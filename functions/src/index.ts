import * as functions from 'firebase-functions';
const axios = require('axios');
const qs = require('querystring');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const { WebClient } = require('@slack/client');

// An access token (from your Slack app or custom integration - xoxp, xoxb, or xoxa)
const token = functions.config().slack.key;

const slack = new WebClient(token);


const db = admin.firestore();

export const message_action = functions.https.onRequest(async (request, response) => {
  console.log(request.body.type);
  switch (request.body.type) {
    case 'url_verification': {
      return response.status(200).send(request.body.challenge)
    }
    case 'event_callback': {
      const { event } = request.body; // @TODO: verify with token
      console.log(event);
      switch (event.type) {
        case 'message': {
          const welcomeTextWeb = "1. Upload your avatar image to Slack.\n" +
            "2. Log in to the web app here  👉 httos://producer.chat/login\n" +
            "3. Ask the community from here 👉 https://producer.chat/qa";

          const welcomeTextSlack = "- Post your introduction to #general channel\n" +
            "- Join any channel you want from the little '+' button on the left sidebar of Slack\n";
          const message = {
            token: 'xoxb-397383219366-395985384388-5n3T12ArBrwtgwyR06zCzLHB',
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

          message.channel = event.user;

          const params = qs.stringify(message);
          console.info(params);

          axios.post('https://slack.com/api/chat.postMessage', params);
          return response.status(200).send()
        }
        case 'team_join': {
          return response.status(200).send({ text: 'cool message sent to me' })
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
    return slack.users.lookupByEmail({email: user.email, token: 'xoxp-397383219366-396043467059-395985380612-ade3572d730795df75cd83e04b17406f'})
        .then(function (response) {
            console.log('slack response:' + response);
           if (response.ok) {
               console.log('found slack user');
               const slackUser = response.user as SlackUser;
               const newUser = {
                   email: user.email,
                   displayName: slackUser.profile.display_name,
                   photoURL72: slackUser.profile.image_72,
                   photoURL192: slackUser.profile.image_192,
                   isAdmin: slackUser.is_admin,
                   isRestricted: slackUser.is_restricted
               };
               console.log(newUser);
               db.collection('users').doc(slackUser.id).set(newUser)
           } else {
               console.log('no slack user found.')
           }
        });
});

// export const command_ask = functions.https.onRequest(async (request, response) => {
//     if (request.method !== "POST") {
//         console.error(`Got unsupported ${request.method} request. Expected POST.`);
//         return response.status(405).send("Only POST requests are accepted");
//     }
//
//     const command = request.body as SlackSlashCommand;
//     if (command.token !== functions.config().slack.key) {
//         console.error(`Invalid request token ${command.token} from ${command.team_id} (${command.team_domain}.slack.com)`);
//         return response.status(401).send("Invalid request token!");
//     }
//
//     const question = {
//         title: command.text,
//         user: command.user_id,
//     }
//
//     admin.database().ref('/questions').push
//
// });

// export const command_get_login_link = functions.https.onRequest(async (request, response) => {
//     if (request.method !== "POST") {
//         console.error(`Got unsupported ${request.method} request. Expected POST.`);
//         return response.status(405).send("Only POST requests are accepted");
//     }
//
//     const command = request.body as SlackSlashCommand;
//     if (command.token !== functions.config().slack.key) {
//         console.error(`Invalid request token ${command.token} from ${command.team_id} (${command.team_domain}.slack.com)`);
//         return response.status(401).send("Invalid request token!");
//     }
//
//     const authToken = Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8);
//
//     const newUser = {
//         displayName: '',
//         photoURL: '',
//         authToken: authToken
//     };
//
// const userRef = db.collection('users').doc(command.user_id);
//     userRef.get()
//         .then(doc => {
//             if (doc.exists) {
//               const existingUser = doc.data();
//               userRef.update({ authToken: authToken });
//               console.log('User:', existingUser);
//             } else {
//               console.log('creating user');
//                 db.collection('users').doc(command.user_id).set(newUser)
//             }
//         })
//         .catch(err => {
//             console.log('Error getting document', err);
//         });
//
//     return response.contentType("json").status(200).send({
//         "response_type": "ephemeral",
//         "text": `Click to login to the web-app: https://producer.chat/login?token=${authToken}`
//     });
// });
//
// export const command_login = functions.https.onRequest(async (request, response) => {
//     if (request.method !== "POST") {
//         console.error(`Got unsupported ${request.method} request. Expected POST.`);
//         return response.status(405).send("Only POST requests are accepted");
//     }
//
//     const loginModel = request.body as LoginModel;
//
//     try {
//         const user = await db.collection('users').where('authToken', '==', loginModel.authToken).get()
//     } catch (error) {
//         console.log(error)
//     }
//
//
//
//
//     return response
// });
//
// interface LoginModel {
//     authToken: string
// }

interface SlackUser {
    id: string,
    team_id: string,
    name: string,

}

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