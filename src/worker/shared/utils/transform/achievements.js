export const achievementResponse = (achievementData) => achievementData ? ({
    id: achievementData.id,
    title: achievementData.title,
    text: achievementData.text,
    minDemoVersion: achievementData.minDemoVersion,
}) : achievementData;