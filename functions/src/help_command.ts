import * as functions from "firebase-functions";
import { SlackSlashCommand } from "./interfaces";


exports.handler = async function (request, response) {
  if (request.method !== "POST") {
    console.error(`Got unsupported ${request.method} request. Expected POST.`);
    return response.status(405).send("Only POST requests are accepted");
  }
  const command = request.body as SlackSlashCommand;
  if (command.token !== functions.config().slack.key) {
    console.error(`Invalid request token ${command.token} from ${command.team_id} (${command.team_domain}.slack.com)`);
    return response.status(401).send("Invalid request token!");
  }

  const slackCommandsText = "/checkin - check in daily with this command\n" +
    "/helpme - shows list of available commands";

  response
    .contentType("json")
    .status(200)
    .send({
      response_type: "ephemeral",
      text: slackCommandsText
    });
};
