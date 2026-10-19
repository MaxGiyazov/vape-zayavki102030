/** Склонение существительных по числу: 1 позиция, 2 позиции, 5 позиций. */
export function plural(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n);
  const n10 = abs % 10;
  const n100 = abs % 100;
  if (n10 === 1 && n100 !== 11) return forms[0];
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1];
  return forms[2];
}

export function positionsLabel(n: number): string {
  return `${n} ${plural(n, ["позиция", "позиции", "позиций"])}`;
}

export function unitsLabel(n: number): string {
  return `${n} ед.`;
}

/** Короткая форма для кнопок: «3 поз., 18 ед.» */
export function shortTotals(positions: number, units: number): string {
  return `${positions} поз., ${units} ед.`;
}

export function productsLabel(n: number): string {
  return `${n} ${plural(n, ["товар", "товара", "товаров"])}`;
}

const pad = (value: number) => String(value).padStart(2, "0");

/** Формат даты для заявки: 19.10.2026 14:35 */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}
