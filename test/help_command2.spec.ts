const functions = require("firebase-functions-test")();
import {help_command} from "./../index";

const chai = require("chai");
const assert = chai.assert;

const sinon = require("sinon");

const admin = require("firebase-admin");


const firebaseFunctions = require("firebase-functions");
const httpMocks = require("node-mocks-http");


describe("help_command", () => {
    let myFunctions, initializeApp;

    beforeAll(() => {
        initializeApp = sinon.stub();
        myFunctions = require("../index");
        firebaseFunctions.config = jest.fn(() => {
            return {slack: {key: "test-slack-key"}};
        });
    });

    afterAll(() => {
        // Restore admin.initializeApp() to its original method.
        initializeApp.restore();
        // Do other cleanup tasks.
        functions.cleanup();
    });

    it("should work", () => {
        const req = httpMocks.createRequest({
            method: "POST",
            url: "/users/123",
            body: {
                token: "test-slack-key"
            }
        });

        const res = httpMocks.createResponse();
        myFunctions.help_command(req, res);
        expect(res.statusCode).toEqual(200);
        const body = res._getData();
        expect(body.response_type).toEqual("ephemeral");
        expect(body.text).toContain("for adding todos");
    });
});
