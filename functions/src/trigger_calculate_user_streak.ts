import {COLLECTIONS} from "./constants";

exports.handler = async function (change, db) {
    let task;
    if (change.after) {
        task = change.after.data();
    } else {
        task = change.data();
    }
    console.log(`calculating streak for ${task.user.displayName} with an id of ${task.user.id}`);

    const userRef = db.collection(COLLECTIONS.USERS).doc(task.user.id);
    const userSnapshot = await userRef.get();
    const user = userSnapshot.data();
    const prevCheckinDate = user.lastCheckin.toDate();

    const difference = differenceInDays(prevCheckinDate, new Date());
    if (difference === 1) {
        const newStreak = user.streak + 1;
        db.collection(COLLECTIONS.USERS)
            .doc(task.user.id)
            .update({streak: newStreak, lastCheckin: new Date()});
        console.log(`new streak for ${task.user.displayName} is ${newStreak}`);
        return;
    } else if (difference > 1) {
        db.collection(COLLECTIONS.USERS)
            .doc(task.user.id)
            .update({streak: 1, lastCheckin: new Date()});
        console.log(`new streak for ${task.user.displayName} is 1`);
        return;
    }
    console.log(`streak for ${task.user.displayName} not updated, still ${user.streak}`);
    return;
};

export function differenceInDays(date1, date2) {
    const dt1 = new Date(date1);
    const dt2 = new Date(date2);
    return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24));
}
