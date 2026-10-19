"use client";

import { Link } from "@/components/ui/link";
import { useMemo, useState } from "react";
import { Loader2, Send, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { CartItem } from "@/components/cart-item";
import { CategoryIcon } from "@/components/category-icon";
import { SendTelegramDialog } from "@/components/send-telegram-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CATEGORIES } from "@/lib/data";
import { positionsLabel, unitsLabel } from "@/lib/format";
import { useAppStore, useCartItems } from "@/lib/store";
import { buildOrderMessage, resolveTelegramTarget, sendOrderToTelegram } from "@/lib/telegram";
import type { CartLine } from "@/lib/types";

export function CartPage() {
  const points = useAppStore((state) => state.points);
  const activePointId = useAppStore((state) => state.activePointId);
  const products = useAppStore((state) => state.products);
  const settings = useAppStore((state) => state.settings);
  const setQuantity = useAppStore((state) => state.setQuantity);
  const removeItem = useAppStore((state) => state.removeItem);
  const clearCart = useAppStore((state) => state.clearCart);
  const createOrder = useAppStore((state) => state.createOrder);

  const items = useCartItems(activePointId);

  const [sending, setSending] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [message, setMessage] = useState("");

  const point = points.find((item) => item.id === activePointId);
  const target = resolveTelegramTarget(settings, point);

  const lines = useMemo<CartLine[]>(() => {
    return items.flatMap((item) => {
      const product = products.find((candidate) => candidate.id === item.productId);
      return product ? [{ product, quantity: item.quantity, color: item.color }] : [];
    });
  }, [items, products]);

  const groups = useMemo(
    () =>
      CATEGORIES.map((category) => ({
        category,
        lines: lines.filter((line) => line.product.categoryId === category.id),
      })).filter((group) => group.lines.length > 0),
    [lines],
  );

  const positions = lines.length;
  const units = lines.reduce((sum, line) => sum + line.quantity, 0);

  const finalize = (note?: string) => {
    const order = createOrder();
    setDialogOpen(false);
    if (!order) return;
    toast.success("Заявка отправлена", {
      description: note
        ? `${note} · ${order.totalQty} ед.`
        : `${point?.name ?? "Торговая точка"} · ${order.totalQty} ед.`,
    });
  };

  const handleSend = async () => {
    if (!point) {
      toast.error("Сначала выберите торговую точку");
      return;
    }

    const text = buildOrderMessage({
      pointName: point.name,
      createdAt: new Date().toISOString(),
      lines,
    });

    // Бот не настроен — показываем текст для копирования
    if (!target.configured) {
      setMessage(text);
      setDialogOpen(true);
      return;
    }

    setSending(true);
    try {
      await sendOrderToTelegram({
        token: target.token,
        chatId: target.chatId,
        message: text,
      });
      finalize();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось отправить заявку");
      setMessage(text);
      setDialogOpen(true);
    } finally {
      setSending(false);
    }
  };

  const handleClear = () => {
    clearCart(activePointId);
    toast.success("Корзина очищена");
  };

  if (positions === 0) {
    return (
      <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <ShoppingCart className="h-8 w-8 text-muted-foreground" aria-hidden />
        </span>
        <div>
          <h1 className="text-lg font-semibold">Корзина пуста</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {point ? `Добавьте товары для точки «${point.name}»` : "Добавьте товары из каталога"}
          </p>
        </div>
        <Button asChild className="h-11 px-6">
          <Link href="/">Перейти в каталог</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-[220px]">
      <div className="px-4 pb-1 pt-4">
        <h1 className="text-xl font-bold tracking-tight">Корзина</h1>
        <p className="text-sm text-muted-foreground">
          {point ? `Точка «${point.name}»` : "Точка не выбрана"}
        </p>
      </div>

      <div className="px-4">
        {groups.map((group) => (
          <section key={group.category.id} className="mt-4">
            <h2 className="mb-1.5 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <CategoryIcon
                name={group.category.icon}
                className={`h-3.5 w-3.5 ${group.category.accentClass}`}
              />
              {group.category.name}
              <span className="ml-auto font-medium normal-case">{group.lines.length}</span>
            </h2>
            <Card className="divide-y px-4">
              {group.lines.map((line) => (
                <CartItem
                  key={`${line.product.id}::${line.color ?? ""}`}
                  line={line}
                  onQuantityChange={(quantity) =>
                    setQuantity(activePointId, line.product.id, quantity, line.color)
                  }
                  onRemove={() => removeItem(activePointId, line.product.id, line.color)}
                />
              ))}
            </Card>
          </section>
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur-md">
        <div className="safe-bottom mx-auto w-full max-w-md space-y-2 px-4 pt-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm text-muted-foreground">Итого</span>
            <span className="text-base font-semibold">
              {positionsLabel(positions)}, {unitsLabel(units)}
            </span>
          </div>

          <Button
            className="h-12 w-full text-base font-semibold shadow-sm"
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            ) : (
              <Send className="h-5 w-5" aria-hidden />
            )}
            {sending ? "Отправляем…" : "Отправить в Telegram"}
          </Button>

          <Button
            variant="ghost"
            className="h-10 w-full text-muted-foreground"
            onClick={handleClear}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Очистить
          </Button>

          <p className="text-center text-[11px] leading-tight text-muted-foreground">
            {target.configured
              ? `Отправка в чат ${target.chatId}`
              : "Бот не настроен — покажем текст заявки для копирования"}
          </p>
        </div>
      </div>

      <SendTelegramDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        message={message}
        onSent={(via) => finalize(via === "copy" ? "Текст скопирован" : "Открыт Telegram")}
      />
    </div>
  );
}
