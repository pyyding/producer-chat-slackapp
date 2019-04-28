import { COLLECTIONS } from "./constants";
import * as functions from "firebase-functions";

exports.handler = async function (snap, db, slack) {
    const track = snap.data();
    console.log(`track by: ${track.user.displayName}`);
    const snapshot = await db.collection(COLLECTIONS.TRACKS).where("user.id", "==", track.user.id).get();
    const questions = snapshot.docs;
    db.collection(COLLECTIONS.USERS).doc(track.user.id).update({ totalTracks: questions.length });
    createGeneralChannelPost(track, slack);
};


function createGeneralChannelPost (track, slack) {
    const generalChannelID = "CBP69E2FR";
    const message = `${track.user.displayName} just posted a new track: '${track.link}' `;
    slack.chat.postMessage({
        channel: generalChannelID,
        text: message,
        token: functions.config().slack.access_token,
        unfurl_links: true,
        unfurl_media: true,
        parse: "full"
    });
}
