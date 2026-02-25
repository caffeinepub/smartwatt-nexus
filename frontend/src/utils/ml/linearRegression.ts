export interface PredictionResult {
  day: number;
  predicted: number;
  label: string;
}

export function linearRegressionPredict(
  historicalData: number[],
  daysAhead: number = 7
): PredictionResult[] {
  if (historicalData.length < 2) {
    return Array.from({ length: daysAhead }, (_, i) => ({
      day: i + 1,
      predicted: historicalData[0] || 5,
      label: `Day +${i + 1}`,
    }));
  }

  const n = historicalData.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = historicalData;

  // Calculate means
  const xMean = x.reduce((a, b) => a + b, 0) / n;
  const yMean = y.reduce((a, b) => a + b, 0) / n;

  // Calculate slope and intercept using least squares
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (x[i] - xMean) * (y[i] - yMean);
    denominator += (x[i] - xMean) ** 2;
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;

  return Array.from({ length: daysAhead }, (_, i) => {
    const xVal = n + i;
    const predicted = Math.max(0, slope * xVal + intercept);
    return {
      day: i + 1,
      predicted: Math.round(predicted * 100) / 100,
      label: `Day +${i + 1}`,
    };
  });
}
