import {COLLECTIONS} from "./constants";
import slugify from "slugify";

exports.handler = async function (request, response, db) {
    if (request.method !== "POST") {
        console.error(`Got unsupported ${request.method} request. Expected POST.`);
        return response.status(405).send("Only POST requests are accepted");
    }

    response
        .contentType("json")
        .status(200)
        .send({
            text: "Calculating slugs"
        });

    const usersSnapshot = await db.collection(COLLECTIONS.USERS).get();

    usersSnapshot.forEach((doc) => {
        const user = doc.data()
        const slug = slugify(user.displayName);
        db.collection(COLLECTIONS.USERS)
            .doc(user.id)
            .update({slug: slug});
    })
};
