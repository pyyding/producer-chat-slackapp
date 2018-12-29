const axios = require("axios");
const qs = require("querystring");
import * as functions from "firebase-functions";


const notifyEvilPlans = (username) => {
    const message = {
        token: functions.config().slack.bot_access_token,
        as_user: true,
        link_names: true,
        text: `🚨 NEW MEMBER ALERT: ${username} 🚨`,
        channel: "GE11SAG8G"
    };
    const params = qs.stringify(message);
    axios.post("https://slack.com/api/chat.postMessage", params);
};

export default notifyEvilPlans;