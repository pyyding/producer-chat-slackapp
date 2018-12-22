exports.calculateStreak = function(tasks) {
    let streak = 0;
    let previousDate = new Date();
    console.log("tasks length:" + tasks.length);
    for (const [index, task] of tasks.entries()) {
        const timestamp = task.get("doneAt");
        const currentDate = timestamp.toDate();
        const diff = Math.abs(previousDate.valueOf() - currentDate.valueOf());
        const diffDays = diff / (1000 * 60 * 60 * 24);

        if (diffDays > 2) break;

        if (index === 0 && previousDate.toDateString() === currentDate.toDateString()) streak++;

        if (0 < (diffDays) && (diffDays) <= 1 && currentDate.getDate() !== previousDate.getDate()) streak++;

        previousDate = currentDate;
    }
    console.log("streak:" +  streak);
    return streak;
};