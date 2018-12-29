exports.handler = async function (snap, db) {
    const answer = snap.data();
    console.log(`answerID: ${answer.id}`);
    let ratingSum = 0;
    let count = 0;
    const snapshot = await db.collection("answers").where("questionID", "==", answer.questionID).get();
    console.log(`snapshot of all votes: ${snapshot}`);
    for (const vote of snapshot.docs) {
        ratingSum += vote.data().rating;
        count++;
    }
    const ratingAvg = parseFloat((ratingSum / count).toFixed(1));
    db.collection("questions").doc(answer.questionID).update({ratingAvg: ratingAvg});
};
