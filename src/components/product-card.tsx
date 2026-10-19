"use client";

import { useState } from "react";
import { Palette } from "lucide-react";

import { DeviceColorDialog } from "@/components/device-color-dialog";
import { QuantityStepper } from "@/components/quantity-stepper";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAvailableColors, isDeviceProduct } from "@/lib/data";
import { plural } from "@/lib/format";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  /** Количество в корзине текущей точки (для обычных товаров). */
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  /** Количества по цветам (для устройств). */
  colorQuantities?: Record<string, number>;
  /** Применение количеств по цветам (для устройств). */
  onApplyColors?: (entries: { color: string; quantity: number }[]) => void;
}

export function ProductCard({
  product,
  quantity,
  onQuantityChange,
  colorQuantities = {},
  onApplyColors,
}: ProductCardProps) {
  const [draft, setDraft] = useState(1);
  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const device = isDeviceProduct(product);
  const allColors = product.colors ?? [];
  const colors = getAvailableColors(product);
  const itemLabel = `${product.brand} ${product.name} ${product.flavor}`.trim();

  if (device) {
    const totalInCart = colors.reduce(
      (sum, color) => sum + (colorQuantities[color.name] ?? 0),
      0,
    );

    return (
      <>
        <Card className="overflow-hidden p-0">
          <button
            type="button"
            onClick={() => setColorDialogOpen(true)}
            className="block w-full p-4 text-left transition-colors hover:bg-muted/40 active:bg-muted/60"
            aria-label={`Выбрать цвета: ${itemLabel}`}
          >
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {product.brand}
              </p>
              <h3 className="mt-0.5 line-clamp-2 text-[15px] font-semibold leading-snug">
                {product.name}
              </h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {colors.length === 0
                  ? "Нет доступных цветов"
                  : colors.length === allColors.length
                    ? `${colors.length} ${plural(colors.length, ["расцветка", "расцветки", "расцветок"])}`
                    : `${colors.length} из ${allColors.length} доступны`}
              </p>
            </div>

            {colors.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {colors.slice(0, 4).map((color) => (
                  <span
                    key={color.name}
                    className="rounded-full border bg-background px-2 py-0.5 text-[11px] text-muted-foreground"
                  >
                    {color.name}
                  </span>
                ))}
                {colors.length > 4 ? (
                  <span className="rounded-full border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                    +{colors.length - 4}
                  </span>
                ) : null}
              </div>
            ) : null}

            <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-primary/5 px-3 py-2.5">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                <Palette className="h-4 w-4" aria-hidden />
                {totalInCart > 0 ? `${totalInCart} шт. в заявке` : "Выбрать цвета"}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {totalInCart > 0 ? "Изменить" : "Открыть"}
              </span>
            </div>
          </button>
        </Card>

        {colorDialogOpen && onApplyColors ? (
          <DeviceColorDialog
            open={colorDialogOpen}
            onOpenChange={setColorDialogOpen}
            product={product}
            initialQuantities={colorQuantities}
            onApply={onApplyColors}
          />
        ) : null}
      </>
    );
  }

  const inCart = quantity > 0;

  return (
    <Card className="p-4">
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {product.brand}
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-[15px] font-semibold leading-snug">
          {product.name}
        </h3>
        {product.flavor ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{product.flavor}</p>
        ) : null}
      </div>

      <div className="mt-3">
        {inCart ? (
          // Товар уже в корзине — кнопка превращается в счётчик
          <QuantityStepper
            value={quantity}
            onChange={onQuantityChange}
            fullWidth
            itemLabel={itemLabel}
          />
        ) : (
          <div className="flex items-center gap-2">
            <QuantityStepper value={draft} onChange={setDraft} min={1} itemLabel={itemLabel} />
            <Button className="h-11 flex-1 font-semibold" onClick={() => onQuantityChange(draft)}>
              В корзину
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
