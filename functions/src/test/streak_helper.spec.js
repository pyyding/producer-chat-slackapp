const streakHelper = require("../streak_helper.js");

describe("streak_helper", () => {
    class MockTask {
        constructor(date) {
            this.date = date;
        }

        get() {
            return {toDate: () => new Date(this.date)};
        }
    }

    beforeAll(() => {
        const now = new Date(1543769769005);
        global.Date.now = jest.fn(() => now);
    });

    it("should work with multiple", () => {

        const secondDecember = 1543769769005;
        const firstDecember = 1543683372258;
        const thirtythNovember = 1543602632797;
        const thirtythNovember2 = 1543537832797;
        const twentythNovember = 1542733035254;
        const tasks = [
            new MockTask(secondDecember),
            new MockTask(firstDecember),
            new MockTask(thirtythNovember),
            new MockTask(thirtythNovember2),
            new MockTask(twentythNovember)
        ];
        const streak = streakHelper.calculateStreak(tasks);
        expect(streak).toEqual(3);
    });

    it("should work with one", () => {
        const secondDecember = 1543769769005;
        const tasks = [
            new MockTask(secondDecember)
        ];
        const streak = streakHelper.calculateStreak(tasks);
        expect(streak).toEqual(1);
    });

});
