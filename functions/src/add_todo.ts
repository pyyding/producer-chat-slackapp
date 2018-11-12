import * as functions from "firebase-functions";
import { SlackSlashCommand } from './interfaces';
import { COLLECTIONS } from './constants';
const axios = require('axios');
const qs = require('querystring');


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
            text: "Task has been added to your profile!"
        });

    const userSnapshot = await db.collection(COLLECTIONS.USERS).doc(command.user_id).get();
    const user = userSnapshot.data();

    const task = {
        text: command.text,
        user: {
            id: userSnapshot.id,
            displayName: user.displayName,
            photoURL: user.photoURL
        },
        createdAt: new Date(),
        isDone: false
    };

    const taskRef = await db.collection(COLLECTIONS.TASKS).doc();
    await taskRef.set(task);
};
