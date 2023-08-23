const express = require("express");
const axios = require("axios");
const app = express();
const { WebClient } = require("@slack/web-api");
const technicalArrayKeyword = require("./technicalKeywords");
require("dotenv").config();
const token = process.env.SLACK_TOKEN;
const channelId = process.env.CHANNEL_ID;
const web = new WebClient(token);

app.use(express.urlencoded({ extended: false }));

const questionToSearch =
  "What is the difference between TCP and UDP and Javascript protocols? ";

app.post("/form-submit", (req, res) => {
  //POST IN THE CHANNEL
  axios
    .post(
      "https://hooks.slack.com/services/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",
      {
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `Question: *${req.body.question}*\n\n Answer: *${req.body.answer}*`,
            },
          },
        ],
      }
    )
    .then(() => {
      res.send("Form submitted!");
    })
    .catch(() => {
      res.send("Form submission failed!");
    });
});
//Function to fetch and print ALL messages
async function fetchAndPrintMessages() {
  try {
    // Call the conversations.history API to fetch messages
    const result = await web.conversations.history({
      channel: channelId,
    });

    // Check if the API call was successful
    if (result.ok) {
      console.log(
        "--------------------ALL MESSAGES IN CHANNEL----------------------"
      );
      // Print each message text to the console
      result.messages.forEach((message) => {
        console.log(message.text);
      });
    } else {
      console.error("Failed to fetch messages:", result.error);
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}
fetchAndPrintMessages();

async function fetchLastQuestion() {
  try {
    // Call the conversations.history API to fetch messages
    const result = await web.conversations.history({
      channel: channelId,
      //limit: 1, // Retrieve the last message only
    });

    // Check if the API call was successful
    if (result.ok && result.messages.length > 0) {
      // Get the text of the last message
      const lastMessageText = result.messages[0].text;
      console.log(
        "-------------------LAST QUESTION ASKED IN THE CAHNNEL-----------------------"
      );
      console.log("Last question:", lastMessageText);

      // Call the searchQuery function with the last message as parameter
      //searchQuery(lastMessageText);
    } else {
      console.error("Failed to fetch last message:", result.error);
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}
fetchLastQuestion();

async function searchQuery(keyword) {
  try {
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${token}`,
    };

    const data = new URLSearchParams({
      query: keyword,
      count: 100, // Number of messages to retrieve //! DISCUSS WITH TEAM
      sort: "timestamp", // Sorting by timestamp
      sort_dir: "desc", // Sorting direction
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
      } else {
        console.log("------------------NO QUESTION------------------------");
        console.log(
          `No question found in the channel for the keyword: ${keyword}`
        );
      }
    } else {
      console.error("Failed to search messages:", result.error);
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}
//GET the technical keywords from the question
function findTechnicalKeywords(question) {
  const keywords = question.toLowerCase().split(" ");
  const foundKeywords = [];

  for (const keyword of keywords) {
    if (technicalArrayKeyword.includes(keyword)) {
      //use includes to check if the keyword is in the array
      foundKeywords.push(keyword);
    }
  }
  return foundKeywords;
}
//call the function to get the technical keywords
const foundKeywords = findTechnicalKeywords(questionToSearch);
//! DISCUSS WITH TEAMm
if (foundKeywords.length > 0) {
  console.log("Found technical keywords:", foundKeywords);
  const stringKeywords = foundKeywords.join(" ");
  console.log("String keywords:", stringKeywords);
  searchQuery(stringKeywords); //! DISCUSS WITH TEAM
  // for (const keyword of foundKeywords) {
  //   searchQuery(keyword);
  // }
} else {
  console.log("No technical keywords found in the question.");
}
exports = module.exports = app;
