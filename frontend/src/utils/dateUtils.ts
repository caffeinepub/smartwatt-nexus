import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, isWithinInterval } from 'date-fns';

export function timestampToDate(timestamp: bigint): Date {
  // Backend timestamps are in seconds
  return new Date(Number(timestamp) * 1000);
}

export function dateToTimestamp(date: Date): bigint {
  return BigInt(Math.floor(date.getTime() / 1000));
}

export function formatDate(date: Date): string {
  return format(date, 'MMM dd, yyyy');
}

export function formatDateShort(date: Date): string {
  return format(date, 'MMM dd');
}

export function formatMonth(date: Date): string {
  return format(date, 'MMMM yyyy');
}

export function getMonthDays(year: number, month: number): Date[] {
  const start = startOfMonth(new Date(year, month, 1));
  const end = endOfMonth(new Date(year, month, 1));
  return eachDayOfInterval({ start, end });
}

export function filterRecordsByMonth(
  records: Array<{ date: bigint; unitsConsumed: bigint }>,
  year: number,
  month: number
): Array<{ date: bigint; unitsConsumed: bigint }> {
  const start = startOfMonth(new Date(year, month, 1));
  const end = endOfMonth(new Date(year, month, 1));

  return records.filter((record) => {
    const date = timestampToDate(record.date);
    return isWithinInterval(date, { start, end });
  });
}

export function groupRecordsByDay(
  records: Array<{ date: bigint; unitsConsumed: bigint }>
): Map<string, number> {
  const map = new Map<string, number>();

  for (const record of records) {
    const date = timestampToDate(record.date);
    const key = format(date, 'yyyy-MM-dd');
    const existing = map.get(key) || 0;
    map.set(key, existing + Number(record.unitsConsumed));
  }

  return map;
}

export function getTodayTimestamp(): bigint {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dateToTimestamp(today);
}

export function getYesterdayTimestamp(): bigint {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  return dateToTimestamp(yesterday);
}
