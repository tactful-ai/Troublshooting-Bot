const axios = require("axios"); // Import the 'axios' library
const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const accessToken = process.env.TEAMS_TOKEN;
const nonTechnicalArrayKeyword = require("./../nonTechnicalKeywords");

const fetchAllMessages = async () => {
  const chatEndpoint = `https://graph.microsoft.com/beta/chats/${CHAT_ID}/messages`;

  let allMessages = [];

  let pageUrl = chatEndpoint;
  while (pageUrl) {
    try {
      const response = await axios.get(pageUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        const responseData = response.data;
        const messages = responseData.value.filter(
          (message) => message.body.content.trim() !== ""
        );
        allMessages = allMessages.concat(messages);

        pageUrl = responseData["@odata.nextLink"];
      } else {
        console.error("Error fetching messages:", response.statusText);
        break;
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      break;
    }
  }

  return allMessages;
};

app.get("/fetch-chat", async (req, res) => {
  try {
    const messages = await fetchAllMessages();

    const simplifiedMessages = messages.map((message) => ({
      sender:
        message.from && message.from.user
          ? message.from.user.displayName
          : "System",
      message: message.body.content,
    }));

    res.json(simplifiedMessages);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching messages." });
  }
});

async function searchQuery(keyword) {
  try {
    const messages = await fetchAllMessages(keyword);

    const matchedMessages = messages
      .filter((message) => message.body.content.includes(keyword))
      .map((message) => ({
        sender:
          message.from && message.from.user
            ? message.from.user.displayName
            : "System",
        message: message.body.content,
      }));

    return {
      found: matchedMessages.length > 0,
      foundMessages: matchedMessages,
    };
  } catch (error) {
    console.error("Error searching messages:", error);
    throw error;
  }
}

app.post("/question", async (req, res) => {
  const question = req.body.question;
  const foundKeywords = findTechnicalKeywords(question);

  const keywordResults = [];

  for (const keyword of foundKeywords) {
    try {
      const keywordData = await searchQuery(keyword);
      keywordResults.push({
        keyword: keyword,
        found: keywordData.found,
        foundMessages: keywordData.foundMessages,
      });
    } catch (error) {
      res.status(500).json({ error: "An error occurred while processing." });
      return;
    }
  }

  const hasFoundAnyKeyword = keywordResults.some((result) => result.found);

  res.status(200).json({
    status: 200,
    message: "Question Received",
    data: {
      question,
      keywordResults,
    },
  });
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

module.exports = app;
