const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function parseIsoDateFromApi(
  value: string | null | undefined
): string {
  if (!value) {
    return "";
  }

  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? "";
}

/** Normalizes a form date to `YYYY-MM-DD`, or null when empty/invalid. */
export function toIsoDateString(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (ISO_DATE_RE.test(trimmed)) {
    const [year, month, day] = trimmed.split("-").map(Number);
    if (isValidCalendarDate(year, month, day)) {
      return trimmed;
    }
    return null;
  }

  const parsed = parseIsoDateFromApi(trimmed);
  return parsed || null;
}

function isValidCalendarDate(
  year: number,
  month: number,
  day: number
): boolean {
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1
  ) {
    return false;
  }

  return day <= daysInMonth(year, month);
}

export function isoDateToDate(value: string): Date | undefined {
  const iso = parseIsoDateFromApi(value);
  if (!iso) {
    return undefined;
  }

  const [year, month, day] = iso.split("-").map(Number);
  if (!isValidCalendarDate(year, month, day)) {
    return undefined;
  }

  return new Date(year, month - 1, day);
}

export function dateToIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** GraphQL DateTime from a date-only form value (`YYYY-MM-DD`). */
export function toDateTimeIso(dateValue: string): string {
  const dateOnly = toIsoDateString(dateValue);
  if (dateOnly) {
    return `${dateOnly}T00:00:00.000Z`;
  }

  if (dateValue.includes("T")) {
    return new Date(dateValue).toISOString();
  }

  return dateValue;
}

/** GraphQL DateTime for optional date fields; null clears the value. */
export function toGraphQLDateTimeOrNull(dateValue: string): string | null {
  const dateOnly = toIsoDateString(dateValue);
  return dateOnly ? `${dateOnly}T00:00:00.000Z` : null;
}
