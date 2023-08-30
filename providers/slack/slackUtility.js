const express = require("express");
const axios = require("axios");
const app = express();
const { WebClient } = require("@slack/web-api");
const nonTechnicalArrayKeyword = require("../nonTechnicalKeywords");
const dotenv = require("dotenv");
dotenv.config();
const token = process.env.SLACK_TOKEN;
const channelId = process.env.SLACK_CHANNEL_ID;
const web = new WebClient(token);

app.use(express.urlencoded({ extended: false }));

app.post("/q-a", (req, res) => {
  axios
    .post(process.env.SLACK_WEBHOOK_URL, {
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Question: *${req.body.question}*\n\n Answer: *${req.body.answer}*`,
          },
        },
      ],
    })
    .then(() => {
      res.send("Form submitted!");
    })
    .catch(() => {
      res.send("Form submission failed!");
    });
});

app.get("/allMessages", async (req, res) => {
  try {
    const result = await web.conversations.history({
      channel: channelId,
    });

    if (result.ok) {
      const messages = result.messages.map((message) => {
        return {
          text: message.text,
          timestamp: message.ts,
          user: message.user,
        };
      });
      console.log(messages);

      res.status(200).json({ status: 200, data: { messages } });
    } else {
      console.error("Failed to fetch messages:", result.error);
      res.status(500).json({ status: 500, error: "Failed to fetch messages" });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ status: 500, error: "Internal Server Error" });
  }
});

async function searchQuery(keyword) {
  try {
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${token}`,
    };

    const data = new URLSearchParams({
      query: keyword,
      count: 10,
      sort: "timestamp",
      sort_dir: "desc",
    }).toString();

    const response = await axios.post(
      "https://slack.com/api/search.messages",
      data,
      { headers }
    );

    const result = response.data;

    if (result.ok) {
      if (result.messages.total > 0) {
        console.log(
          "-------------------FOUND A QUESTION-----------------------"
        );
        console.log(
          `Channel has a question related to the keyword: ${keyword}`
        );
        console.log("Found messages:");
        result.messages.matches.forEach((match) => {
          console.log(match.text);
        });

        const foundQuestionData = {
          found: true,
          question: `Channel has a question related to the keyword: ${keyword}`,
          foundQuestion: result.messages.matches.map((match) => match.text),
        };

        return foundQuestionData;
      } else {
        console.log("------------------NO QUESTION------------------------");
        console.log(
          `No question found in the channel for the keyword: ${keyword}`
        );
        return { found: false };
      }
    } else {
      console.error("Failed to search messages:", result.error);
      return { found: false };
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return { found: false };
  }
}

app.post("/question", async (req, res) => {
  const question = req.body.question;
  const foundKeywords = findTechnicalKeywords(question);

  const keywordResults = [];

  for (const keyword of foundKeywords) {
    const questionData = await searchQuery(keyword);
    keywordResults.push({
      keyword: keyword,
      found: questionData.found,
      foundQuestion: questionData.foundQuestion,
    });
  }

  const hasFoundAnyKeyword = keywordResults.some((result) => result.found);

  if (hasFoundAnyKeyword) {
    res.status(200).json({
      status: 200,
      message: "Question Received",
      data: {
        question,
        keywordResults,
      },
    });
  } else {
    console.log("No technical keywords found in the question.");
    res.status(200).json({
      status: 200,
      message: "Question Received",
      data: {
        question,
        keywordResults,
      },
    });
  }
});

function findTechnicalKeywords(question) {
  const keywords = question.toLowerCase().split(" ");
  const foundKeywords = [];

  for (const keyword of keywords) {
    if (!nonTechnicalArrayKeyword.includes(keyword)) {
      foundKeywords.push(keyword);
    }
  }

  return foundKeywords;
}

app.get("/keywords", (req, res) => {
  res.status(200).json({ status: 200, data: { technicalArrayKeyword } });
});

module.exports = app;
