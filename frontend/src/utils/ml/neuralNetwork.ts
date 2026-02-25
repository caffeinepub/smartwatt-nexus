import type { PredictionResult } from './linearRegression';

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
}

function sigmoidDerivative(x: number): number {
  const s = sigmoid(x);
  return s * (1 - s);
}

function normalizeData(data: number[]): { normalized: number[]; min: number; max: number } {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return {
    normalized: data.map((v) => (v - min) / range),
    min,
    max,
  };
}

function denormalize(value: number, min: number, max: number): number {
  return value * (max - min) + min;
}

export function annPredict(
  historicalData: number[],
  daysAhead: number = 7
): PredictionResult[] {
  if (historicalData.length < 3) {
    return Array.from({ length: daysAhead }, (_, i) => ({
      day: i + 1,
      predicted: historicalData[historicalData.length - 1] || 5,
      label: `Day +${i + 1}`,
    }));
  }

  const { normalized, min, max } = normalizeData(historicalData);
  const windowSize = Math.min(5, Math.floor(historicalData.length / 2));
  const inputSize = windowSize;
  const hiddenSize = 8;
  const outputSize = 1;
  const learningRate = 0.05;
  const epochs = 200;

  // Initialize weights randomly but deterministically
  const seed = historicalData.reduce((a, b) => a + b, 0);
  let rng = seed;
  const rand = () => {
    rng = (rng * 1664525 + 1013904223) & 0xffffffff;
    return (rng / 0x80000000) - 1;
  };

  let w1 = Array.from({ length: inputSize }, () =>
    Array.from({ length: hiddenSize }, () => rand() * 0.5)
  );
  let b1 = Array.from({ length: hiddenSize }, () => 0);
  let w2 = Array.from({ length: hiddenSize }, () =>
    Array.from({ length: outputSize }, () => rand() * 0.5)
  );
  let b2 = Array.from({ length: outputSize }, () => 0);

  // Build training samples
  const samples: { input: number[]; output: number[] }[] = [];
  for (let i = windowSize; i < normalized.length; i++) {
    samples.push({
      input: normalized.slice(i - windowSize, i),
      output: [normalized[i]],
    });
  }

  if (samples.length === 0) {
    return Array.from({ length: daysAhead }, (_, i) => ({
      day: i + 1,
      predicted: historicalData[historicalData.length - 1] || 5,
      label: `Day +${i + 1}`,
    }));
  }

  // Training
  for (let epoch = 0; epoch < epochs; epoch++) {
    for (const sample of samples) {
      // Forward pass
      const hidden = b1.map((bias, j) => {
        const z = sample.input.reduce((sum, xi, i) => sum + xi * w1[i][j], bias);
        return sigmoid(z);
      });

      const output = b2.map((bias, k) => {
        const z = hidden.reduce((sum, hj, j) => sum + hj * w2[j][k], bias);
        return sigmoid(z);
      });

      // Backward pass
      const outputError = output.map((o, k) => o - sample.output[k]);
      const outputDelta = output.map((o, k) => outputError[k] * sigmoidDerivative(o));

      const hiddenError = hidden.map((_, j) =>
        outputDelta.reduce((sum, delta, k) => sum + delta * w2[j][k], 0)
      );
      const hiddenDelta = hidden.map((h, j) => hiddenError[j] * sigmoidDerivative(h));

      // Update weights
      for (let j = 0; j < hiddenSize; j++) {
        for (let k = 0; k < outputSize; k++) {
          w2[j][k] -= learningRate * outputDelta[k] * hidden[j];
        }
      }
      b2 = b2.map((b, k) => b - learningRate * outputDelta[k]);

      for (let i = 0; i < inputSize; i++) {
        for (let j = 0; j < hiddenSize; j++) {
          w1[i][j] -= learningRate * hiddenDelta[j] * sample.input[i];
        }
      }
      b1 = b1.map((b, j) => b - learningRate * hiddenDelta[j]);
    }
  }

  // Predict
  const predictions: PredictionResult[] = [];
  let window = normalized.slice(-windowSize);

  for (let i = 0; i < daysAhead; i++) {
    const hidden = b1.map((bias, j) => {
      const z = window.reduce((sum, xi, idx) => sum + xi * w1[idx][j], bias);
      return sigmoid(z);
    });

    const output = b2.map((bias, k) => {
      const z = hidden.reduce((sum, hj, j) => sum + hj * w2[j][k], bias);
      return sigmoid(z);
    });

    const predictedNorm = Math.max(0, Math.min(1, output[0]));
    const predicted = Math.max(0, denormalize(predictedNorm, min, max));

    predictions.push({
      day: i + 1,
      predicted: Math.round(predicted * 100) / 100,
      label: `Day +${i + 1}`,
    });

    window = [...window.slice(1), predictedNorm];
  }

  return predictions;
}
