import { CATEGORIES } from "@/lib/data";
import type { ParsedProductRow, ProductSection } from "@/lib/types";

export interface BatchItem extends ParsedProductRow {
  /** Номер строки в исходном тексте — для предпросмотра. */
  line: number;
}

export interface BatchParseResult {
  items: BatchItem[];
  errors: string[];
}

const CATEGORY_NAMES = new Set(
  CATEGORIES.map((category) => category.name.toLocaleLowerCase("ru-RU")),
);

const normalizeText = (value: string) => value.replace(/\s+/g, " ").trim();
const normalizeKey = (value: string) => value.toLocaleLowerCase("ru-RU");

function splitColors(value: string): string[] {
  const result: string[] = [];
  for (const part of value.split(/[,;]+/)) {
    const color = normalizeText(part);
    if (!color) continue;
    if (result.some((item) => normalizeKey(item) === normalizeKey(color))) continue;
    result.push(color);
  }
  return result;
}

function isCategoryHeader(value: string): boolean {
  return CATEGORY_NAMES.has(normalizeKey(value.replace(/:+$/, "").trim()));
}

function isIgnoredLine(value: string): boolean {
  if (!value) return true;
  if (/^(\.{2,}|…+)$/.test(value)) return true;
  return value.startsWith("#") || value.startsWith("//");
}

interface HeaderNode {
  title: string;
  indent: number;
}

/**
 * Разбирает свободный текст массового импорта.
 *
 * Формат A: `Бренд | Устройство | Цвет1, Цвет2`
 * Формат B: заголовки групп, оканчивающиеся двоеточием, и строки-позиции под ними.
 */
export function parseBatchInput(text: string, categoryId: string): BatchParseResult {
  const items: BatchItem[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();
  const stack: HeaderNode[] = [];
  let lastWasItem = false;

  const lines = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").split("\n");

  const addItem = (row: Omit<ParsedProductRow, "unit">, line: number) => {
    const brand = normalizeText(row.brand);
    const name = normalizeText(row.name);
    const flavor = normalizeText(row.flavor);
    if (!brand || (!name && !flavor && !row.colors?.length)) {
      errors.push(`Строка ${line}: не хватает бренда или названия`);
      return;
    }

    const key = `${categoryId}|${normalizeKey(brand)}|${normalizeKey(name)}|${normalizeKey(flavor)}`;
    if (seen.has(key)) {
      errors.push(`Строка ${line}: дубликат — ${[brand, name, flavor].filter(Boolean).join(" ")}`);
      return;
    }
    seen.add(key);

    items.push({
      brand,
      name,
      flavor,
      unit: "шт",
      section: row.section,
      colors: row.colors?.length ? row.colors : undefined,
      line,
    });
  };

  lines.forEach((raw, index) => {
    const lineNumber = index + 1;
    const trimmed = normalizeText(raw);
    if (isIgnoredLine(trimmed)) return;

    // Формат A — явное указание устройства и его цветов
    if (trimmed.includes("|")) {
      const parts = trimmed.split("|").map((part) => normalizeText(part));
      const [brand = "", name = "", colorsRaw = ""] = parts;
      if (parts.length < 3 || !brand || !name) {
        errors.push(`Строка ${lineNumber}: формат A — Бренд | Устройство | Цвет1, Цвет2`);
        return;
      }
      const colors = splitColors(colorsRaw);
      if (colors.length === 0) {
        errors.push(`Строка ${lineNumber}: укажите хотя бы один цвет`);
        return;
      }

      addItem(
        {
          brand,
          name,
          flavor: "",
          section: categoryId === "hardware" ? ("device" as ProductSection) : undefined,
          colors,
        },
        lineNumber,
      );

      // Формат A — самостоятельная запись, не влияет на вложенность формата B
      stack.length = 0;
      lastWasItem = false;
      return;
    }

    // Заголовок группы формата B
    if (trimmed.endsWith(":")) {
      const title = normalizeText(trimmed.replace(/:+\s*$/, ""));
      if (!title) {
        errors.push(`Строка ${lineNumber}: пустой заголовок группы`);
        return;
      }

      const indentMatch = raw.match(/^[\t ]*/)?.[0] ?? "";
      const indent = indentMatch.replace(/\t/g, "  ").length;

      if (lastWasItem) {
        // После списка новый заголовок — сосед предыдущего, а не его потомок
        while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
          stack.pop();
        }
      }

      stack.push({ title, indent });
      lastWasItem = false;
      return;
    }

    // Позиция внутри группы
    if (stack.length === 0) {
      errors.push(`Строка ${lineNumber}: нет заголовка группы перед позицией «${trimmed}»`);
      return;
    }

    const path = stack.map((node) => node.title);
    const levels = path.length > 1 && isCategoryHeader(path[0]) ? path.slice(1) : path;
    const brand = levels[0] ?? "";
    const name = levels.slice(1).join(" · ");

    addItem(
      {
        brand,
        name,
        flavor: trimmed,
        section: categoryId === "hardware" ? ("consumable" as ProductSection) : undefined,
      },
      lineNumber,
    );
    lastWasItem = true;
  });

  return { items, errors };
}
