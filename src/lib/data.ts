import type { Category, Point, Product, ProductColor } from "@/lib/types";

/** Торговые точки по умолчанию. */
export const DEFAULT_POINTS: Point[] = [
  { id: "point-mira-47", name: "Мира 47", telegramChatId: "" },
  { id: "point-lenina-12", name: "Ленина 12", telegramChatId: "" },
  { id: "point-gagarina-5", name: "Гагарина 5", telegramChatId: "" },
];

/** Шесть фиксированных категорий каталога. */
export const CATEGORIES: Category[] = [
  {
    id: "drinks",
    name: "Напитки",
    icon: "drinks",
    iconClass: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
    cardClass: "border-blue-100 hover:border-blue-200 dark:border-blue-500/20 dark:hover:border-blue-500/40",
    accentClass: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "hardware",
    name: "Железо",
    icon: "hardware",
    iconClass: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
    cardClass:
      "border-indigo-100 hover:border-indigo-200 dark:border-indigo-500/20 dark:hover:border-indigo-500/40",
    accentClass: "text-indigo-600 dark:text-indigo-400",
  },
  {
    id: "liquids",
    name: "Жидкости",
    icon: "liquids",
    iconClass: "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400",
    cardClass: "border-sky-100 hover:border-sky-200 dark:border-sky-500/20 dark:hover:border-sky-500/40",
    accentClass: "text-sky-600 dark:text-sky-400",
  },
  {
    id: "snus",
    name: "Снюс",
    icon: "snus",
    iconClass: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    cardClass:
      "border-emerald-100 hover:border-emerald-200 dark:border-emerald-500/20 dark:hover:border-emerald-500/40",
    accentClass: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "disposables",
    name: "Одноразки",
    icon: "disposables",
    iconClass: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    cardClass:
      "border-amber-100 hover:border-amber-200 dark:border-amber-500/20 dark:hover:border-amber-500/40",
    accentClass: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "other",
    name: "Другое",
    icon: "other",
    iconClass: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400",
    cardClass:
      "border-slate-200 hover:border-slate-300 dark:border-slate-500/20 dark:hover:border-slate-500/40",
    accentClass: "text-slate-600 dark:text-slate-400",
  },
];

export function getCategory(categoryId: string): Category | undefined {
  return CATEGORIES.find((category) => category.id === categoryId);
}

interface ProductOptions {
  section?: Product["section"];
  colors?: ProductColor[];
  inStock?: boolean;
}

const product = (
  id: string,
  categoryId: string,
  brand: string,
  name: string,
  flavor: string,
  options: ProductOptions = {},
): Product => ({
  id,
  categoryId,
  brand,
  name,
  flavor,
  unit: "шт",
  section: options.section,
  colors: options.colors,
  inStock: options.inStock ?? true,
});

/** Устройство «Железа»: цвета вынесены в отдельный список. */
const device = (id: string, brand: string, name: string, colors: string[]): Product =>
  product(id, "hardware", brand, name, "", {
    section: "device",
    colors: colors.map((color) => ({ name: color, inStock: true })),
  });

/** Расходник «Железа»: картриджи, испарители, аксессуары. */
const consumable = (
  id: string,
  brand: string,
  name: string,
  flavor: string,
): Product => product(id, "hardware", brand, name, flavor, { section: "consumable" });

/** Демо-каталог. */
export const DEMO_PRODUCTS: Product[] = [
  // Напитки
  product("drinks-monster-grape", "drinks", "Monster", "Energy 500 мл", "Виноградная кола"),
  product("drinks-monster-mango", "drinks", "Monster", "Energy Ultra 500 мл", "Манго"),
  product("drinks-monster-original", "drinks", "Monster", "Energy 500 мл", "Оригинал"),
  product("drinks-adrenaline-grape", "drinks", "Adrenaline", "Rush 450 мл", "Виноградная кола"),
  product("drinks-adrenaline-mango", "drinks", "Adrenaline", "Rush 450 мл", "Манго"),
  product("drinks-adrenaline-original", "drinks", "Adrenaline", "Rush 450 мл", "Оригинал"),
  product("drinks-burn-mango", "drinks", "Burn", "Energy 449 мл", "Манго"),
  product("drinks-burn-original", "drinks", "Burn", "Energy 449 мл", "Оригинал"),
  product("drinks-redbull-original", "drinks", "Red Bull", "Energy 250 мл", "Оригинал"),
  product("drinks-redbull-grape", "drinks", "Red Bull", "Energy 250 мл", "Виноградная кола"),
  product("drinks-flash-mango", "drinks", "Flash", "Energy 450 мл", "Манго"),
  product("drinks-flash-original", "drinks", "Flash", "Energy 450 мл", "Оригинал"),

  // Железо — устройства
  device("hardware-smok-novo5", "Smok", "Novo 5", ["Чёрный", "Синий", "Серый", "Белый"]),
  device("hardware-smok-nord5", "Smok", "Nord 5", ["Чёрный", "Синий", "Красный", "Серый"]),
  device("hardware-smok-rpm5", "Smok", "RPM 5", ["Чёрный", "Серый", "Синий"]),
  device("hardware-voopoo-drag-x2", "Voopoo", "Drag X2", ["Чёрный", "Серый", "Красный"]),
  device("hardware-voopoo-argus-p1", "Voopoo", "Argus P1", [
    "Серебристый",
    "Чёрный",
    "Зелёный",
  ]),
  device("hardware-geekvape-aegis-legend-3", "GeekVape", "Aegis Legend 3", [
    "Чёрный",
    "Серый",
    "Оранжевый",
  ]),
  device("hardware-geekvape-wenax-q", "GeekVape", "Wenax Q", ["Синий", "Чёрный", "Розовый"]),
  device("hardware-vaporesso-xros-4", "Vaporesso", "Xros 4", [
    "Чёрный",
    "Синий",
    "Красный",
    "Серебристый",
  ]),
  device("hardware-vaporesso-xros-4-nano", "Vaporesso", "Xros 4 Nano", [
    "Чёрный",
    "Серебристый",
    "Розовый",
    "Голубой",
    "Зелёный",
  ]),
  device("hardware-vaporesso-luxe-x-pro", "Vaporesso", "Luxe X Pro", [
    "Красный",
    "Чёрный",
    "Серебристый",
  ]),
  device("hardware-vaporesso-gtx-one", "Vaporesso", "GTX One", ["Белый", "Чёрный", "Синий"]),
  device("hardware-uwell-caliburn-g3", "Uwell", "Caliburn G3", [
    "Чёрный",
    "Синий",
    "Красный",
    "Зелёный",
  ]),

  // Железо — расходники (перенесены из «Другого»)
  consumable("hardware-smok-novo5-coils", "SMOK", "Испаритель Novo 5", "0.8 Ом"),
  consumable("hardware-voopoo-pnp-coils", "Voopoo", "Картридж PnP", "0.6 Ом"),
  consumable("hardware-geekvape-b-coils", "GeekVape", "Испаритель B-series", "0.4 Ом"),
  consumable("hardware-vaporesso-gtx-coils", "Vaporesso", "Испаритель GTX", "0.6 Ом"),
  consumable("hardware-vaporesso-xros-pods", "Vaporesso", "Картридж Xros", "0.6 Ом"),
  consumable("hardware-cotton-bacon", "Cotton Bacon", "Вата Organic", "10 г"),
  consumable("hardware-elfbar-bc5000-pods", "Elfbar", "Картридж BC5000", "2 шт"),
  consumable("hardware-hqd-cuvie-pods", "HQD", "Картридж Cuvie", "2 шт"),
  consumable("hardware-samsung-18650", "Samsung", "Аккумулятор 18650", "3000 мАч"),
  consumable("hardware-chubby-bottle", "Chubby Gorilla", "Флакон 30 мл", "ПЭТ"),
  consumable("hardware-vape-care-wipes", "Vape Care", "Салфетки", "50 шт"),

  // Жидкости
  product("liquids-jam-monster-strawberry", "liquids", "Jam Monster", "Strawberry 30 мл", "20 мг"),
  product("liquids-jam-monster-blueberry", "liquids", "Jam Monster", "Blueberry 30 мл", "20 мг"),
  product("liquids-jam-monster-mango", "liquids", "Jam Monster", "Mango 30 мл", "20 мг"),
  product("liquids-nasty-slow-blow", "liquids", "Nasty", "Slow Blow 30 мл", "20 мг"),
  product("liquids-nasty-cushman", "liquids", "Nasty", "Cushman 30 мл", "20 мг"),
  product("liquids-nasty-bad-blood", "liquids", "Nasty", "Bad Blood 60 мл", "3 мг"),
  product("liquids-chaser-black-grape", "liquids", "Chaser", "Black Grape 30 мл", "20 мг"),
  product("liquids-chaser-mango", "liquids", "Chaser", "Mango 30 мл", "20 мг"),
  product("liquids-bad-drip-cherry", "liquids", "BAD Drip", "Cherry 30 мл", "20 мг"),
  product("liquids-bad-drip-watermelon", "liquids", "BAD Drip", "Watermelon 30 мл", "20 мг"),

  // Снюс
  product("snus-lyft-ice-cool", "snus", "Lyft", "Ice Cool", "15 мг"),
  product("snus-lyft-berry", "snus", "Lyft", "Berry", "15 мг"),
  product("snus-siberia-red", "snus", "Siberia", "Red", "80 мг"),
  product("snus-siberia-white-dry", "snus", "Siberia", "White Dry", "80 мг"),
  product("snus-odens-cold-dry", "snus", "Odens", "Cold Dry", "22 мг"),
  product("snus-odens-double-mint", "snus", "Odens", "Double Mint", "22 мг"),
  product("snus-corvus-fresh", "snus", "Corvus", "Fresh", "30 мг"),
  product("snus-corvus-mint", "snus", "Corvus", "Mint", "30 мг"),

  // Одноразки
  product("disposables-elfbar-bc5000-strawberry", "disposables", "Elfbar", "BC5000", "Клубника"),
  product("disposables-elfbar-bc5000-grape", "disposables", "Elfbar", "BC5000", "Виноград"),
  product("disposables-elfbar-eb8000-mango", "disposables", "Elfbar", "EB8000", "Манго"),
  product("disposables-elfbar-te6000-melon", "disposables", "Elfbar", "TE6000", "Дыня"),
  product("disposables-hqd-cuvie-plus-watermelon", "disposables", "HQD", "Cuvie Plus", "Арбуз"),
  product("disposables-hqd-ultra-mint", "disposables", "HQD", "Ultra", "Мята"),
  product("disposables-lost-mary-bm5000-blueberry", "disposables", "Lost Mary", "BM5000", "Голубика"),
  product("disposables-lost-mary-os5000-cola", "disposables", "Lost Mary", "OS5000", "Кола"),
  product("disposables-waka-sopro-lemonade", "disposables", "Waka", "SoPro", "Лимонад"),
  product("disposables-waka-mini-strawberry", "disposables", "Waka", "Mini", "Клубника"),
];

/** Уникальные бренды категории в порядке появления в каталоге. */
export function getBrands(products: Product[], categoryId: string): string[] {
  const brands: string[] = [];
  for (const item of products) {
    if (item.categoryId === categoryId && !brands.includes(item.brand)) {
      brands.push(item.brand);
    }
  }
  return brands;
}

export function isDeviceProduct(product: Product): boolean {
  return product.section === "device" || (product.colors?.length ?? 0) > 0;
}

export function getAvailableColors(product: Product): ProductColor[] {
  return (product.colors ?? []).filter((color) => color.inStock);
}

/** Товар виден на витрине: включён и имеет хотя бы один доступный цвет. */
export function isAvailable(product: Product): boolean {
  if (product.inStock === false) return false;
  if (product.colors && product.colors.length > 0) {
    return product.colors.some((color) => color.inStock);
  }
  return true;
}

