import { HONDURAS_TIME_ZONE, formatHondurasInputDate } from "@/lib/date-format";
import { fromZonedTime } from "date-fns-tz";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export type DateRangePreset = "today" | "week" | "month";

export type ListDateRangeInput = {
  from?: string;
  to?: string;
};

export type ResolvedListDateRange = {
  from: Date;
  to: Date;
  toExclusive: Date;
  fromInput: string;
  toInput: string;
};

function parseInputDate(value: string | undefined, fallback: Date) {
  if (!value) return fallback;

  const parsed = inputToUtcDate(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function inputToUtcDate(value: string) {
  return fromZonedTime(`${value}T00:00:00`, HONDURAS_TIME_ZONE);
}

function toInputDate(date: Date) {
  return formatHondurasInputDate(date);
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_IN_MS);
}

function getHondurasDateParts(date: Date) {
  const inputDate = formatHondurasInputDate(date);
  const [year, month, day] = inputDate.split("-").map(Number);
  return { inputDate, year, month, day };
}

function getHondurasWeekday(date: Date) {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: HONDURAS_TIME_ZONE,
    weekday: "short",
  }).format(date);
  const weekdays: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return weekdays[weekday] ?? 0;
}

function toInputFromParts(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getDateRangePresetInputs(preset: DateRangePreset, now = new Date()): ListDateRangeInput {
  const today = inputToUtcDate(getHondurasDateParts(now).inputDate);

  if (preset === "today") {
    const todayInput = toInputDate(today);
    return { from: todayInput, to: todayInput };
  }

  if (preset === "month") {
    const { year, month } = getHondurasDateParts(now);
    const firstDayInput = toInputFromParts(year, month, 1);
    const firstDay = inputToUtcDate(firstDayInput);
    const nextMonthYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextMonthFirstDay = inputToUtcDate(toInputFromParts(nextMonthYear, nextMonth, 1));
    const lastDay = addDays(nextMonthFirstDay, -1);
    return { from: toInputDate(firstDay), to: toInputDate(lastDay) };
  }

  const weekday = getHondurasWeekday(today);
  const daysFromMonday = (weekday + 6) % 7;
  const firstDay = addDays(today, -daysFromMonday);
  const lastDay = addDays(firstDay, 6);
  return { from: toInputDate(firstDay), to: toInputDate(lastDay) };
}

export function resolveListDateRange(range: ListDateRangeInput = {}): ResolvedListDateRange {
  const defaultRange = getDateRangePresetInputs("week");
  let from = parseInputDate(range.from, inputToUtcDate(defaultRange.from!));
  let to = parseInputDate(range.to, inputToUtcDate(defaultRange.to!));

  if (from > to) {
    [from, to] = [to, from];
  }

  return {
    from,
    to,
    toExclusive: addDays(to, 1),
    fromInput: toInputDate(from),
    toInput: toInputDate(to),
  };
}
