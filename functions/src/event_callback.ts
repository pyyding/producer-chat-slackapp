import * as functions from "firebase-functions";
import {SlackMessageAction, SlackUser, SlackUserChangeAction} from './interfaces';
const axios = require('axios');
const qs = require('querystring');


exports.handler = async function(request, response, db, slack) {
    console.log(request.body.type);
    switch (request.body.type) {
        case 'url_verification': {
            return response.status(200).send(request.body.challenge)
        }
        case 'event_callback': {
            if (request.method !== "POST") {
                console.error(`Got unsupported ${request.method} request. Expected POST.`);
                return response.status(405).send("Only POST requests are accepted");
            }

            if (request.body.token !== functions.config().slack.key) {
                console.error(`Invalid request token ${request.body.token} from ${request.body.event.user}`);
                return response.status(401).send("Invalid request token!");
            }

            console.log('action event type: ' + request.body.event.type);

            switch (request.body.event.type) {
                case 'message': {
                    const action = request.body as SlackMessageAction;

                    const welcomeTextWeb = "1. Upload your avatar image to Slack.\n" +
                        "2. Log in to the web app here  👉 httos://producer.chat/login\n" +
                        "3. Ask the community from here 👉 https://producer.chat/qa";

                    const welcomeTextSlack = "- Post your introduction to #general channel\n" +
                        "- Join any channel you want from the little '+' button on the left sidebar of Slack\n";
                    const message = {
                        token: functions.config().slack.bot_access_token,
                        as_user: true,
                        link_names: true,
                        text: 'Welcome to Producer Chat! We\'re glad you\'re here.',
                        attachments: JSON.stringify([
                            {
                                title: "Let's get you started! 😊",
                                text: welcomeTextWeb,
                                color: '#74c8ed',
                            },
                            {
                                title: "Some tips: ",
                                text: welcomeTextSlack,
                                color: '#3060f0'
                            }]),
                        channel: ''
                    };

                    message.channel = action.event.user;

                    const params = qs.stringify(message);
                    console.info(params);

                    axios.post('https://slack.com/api/chat.postMessage', params);
                    return response.status(200).send()
                }
                case 'user_change': {
                    const action = request.body as SlackUserChangeAction;
                    console.info('triggered user change: ' + action.event.user.id);
                    const slackResponse = await
                    slack.users.info({user: action.event.user.id, token: functions.config().slack.access_token});
                    if (slackResponse.ok) {
                        console.log('slackUser found, commiting changes');
                        const slackUser = slackResponse.user as SlackUser;
                        const userRef = db.collection('users').doc(action.event.user.id);
                        userRef.update({
                            displayName: slackUser.profile.display_name,
                            photoURL: slackUser.profile.image_72
                        });
                        const newUser = {
                            user: {
                                id: slackUser.id,
                                displayName: slackUser.profile.display_name,
                                photoURL: slackUser.profile.image_72
                            }
                        };

                        const questionsRef = await
                        db.collection('questions').where('user.id', '==', action.event.user.id).get();
                        const questionIDs = [];
                        questionsRef.forEach(question => {
                            questionIDs.push(question.id);
                        });

                        const answersRef = await
                        db.collection('answers').where('user.id', '==', action.event.user.id).get();
                        const answerIDs = [];
                        answersRef.forEach(answer => {
                            answerIDs.push(answer.id);
                        });

                        const batch = db.batch();
                        questionIDs.forEach(id => {
                            const questionRef = db.collection('questions').doc(id);
                            batch.update(questionRef, newUser)
                        });
                        answerIDs.forEach(id => {
                            const answerRef = db.collection('answers').doc(id);
                            batch.update(answerRef, newUser)
                        });
                        batch.commit();
                        return response.status(200).send();
                    }
                    return response.status(404).send();
                }
            }
        }
    }
    return response.status(500).send(request.body)
};
