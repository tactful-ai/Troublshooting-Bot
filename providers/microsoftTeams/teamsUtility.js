const axios = require("axios"); // Import the 'axios' library
const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

const accessToken = process.env.TEAMS_TOKEN;

const searchRequestBody = {
  requests: [
    {
      entityTypes: ["chatMessage"],
      query: {
        queryString: "helllo",
      },
    },
  ],
};

const searchChatMessages = async () => {
  try {
    const response = await axios.post(
      "https://graph.microsoft.com/beta/search/microsoft.graph.query",
      searchRequestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      const responseData = response.data;
      const chatMessages = responseData.value;
      return chatMessages;
    } else {
      console.error("Error searching chat messages:", response.statusText);
      return [];
    }
  } catch (error) {
    console.error("Error searching chat messages:", error);
    return [];
  }
};

// const searchQuery = "Hello";
const fetchAllMessages = async () => {
  const chatEndpoint =
    "https://graph.microsoft.com/beta/chats/19:uni01_tcy3xfktmzpebrha5hqua34tpfnuuey3je6q26zkbbtzi5k4dasq@thread.v2/messages";

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
          (message) => message.body.content.trim() !== "" // Filter out empty messages
        );
        allMessages = allMessages.concat(messages);

        // Check if there are more pages
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

// Endpoint to search chat messages
app.get("/search-messages", async (req, res) => {
  try {
    const chatMessages = await searchChatMessages();
    res.json(chatMessages);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while searching chat messages." });
  }
});

// Endpoint to fetch all messages
app.get("/fetch-chat", async (req, res) => {
  try {
    const messages = await fetchAllMessages();

    // Extract the sender's name and message content
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

module.exports = app;
