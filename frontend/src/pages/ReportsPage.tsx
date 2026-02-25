import { useState, useMemo } from 'react';
import { useGetUserConsumptionRecords } from '../hooks/useQueries';
import { filterRecordsByMonth, timestampToDate } from '../utils/dateUtils';
import { exportToCSV, calculateDailyCost } from '../utils/csvExport';
import { format } from 'date-fns';
import MonthNavigator from '../components/MonthNavigator';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Download, TrendingUp } from 'lucide-react';

export default function ReportsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: records = [], isLoading } = useGetUserConsumptionRecords();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthRecords = useMemo(
    () => filterRecordsByMonth(records, year, month),
    [records, year, month]
  );

  const sortedMonthRecords = useMemo(
    () => [...monthRecords].sort((a, b) => Number(a.date) - Number(b.date)),
    [monthRecords]
  );

  const totalUnits = sortedMonthRecords.reduce((sum, r) => sum + Number(r.unitsConsumed), 0);
  const totalCost = sortedMonthRecords.reduce((sum, r) => sum + calculateDailyCost(Number(r.unitsConsumed)), 0);

  const handleDownload = () => {
    const exportData = sortedMonthRecords.map((r) => ({
      date: r.date,
      unitsConsumed: r.unitsConsumed,
      estimatedCost: calculateDailyCost(Number(r.unitsConsumed)),
    }));
    const filename = `powertrack-report-${format(currentDate, 'yyyy-MM')}.csv`;
    exportToCSV(exportData, filename);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-energy" />
            Consumption Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Monthly usage summary and export</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthNavigator
            currentDate={currentDate}
            onChange={setCurrentDate}
            maxDate={new Date()}
          />
          <Button
            onClick={handleDownload}
            disabled={sortedMonthRecords.length === 0}
            size="sm"
            className="bg-energy text-primary-foreground font-semibold text-xs h-8 gap-1.5 hover:bg-energy/90 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total Records', value: sortedMonthRecords.length.toString() },
          { label: 'Total Units', value: `${totalUnits.toFixed(1)} kWh` },
          { label: 'Est. Monthly Cost', value: `₹${totalCost.toFixed(0)}` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border p-4" style={{ background: 'var(--card)' }}>
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            {isLoading ? (
              <Skeleton className="h-6 w-24 bg-muted/50" />
            ) : (
              <p className="text-xl font-bold font-display text-energy">{stat.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden" style={{ background: 'var(--card)' }}>
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-display font-semibold text-foreground">
            {format(currentDate, 'MMMM yyyy')} — Detailed Records
          </h2>
          <TrendingUp className="w-4 h-4 text-energy opacity-60" />
        </div>

        {isLoading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full bg-muted/30" />
            ))}
          </div>
        ) : sortedMonthRecords.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-12 h-12 text-energy opacity-30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No records for this month</p>
            <p className="text-xs text-muted-foreground mt-1">Add consumption data or navigate to a different month</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">#</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider text-right">Units (kWh)</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider text-right">Est. Cost (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMonthRecords.map((record, idx) => {
                const cost = calculateDailyCost(Number(record.unitsConsumed));
                return (
                  <TableRow key={idx} className="border-border hover:bg-muted/20">
                    <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="text-sm text-foreground">
                      {format(timestampToDate(record.date), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell className="text-sm text-right font-medium text-foreground">
                      {Number(record.unitsConsumed).toFixed(1)}
                    </TableCell>
                    <TableCell className="text-sm text-right font-medium text-energy">
                      ₹{cost.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow style={{ background: 'oklch(0.72 0.18 195 / 0.1)' }}>
                <TableCell colSpan={2} className="font-bold text-foreground">Monthly Total</TableCell>
                <TableCell className="text-right font-bold text-energy">{totalUnits.toFixed(1)} kWh</TableCell>
                <TableCell className="text-right font-bold text-energy">₹{totalCost.toFixed(0)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </div>
    </div>
  );
}
