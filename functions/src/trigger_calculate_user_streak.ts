import { COLLECTIONS } from "./constants";
import { calculateStreak } from "./streak_helper";

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
  const streak = calculateStreak(tasks);
  db.collection(COLLECTIONS.USERS)
    .doc(task.user.id)
    .update({ streak: streak });
};
