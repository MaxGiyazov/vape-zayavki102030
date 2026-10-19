"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_POINTS, DEMO_PRODUCTS } from "@/lib/data";
import { createId } from "@/lib/id";
import type {
  CartItem,
  ImportReport,
  Order,
  ParsedProductRow,
  Point,
  Product,
  ProductColor,
  ProductInput,
  Settings,
} from "@/lib/types";

export const STORAGE_KEY = "zayavki-store";

/** Стабильная ссылка на пустую корзину — нужна для безопасных селекторов zustand. */
export const EMPTY_CART: CartItem[] = [];

const MAX_QUANTITY = 999;

const cloneProduct = (item: Product): Product => ({
  ...item,
  colors: item.colors ? item.colors.map((color) => ({ ...color })) : undefined,
});

const createInitialState = () => ({
  points: DEFAULT_POINTS.map((point) => ({ ...point })),
  activePointId: DEFAULT_POINTS[0].id,
  products: DEMO_PRODUCTS.map(cloneProduct),
  /** Корзины хранятся отдельно для каждой торговой точки */
  carts: {} as Record<string, CartItem[]>,
  orders: [] as Order[],
  settings: { telegramBotToken: "", telegramChatId: "" } as Settings,
});

type InitialState = ReturnType<typeof createInitialState>;

interface AppState extends InitialState {
  // Точки
  setActivePoint: (pointId: string) => void;
  addPoint: (data: { name: string; telegramChatId: string }) => Point;
  updatePoint: (id: string, data: { name: string; telegramChatId: string }) => void;
  removePoint: (id: string) => void;

  // Корзина
  setQuantity: (pointId: string, productId: string, quantity: number, color?: string) => void;
  changeQuantity: (pointId: string, productId: string, delta: number, color?: string) => void;
  removeItem: (pointId: string, productId: string, color?: string) => void;
  /** Заменяет все позиции товара количествами по цветам (для модалки устройства). */
  setProductColorQuantities: (
    pointId: string,
    productId: string,
    entries: { color: string; quantity: number }[],
  ) => void;
  clearCart: (pointId: string) => void;
  /** Фиксирует заявку в истории и очищает корзину точки. */
  createOrder: () => Order | null;

  // Каталог
  importProducts: (categoryId: string, rows: ParsedProductRow[]) => ImportReport;
  addProduct: (input: ProductInput) => Product;
  updateProduct: (id: string, patch: Partial<ProductInput>) => void;
  removeProduct: (id: string) => void;
  removeProductColor: (id: string, color: string) => void;
  setProductInStock: (id: string, inStock: boolean) => void;
  setProductColorInStock: (id: string, color: string, inStock: boolean) => void;

  // Настройки
  updateSettings: (patch: Partial<Settings>) => void;
  resetAll: () => void;
}

const normalizeText = (value: string) => value.replace(/\s+/g, " ").trim();

const normalizeKey = (row: { brand: string; name: string; flavor: string }) =>
  `${row.brand}|${row.name}|${row.flavor}`.toLocaleLowerCase("ru-RU").replace(/\s+/g, " ").trim();

const normalizeColor = (value: string) => normalizeText(value);
const colorKey = (value: string) => value.toLocaleLowerCase("ru-RU");

const normalizeColors = (colors?: (string | ProductColor)[]): ProductColor[] => {
  const result: ProductColor[] = [];
  for (const color of colors ?? []) {
    const name = normalizeColor(typeof color === "string" ? color : color.name);
    if (!name) continue;
    if (result.some((item) => colorKey(item.name) === colorKey(name))) continue;
    result.push({
      name,
      inStock: typeof color === "string" ? true : color.inStock !== false,
    });
  }
  return result;
};

const mergeColors = (
  current: ProductColor[] | undefined,
  incoming: (string | ProductColor)[] | undefined,
): ProductColor[] => {
  if (!incoming || incoming.length === 0) return current ?? [];
  const currentByKey = new Map((current ?? []).map((color) => [colorKey(color.name), color]));
  const seen = new Set<string>();
  return incoming.flatMap((raw) => {
    const name = normalizeColor(typeof raw === "string" ? raw : raw.name);
    if (!name) return [];
    const key = colorKey(name);
    if (seen.has(key)) return [];
    seen.add(key);
    const existing = currentByKey.get(key);
    const inStock =
      typeof raw === "string" ? (existing?.inStock ?? true) : raw.inStock !== false;
    return [{ name, inStock }];
  });
};

const cartItemKey = (productId: string, color?: string) =>
  `${productId}::${colorKey(color ?? "")}`;

const clampQuantity = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(MAX_QUANTITY, Math.floor(value)));
};

const cleanCarts = (
  carts: Record<string, CartItem[]>,
  predicate: (item: CartItem) => boolean,
): Record<string, CartItem[]> => {
  const next: Record<string, CartItem[]> = {};
  for (const [pointId, items] of Object.entries(carts)) {
    const filtered = items.filter(predicate);
    if (filtered.length > 0) next[pointId] = filtered;
  }
  return next;
};

const CONSUMABLE_HINTS = [
  /испарител/i,
  /картридж/i,
  /coil/i,
  /pods?\b/i,
  /вата/i,
  /аккумулятор/i,
  /флакон/i,
  /салфетк/i,
];

const looksLikeConsumable = (product: Product) =>
  CONSUMABLE_HINTS.some((pattern) => pattern.test(`${product.name} ${product.flavor}`));

/** Приводит persisted-каталог версий 1.0–1.2 к актуальной модели. */
const migrateProduct = (product: Product): Product => {
  let categoryId = product.categoryId;
  let section = product.section;
  let rawColors = product.colors as unknown as (string | ProductColor)[] | undefined;
  let flavor = product.flavor ?? "";

  if (categoryId === "other" && looksLikeConsumable(product)) {
    categoryId = "hardware";
    section = "consumable";
  }

  if (categoryId === "hardware") {
    if (!section) section = looksLikeConsumable(product) ? "consumable" : "device";
    if (section === "device" && (!rawColors || rawColors.length === 0)) {
      rawColors = flavor ? [flavor] : [];
      flavor = "";
    }
  }

  return {
    ...product,
    categoryId,
    flavor,
    section,
    colors: normalizeColors(rawColors),
    inStock: product.inStock !== false,
  };
};

const normalizeProductFields = (input: ProductInput) => {
  const colors = normalizeColors(input.colors);
  let section = input.section;
  if (input.categoryId !== "hardware") {
    section = undefined;
  } else if (!section) {
    section = colors.length > 0 ? "device" : "consumable";
  }

  return {
    categoryId: input.categoryId,
    brand: normalizeText(input.brand),
    name: normalizeText(input.name),
    flavor: normalizeText(input.flavor ?? ""),
    unit: input.unit ?? ("шт" as const),
    section,
    colors,
    inStock: input.inStock ?? true,
  };
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...createInitialState(),

      setActivePoint: (pointId) => {
        if (!get().points.some((point) => point.id === pointId)) return;
        set({ activePointId: pointId });
      },

      addPoint: ({ name, telegramChatId }) => {
        const point: Point = {
          id: createId("point"),
          name: name.trim(),
          telegramChatId: telegramChatId.trim(),
        };
        set((state) => ({
          points: [...state.points, point],
          activePointId: state.activePointId || point.id,
        }));
        return point;
      },

      updatePoint: (id, { name, telegramChatId }) => {
        set((state) => ({
          points: state.points.map((point) =>
            point.id === id
              ? { ...point, name: name.trim(), telegramChatId: telegramChatId.trim() }
              : point,
          ),
        }));
      },

      removePoint: (id) => {
        // Не даём удалить последнюю точку — иначе заявку не к чему привязать
        if (get().points.length <= 1) return;
        set((state) => {
          const points = state.points.filter((point) => point.id !== id);
          const carts = { ...state.carts };
          delete carts[id];
          return {
            points,
            carts,
            activePointId: state.activePointId === id ? points[0].id : state.activePointId,
          };
        });
      },

      setQuantity: (pointId, productId, quantity, color) => {
        const qty = clampQuantity(quantity);
        const value = color ? normalizeColor(color) : undefined;
        const key = cartItemKey(productId, value);

        if (qty > 0) {
          const product = get().products.find((item) => item.id === productId);
          if (!product || product.inStock === false) return;
          if (product.colors && product.colors.length > 0) {
            if (!value) return;
            const match = product.colors.find(
              (item) => colorKey(item.name) === colorKey(value),
            );
            if (!match || !match.inStock) return;
          }
        }

        set((state) => {
          const items = state.carts[pointId] ?? [];
          const exists = items.some((item) => cartItemKey(item.productId, item.color) === key);

          let nextItems: CartItem[];
          if (qty === 0) {
            nextItems = items.filter((item) => cartItemKey(item.productId, item.color) !== key);
          } else if (exists) {
            nextItems = items.map((item) =>
              cartItemKey(item.productId, item.color) === key ? { ...item, quantity: qty } : item,
            );
          } else {
            nextItems = [...items, { productId, quantity: qty, ...(value ? { color: value } : {}) }];
          }

          const carts = { ...state.carts };
          if (nextItems.length > 0) {
            carts[pointId] = nextItems;
          } else {
            delete carts[pointId];
          }
          return { carts };
        });
      },

      changeQuantity: (pointId, productId, delta, color) => {
        const key = cartItemKey(productId, color);
        const items = get().carts[pointId] ?? [];
        const current =
          items.find((item) => cartItemKey(item.productId, item.color) === key)?.quantity ?? 0;
        get().setQuantity(pointId, productId, current + delta, color);
      },

      removeItem: (pointId, productId, color) => {
        get().setQuantity(pointId, productId, 0, color);
      },

      setProductColorQuantities: (pointId, productId, entries) => {
        set((state) => {
          const product = state.products.find((item) => item.id === productId);
          if (!product || product.inStock === false || !product.colors?.length) return state;

          const availableColors = new Set(
            product.colors
              .filter((color) => color.inStock)
              .map((color) => colorKey(color.name)),
          );
          const items = (state.carts[pointId] ?? []).filter(
            (item) => item.productId !== productId,
          );

          for (const entry of entries) {
            const color = normalizeColor(entry.color);
            const quantity = clampQuantity(entry.quantity);
            if (!color || quantity === 0) continue;
            if (!availableColors.has(colorKey(color))) continue;
            items.push({ productId, quantity, color });
          }

          const carts = { ...state.carts };
          if (items.length > 0) {
            carts[pointId] = items;
          } else {
            delete carts[pointId];
          }
          return { carts };
        });
      },

      clearCart: (pointId) => {
        set((state) => {
          const carts = { ...state.carts };
          delete carts[pointId];
          return { carts };
        });
      },

      createOrder: () => {
        const { activePointId, carts } = get();
        const items = carts[activePointId] ?? [];
        if (items.length === 0) return null;

        const order: Order = {
          id: createId("order"),
          pointId: activePointId,
          items: items.map((item) => ({ ...item })),
          totalQty: items.reduce((sum, item) => sum + item.quantity, 0),
          createdAt: new Date().toISOString(),
          status: "sent",
        };

        set((state) => {
          const nextCarts = { ...state.carts };
          delete nextCarts[activePointId];
          return { orders: [order, ...state.orders], carts: nextCarts };
        });

        return order;
      },

      importProducts: (categoryId, rows) => {
        const state = get();
        const report: ImportReport = { added: 0, updated: 0, errors: [] };
        const nextProducts = [...state.products];

        const byKey = new Map<string, Product>();
        for (const item of state.products) {
          if (item.categoryId === categoryId) byKey.set(normalizeKey(item), item);
        }

        const seen = new Set<string>();
        for (const row of rows) {
          const key = normalizeKey(row);
          if (seen.has(key)) {
            report.errors.push(`Дубликат в списке: ${row.brand} ${row.name} ${row.flavor}`.trim());
            continue;
          }
          seen.add(key);

          const match = byKey.get(key);
          if (match) {
            const index = nextProducts.findIndex((item) => item.id === match.id);
            if (index >= 0) {
              const current = nextProducts[index];
              nextProducts[index] = {
                ...current,
                unit: row.unit ?? current.unit,
                section: row.section ?? current.section,
                colors: row.colors?.length
                  ? mergeColors(current.colors, row.colors)
                  : current.colors,
              };
            }
            report.updated += 1;
            continue;
          }

          const fields = normalizeProductFields({
            categoryId,
            brand: row.brand,
            name: row.name,
            flavor: row.flavor,
            unit: row.unit,
            section: row.section,
            colors: row.colors,
          });
          const created: Product = { id: createId(categoryId), ...fields };
          nextProducts.push(created);
          byKey.set(key, created);
          report.added += 1;
        }

        set({ products: nextProducts });
        return report;
      },

      addProduct: (input) => {
        const created: Product = {
          id: createId(input.categoryId),
          ...normalizeProductFields(input),
        };
        set((state) => ({ products: [created, ...state.products] }));
        return created;
      },

      updateProduct: (id, patch) => {
        set((state) => {
          const current = state.products.find((item) => item.id === id);
          if (!current) return state;

          const next: Product = {
            ...current,
            ...normalizeProductFields({
              categoryId: current.categoryId,
              brand: current.brand,
              name: current.name,
              flavor: current.flavor,
              unit: current.unit,
              section: current.section,
              colors: current.colors,
              inStock: current.inStock,
              ...patch,
            }),
          };
          const availableColors = new Set(
            (next.colors ?? [])
              .filter((color) => color.inStock)
              .map((color) => colorKey(color.name)),
          );
          const carts = cleanCarts(state.carts, (item) => {
            if (item.productId !== id) return true;
            if (!next.inStock) return false;
            if (!next.colors?.length) return next.section !== "device";
            if (!item.color) return false;
            return availableColors.has(colorKey(item.color));
          });

          return {
            products: state.products.map((item) => (item.id === id ? next : item)),
            carts,
          };
        });
      },

      removeProduct: (id) => {
        set((state) => ({
          products: state.products.filter((item) => item.id !== id),
          carts: cleanCarts(state.carts, (item) => item.productId !== id),
        }));
      },

      removeProductColor: (id, color) => {
        set((state) => {
          const current = state.products.find((item) => item.id === id);
          if (!current) return state;
          const nextColors = (current.colors ?? []).filter(
            (item) => colorKey(item.name) !== colorKey(color),
          );
          return {
            products: state.products.map((item) =>
              item.id === id ? { ...item, colors: nextColors } : item,
            ),
            carts: cleanCarts(
              state.carts,
              (item) =>
                item.productId !== id ||
                !item.color ||
                colorKey(item.color) !== colorKey(color),
            ),
          };
        });
      },

      setProductInStock: (id, inStock) => {
        set((state) => ({
          products: state.products.map((item) =>
            item.id === id ? { ...item, inStock } : item,
          ),
          carts: inStock
            ? state.carts
            : cleanCarts(state.carts, (item) => item.productId !== id),
        }));
      },

      setProductColorInStock: (id, color, inStock) => {
        set((state) => {
          const current = state.products.find((item) => item.id === id);
          if (!current?.colors?.length) return state;

          const nextColors = current.colors.map((item) =>
            colorKey(item.name) === colorKey(color) ? { ...item, inStock } : item,
          );
          const availableColors = new Set(
            nextColors.filter((item) => item.inStock).map((item) => colorKey(item.name)),
          );

          return {
            products: state.products.map((item) =>
              item.id === id ? { ...item, colors: nextColors } : item,
            ),
            carts: cleanCarts(
              state.carts,
              (item) =>
                item.productId !== id ||
                !item.color ||
                availableColors.has(colorKey(item.color)),
            ),
          };
        });
      },

      updateSettings: (patch) => {
        set((state) => ({ settings: { ...state.settings, ...patch } }));
      },

      resetAll: () => {
        set(createInitialState());
      },
    }),
    {
      name: STORAGE_KEY,
      version: 3,
      // Гидратацию запускаем вручную на клиенте, чтобы не ловить рассинхрон с SSR
      skipHydration: true,
      migrate: (persisted) => {
        if (!persisted || typeof persisted !== "object") return persisted as AppState;
        const state = persisted as Partial<AppState>;
        if (!Array.isArray(state.products)) return persisted as AppState;

        const products = state.products.map((item) => migrateProduct(item));
        const productsById = new Map(products.map((product) => [product.id, product]));
        const carts = cleanCarts(state.carts ?? {}, (item) => {
          const product = productsById.get(item.productId);
          if (!product) return true;
          if (!product.inStock) return false;
          if (!product.colors?.length) return true;
          if (!item.color) {
            const firstAvailable = product.colors.find((color) => color.inStock);
            if (!firstAvailable) return false;
            item.color = firstAvailable.name;
            return true;
          }
          const match = product.colors.find(
            (color) => colorKey(color.name) === colorKey(item.color ?? ""),
          );
          return Boolean(match?.inStock);
        });

        return { ...state, products, carts } as AppState;
      },
    },
  ),
);

/** Текущая корзина точки (стабильная пустая ссылка, если корзины ещё нет). */
export function useCartItems(pointId: string): CartItem[] {
  return useAppStore((state) => state.carts[pointId] ?? EMPTY_CART);
}

export function useActivePoint() {
  return useAppStore((state) => state.points.find((point) => point.id === state.activePointId));
}
