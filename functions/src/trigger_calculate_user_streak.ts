import { COLLECTIONS } from "./constants";

exports.handler = async function(snap, db) {
  const createdTask = snap.data();
  console.log(`task by: ${createdTask.user.displayName}`);
  if (!createdTask.isDone) {
    console.log('No update needed, task marked as "not done"');
    return;
  }
  const snapshot = await db
    .collection(COLLECTIONS.TASKS)
    .where("user.id", "==", createdTask.user.id)
    .where("isDone", "==", true)
    .orderBy("createdAt", "desc")
    .get();
  const today = new Date();
  const tasks = snapshot.docs;
  let previousCalendarDay = today.getDate();
  let streak = 1;
  for (const task of tasks) {
    const timestamp = task.get("createdAt");
    const date = timestamp.toDate();
    const calendarDay = date.getDate();
    console.log("Previous Cal Day: " + previousCalendarDay);
    console.log("Cal Day: " + calendarDay);
    if (previousCalendarDay - calendarDay > 1) break;
    if (previousCalendarDay - calendarDay === 1) streak++;
    previousCalendarDay = calendarDay;
  }
  db.collection(COLLECTIONS.USERS)
    .doc(createdTask.user.id)
    .update({ streak: streak });
};
