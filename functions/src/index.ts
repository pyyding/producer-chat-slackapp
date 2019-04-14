const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const {WebClient} = require("@slack/client");

// import functions
const event_callback_function = require("./event_callback");
const check_in_function = require("./check_in");
const help_command_function = require("./help_command");

// import trigger functions
const trigger_calculate_vote_sum_function = require("./trigger_calculate_vote_sum");
const trigger_calculate_question_rating_function = require("./trigger_calculate_question_rating");
const trigger_create_user_function = require("./trigger_create_user");
const trigger_calculate_user_streak_function = require("./trigger_calculate_user_streak");
const trigger_calculate_user_total_tracks_function = require("./trigger_calculate_user_total_tracks");
const cron_calculate_streaks_function = require("./cron_calculate_streaks");
const cron_calculate_slugs = require("./cron_calculate_slugs");

// admin functions
const test_welcome_text_function = require("./test_welcome_text");

// An access token (from your Slack app or custom integration - xoxp, xoxb, or xoxa)
const key = functions.config().slack.key;
const slack = new WebClient(key);

// firestore setup
const db = admin.firestore();
db.settings();

exports.message_action = functions.https.onRequest(async (request, response) => {
    return event_callback_function.handler(request, response, db, slack);
});

exports.trigger_create_user = functions.auth.user()
    .onCreate((user) => {
        return trigger_create_user_function.handler(user, db, slack);
    });

exports.trigger_calculate_vote_sum = functions.firestore.document("votes/{voteID}")
    .onCreate(async (snap, _context) => {
        return trigger_calculate_vote_sum_function.handler(snap, db);
    });

exports.trigger_calculate_question_rating = functions.firestore.document("answers/{answerID}")
    .onCreate(async (snap, _context) => {
        return trigger_calculate_question_rating_function.handler(snap, db);
    });


exports.trigger_calculate_user_streak = functions.firestore.document("tasks/{taskID}")
    .onUpdate(async (change, _context) => {
        return trigger_calculate_user_streak_function.handler(change, db);
    });

exports.trigger_calculate_user_streak_create = functions.firestore.document("tasks/{taskID}")
    .onCreate(async (snap, _context) => {
        return trigger_calculate_user_streak_function.handler(snap, db);
    });

exports.trigger_calculate_user_total_tracks = functions.firestore.document("questions/{questionID}")
    .onCreate(async (snap, _context) => {
        return trigger_calculate_user_total_tracks_function.handler(snap, db, slack);
    });

exports.check_in = functions.https.onRequest(async (request, response) => {
    return check_in_function.handler(request, response, db, slack);
});

exports.cron_calculate_streaks = functions.https.onRequest(async (request, response) => {
    return cron_calculate_streaks_function.handler(request, response, db);
});

exports.cron_calculate_slugs = functions.https.onRequest(async (request, response) => {
    return cron_calculate_slugs.handler(request, response, db);
});

exports.test_welcome_text = functions.https.onRequest(async (request, response) => {
    return test_welcome_text_function.handler(request, response, db, slack);
});

exports.help_command = functions.https.onRequest(async (request, response) => {
    return help_command_function.handler(request, response);
});
