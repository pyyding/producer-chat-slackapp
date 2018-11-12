import * as functions from "firebase-functions";
import { SlackSlashCommand } from "./interfaces";
import { COLLECTIONS } from "./constants";

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
  const today = new Date();

  for (const user of users) {
    const snapshot = await db
      .collection(COLLECTIONS.TASKS)
      .where("user.id", "==", user.id)
      .where("isDone", "==", true)
      .orderBy("createdAt", "desc")
      .get();
    const tasks = snapshot.docs;
    let previousCalendarDay = today.getDate();
    let streak = 0;
    for (const task of tasks) {
      const timestamp = task.get("createdAt");
      const date = timestamp.toDate();
      const calendarDay = date.getDate();
      console.log("Previous Cal Day: " + previousCalendarDay);
      console.log("Cal Day: " + calendarDay);
      if (previousCalendarDay - calendarDay > 1) break;
      if (0 <= (previousCalendarDay - calendarDay) && (previousCalendarDay - calendarDay) <= 1) streak++;
      previousCalendarDay = calendarDay;
    }
    db.collection(COLLECTIONS.USERS)
      .doc(user.id)
      .update({ streak: streak });
  }
};
