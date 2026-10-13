/**
 * Форматирование даты и времени встречи.
 * Без зависимостей и без учёта часового пояса устройства:
 * дата из конфигурации всегда отображается ровно так, как записана.
 */

const MONTHS_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
] as const;

const WEEKDAYS = [
  "воскресенье",
  "понедельник",
  "вторник",
  "среда",
  "четверг",
  "пятница",
  "суббота",
] as const;

interface DateParts {
  year: number;
  month: number;
  day: number;
}

export function parseIsoDate(iso: string): DateParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) {
    throw new Error(`Некорректная дата в конфигурации: "${iso}"`);
  }
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

/** «15 октября» */
export function formatDayMonth(iso: string): string {
  const { month, day } = parseIsoDate(iso);
  return `${day} ${MONTHS_GENITIVE[month - 1] ?? ""}`.trim();
}

/** «четверг» */
export function formatWeekday(iso: string): string {
  const { year, month, day } = parseIsoDate(iso);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return WEEKDAYS[weekday] ?? "";
}

/** «15.10.2026» */
export function formatNumericDate(iso: string): string {
  const { year, month, day } = parseIsoDate(iso);
  return `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}.${year}`;
}
