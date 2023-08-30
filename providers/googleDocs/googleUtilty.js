const express = require("express");
const { google } = require("googleapis");
const nonTechnicalArrayKeyword = require("./../nonTechnicalKeywords");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const dotenv = require("dotenv");
dotenv.config();
const documentId = process.env.GOOGLE_DOCS_ID;
app.use(express.json());

app.post("/q-a", async (req, res) => {
  const { question, answer } = req.body;

  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/documents",
  });

  // Create client instance for auth
  const client = await auth.getClient();

  // Instance of Google Docs API
  const googleDocs = google.docs({ version: "v1", auth: client });

  // Get the document's content
  const document = await googleDocs.documents.get({
    documentId,
  });

  // Get the existing content from the document
  const existingContent = document.data.body.content;

  // Construct the new content to be added
  const newContent = [
    {
      insertText: {
        location: {
          index: existingContent.length, // Append at the end
        },
        text: `Question: ${question}, Answer: ${answer}\n`, // Use request and name fields
      },
    },
  ];

  // Add content to the document
  await googleDocs.documents.batchUpdate({
    documentId,
    resource: {
      requests: newContent,
    },
  });

  res.send("Successfully submitted! Content added to the document. Thank you!");
});

app.get("/document", async (req, res) => {
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/documents.readonly",
  });

  // Create client instance for auth
  const client = await auth.getClient();

  // Instance of Google Docs API
  const googleDocs = google.docs({ version: "v1", auth: client });

  // Get the document's content
  const document = await googleDocs.documents.get({
    documentId,
  });

  const content = document.data.body.content;

  // Extract text from the content
  const extractedText = content
    .map((item) =>
      item.paragraph
        ? item.paragraph.elements
            .map((element) => element.textRun.content)
            .join("")
        : ""
    )
    .join("\n");
  console.log(extractedText);

  res.status(200).json({
    status: "success",
    data: {
      extractedText,
    },
  });
});

async function searchQuery(keyword) {
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

app.post("/question", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  const foundKeywords = findTechnicalKeywords(question);
  console.log("foundKeywords", foundKeywords);

  if (foundKeywords.length > 0) {
    const results = [];

    for (const keyword of foundKeywords) {
      const { articleFound, articleContent } = await searchQuery(keyword);
      results.push({
        keyword,
        articleFound,
        articleContent,
      });
    }
    console.log("results", results);
    return res.json({ results });
  } else {
    return res.json({
      message: "No technical keywords found in the question.",
    });
  }
});

module.exports = app;
