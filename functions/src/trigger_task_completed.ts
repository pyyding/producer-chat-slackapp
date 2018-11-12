// On task completions, posts to general channel in Slack.

const axios = require("axios");
import * as functions from "firebase-functions";

exports.handler = async function(snap, db, slack) {
  const task = snap.data();
  console.log(`task: ${task.text}`);
  if (task.isDone) {
    const generalChannelID = "CBP69E2FR";
    const message = `${task.user.displayName} just finished '${task.text}' `;
    console.log("message: " + message);
    slack.chat.postMessage({
      channel: generalChannelID,
      text: message,
      token: functions.config().slack.access_token
    });
  }
};
