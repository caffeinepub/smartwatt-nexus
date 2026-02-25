import { useState, useMemo, useEffect } from 'react';
import { useGetUserConsumptionRecords } from '../hooks/useQueries';
import { timestampToDate, groupRecordsByDay } from '../utils/dateUtils';
import { format, subDays, startOfDay } from 'date-fns';
import { linearRegressionPredict } from '../utils/ml/linearRegression';
import { annPredict } from '../utils/ml/neuralNetwork';
import { lstmLikePredict } from '../utils/ml/lstmLike';
import type { MLModel } from '../components/ModelSelector';
import ConsumptionChart from '../components/ConsumptionChart';
import TrendIndicator from '../components/TrendIndicator';
import ConsumptionAlert from '../components/ConsumptionAlert';
import ModelSelector from '../components/ModelSelector';
import ManualEntryForm from '../components/ManualEntryForm';
import DemoDataButton from '../components/DemoDataButton';
import OnboardingGuide, { isOnboardingDismissed } from '../components/OnboardingGuide';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap, Activity, Calendar, TrendingUp, Database } from 'lucide-react';

export default function DashboardPage() {
  const { data: records = [], isLoading } = useGetUserConsumptionRecords();
  const [selectedModel, setSelectedModel] = useState<MLModel>('regression');
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => Number(a.date) - Number(b.date)),
    [records]
  );

  const dayMap = useMemo(() => groupRecordsByDay(sortedRecords), [sortedRecords]);

  const todayKey = format(startOfDay(new Date()), 'yyyy-MM-dd');
  const yesterdayKey = format(subDays(startOfDay(new Date()), 1), 'yyyy-MM-dd');
  const todayValue = dayMap.get(todayKey) || 0;
  const yesterdayValue = dayMap.get(yesterdayKey) || 0;

  const historicalValues = useMemo(() => {
    const sorted = Array.from(dayMap.entries()).sort(([a], [b]) => a.localeCompare(b));
    return sorted.map(([, v]) => v);
  }, [dayMap]);

  const predictions = useMemo(() => {
    if (historicalValues.length < 2) return [];
    switch (selectedModel) {
      case 'regression': return linearRegressionPredict(historicalValues, 7);
      case 'ann': return annPredict(historicalValues, 7);
      case 'lstm': return lstmLikePredict(historicalValues, 7);
    }
  }, [historicalValues, selectedModel]);

  const totalUnits = sortedRecords.reduce((sum, r) => sum + Number(r.unitsConsumed), 0);
  const avgDaily = dayMap.size > 0 ? totalUnits / dayMap.size : 0;
  const maxDay = dayMap.size > 0 ? Math.max(...Array.from(dayMap.values())) : 0;

  const showAlert = !alertDismissed && todayValue > yesterdayValue && yesterdayValue > 0;

  // Show onboarding for new users (no records) who haven't dismissed it
  useEffect(() => {
    if (!isLoading && records.length === 0 && !isOnboardingDismissed()) {
      setShowOnboarding(true);
    }
  }, [isLoading, records.length]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Onboarding guide */}
      <OnboardingGuide
        isOpen={showOnboarding}
        onDismiss={() => setShowOnboarding(false)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Zap className="w-6 h-6 text-energy" />
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time electricity consumption overview
          </p>
        </div>
        <DemoDataButton />
      </div>

      {/* Alert */}
      {showAlert && (
        <ConsumptionAlert
          todayValue={todayValue}
          yesterdayValue={yesterdayValue}
          onDismiss={() => setAlertDismissed(true)}
        />
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Today's Usage",
            value: `${todayValue.toFixed(1)} kWh`,
            icon: Activity,
            sub: <TrendIndicator todayValue={todayValue} yesterdayValue={yesterdayValue} />,
          },
          {
            label: 'Total Records',
            value: records.length.toString(),
            icon: Database,
            sub: <span className="text-xs text-muted-foreground">{dayMap.size} unique days</span>,
          },
          {
            label: 'Daily Average',
            value: `${avgDaily.toFixed(1)} kWh`,
            icon: TrendingUp,
            sub: <span className="text-xs text-muted-foreground">across {dayMap.size} days</span>,
          },
          {
            label: 'Peak Day',
            value: `${maxDay.toFixed(1)} kWh`,
            icon: Calendar,
            sub: <span className="text-xs text-muted-foreground">highest single day</span>,
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-card border border-border rounded-xl p-4 card-gradient"
            >
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-7 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                    <Icon className="w-4 h-4 text-energy opacity-70" />
                  </div>
                  <p className="text-xl font-bold font-display text-foreground">{card.value}</p>
                  <div className="mt-1">{card.sub}</div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Chart section */}
      <div className="bg-card border border-border rounded-xl p-4 md:p-5 card-gradient">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">
              Consumption History & Forecast
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Historical data with{' '}
              <span className="text-forecast font-medium">Forecast (ML)</span> predictions
            </p>
          </div>
          <ModelSelector value={selectedModel} onChange={setSelectedModel} />
        </div>
        {isLoading ? (
          <Skeleton className="h-80 w-full rounded-lg" />
        ) : records.length === 0 ? (
          <div className="h-80 flex flex-col items-center justify-center text-center gap-3">
            <Zap className="w-10 h-10 text-energy opacity-30" />
            <p className="text-muted-foreground text-sm">No consumption data yet.</p>
            <p className="text-xs text-muted-foreground">Add records manually or seed demo data to see the chart.</p>
          </div>
        ) : (
          <ConsumptionChart records={sortedRecords} predictions={predictions} height={320} />
        )}
      </div>

      {/* Bottom grid: Manual entry + Recent records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Manual entry */}
        <div className="bg-card border border-border rounded-xl p-4 md:p-5 card-gradient">
          <h2 className="font-display text-base font-semibold text-foreground mb-4">
            Add Consumption Record
          </h2>
          <ManualEntryForm />
        </div>

        {/* Recent records */}
        <div className="bg-card border border-border rounded-xl p-4 md:p-5 card-gradient">
          <h2 className="font-display text-base font-semibold text-foreground mb-4">
            Recent Records
          </h2>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : sortedRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
              <Database className="w-8 h-8 text-muted-foreground opacity-40" />
              <p className="text-sm text-muted-foreground">No records yet</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {[...sortedRecords].reverse().slice(0, 15).map((record, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <span className="text-xs text-muted-foreground">
                    {format(timestampToDate(record.date), 'MMM dd, yyyy')}
                  </span>
                  <span className="text-xs font-medium text-energy font-mono">
                    {Number(record.unitsConsumed).toFixed(1)} kWh
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
