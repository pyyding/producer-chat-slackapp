const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const {WebClient} = require("@slack/client");

// import functions
const event_callback_function = require("./event_callback");
const add_todo_function = require("./add_todo");
const add_done_todo_function = require("./add_done_todo");
const return_tasks_page_function = require("./return_tasks_page");
const help_command_function = require("./help_command");

// import trigger functions
const trigger_calculate_vote_sum_function = require("./trigger_calculate_vote_sum");
const trigger_calculate_question_rating_function = require("./trigger_calculate_question_rating");
const trigger_create_user_function = require("./trigger_create_user");
const trigger_calculate_user_streak_function = require("./trigger_calculate_user_streak");
const trigger_calculate_user_total_tracks_function = require("./trigger_calculate_user_total_tracks");
const trigger_task_completed_function = require("./trigger_task_completed");
const cron_calculate_streaks_function = require("./cron_calculate_streaks");
const cron_calculate_slugs = require("./cron_calculate_slugs");

// admin functions
const test_welcome_text_function = require("./test_welcome_text");

// An access token (from your Slack app or custom integration - xoxp, xoxb, or xoxa)
const key = functions.config().slack.key;
const slack = new WebClient(key);

// firestore setup
const db = admin.firestore();
const firestoreSettings = {timestampsInSnapshots: true};
db.settings(firestoreSettings);

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

exports.trigger_task_completed = functions.firestore.document("tasks/{taskID}")
    .onUpdate(async (change, _context) => {
        return trigger_task_completed_function.handler(change.after, db, slack);
    });

exports.trigger_task_completed2 = functions.firestore.document("tasks/{taskID}")
    .onCreate(async (snap, _context) => {
        return trigger_task_completed_function.handler(snap, db, slack);
    });

exports.add_todo = functions.https.onRequest(async (request, response) => {
    return add_todo_function.handler(request, response, db, slack);
});

exports.add_done_todo = functions.https.onRequest(async (request, response) => {
    return add_done_todo_function.handler(request, response, db, slack);
});

exports.return_tasks_page = functions.https.onRequest(async (request, response) => {
    return return_tasks_page_function.handler(request, response, db, slack);
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
