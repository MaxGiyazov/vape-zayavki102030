"use client";

import { Link } from "@/components/ui/link";
import { PackageCheck, Settings2, ShoppingCart } from "lucide-react";

import { PointSelector } from "@/components/point-selector";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

/** Sticky-хедер: логотип, селектор точки, корзина со счётчиком и настройки. */
export function Header() {
  const activePointId = useAppStore((state) => state.activePointId);
  const carts = useAppStore((state) => state.carts);

  const units = (carts[activePointId] ?? []).reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="safe-top sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 px-4 pt-1">
        <Link href="/" className="flex items-center gap-2" aria-label="На главную">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <PackageCheck className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-lg font-bold tracking-tight">Заявки</span>
        </Link>

        <div className="flex items-center">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/settings" aria-label="Настройки">
              <Settings2 className="h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" className="relative rounded-full">
            <Link href="/cart" aria-label={`Корзина, ${units} ед.`}>
              <ShoppingCart className="h-5 w-5" />
              {units > 0 ? (
                <span className="absolute right-0 top-0 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold leading-none text-primary-foreground">
                  {units > 99 ? "99+" : units}
                </span>
              ) : null}
            </Link>
          </Button>
        </div>
      </div>

      <div className="px-4 pb-2 pt-2">
        <PointSelector />
      </div>
    </header>
  );
}
