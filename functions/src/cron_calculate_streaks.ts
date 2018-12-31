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
        let streak = 0;
        let previousDate = new Date(Date.now());
        console.log("tasks length:" + tasks.length);
        for (const [index, task] of tasks.entries()) {
            const timestamp = task.get("doneAt");
            const currentDate = timestamp.toDate();
            const diff = Math.abs(previousDate.valueOf() - currentDate.valueOf());
            const diffDays = diff / (1000 * 60 * 60 * 24);

            console.log(previousDate.toDateString());
            console.log(currentDate.toDateString());

            if (diffDays > 2) break;

            if (index === 0 && previousDate.toDateString() === currentDate.toDateString()) streak++;

            if (0 < (diffDays) && (diffDays) <= 1 && currentDate.getDate() !== previousDate.getDate()) streak++;

            previousDate = currentDate;
        }
        console.log("streak:" +  streak);
        db.collection(COLLECTIONS.USERS)
            .doc(user.id)
            .update({streak: streak});
    }
};
