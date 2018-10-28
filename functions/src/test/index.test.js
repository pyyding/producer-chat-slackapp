const test = require('firebase-functions-test')();

const adminInitStub = sinon.stub(admin, 'initializeApp');

const myFunctions = require('../index.ts'); 

const wrapped = test.wrap(myFunctions.trigger_calculate_user_streak);
