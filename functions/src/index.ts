import * as functions from 'firebase-functions';
const admin = require('firebase-admin');
admin.initializeApp();
const { WebClient } = require('@slack/client');

// import functions
const event_callback_function = require('./event_callback');
const trigger_calculate_vote_sum_function = require('./trigger_calculate_vote_sum');
const trigger_calculate_question_rating_function = require('./trigger_calculate_question_rating');
const trigger_create_user_function = require('./trigger_create_user');

// An access token (from your Slack app or custom integration - xoxp, xoxb, or xoxa)
const key = functions.config().slack.key;
const slack = new WebClient(key);

const db = admin.firestore();

export const message_action = functions.https.onRequest(async (request, response) => {
    return event_callback_function.handler(request, response, db, slack)
});

export const trigger_create_user = functions.auth.user()
    .onCreate((user) => {
        return trigger_create_user_function.handler(user, db, slack)
    });

export const trigger_calculate_vote_sum = functions.firestore.document('votes/{voteID}')
    .onCreate( async (snap, _context) => {
       return trigger_calculate_vote_sum_function.handler(snap, db)
    });

export const trigger_calculate_question_rating = functions.firestore.document('answers/{answerID}')
    .onCreate( async (snap, _context) => {
       return trigger_calculate_question_rating_function.handler(snap, db)
    });
