"use client";

import { Trash2 } from "lucide-react";

import { QuantityStepper } from "@/components/quantity-stepper";
import { Button } from "@/components/ui/button";
import type { CartLine } from "@/lib/types";

interface CartItemProps {
  line: CartLine;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

/** Строка корзины: товар, вкус, счётчик и удаление. */
export function CartItem({ line, onQuantityChange, onRemove }: CartItemProps) {
  const { product, quantity, color } = line;
  const label = `${product.brand} ${product.name}${color ? ` (${color})` : ""}`;
  const fullLabel = `${product.brand} ${product.name} ${product.flavor} ${color ?? ""}`.trim();

  return (
    <div className="flex items-center gap-2 py-3">
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold leading-snug">{label}</p>
        {product.flavor ? (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{product.flavor}</p>
        ) : null}
      </div>

      <QuantityStepper
        value={quantity}
        onChange={onQuantityChange}
        size="sm"
        itemLabel={fullLabel}
      />

      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        aria-label={`Удалить ${fullLabel} из корзины`}
        className="h-9 w-9 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
