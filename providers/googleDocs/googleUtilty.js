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

  const client = await auth.getClient();

  const googleDocs = google.docs({ version: "v1", auth: client });

  const document = await googleDocs.documents.get({
    documentId,
  });

  const existingContent = document.data.body.content;

  const newContent = [
    {
      insertText: {
        location: {
          index: existingContent.length,
        },
        text: `Question: ${question}, Answer: ${answer}\n`,
      },
    },
  ];

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

  const client = await auth.getClient();

  const googleDocs = google.docs({ version: "v1", auth: client });

  const document = await googleDocs.documents.get({
    documentId,
  });

  const content = document.data.body.content;

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

    const content = document.data.body.content;

    let articleFound = false;
    let articleContent = "";

    let keywordFound = false;
    let capturingContent = false;

    for (const item of content) {
      if (articleFound) {
        break;
      }

      if (item.paragraph) {
        for (const element of item.paragraph.elements) {
          if (element.textRun) {
            const contentText = element.textRun.content;

            if (capturingContent && element.textRun.textStyle.bold) {
              articleFound = true;
              break;
            }

            if (contentText.toLowerCase().includes(keyword)) {
              keywordFound = true;
              capturingContent = true;
            }

            if (capturingContent) {
              articleContent += contentText;
            }
          }
        }
      }
    }

    return { articleFound, articleContent };
  } catch (error) {
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
