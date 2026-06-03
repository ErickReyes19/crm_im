import { formatHondurasInputDate } from "@/lib/date-format";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

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

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function inputToUtcDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function toInputDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function resolveListDateRange(range: ListDateRangeInput = {}): ResolvedListDateRange {
  const todayInput = formatHondurasInputDate(new Date());
  const today = inputToUtcDate(todayInput);
  let from = parseInputDate(range.from, today);
  let to = parseInputDate(range.to, today);

  if (from > to) {
    [from, to] = [to, from];
  }

  return {
    from,
    to,
    toExclusive: new Date(to.getTime() + DAY_IN_MS),
    fromInput: toInputDate(from),
    toInput: toInputDate(to),
  };
}
