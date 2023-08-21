const express = require("express");
const app = express();
const slack = require("./providers/slack/slackUtility");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
  if (process.env.NODE_ENV === "development") {
    res.send("Hello, Express!");
  }
});

if (process.env.NODE_ENV === "development") {
  app.use("/slack", slack);
}

module.exports = app;
