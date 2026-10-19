import { CATEGORIES } from "@/lib/data";
import type { Category, Product } from "@/lib/types";

const stockLabel = (inStock: boolean) => (inStock ? "в наличии" : "нет в наличии");

const joinTitle = (parts: string[]) => parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();

function deviceBlock(product: Product): string[] {
  const lines = [`${product.brand} ${product.name}`.trim()];
  if (!product.colors?.length) {
    lines.push(`  - ${stockLabel(product.inStock)}`);
    return lines;
  }
  for (const color of product.colors) {
    lines.push(`  - ${color.name} (${stockLabel(color.inStock)})`);
  }
  return lines;
}

function consumableLine(product: Product): string {
  return `${joinTitle([product.brand, product.name, product.flavor])} — ${stockLabel(product.inStock)}`;
}

function groupedCategoryBlock(category: Category, products: Product[]): string[] {
  if (products.length === 0) {
    return [`[${category.name}]`, "(нет товаров)"];
  }

  const groups = new Map<string, Product[]>();
  for (const product of products) {
    const key = product.brand.trim() || category.name;
    const current = groups.get(key) ?? [];
    current.push(product);
    groups.set(key, current);
  }

  const lines: string[] = [];
  groups.forEach((items, brand) => {
    lines.push(`[${category.name}] / ${brand}`);
    for (const product of items) {
      const label = [product.name, product.flavor].filter(Boolean).join(" · ");
      lines.push(`  - ${label || product.brand} (${stockLabel(product.inStock)})`);
    }
    lines.push("");
  });
  return lines;
}

function hardwareBlock(category: Category, products: Product[]): string[] {
  const devices = products.filter(
    (product) => product.section === "device" || (product.section !== "consumable" && (product.colors?.length ?? 0) > 0),
  );
  const consumables = products.filter((product) => !devices.includes(product));
  const lines: string[] = [];

  if (devices.length > 0) {
    lines.push(`[${category.name}] / Устройства`);
    for (const product of devices) {
      lines.push(...deviceBlock(product));
      lines.push("");
    }
  }

  if (consumables.length > 0) {
    lines.push(`[${category.name}] / Расходники`);
    for (const product of consumables) {
      lines.push(consumableLine(product));
    }
    lines.push("");
  }

  if (lines.length === 0) {
    lines.push(`[${category.name}]`, "(нет товаров)");
  }
  return lines;
}

function categoryBlock(category: Category, products: Product[]): string[] {
  const categoryProducts = products.filter((product) => product.categoryId === category.id);
  if (category.id === "hardware") return hardwareBlock(category, categoryProducts);
  return groupedCategoryBlock(category, categoryProducts);
}

function compose(blocks: string[][]): string {
  return blocks
    .map((lines) => lines.join("\n").replace(/\n{3,}/g, "\n\n").trim())
    .filter(Boolean)
    .join("\n\n");
}

/** Человекочитаемый снимок всего каталога для буфера обмена. */
export function buildCatalogText(products: Product[]): string {
  return `КАТАЛОГ\n\n${compose(CATEGORIES.map((category) => categoryBlock(category, products)))}`;
}

/** Человекочитаемый снимок одной категории для буфера обмена. */
export function buildCategoryText(category: Category, products: Product[]): string {
  return `КАТАЛОГ — ${category.name}\n\n${compose([categoryBlock(category, products)])}`;
}

