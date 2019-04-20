import * as functions from "firebase-functions";
import {SlackSlashCommand} from "./interfaces";
import {COLLECTIONS} from "./constants";

exports.handler = async function (request, response, db) {
    if (request.method !== "POST") {
        console.error(`Got unsupported ${request.method} request. Expected POST.`);
        return response.status(405).send("Only POST requests are accepted");
    }
    const command = request.body as SlackSlashCommand;
    if (command.token !== functions.config().slack.key) {
        console.error(`Invalid request token ${command.token} from ${command.team_id} (${command.team_domain}.slack.com)`);
        return response.status(401).send("Invalid request token!");
    }

    console.log(`started the check in for ${command.user_id}`);

    response
        .contentType("json")
        .status(200)
        .send({
            text: "Good job! You're checked in for today, keep it up!",
            attachments: [
                {
                    image_url: getGif()
                }
            ],
            unfurl_links: true,
            unfurl_media: true,
            parse: "full"
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
        doneAt: new Date(),
        isDone: true
    };

    const taskRef = await db.collection(COLLECTIONS.TASKS).doc();
    await taskRef.set(task);

    console.log(`checked in ${user.displayName}`);
};

function getGif() {
    const now = new Date();
    const index = now.getDate() - 1;
    const gifs = [
       "https://media.giphy.com/media/VzsXNKTAuFmQU/giphy.gif",
        "https://media.giphy.com/media/eLFKlzc9S3kFq/giphy.gif",
        "https://media.giphy.com/media/l41YgqiZc7EPJT3YQ/giphy.gif",
        "https://media.giphy.com/media/BoHCeLmEKytt7oFxyR/giphy.gif",
        "https://media.giphy.com/media/3oEdvawuSWUFWfWP0k/giphy.gif",
        "https://media.giphy.com/media/12vQiYtQcOwOFG/giphy.gif",
        "https://media.giphy.com/media/1sw6sy85n8vkur6x5T/giphy.gif",
        "https://media.giphy.com/media/FBzqZGthkW6KQ/giphy.gif",
        "https://media.giphy.com/media/3tuO3lKrVBFq8/giphy.gif",
        "https://media.giphy.com/media/8RtwsZCgRzMt2/giphy.gif",
        "https://media.giphy.com/media/VeMjxABqrb0Yw/giphy.gif",
        "https://media.giphy.com/media/6RbxN2cEbtCHS/giphy.gif",
        "https://media.giphy.com/media/xUPGGiWOANhNO8qwdG/giphy.gif",
        "https://media.giphy.com/media/RDbZGZ3O0UmL6/giphy.gif",
        "https://media.giphy.com/media/yJUrIRDpku3ao/giphy.gif",
        "https://media.giphy.com/media/l3vRl0aRzOXr4qHTO/giphy.gif",
        "https://media.giphy.com/media/l3vRl0aRzOXr4qHTO/giphy.gif",
        "https://media.giphy.com/media/8vqF2pImLEW3WOI0Gy/giphy.gif",
        "https://media.giphy.com/media/6oX3Jo9zzpEWc/giphy.gif",
        "https://media.giphy.com/media/6oX3Jo9zzpEWc/giphy.gif",
        "https://media.giphy.com/media/XJ2juwJbDcEkzqx4e2/giphy.gif",
        "https://media.giphy.com/media/5n18Zq66EO9lm/giphy.gif",
        "https://media.giphy.com/media/SYVVMFjiTzV3a/giphy.gif",
        "https://media.giphy.com/media/xThuWcZzGnonnG3ayQ/giphy.gif",
        "https://media.giphy.com/media/SJz6dNDQ4bOiQ/giphy.gif",
        "https://media.giphy.com/media/TEWmBQvs5xds6fAMX4/giphy.gif",
        "https://media.giphy.com/media/TrB29ApJbsFkk/giphy.gif",
        "https://media.giphy.com/media/5yYxI8HMtHkQuZMS30/giphy.gif",
        "https://media.giphy.com/media/3YIqOJCp6tOuCZglRr/giphy.gif",
        "https://media.giphy.com/media/3o6Zt5J8VgRbpgizkc/giphy.gif",
        "https://media.giphy.com/media/wH492DEqdp3ji/giphy.gif",
        "https://media.giphy.com/media/C6Y3kbeE448jC/giphy.gif"
    ];
    return gifs[index];
}
