import * as functions from 'firebase-functions';
import {SlackUser} from './interfaces';

exports.handler = async function (user, db, slack) {
    console.info('triggered create_user');
    return slack.users.lookupByEmail({email: user.email, token: functions.config().slack.access_token })
        .then(function (response) {
            console.log('slack response:' + response);
            if (response.ok) {
                console.info('found slack user');
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
                console.error('no slack user found.')
            }
        });
};
