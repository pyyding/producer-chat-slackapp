import { COLLECTIONS } from "./constants";

exports.handler = async function (snap, db) {
    const track = snap.data();
    console.log(`track by: ${track.user.displayName}`);
    const snapshot = await db.collection(COLLECTIONS.TRACKS).where('user.id', '==', track.user.id).get();
    const questions = snapshot.docs;
    db.collection(COLLECTIONS.USERS).doc(track.user.id).update({ totalTracks: questions.length });
};
