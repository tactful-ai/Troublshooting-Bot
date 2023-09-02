// server.js
const express = require("express");
const axios = require("axios");
const app = express();
const nonTechnicalArrayKeyword = require("./../nonTechnicalKeywords");
const dotenv = require("dotenv");
const { MessageCollector } = require("discord.js");
dotenv.config();
app.use(express.json());
const discordToken = process.env.DISCORD_TOKEN;
const channelID = process.env.DISCORD_CHANNEL_ID;

app.post("/send-message", async (req, res) => {
  try {
    const { question, answer } = req.body;

    const questionResponse = await axios.post(
      `https://discord.com/api/v10/channels/${channelID}/messages`,
      { content: `Question: ${question}` },
      {
        headers: {
          Authorization: `Bot ${discordToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const answerResponse = await axios.post(
      `https://discord.com/api/v10/channels/${channelID}/messages`,
      { content: `Answer: ${answer}` },
      {
        headers: {
          Authorization: `Bot ${discordToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res
      .status(200)
      .json({ question: questionResponse.data, answer: answerResponse.data });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while sending the message." });
  }
});

app.get("/get-messages", async (req, res) => {
  try {
    const response = await axios.get(
      `https://discord.com/api/v10/channels/${channelID}/messages`,
      {
        headers: {
          Authorization: `Bot ${discordToken}`,
        },
      }
    );
    //console.log("response", response);
    const messages = response.data.map((message) => ({
      content: message.content,
      username: message.author.username,
      userId: message.author.id,
    }));

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching messages." });
  }
});

app.post("/search-messages", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const foundKeywords = findTechnicalKeywords(question);

    if (foundKeywords.length > 0) {
      const results = [];

      for (const keyword of foundKeywords) {
        const matchedMessages = await searchQuery(keyword);

        results.push({
          keyword,
          found: matchedMessages.length > 0,
          matchedMessages,
        });
      }

      res.status(200).json({ results });
    } else {
      res.status(200).json({ message: "No relevant keywords found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while searching." });
  }
});

async function searchQuery(keyword) {
  try {
    const response = await axios.get(
      `https://discord.com/api/v10/channels/${channelID}/messages`,
      {
        headers: {
          Authorization: `Bot ${discordToken}`,
        },
      }
    );

    const matchedMessages = response.data.filter((message) =>
      message.content.toLowerCase().includes(keyword.toLowerCase())
    );

    const messages = matchedMessages.map((message) => ({
      content: message.content,
      username: message.author.username,
      userId: message.author.id,
    }));

    return messages;
  } catch (error) {
    console.error("Error searching for messages:", error);
    return [];
  }
}
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
