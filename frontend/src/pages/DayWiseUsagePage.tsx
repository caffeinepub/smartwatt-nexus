import { useState, useMemo } from 'react';
import { useGetUserConsumptionRecords } from '../hooks/useQueries';
import { filterRecordsByMonth, timestampToDate, getMonthDays } from '../utils/dateUtils';
import { format } from 'date-fns';
import MonthNavigator from '../components/MonthNavigator';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3 } from 'lucide-react';

const CYAN = 'oklch(0.72 0.18 195)';
const CYAN_DIM = 'oklch(0.72 0.18 195 / 0.5)';
const GRID_COLOR = 'oklch(0.25 0.04 250)';
const TICK_COLOR = 'oklch(0.60 0.04 230)';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 text-xs shadow-card">
        <p className="text-muted-foreground mb-1">{label}</p>
        <p className="font-semibold text-energy">{payload[0].value?.toFixed(2)} kWh</p>
      </div>
    );
  }
  return null;
};

export default function DayWiseUsagePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: records = [], isLoading } = useGetUserConsumptionRecords();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthRecords = useMemo(
    () => filterRecordsByMonth(records, year, month),
    [records, year, month]
  );

  const chartData = useMemo(() => {
    const days = getMonthDays(year, month);
    const dayMap = new Map<string, number>();

    for (const record of monthRecords) {
      const date = timestampToDate(record.date);
      const key = format(date, 'yyyy-MM-dd');
      dayMap.set(key, (dayMap.get(key) || 0) + Number(record.unitsConsumed));
    }

    return days.map((day) => ({
      date: format(day, 'dd'),
      fullDate: format(day, 'MMM dd'),
      units: dayMap.get(format(day, 'yyyy-MM-dd')) || 0,
    }));
  }, [monthRecords, year, month]);

  const totalUnits = chartData.reduce((sum, d) => sum + d.units, 0);
  const avgUnits = chartData.filter((d) => d.units > 0).length > 0
    ? totalUnits / chartData.filter((d) => d.units > 0).length
    : 0;
  const maxUnits = Math.max(...chartData.map((d) => d.units), 0);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-energy" />
            Day-wise Usage
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Daily electricity consumption breakdown</p>
        </div>
        <MonthNavigator
          currentDate={currentDate}
          onChange={setCurrentDate}
          maxDate={new Date()}
        />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Units', value: `${totalUnits.toFixed(1)} kWh` },
          { label: 'Daily Average', value: `${avgUnits.toFixed(1)} kWh` },
          { label: 'Peak Day', value: `${maxUnits.toFixed(1)} kWh` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border p-4 text-center" style={{ background: 'var(--card)' }}>
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            {isLoading ? (
              <Skeleton className="h-6 w-20 mx-auto bg-muted/50" />
            ) : (
              <p className="text-lg font-bold font-display text-energy">{stat.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="rounded-xl border border-border p-5" style={{ background: 'var(--card)' }}>
        <h2 className="font-display font-semibold text-foreground mb-5">
          Daily Consumption — {format(currentDate, 'MMMM yyyy')}
        </h2>

        {isLoading ? (
          <Skeleton className="h-80 w-full bg-muted/30 rounded-lg" />
        ) : totalUnits === 0 ? (
          <div className="h-80 flex flex-col items-center justify-center text-center gap-3">
            <BarChart3 className="w-12 h-12 text-energy opacity-30" />
            <p className="text-muted-foreground font-medium">No data for this month</p>
            <p className="text-xs text-muted-foreground">Add consumption records or navigate to a different month</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: TICK_COLOR, fontSize: 10 }}
                axisLine={{ stroke: GRID_COLOR }}
                tickLine={false}
                interval={1}
              />
              <YAxis
                tick={{ fill: TICK_COLOR, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={40}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'oklch(0.72 0.18 195 / 0.05)' }} />
              <Bar dataKey="units" name="Units (kWh)" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.units === maxUnits && maxUnits > 0 ? CYAN : CYAN_DIM}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Day-wise grid */}
      {!isLoading && totalUnits > 0 && (
        <div className="rounded-xl border border-border p-5" style={{ background: 'var(--card)' }}>
          <h3 className="font-display font-semibold text-foreground mb-4">Daily Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {chartData.map((day) => (
              <div
                key={day.date}
                className={`p-2 rounded-lg text-center border transition-colors ${
                  day.units > 0
                    ? 'border-energy/30 bg-energy/5'
                    : 'border-border bg-muted/10'
                }`}
              >
                <p className="text-xs text-muted-foreground">{day.fullDate}</p>
                <p className={`text-sm font-bold mt-0.5 ${day.units > 0 ? 'text-energy' : 'text-muted-foreground'}`}>
                  {day.units > 0 ? `${day.units.toFixed(1)}` : '—'}
                </p>
                {day.units > 0 && <p className="text-xs text-muted-foreground">kWh</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
