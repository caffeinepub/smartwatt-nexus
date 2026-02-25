import { AlertTriangle, X } from 'lucide-react';

interface ConsumptionAlertProps {
  todayValue: number;
  yesterdayValue: number;
  onDismiss: () => void;
}

export default function ConsumptionAlert({ todayValue, yesterdayValue, onDismiss }: ConsumptionAlertProps) {
  if (todayValue <= yesterdayValue || yesterdayValue === 0) return null;

  const diff = todayValue - yesterdayValue;
  const pct = ((diff / yesterdayValue) * 100).toFixed(1);

  return (
    <div className="animate-slide-in flex items-start gap-3 px-4 py-3 rounded-xl border border-energy/30 bg-energy/8 mb-4"
      style={{ background: 'oklch(0.72 0.18 195 / 0.08)' }}
    >
      <AlertTriangle className="w-5 h-5 text-energy shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">High Consumption Alert</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Today's usage is <strong className="text-energy">{pct}% higher</strong> than yesterday (+{diff.toFixed(2)} kWh).
          Consider reducing usage to save on your electricity bill.
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
        aria-label="Dismiss alert"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
