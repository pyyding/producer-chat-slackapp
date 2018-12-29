exports.handler = async function (snap, db) {
        const userVote = snap.data();
        console.log(`vote answerID: ${userVote.answerID}`);
        let voteSum = 0;
        const snapshot = await db.collection("votes").where("answerID", "==", userVote.answerID).get();
        console.log(`snapshot of all votes: ${snapshot}`);
        for (const vote of snapshot.docs) {
            voteSum += vote.data().isUpvote ? 1 : -1;
        }
        db.collection("answers").doc(userVote.answerID).update({voteSum: voteSum});
    };
