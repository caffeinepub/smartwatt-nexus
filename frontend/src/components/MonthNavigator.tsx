import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addMonths, subMonths } from 'date-fns';

interface MonthNavigatorProps {
  currentDate: Date;
  onChange: (date: Date) => void;
  maxDate?: Date;
}

export default function MonthNavigator({ currentDate, onChange, maxDate }: MonthNavigatorProps) {
  const canGoNext = !maxDate || addMonths(currentDate, 1) <= maxDate;

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 border-border hover:border-energy hover:text-energy hover:bg-energy/10 transition-all"
        onClick={() => onChange(subMonths(currentDate, 1))}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <span className="text-sm font-semibold text-foreground min-w-[120px] text-center">
        {format(currentDate, 'MMMM yyyy')}
      </span>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 border-border hover:border-energy hover:text-energy hover:bg-energy/10 transition-all"
        onClick={() => onChange(addMonths(currentDate, 1))}
        disabled={!canGoNext}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
