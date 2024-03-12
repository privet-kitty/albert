export const calcScore = (
  delta: number,
  deltaAtZero = 16,
  deltaAtMax = 2
): number => {
  const rate = (deltaAtZero - delta) / (deltaAtZero - deltaAtMax);
  return 10 * Math.min(Math.max(rate, 0), 1);
};

export const calcRank = (totalScore: number): string => {
  if (totalScore === 100) {
    return "Perfect";
  } else if (totalScore >= 90) {
    return "Excellent";
  } else if (totalScore >= 80) {
    return "Great";
  } else if (totalScore >= 70) {
    return "Very good";
  } else if (totalScore >= 60) {
    return "Good";
  } else if (totalScore >= 40) {
    return "Fair";
  } else {
    return "Poor";
  }
};
