import {expect} from "chai";
import sinon from "sinon";
import admin from "firebase-admin";

import * as FirebaseFunctionsTest from "firebase-functions-test";

const functions = FirebaseFunctionsTest();

describe("Cloud Functions", () => {
    let myFunctions, adminInitStub;

    before(() => {
        functions.mockConfig({slack: {key: "test-slack-key"}});
        adminInitStub = sinon.stub(admin, "initializeApp");
        myFunctions = require("../functions/src/index");
        debugger;
    });

    after(() => {
        adminInitStub.restore();
        functions.cleanup();
    });

    describe("makeUpperCase", () => {
        it("should work", () => {
            const wrapped = functions.wrap(myFunctions.help_command);
        });
    });
});