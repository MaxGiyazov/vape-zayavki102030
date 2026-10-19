/** Базовые типы данных приложения. */

export type Unit = "шт";

export type CategoryIconName =
  | "drinks"
  | "hardware"
  | "liquids"
  | "snus"
  | "disposables"
  | "other";

export interface Point {
  id: string;
  name: string;
  telegramChatId: string;
}

export interface Category {
  id: string;
  name: string;
  /** Ключ иконки lucide-react */
  icon: CategoryIconName;
  /** Классы для цветного кружка с иконкой */
  iconClass: string;
  /** Мягкий фон карточки категории */
  cardClass: string;
  /** Цвет акцента (чипы, подписи) */
  accentClass: string;
}

/** Подраздел категории «Железо». */
export type ProductSection = "device" | "consumable";

/** Расцветка устройства с собственным статусом наличия. */
export interface ProductColor {
  name: string;
  inStock: boolean;
}

export interface Product {
  id: string;
  categoryId: string;
  brand: string;
  name: string;
  flavor: string;
  unit: Unit;
  /** Заполняется для категории «Железо»: устройство или расходник. */
  section?: ProductSection;
  /** Доступные расцветки устройства. */
  colors?: ProductColor[];
  /** Товар показывается на витрине. */
  inStock: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
  /** Выбранная расцветка устройства. */
  color?: string;
}

export type OrderStatus = "sent";

export interface Order {
  id: string;
  pointId: string;
  /** Снимок позиций на момент отправки */
  items: CartItem[];
  totalQty: number;
  createdAt: string;
  status: OrderStatus;
}

export interface Settings {
  telegramBotToken: string;
  telegramChatId: string;
}

/** Строка массового импорта/создания товара. */
export interface ParsedProductRow {
  brand: string;
  name: string;
  flavor: string;
  unit?: Unit;
  section?: ProductSection;
  colors?: string[];
}

/** Данные для создания или редактирования товара. */
export interface ProductInput {
  categoryId: string;
  brand: string;
  name: string;
  flavor?: string;
  unit?: Unit;
  section?: ProductSection;
  colors?: (string | ProductColor)[];
  inStock?: boolean;
}

/** Отчёт об импорте каталога. */
export interface ImportReport {
  added: number;
  updated: number;
  errors: string[];
}

/** Позиция корзины, обогащённая данными товара (используется в UI и в тексте заявки). */
export interface CartLine {
  product: Product;
  quantity: number;
  color?: string;
}
