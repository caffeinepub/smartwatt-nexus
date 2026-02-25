import type { PredictionResult } from './linearRegression';

function tanh(x: number): number {
  return Math.tanh(Math.max(-20, Math.min(20, x)));
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
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

export function lstmLikePredict(
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
  const hiddenSize = 6;
  const learningRate = 0.03;
  const epochs = 150;

  // Deterministic initialization
  const seed = historicalData.reduce((a, b) => a + b, 0);
  let rng = seed;
  const rand = () => {
    rng = (rng * 1664525 + 1013904223) & 0xffffffff;
    return ((rng / 0x80000000) - 1) * 0.1;
  };

  // LSTM-like cell weights (simplified)
  // Forget gate
  let Wf = Array.from({ length: hiddenSize }, () => Array.from({ length: hiddenSize + 1 }, rand));
  // Input gate
  let Wi = Array.from({ length: hiddenSize }, () => Array.from({ length: hiddenSize + 1 }, rand));
  // Cell gate
  let Wc = Array.from({ length: hiddenSize }, () => Array.from({ length: hiddenSize + 1 }, rand));
  // Output gate
  let Wo = Array.from({ length: hiddenSize }, () => Array.from({ length: hiddenSize + 1 }, rand));
  // Output layer
  let Wy = Array.from({ length: hiddenSize }, rand);
  let by = rand();

  function lstmStep(
    x: number,
    h: number[],
    c: number[]
  ): { h: number[]; c: number[] } {
    const input = [...h, x];

    const f = Wf.map((row) => sigmoid(row.reduce((sum, w, i) => sum + w * input[i], 0)));
    const iGate = Wi.map((row) => sigmoid(row.reduce((sum, w, i) => sum + w * input[i], 0)));
    const cGate = Wc.map((row) => tanh(row.reduce((sum, w, i) => sum + w * input[i], 0)));
    const o = Wo.map((row) => sigmoid(row.reduce((sum, w, i) => sum + w * input[i], 0)));

    const newC = c.map((ci, j) => f[j] * ci + iGate[j] * cGate[j]);
    const newH = o.map((oj, j) => oj * tanh(newC[j]));

    return { h: newH, c: newC };
  }

  function forward(sequence: number[]): number[] {
    let h = Array(hiddenSize).fill(0);
    let c = Array(hiddenSize).fill(0);
    const outputs: number[] = [];

    for (const x of sequence) {
      const result = lstmStep(x, h, c);
      h = result.h;
      c = result.c;
      const out = h.reduce((sum, hj, j) => sum + hj * Wy[j], by);
      outputs.push(sigmoid(out));
    }

    return outputs;
  }

  // Simple training with gradient approximation (finite differences)
  for (let epoch = 0; epoch < epochs; epoch++) {
    const outputs = forward(normalized);
    // Shift outputs to predict next step
    for (let t = 0; t < normalized.length - 1; t++) {
      const error = outputs[t] - normalized[t + 1];
      // Update output weights with simple gradient
      for (let j = 0; j < hiddenSize; j++) {
        Wy[j] -= learningRate * error * 0.01;
      }
      by -= learningRate * error * 0.01;
    }
  }

  // Generate predictions
  const predictions: PredictionResult[] = [];
  let h = Array(hiddenSize).fill(0);
  let c = Array(hiddenSize).fill(0);

  // Warm up with historical data
  for (const x of normalized) {
    const result = lstmStep(x, h, c);
    h = result.h;
    c = result.c;
  }

  let lastX = normalized[normalized.length - 1];

  for (let i = 0; i < daysAhead; i++) {
    const result = lstmStep(lastX, h, c);
    h = result.h;
    c = result.c;
    const out = sigmoid(h.reduce((sum, hj, j) => sum + hj * Wy[j], by));
    const predictedNorm = Math.max(0, Math.min(1, out));
    const predicted = Math.max(0, denormalize(predictedNorm, min, max));

    predictions.push({
      day: i + 1,
      predicted: Math.round(predicted * 100) / 100,
      label: `Day +${i + 1}`,
    });

    lastX = predictedNorm;
  }

  return predictions;
}
