const chai = require('chai');
const assert = chai.assert;

const sinon = require("sinon");
// Require firebase-admin so we can stub out some of its methods.
const admin = require("firebase-admin");
const httpMocks = require("node-mocks-http");
const test = require("firebase-functions-test")();
const firebasemock    = require('firebase-mock');
const mockfirestore   = new firebasemock.MockFirestore();


describe("Cloud Functions", () => {
    let myFunctions, initializeApp, adminInitStub;

    beforeAll(() => {
        test.mockConfig({ slack: { key: "test-slack-key" } });
        adminInitStub = sinon.stub(admin, 'initializeApp');
        // sinon.stub(admin, 'firestore')
        //     .get(() => {
        //         return function () {
        //             return {
        //                 settings: () => {},
        //                 collection: (path) => {
        //                     return {
        //                         get: () => {
        //                             const getResp = {docs: [{ id: 'mock-user-1' }, { id: 'mock-user-2' }]}
        //                             return getResp
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     });

        myFunctions = require("../index.ts");
    });

    afterAll(() => {
        // Restore admin.initializeApp() to its original method.
        initializeApp.restore();
        // Do other cleanup tasks.
        functions.cleanup();
    });

    describe("cron_calculate_streaks", () => {
        it("should calculate correctly", () => {
            const req = httpMocks.createRequest({
                method: "POST",
                url: "/users/123",
                body: {
                    token: "test-slack-key"
                }
            });

            const res = httpMocks.createResponse();

            myFunctions.cron_calculate_streaks(req, res);
        });
    });
});
