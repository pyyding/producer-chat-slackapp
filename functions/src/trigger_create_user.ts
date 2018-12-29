import * as functions from "firebase-functions";
import {SlackUser} from "./interfaces";

exports.handler = async function (user, db, slack) {
    console.info("triggered create_user");
    console.info("user: " + user.email);
    console.info(slack.users);
    console.info(slack.users.lookupByEmail);
    const slackResponse = await slack.users.lookupByEmail({email: user.email, token: functions.config().slack.access_token });
    if (slackResponse.ok) {
        console.info("found slack user");
        const slackUser = slackResponse.user as SlackUser;
        const newUser = {
            email: user.email,
            displayName: slackUser.profile.display_name,
            photoURL: slackUser.profile.image_72,
            isAdmin: slackUser.is_admin,
            isRestricted: slackUser.is_restricted,
            createdAt: new Date()
        };
        console.log(newUser);
        db.collection("users").doc(slackUser.id).set(newUser);
        return true;
    } else {
        console.error("no slack user found.");
        return false;
    }
};
