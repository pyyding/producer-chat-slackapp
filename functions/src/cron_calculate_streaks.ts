import {COLLECTIONS} from "./constants";
import {differenceInDays} from "./trigger_calculate_user_streak";

exports.handler = async function (request, response, db) {
    if (request.method !== "POST") {
        console.error(`Got unsupported ${request.method} request. Expected POST.`);
        return response.status(405).send("Only POST requests are accepted");
    }

    response
        .contentType("json")
        .status(200)
        .send({
            text: "Calculating streaks"
        });

    const usersSnapshot = await db.collection(COLLECTIONS.USERS).get();
    const users = usersSnapshot.docs;

    const now = new Date();
    for (const user of users) {
        console.log("user: " + user.id);

        const lastCheckin = user.lastCheckin.getDate();
        if (differenceInDays(lastCheckin, now) > 1) {
            db.collection(COLLECTIONS.USERS)
                .doc(user.id)
                .update({streak: 0});
        }
    }
};
