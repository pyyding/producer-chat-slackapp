# producer-chat-slackapp
Google Functions for Producer Chat


## Configuring app

#### init config
firebase functions:config:set slack.key="a9IboJLx1WcMIDiazPcpTizn" slack.id="397383219366.395984546068" slack.access_token="xoxp-397383219366-396043467059-395985380612-ade3572d730795df75cd83e04b17406f" slack.bot_access_token="xoxb-397383219366-395985384388-5n3T12ArBrwtgwyR06zCzLHB"
firebase deploy --only functions


#### run app locally

0. run in functions directory
1. get config: `firebase functions:config:get > .runtimeconfig.json`
2. npm run lint
3. npm run build
4. firebase serve --only functions
5. ngrok http 5000
6. set request urls to ngrok urls : https://22e60853.ngrok.io/producer-chat/us-central1/message_action
