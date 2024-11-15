export function calculateTimeToLevelUp(A, B, N, M, factor, dxp) {
    if(dxp <= 0) return 1.e+16;
    // Логарифм 1.01
    const ln1_01 = Math.log(factor);

    // Перший інтеграл
    const firstTerm = A * (Math.pow(factor, M) - Math.pow(factor, N)) / ln1_01;

    // Другий інтеграл - частина з level
    const secondTermPart1 = A * B * ((M * Math.pow(factor, M) - N * Math.pow(factor, N)) / ln1_01);

    // Другий інтеграл - частина з додатковим множником 1/(ln(1.01))^2
    const secondTermPart2 = A * B * ((Math.pow(factor, M) - Math.pow(factor, N)) / (ln1_01 ** 2));

    // Підсумкова загальна кількість XP
    const totalXP = firstTerm + secondTermPart1 - secondTermPart2;

    // Час, необхідний для підвищення рівня
    const totalTime = totalXP / dxp;

    return totalTime;
}

export function weightedRandomChoice(probMap) {
    // Calculate total weight
    const totalWeight = Object.values(probMap).reduce((sum, weight) => sum + weight, 0);

    // Generate a random number in the range of totalWeight
    const randVal = Math.random() * totalWeight;

    // Traverse through the items, accumulating the weight
    let cumulativeWeight = 0;
    for (const [key, weight] of Object.entries(probMap)) {
        cumulativeWeight += weight;
        if (randVal < cumulativeWeight) {
            return key;
        }
    }
}