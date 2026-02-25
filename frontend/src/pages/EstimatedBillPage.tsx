import { useState, useMemo } from 'react';
import { useGetUserConsumptionRecords, useGetDetailedBillEstimate } from '../hooks/useQueries';
import { filterRecordsByMonth } from '../utils/dateUtils';
import { format } from 'date-fns';
import MonthNavigator from '../components/MonthNavigator';
import SlabBreakdownTable from '../components/SlabBreakdownTable';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Receipt, Zap, Info } from 'lucide-react';

export default function EstimatedBillPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isBPL, setIsBPL] = useState(false);
  const { data: records = [], isLoading: recordsLoading } = useGetUserConsumptionRecords();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthRecords = useMemo(
    () => filterRecordsByMonth(records, year, month),
    [records, year, month]
  );

  const totalUnits = useMemo(
    () => monthRecords.reduce((sum, r) => sum + Number(r.unitsConsumed), 0),
    [monthRecords]
  );

  const { data: billDetails, isLoading: billLoading } = useGetDetailedBillEstimate(
    BigInt(Math.round(totalUnits)),
    isBPL
  );

  const isLoading = recordsLoading || billLoading;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Receipt className="w-6 h-6 text-energy" />
            Estimated Bill
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Based on TSSPDCL/TSNPDCL domestic tariff rates
          </p>
        </div>
        <MonthNavigator
          currentDate={currentDate}
          onChange={setCurrentDate}
          maxDate={new Date()}
        />
      </div>

      {/* BPL toggle + units summary */}
      <div className="rounded-xl border border-border p-5" style={{ background: 'var(--card)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {format(currentDate, 'MMMM yyyy')} — Consumption Summary
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {monthRecords.length} records · {totalUnits.toFixed(1)} kWh total
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="bpl-toggle" className="text-sm text-muted-foreground cursor-pointer">
              BPL Consumer
            </Label>
            <Switch
              id="bpl-toggle"
              checked={isBPL}
              onCheckedChange={setIsBPL}
              className="data-[state=checked]:bg-energy"
            />
          </div>
        </div>

        {isBPL && (
          <div className="mt-3 p-3 rounded-lg bg-energy/10 border border-energy/30 flex items-start gap-2">
            <Info className="w-4 h-4 text-energy shrink-0 mt-0.5" />
            <p className="text-xs text-energy/80">
              BPL (Below Poverty Line) consumers get free electricity up to 50 units per month.
            </p>
          </div>
        )}
      </div>

      {/* Bill amount highlight */}
      {totalUnits > 0 && (
        <div className="rounded-xl border border-energy/30 p-6 text-center" style={{ background: 'var(--card)' }}>
          <p className="text-sm text-muted-foreground mb-2">Estimated Bill for {format(currentDate, 'MMMM yyyy')}</p>
          {isLoading ? (
            <Skeleton className="h-14 w-48 mx-auto bg-muted/50" />
          ) : billDetails ? (
            <>
              <p className="font-display text-5xl font-bold text-energy">
                ₹{Number(billDetails.totalCost).toFixed(0)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {totalUnits.toFixed(1)} kWh consumed · Avg ₹{totalUnits > 0 ? (Number(billDetails.totalCost) / totalUnits).toFixed(2) : '0'}/unit
              </p>
            </>
          ) : null}
        </div>
      )}

      {/* Tariff info */}
      <div className="rounded-xl border border-border p-5" style={{ background: 'var(--card)' }}>
        <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-energy" />
          TS Electricity Tariff Slabs (Domestic)
        </h2>

        {totalUnits === 0 ? (
          <div className="py-8 text-center">
            <Receipt className="w-12 h-12 text-energy opacity-30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No consumption data for this month</p>
            <p className="text-xs text-muted-foreground mt-1">Add records or navigate to a different month</p>
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-full bg-muted/30" />)}
          </div>
        ) : billDetails ? (
          <SlabBreakdownTable billDetails={billDetails} />
        ) : null}
      </div>

      {/* Tariff reference */}
      <div className="rounded-xl border border-border p-5" style={{ background: 'var(--card)' }}>
        <h3 className="font-display font-semibold text-foreground mb-3 text-sm">
          TSSPDCL/TSNPDCL Domestic Tariff Reference
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {[
            { slab: '0–50 units', rate: '₹1.45/unit', note: 'Free for BPL consumers' },
            { slab: '51–100 units', rate: '₹2.60/unit', note: '' },
            { slab: '101–200 units', rate: '₹3.50/unit', note: '' },
            { slab: '201–300 units', rate: '₹5.00/unit', note: '' },
            { slab: 'Above 300 units', rate: '₹8.50/unit', note: '' },
            { slab: 'Fixed Charges', rate: '₹50/month', note: 'Applicable to all consumers' },
          ].map((item) => (
            <div key={item.slab} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border">
              <div>
                <p className="font-medium text-foreground">{item.slab}</p>
                {item.note && <p className="text-muted-foreground text-xs">{item.note}</p>}
              </div>
              <span className="font-bold text-energy">{item.rate}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
