import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TrendIndicatorProps {
  todayValue: number;
  yesterdayValue: number;
  className?: string;
}

export default function TrendIndicator({ todayValue, yesterdayValue, className = '' }: TrendIndicatorProps) {
  if (yesterdayValue === 0 && todayValue === 0) {
    return (
      <div className={`flex items-center gap-1.5 text-muted-foreground ${className}`}>
        <Minus className="w-4 h-4" />
        <span className="text-sm font-medium">No data</span>
      </div>
    );
  }

  const diff = todayValue - yesterdayValue;
  const pct = yesterdayValue > 0 ? ((diff / yesterdayValue) * 100) : 0;
  const isUp = diff > 0;
  const isFlat = diff === 0;

  // For energy consumption: up is bad (destructive), down is good (energy/cyan)
  const color = isFlat
    ? 'oklch(0.60 0.04 230)'
    : isUp
    ? 'oklch(0.55 0.22 25)'
    : 'oklch(0.72 0.18 195)';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex items-center gap-1.5 cursor-default ${className}`}
            style={{ color }}
          >
            {isFlat ? (
              <Minus className="w-5 h-5" />
            ) : isUp ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
            <span className="text-sm font-bold">
              {isFlat ? 'No change' : `${isUp ? '+' : ''}${pct.toFixed(1)}%`}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-card border-border text-xs">
          <p>Today: {todayValue.toFixed(2)} kWh</p>
          <p>Yesterday: {yesterdayValue.toFixed(2)} kWh</p>
          <p>Difference: {diff > 0 ? '+' : ''}{diff.toFixed(2)} kWh</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
