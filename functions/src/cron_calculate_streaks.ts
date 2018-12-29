import {COLLECTIONS} from "./constants";
const StreakHelper = require("./streak_helper");

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

    for (const user of users) {
        console.log("user: " + user.id);
        const snapshot = await db
            .collection(COLLECTIONS.TASKS)
            .where("user.id", "==", user.id)
            .where("isDone", "==", true)
            .orderBy("doneAt", "desc")
            .get();
        const tasks = snapshot.docs;
        const streak = StreakHelper.calculateStreak(tasks);
        db.collection(COLLECTIONS.USERS)
            .doc(user.id)
            .update({streak: streak});
    }
};
