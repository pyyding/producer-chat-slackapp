const axios = require("axios");
const qs = require("querystring");
import * as functions from "firebase-functions";
import { SlackSlashCommand } from "./interfaces";


exports.handler = async function (request, response, db, slack) {
  if (request.method !== "POST") {
    console.error(`Got unsupported ${request.method} request. Expected POST.`);
    return response.status(405).send("Only POST requests are accepted");
  }
  const command = request.body as SlackSlashCommand;
  if (command.token !== functions.config().slack.key) {
    console.error(`Invalid request token ${command.token} from ${command.team_id} (${command.team_domain}.slack.com)`);
    return response.status(401).send("Invalid request token!");
  }

  response
    .contentType("json")
    .status(200)
    .send({
      response_type: "ephemeral",
      text: "sending response"
    });
  const welcomeTextWeb = "1. Upload your avatar image to Slack.\n" +
    "2. Download Slack desktop and mobile app 👉 https://slack.com/downloads\n" +
    "3. Log in to the web app here 👉 https://producer.chat/login";

  const welcomeTextSlack = "- Post your introduction to #general channel\n" +
    "- Join any channel you want from the little '+' button on the left sidebar of Slack\n";

  const slackCommandsText = "/add - for adding todos\n" +
    "/done - for adding tasks you did today\n" +
    "/tasks - shows your tasks page URL\n" +
    "/helpme - shows list of available commands";
  const message = {
    token: functions.config().slack.bot_access_token,
    as_user: true,
    link_names: true,
    text: "Welcome to Producer Chat! We're glad you're here.",
    attachments: JSON.stringify([
      {
        title: "Let's get you started! 😊",
        text: welcomeTextWeb,
        color: "#1a4367",
      },
      {
        title: "Slack commands: ",
        text: slackCommandsText,
        color: "#20be99"
      },
      {
        title: "Some tips: ",
        text: welcomeTextSlack,
        color: "#3060f0"
      }]),
    channel: "GE11SAG8G"
  };
  const params = qs.stringify(message);
  axios.post("https://slack.com/api/chat.postMessage", params);
};
