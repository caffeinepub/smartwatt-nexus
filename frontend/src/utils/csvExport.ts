import { format } from 'date-fns';
import { timestampToDate } from './dateUtils';

interface ExportRecord {
  date: bigint;
  unitsConsumed: bigint;
  estimatedCost?: number;
}

export function exportToCSV(records: ExportRecord[], filename: string): void {
  const headers = ['Date', 'Units Consumed (kWh)', 'Estimated Cost (₹)'];

  const rows = records.map((record) => {
    const date = timestampToDate(record.date);
    const dateStr = format(date, 'dd/MM/yyyy');
    const units = Number(record.unitsConsumed);
    const cost = record.estimatedCost !== undefined ? record.estimatedCost.toFixed(2) : '';
    return [dateStr, units.toString(), cost];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function calculateDailyCost(units: number): number {
  // TS Electricity tariff - simplified daily cost estimation
  // Assuming monthly units = daily * 30
  const monthlyUnits = units * 30;
  let cost = 0;
  let remaining = monthlyUnits;

  if (remaining <= 50) {
    cost = remaining * 1.45;
    remaining = 0;
  } else {
    cost += 50 * 1.45;
    remaining -= 50;
  }

  if (remaining > 0) {
    const slab = Math.min(remaining, 50);
    cost += slab * 2.6;
    remaining -= slab;
  }

  if (remaining > 0) {
    const slab = Math.min(remaining, 100);
    cost += slab * 3.5;
    remaining -= slab;
  }

  if (remaining > 0) {
    const slab = Math.min(remaining, 100);
    cost += slab * 5.0;
    remaining -= slab;
  }

  if (remaining > 0) {
    cost += remaining * 8.5;
  }

  cost += 50; // Fixed charges
  return cost / 30; // Daily cost
}
