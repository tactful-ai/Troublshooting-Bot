const express = require("express");
const axios = require("axios");
const app = express();
const { WebClient } = require("@slack/web-api");
const nonTechnicalArrayKeyword = require("../lib/nonTechnicalKeywords");
const dotenv = require("dotenv");
dotenv.config();
const token = process.env.SLACK_TOKEN;
// const channellId = process.env.SLACK_CHANNEL_ID;
const web = new WebClient(token);
const { v4: uuidv4 } = require("uuid");
const { google } = require("googleapis");
const documentId = process.env.GOOGLE_DOCS_ID;
const confluenceBaseUrl = process.env.CONFLUENCE_URL;
const username = process.env.CONFLUENCE_USERNAME;
const password = process.env.CONFLUENCE_PASSWORD;
const pageId = process.env.CONFLUENCE_PAGE_ID;
const auth = {
  username: username,
  password: password,
};
const discordToken = process.env.DISCORD_TOKEN;
const channelID = process.env.DISCORD_CHANNEL_ID;
const accessToken = process.env.TEAMS_TOKEN;
const categoryKeywordsMap = require("../lib/category");
const cheerio = require("cheerio");

async function slackSearchQuery(keyword) {
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
      if (
        result.messages &&
        result.messages.total > 0 &&
        result.messages.matches
      ) {
        const foundQuestionText = result.messages.matches
          .map((match) => match.text)
          .join(" ");
        const foundQuestionData = {
          id: uuidv4(),
          found: true,
          question: `Channel has a question related to the keyword: ${keyword}`,
          foundQuestion: foundQuestionText,
          src: {
            tiny: "https://yt3.googleusercontent.com/ytc/AOPolaTCsMhpgrJldSw0eABzVJ9JEc1pYyTST4CJ7JzN1Q=s900-c-k-c0x00ffffff-no-rj",
          },
        };
        return foundQuestionData;
      } else {
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

async function googleSearchQuery(keyword) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: "credentials.json",
      scopes: "https://www.googleapis.com/auth/documents",
    });

    const client = await auth.getClient();
    const googleDocs = google.docs({ version: "v1", auth: client });

    const document = await googleDocs.documents.get({
      documentId,
    });

    // Extract the content of the document
    const content = document.data.body.content;

    // Flags to track article and keyword found status, and capturing content
    let articleFound = false;
    let articleContent = "";

    let keywordFound = false;
    let capturingContent = false;

    // Iterate through the content of the document
    for (const item of content) {
      if (articleFound) {
        break; // Exit the loop if the article is found
      }

      if (item.paragraph) {
        for (const element of item.paragraph.elements) {
          if (element.textRun) {
            const contentText = element.textRun.content;

            if (capturingContent && element.textRun.textStyle.bold) {
              articleFound = true; // Mark article as found if bold text encountered
              break;
            }

            if (contentText.toLowerCase().includes(keyword)) {
              keywordFound = true; // Mark keyword as found
              capturingContent = true; // Start capturing content
            }

            if (capturingContent) {
              articleContent += contentText; // Accumulate content text
            }
          }
        }
      }
    }

    // Return information about whether article and keyword were found, along with the article content
    return { articleFound, articleContent };
  } catch (error) {
    // Handle errors: log the error and return default values
    console.error("Error searching for keywords:", error);
    return { articleFound: false, articleContent: "" };
  }
}

async function confluenceGetPageContent(pageId) {
  try {
    const response = await axios.get(
      `${confluenceBaseUrl}/rest/api/content/${pageId}?expand=body.storage,title`,
      {
        auth,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return {
      title: response.data.title,
      body: response.data.body.storage.value,
    };
  } catch (error) {
    console.error("Error fetching page content:", error.message);
    throw error;
  }
}

async function confluenceSearchQuery(keyword) {
  try {
    const pageContent = await confluenceGetPageContent(pageId);

    const keywordFoundInTitle = pageContent.title
      .toLowerCase()
      .includes(keyword);
    const keywordFoundInBody = pageContent.body.toLowerCase().includes(keyword);

    let articleContent = ""; // Initialize with empty string
    let articleFound = false; // Initialize with false

    const boldTextRegex = /<strong>|<b>(.*?)<\/b>/gi; // Define bold text regex here

    if (keywordFoundInBody) {
      const bodyLines = pageContent.body.split("\n");
      let foundBoldText = false;
      let tempArticleContent = "";

      for (const line of bodyLines) {
        if (line.match(boldTextRegex)) {
          if (foundBoldText) {
            break;
          }
          foundBoldText = true;
        }

        if (foundBoldText) {
          tempArticleContent += line + "\n";
        }
      }

      if (tempArticleContent) {
        // Split the content into paragraphs
        const paragraphs = tempArticleContent.split("<p />");

        // Find the paragraph that contains the keyword
        const paragraphWithKeyword = paragraphs.find((paragraph) =>
          paragraph.toLowerCase().includes(keyword)
        );

        if (paragraphWithKeyword) {
          articleContent = paragraphWithKeyword;
          articleFound = true; // Set to true if article content is found
        }
      }
    }

    return {
      keywordFoundInTitle,
      keywordFoundInBody,
      keywordFound: keywordFoundInTitle || keywordFoundInBody, // Flag indicating keyword was found
      articleFound,
      articleContent,
    };
  } catch (error) {
    console.error("Error searching keyword:", error.message);
    throw error;
  }
}

async function discordSearchQuery(keyword) {
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
      short_description: message.content,
      title: message.author.username,
      userId: message.author.id,
    }));

    return messages;
  } catch (error) {
    console.error("Error searching for messages:", error);
    return [];
  }
}

const teamsFetchAllMessages = async () => {
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
          (message) => message.body.content.trim() !== ""
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

async function teamsSearchQuery(keyword) {
  try {
    const messages = await teamsFetchAllMessages(keyword);

    const matchedMessages = messages
      .filter((message) => message.body.content.includes(keyword))
      .map((message) => {
        const $ = cheerio.load(message.body.content);
        const textContent = $.text();

        return {
          id: uuidv4(),
          title:
            message.from && message.from.user
              ? message.from.user.displayName
              : "System",
          short_description: textContent, // Use the extracted text content
          image_url:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg/1200px-Microsoft_Office_Teams_%282018%E2%80%93present%29.svg.png",
          keyword: keyword,
        };
      });

    return {
      found: matchedMessages.length > 0,
      foundMessages: matchedMessages,
    };
  } catch (error) {
    console.error("Error searching messages:", error);
    throw error;
  }
}

function findTechnicalKeywords(question) {
  // Split the question into individual words and convert them to lowercase.
  const keywords = question.toLowerCase().split(" ");
  const foundKeywords = [];

  // Iterate through the words in the question.
  for (const keyword of keywords) {
    // Check if the keyword is not in the `nonTechnicalArrayKeyword`.
    if (!nonTechnicalArrayKeyword.includes(keyword)) {
      // If the keyword is not in the non-technical array, add it to the `foundKeywords` array.
      foundKeywords.push(keyword);
    }
  }

  // Return the array of found technical keywords.
  return foundKeywords;
}

app.post("/question", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  const foundKeywords = findTechnicalKeywords(question);

  if (foundKeywords.length === 0) {
    return res.json({
      message: "No technical keywords found in the question.",
    });
  }
  const categoriesForQuestion = [];

  // Check which categories the found keywords belong to.
  for (const category in categoryKeywordsMap) {
    // Get the keywords associated with the current category.
    const keywordsForCategory = categoryKeywordsMap[category];

    // Check if any keyword in `foundKeywords` is included in the `keywordsForCategory` array.
    if (
      foundKeywords.some((keyword) => keywordsForCategory.includes(keyword))
    ) {
      // If a match is found, add the category to the `categoriesForQuestion` array.
      categoriesForQuestion.push(category);
    }
  }

  const combinedResults = [];

  for (const keyword of foundKeywords) {
    const slackData = await slackSearchQuery(keyword);
    const googleData = await googleSearchQuery(keyword);
    const confluenceData = await confluenceSearchQuery(keyword);
    const discordMessages = await discordSearchQuery(keyword);
    const teamsData = await teamsSearchQuery(keyword); // Add Teams results

    // Add Slack results to combinedResults
    if (slackData.found) {
      combinedResults.push({
        id: uuidv4(),
        source: "slack",
        title: keyword,
        short_description: slackData.foundQuestion,
        image_url:
          "https://yt3.googleusercontent.com/ytc/AOPolaTCsMhpgrJldSw0eABzVJ9JEc1pYyTST4CJ7JzN1Q=s900-c-k-c0x00ffffff-no-rj",
      });
    }

    // Add Google Docs results to combinedResults
    if (googleData.articleFound) {
      combinedResults.push({
        id: uuidv4(),
        source: "google_docs",
        title: keyword,
        short_description: googleData.articleContent.slice(0, 100),
        image_url:
          "https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Google_Docs.width-500.format-webp.webp",
      });
    }

    // Add Confluence results to combinedResults
    if (confluenceData.articleFound) {
      combinedResults.push({
        id: uuidv4(),
        source: "confluence",
        title: keyword,
        short_description: confluenceData.articleContent.substring(0, 150),
        image_url:
          "https://media.licdn.com/dms/image/C4D0BAQHR3-muCN3-4A/company-logo_200_200/0/1611699233211?e=2147483647&v=beta&t=9ih0eEQjXVMMb5gA76KKXUV3T-VJkTN812f769UiBr4",
      });
    }
    // Add Discord results to combinedResults
    for (const message of discordMessages) {
      // Generate a unique ID for each result (you can use any ID generation logic you prefer)
      const id = uuidv4();

      // Add the additional fields to the message object
      message.id = id;
      message.keyword = keyword;

      // You can add the image_url field here based on your requirements
      message.image_url =
        "https://play-lh.googleusercontent.com/0oO5sAneb9lJP6l8c6DH4aj6f85qNpplQVHmPmbbBxAukDnlO7DarDW0b-kEIHa8SQ"; // Replace with the actual image URL

      combinedResults.push(message);
    }

    // Add Teams results to combinedResults
    for (const message of teamsData.foundMessages) {
      // Generate a unique ID for each result (you can use any ID generation logic you prefer)
      const id = uuidv4();

      // Add the additional fields to the message object
      message.id = id;
      message.keyword = keyword;

      // You can add the image_url field here based on your requirements
      message.image_url =
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg/1200px-Microsoft_Office_Teams_%282018%E2%80%93present%29.svg.png"; // Replace with the actual image URL

      combinedResults.push(message);
    }
  }

  const responseObject = {
    results: combinedResults,
    message: `This question belongs to the following category(s): ${categoriesForQuestion.join(
      ", "
    )}`,
  };
  res.json(responseObject);
});

module.exports = app;
