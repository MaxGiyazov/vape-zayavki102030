"use client";

import { useMemo, useState } from "react";
import { Palette } from "lucide-react";

import { QuantityStepper } from "@/components/quantity-stepper";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product } from "@/lib/types";

interface DeviceColorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  /** Текущие количества по цветам в корзине точки. */
  initialQuantities: Record<string, number>;
  onApply: (entries: { color: string; quantity: number }[]) => void;
}

/** Модалка выбора расцветок устройства с независимыми счётчиками. */
export function DeviceColorDialog({
  open,
  onOpenChange,
  product,
  initialQuantities,
  onApply,
}: DeviceColorDialogProps) {
  const colors = useMemo(
    () => (product.colors ?? []).filter((color) => color.inStock),
    [product.colors],
  );
  const [quantities, setQuantities] = useState<Record<string, number>>(() => ({
    ...initialQuantities,
  }));

  const total = useMemo(
    () => colors.reduce((sum, color) => sum + (quantities[color.name] ?? 0), 0),
    [colors, quantities],
  );

  const handleApply = () => {
    onApply(
      colors.map((color) => ({
        color: color.name,
        quantity: quantities[color.name] ?? 0,
      })),
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" aria-hidden />
            {product.brand} {product.name}
          </DialogTitle>
          <DialogDescription>
            Укажите количество для каждой расцветки — позиции добавятся в заявку отдельно.
          </DialogDescription>
        </DialogHeader>

        {colors.length === 0 ? (
          <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            Нет доступных цветов — все расцветки этой модели сейчас отсутствуют.
          </p>
        ) : (
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {colors.map((color) => (
              <div
                key={color.name}
                className="flex items-center justify-between gap-3 rounded-xl border bg-muted/30 px-3 py-2"
              >
                <span className="min-w-0 truncate text-sm font-medium">{color.name}</span>
                <QuantityStepper
                  value={quantities[color.name] ?? 0}
                  onChange={(quantity) =>
                    setQuantities((current) => ({ ...current, [color.name]: quantity }))
                  }
                  min={0}
                  max={999}
                  size="sm"
                  editable
                  itemLabel={`${product.name}, ${color.name}`}
                />
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="shrink-0">
          <Button variant="outline" className="h-11" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button className="h-11 font-semibold" onClick={handleApply} disabled={colors.length === 0}>
            {total > 0 ? `Добавить ${total} шт.` : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
