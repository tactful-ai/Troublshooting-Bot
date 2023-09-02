const express = require("express");
const app = express();
const slack = require("./providers/slack/slackUtility");
const googleDoc = require("./providers/googleDocs/googleUtilty");
const confluence = require("./providers/confluence/confluenceUtility");
const teams = require("./providers/microsoftTeams/teamsUtility");
const discord = require("./providers/discord/discordUtility");
const morgan = require("morgan");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan("dev"));
app.get("/", (req, res) => {
  res.send("Welcome To Troubleshooting Bot");
});

app.use("/slack", slack);

app.use("/googleDoc", googleDoc);

app.use("/teams", teams);

app.use("/conflunce", confluence);

app.use("/discord", discord);

module.exports = app;
