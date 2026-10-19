import { CATEGORIES } from "@/lib/data";
import { formatDateTime, positionsLabel } from "@/lib/format";
import type { CartLine, Point, Product, Settings } from "@/lib/types";

/** Полное название товара для заявки: бренд + модель + вкус без дублей. */
export function productLabel(product: Product, color?: string): string {
  const lower = (value: string) => value.toLocaleLowerCase("ru-RU");
  const parts: string[] = [];
  const push = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (parts.some((part) => lower(part) === lower(trimmed))) return;
    parts.push(trimmed);
  };
  push(product.brand);
  push(product.name);
  push(product.flavor);
  const label = parts.join(" ");
  return color ? `${label} (${color})` : label;
}

export interface MessagePayload {
  pointName: string;
  createdAt: string;
  lines: CartLine[];
}

/** Текст заявки для Telegram. */
export function buildOrderMessage({ pointName, createdAt, lines }: MessagePayload): string {
  const knownIds = new Set(CATEGORIES.map((category) => category.id));

  const blocks = CATEGORIES.map((category) => {
    const categoryLines = lines.filter((line) => line.product.categoryId === category.id);
    if (categoryLines.length === 0) return null;
    const rows = categoryLines.map(
      (line) =>
        `- ${productLabel(line.product, line.color)} — ${line.quantity} ${line.product.unit}.`,
    );
    return `${category.name}:\n${rows.join("\n")}`;
  }).filter((block): block is string => block !== null);

  // Товары с неизвестной категорией не теряем
  const orphanLines = lines.filter((line) => !knownIds.has(line.product.categoryId));
  if (orphanLines.length > 0) {
    const rows = orphanLines.map(
      (line) =>
        `- ${productLabel(line.product, line.color)} — ${line.quantity} ${line.product.unit}.`,
    );
    blocks.push(`Другое:\n${rows.join("\n")}`);
  }

  const totalQty = lines.reduce((sum, line) => sum + line.quantity, 0);

  return [
    `ТТ: ${pointName}`,
    `Заявка от ${formatDateTime(createdAt)}`,
    "",
    blocks.join("\n\n"),
    "",
    `Итого: ${positionsLabel(lines.length)}, ${totalQty} ед.`,
  ].join("\n");
}

/** Ссылка «поделиться» в Telegram — работает без бэкенда. */
export function buildShareUrl(message: string): string {
  return `https://t.me/share/url?url=&text=${encodeURIComponent(message)}`;
}

export function resolveTelegramTarget(settings: Settings, point?: Point) {
  const token = settings.telegramBotToken.trim();
  const chatId = point?.telegramChatId.trim() || settings.telegramChatId.trim();
  return { token, chatId, configured: Boolean(token && chatId) };
}

export const BOT_TOKEN_PATTERN = /^\d{6,12}:[A-Za-z0-9_-]{30,}$/;
export const CHAT_ID_PATTERN = /^(-?\d{5,}|@[A-Za-z][A-Za-z0-9_]{3,})$/;

export function isValidBotToken(token: string): boolean {
  return BOT_TOKEN_PATTERN.test(token.trim());
}

export function isValidChatId(chatId: string): boolean {
  return CHAT_ID_PATTERN.test(chatId.trim());
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Имитация вызова Telegram Bot API: бэкенда нет, поэтому запрос «уходит» на сервер
 * только визуально. Реальная доставка выполняется через системный диалог Telegram.
 */
export async function sendOrderToTelegram(params: {
  token: string;
  chatId: string;
  message: string;
}): Promise<void> {
  if (!params.message.trim()) throw new Error("Текст заявки пуст");
  if (!isValidBotToken(params.token)) {
    throw new Error("Bot Token заполнен неверно — проверьте настройки Telegram");
  }
  if (!isValidChatId(params.chatId)) {
    throw new Error("Chat ID заполнен неверно — проверьте настройки Telegram");
  }

  await delay(700);
}

/** Проверка настроек бота (тоже имитация сетевого запроса). */
export async function testTelegramConnection(token: string, chatId: string): Promise<void> {
  if (!token.trim()) throw new Error("Укажите Bot Token");
  if (!chatId.trim()) throw new Error("Укажите Chat ID");
  if (!isValidBotToken(token)) throw new Error("Bot Token не похож на настоящий: нужен формат 123456789:AA…");
  if (!isValidChatId(chatId)) throw new Error("Chat ID должен быть числом (например -1001234567890) или @username");

  await delay(800);
}

/** Настройки считаются заполненными, если есть токен и хотя бы один chatId. */
export function isTelegramConfigured(settings: Settings, point?: Point): boolean {
  return resolveTelegramTarget(settings, point).configured;
}
