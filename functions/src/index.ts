import * as functions from 'firebase-functions';
const axios = require('axios');
const qs = require('querystring');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const { WebClient } = require('@slack/client');

// An access token (from your Slack app or custom integration - xoxp, xoxb, or xoxa)
const key = functions.config().slack.key;

const slack = new WebClient(key);


const db = admin.firestore();

export const message_action = functions.https.onRequest(async (request, response) => {
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
            console.info('triggered user change: ' + action.event.user.id  );
            const slackResponse = await slack.users.info({ user: action.event.user.id, token: functions.config().slack.access_token });
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

                const questionsRef = await db.collection('questions').where('user.id', '==', action.event.user.id).get();
                const questionIDs = [];
                questionsRef.forEach(question => {
                    questionIDs.push(question.id);
                });

                const answersRef = await db.collection('answers').where('user.id', '==', action.event.user.id).get();
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
});

export const command_ping = functions.https.onRequest(async (request, response) => {
  if (request.method !== "POST") {
    console.error(`Got unsupported ${request.method} request. Expected POST.`);
    return response.status(405).send("Only POST requests are accepted");
  }

   const command = request.body as SlackSlashCommand;
   if (command.token !== functions.config().slack.key) {
       console.error(`Invalid request token ${command.token} from ${command.team_id} (${command.team_domain}.slack.com)`);
       return response.status(401).send("Invalid request token!");
   }

  // Handle the commands later, Slack expect this request to return within 3000ms
  // await admin.database().ref("commands/ping").push(command);

  return response.contentType("json").status(200).send({
    "response_type": "ephemeral",
    "text": "jou.."
  });
});

export const trigger_create_user = functions.auth.user().onCreate((user) => {
    console.log('triggered create_user');
    return slack.users.lookupByEmail({email: user.email, token: functions.config().slack.access_token })
        .then(function (response) {
            console.log('slack response:' + response);
           if (response.ok) {
               console.log('found slack user');
               const slackUser = response.user as SlackUser;
               const newUser = {
                   email: user.email,
                   displayName: slackUser.profile.display_name,
                   photoURL: slackUser.profile.image_72,
                   isAdmin: slackUser.is_admin,
                   isRestricted: slackUser.is_restricted,
                   createdAt: new Date()
               };
               console.log(newUser);
               db.collection('users').doc(slackUser.id).set(newUser)
           } else {
               console.log('no slack user found.')
           }
        });
});

interface SlackUser {
    id: string;
    team_id: string;
    name: string;
    deleted: boolean;
    color: string;
    real_name: string;
    tz: string;
    tz_label: string;
    tz_offset: number;
    profile: SlackUserProfile;
    is_admin: boolean;
    is_owner: boolean;
    is_primary_owner: boolean;
    is_restricted: boolean;
    is_ultra_restricted: boolean;
    is_bot: boolean;
    is_stranger: boolean;
    updated: number;
    is_app_user: boolean;
    has_2fa: boolean;
    locale: string;
}

interface SlackUserProfile {
    avatar_hash: string;
    status_text: string;
    status_emoji: string;
    real_name: string;
    display_name: string;
    real_name_normalized: string;
    display_name_normalized: string;
    email: string;
    image_24: string;
    image_32: string;
    image_48: string;
    image_72: string;
    image_192: string;
    image_512: string;
    team: string;
}

interface SlackSlashCommand {
  token: string,
  team_id: string,
  team_domain: string,
  channel_id: string,
  channel_name: string,
  user_id: string,
  user_name: string,
  command: string,
  text: string,
  response_url: string
}

export interface SlackMessageAction {
    token: string;
    team_id: string;
    api_app_id: string;
    event: {
        type: string,
        user: string,
        item: {
            type: string,
            channel: string,
            ts: string
        },
        reaction: string,
        item_user: string,
        event_ts: string
    };
    type: string;
    authed_users: string[];
    event_id: string,
    event_time: number
}

export interface SlackUserChangeAction {
    token: string;
    team_id: string;
    api_app_id: string;
    event: {
        type: string,
        user: {
            id: string
        },
        item: {
            type: string,
            channel: string,
            ts: string
        },
        reaction: string,
        item_user: string,
        event_ts: string
    };
    type: string;
    authed_users: string[];
    event_id: string,
    event_time: number
}
