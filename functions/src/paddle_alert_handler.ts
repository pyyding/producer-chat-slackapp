const axios = require("axios");
const qs = require("querystring");

const ALERT_TYPES = {
    SUBSCRIPTION_CREATED: "subscription_created",
    SUBSCRIPTION_UPDATED: "subscription_updated",
    SUBSCRIPTION_CANCELLED: "subscription_cancelled",
    SUBSCRIPTION_PAYMENT_SUCCEEDED: "subscription_payment_succeeded",
    SUBSCRIPTION_PAYMENT_FAILED: "subscription_payment_failed",
    SUBSCRIPTION_PAYMENT_REFUNDED: "subscription_payment_refunded"
};

exports.handler = async function (request, response) {
    if (request.method !== "POST") {
        console.error(`Got unsupported ${request.method} request. Expected POST.`);
        return response.status(405).send("Only POST requests are accepted");
    }

    console.log(`Received Paddle event: ${request.body.alert_name}`);
    switch(request.body.alert_name) {
        case ALERT_TYPES.SUBSCRIPTION_CREATED: {
            const message = {
                token: "xoxp-397383219366-396043467059-410283874129-cf9d6200931cd9202c4558163fa5b6b0",
                email: request.body.email
            };
            const params = qs.stringify(message);
            axios.post("https://slack.com/api/users.admin.invite", params);
            console.log(`successfully sent email to ${request.body.email}`);
            response.status(200).send("Slack invite sent!");
            return true;
        }
        case ALERT_TYPES.SUBSCRIPTION_CANCELLED: {
            // todo
        }
    }

};
