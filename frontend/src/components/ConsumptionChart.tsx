import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';
import { timestampToDate } from '../utils/dateUtils';
import type { ConsumptionRecord } from '../backend';
import type { PredictionResult } from '../utils/ml/linearRegression';

interface ChartDataPoint {
  date: string;
  actual?: number;
  predicted?: number;
  timestamp: number;
}

interface ConsumptionChartProps {
  records: ConsumptionRecord[];
  predictions?: PredictionResult[];
  height?: number;
}

// Cyan/teal for actual consumption
const CYAN = 'oklch(0.72 0.18 195)';
const GRID_COLOR = 'oklch(0.25 0.04 250)';
const TICK_COLOR = 'oklch(0.60 0.04 230)';

// High-contrast vivid violet for ML forecast — clearly distinct on dark navy
const FORECAST = '#a855f7';
const FORECAST_GLOW = 'rgba(168, 85, 247, 0.35)';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-card text-xs">
        <p className="text-muted-foreground mb-1">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} style={{ color: entry.color }} className="font-medium">
            {entry.name}: {entry.value?.toFixed(2)} kWh
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ConsumptionChart({ records, predictions = [], height = 320 }: ConsumptionChartProps) {
  const sortedRecords = [...records].sort((a, b) => Number(a.date) - Number(b.date));

  const historicalData: ChartDataPoint[] = sortedRecords.map((r) => ({
    date: format(timestampToDate(r.date), 'MMM dd'),
    actual: Number(r.unitsConsumed),
    timestamp: Number(r.date),
  }));

  const lastTimestamp = sortedRecords.length > 0
    ? Number(sortedRecords[sortedRecords.length - 1].date)
    : Math.floor(Date.now() / 1000);

  const predictionData: ChartDataPoint[] = predictions.map((p, i) => ({
    date: format(new Date((lastTimestamp + (i + 1) * 86400) * 1000), 'MMM dd'),
    predicted: p.predicted,
    timestamp: lastTimestamp + (i + 1) * 86400,
  }));

  const chartData: ChartDataPoint[] = [...historicalData];
  if (predictions.length > 0 && historicalData.length > 0) {
    chartData[chartData.length - 1] = {
      ...chartData[chartData.length - 1],
      predicted: chartData[chartData.length - 1].actual,
    };
  }
  chartData.push(...predictionData);

  const avgConsumption = historicalData.length > 0
    ? historicalData.reduce((sum, d) => sum + (d.actual || 0), 0) / historicalData.length
    : 0;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CYAN} stopOpacity={0.3} />
            <stop offset="95%" stopColor={CYAN} stopOpacity={0} />
          </linearGradient>
          <filter id="forecastGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: TICK_COLOR, fontSize: 11 }}
          axisLine={{ stroke: GRID_COLOR }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: TICK_COLOR, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}`}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '12px', color: TICK_COLOR }}
        />
        {avgConsumption > 0 && (
          <ReferenceLine
            y={avgConsumption}
            stroke={TICK_COLOR}
            strokeDasharray="4 4"
            label={{ value: `Avg: ${avgConsumption.toFixed(1)}`, fill: TICK_COLOR, fontSize: 10, position: 'right' }}
          />
        )}
        <Line
          type="monotone"
          dataKey="actual"
          name="Actual (kWh)"
          stroke={CYAN}
          strokeWidth={2.5}
          dot={{ fill: CYAN, r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: CYAN, stroke: '#fff', strokeWidth: 2 }}
          connectNulls={false}
        />
        {predictions.length > 0 && (
          <Line
            type="monotone"
            dataKey="predicted"
            name="Forecast (ML)"
            stroke={FORECAST}
            strokeWidth={2.5}
            strokeDasharray="6 4"
            dot={{ fill: FORECAST, r: 3.5, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: FORECAST, stroke: '#fff', strokeWidth: 2 }}
            connectNulls={false}
            style={{ filter: `drop-shadow(0 0 6px ${FORECAST_GLOW})` }}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
