import * as functions from "firebase-functions";
import {COLLECTIONS} from "./constants";
import slugify from "slugify";

exports.handler = async function (user, db, slack) {
    console.info(`user: ${user.email}`);
    try {
        const slackResponse = await slack.users.lookupByEmail({
            email: user.email,
            token: functions.config().slack.access_token
        });
        if (!slackResponse.ok) {
            console.error("Couldn't find slack user");
            return false;
        }
        console.info("found slack user");
        const { user: slackUser } = slackResponse;
        const displayName = slackUser.profile.display_name;
        let slug = slugify(slackUser.profile.display_name);
        const usersWithSameSlug = await db.collection(COLLECTIONS.USERS).where("displayName", "==", displayName).get();
        const numberOfDuplicates = usersWithSameSlug.docs.length;
        if (numberOfDuplicates > 0) {
            slug = `${slug}-${numberOfDuplicates}`;
        }

        const newUser = {
            displayName,
            photoURL: slackUser.profile.image_72,
            isAdmin: slackUser.is_admin,
            isRestricted: slackUser.is_restricted,
            slug,
            createdAt: new Date(),
            lastCheckin: new Date(),
            streak: 0
        };
        db.collection(COLLECTIONS.USERS).doc(slackUser.id).set(newUser);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};
