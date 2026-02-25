import { useState } from 'react';
import { useAddConsumptionRecord } from '../hooks/useQueries';
import { dateToTimestamp } from '../utils/dateUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Loader2 } from 'lucide-react';

export default function ManualEntryForm() {
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [units, setUnits] = useState('');

  const addRecord = useAddConsumptionRecord();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !units) return;

    const unitsNum = parseFloat(units);
    if (isNaN(unitsNum) || unitsNum < 0) {
      toast.error('Please enter a valid units value');
      return;
    }

    const dateObj = new Date(date);
    dateObj.setHours(12, 0, 0, 0);
    const timestamp = dateToTimestamp(dateObj);

    try {
      await addRecord.mutateAsync({
        date: timestamp,
        unitsConsumed: BigInt(Math.round(unitsNum)),
      });
      toast.success('Consumption record added successfully');
      setUnits('');
    } catch (err: any) {
      const msg = err?.message || 'Failed to add record';
      toast.error(msg.includes('trap') ? 'Failed to add record. Check your permissions.' : msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="entry-date" className="text-xs text-muted-foreground">Date</Label>
          <Input
            id="entry-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="bg-muted/30 border-border text-sm h-9 focus:border-energy"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="entry-units" className="text-xs text-muted-foreground">Units (kWh)</Label>
          <Input
            id="entry-units"
            type="number"
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            placeholder="e.g. 8.5"
            min="0"
            step="0.1"
            className="bg-muted/30 border-border text-sm h-9 focus:border-energy"
            required
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={addRecord.isPending}
        className="w-full h-9 bg-energy text-primary-foreground font-semibold text-sm hover:bg-energy/90 transition-all"
      >
        {addRecord.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <Plus className="w-4 h-4 mr-2" />
        )}
        Add Record
      </Button>
    </form>
  );
}
