const express = require("express");
const app = express();
const slack = require("./providers/slack/slackUtility");
const googleDoc = require("./providers/googleDocs/googleUtilty");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome To Troubleshooting Bot");
});

app.use("/slack", slack);

app.use("/googleDoc", googleDoc);

module.exports = app;
