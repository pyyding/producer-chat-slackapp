const StreakHelper = require("./streak_helper");
import { COLLECTIONS } from "./constants";

exports.handler = async function(change, db) {
  const task = change.after.data();
  console.log(`task by: ${task.user.displayName}`);
  if (!task.isDone) {
    console.log("No update needed, task marked as \"not done\"");
    return;
  }
  const snapshot = await db
    .collection(COLLECTIONS.TASKS)
    .where("user.id", "==", task.user.id)
    .where("isDone", "==", true)
    .orderBy("doneAt", "desc")
    .get();
  const tasks = snapshot.docs;
  const streak = StreakHelper.calculateStreak(tasks);
  console.log("streak : " + streak);
  console.log("task user id:" + task.user.id);
  db.collection(COLLECTIONS.USERS)
    .doc(task.user.id)
    .update({ streak });
};
