"use client";

import { Link } from "@/components/ui/link";
import { ChevronRight, ShoppingCart } from "lucide-react";

import { CategoryCard } from "@/components/category-card";
import { Button } from "@/components/ui/button";
import { CATEGORIES, isAvailable } from "@/lib/data";
import { shortTotals } from "@/lib/format";
import { useAppStore } from "@/lib/store";

export function HomePage() {
  const products = useAppStore((state) => state.products);
  const activePointId = useAppStore((state) => state.activePointId);
  const carts = useAppStore((state) => state.carts);

  const items = carts[activePointId] ?? [];
  const positions = items.length;
  const units = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className={positions > 0 ? "px-4 pb-32 pt-4" : "px-4 pb-8 pt-4"}>
      <div className="mb-4">
        <h1 className="text-xl font-bold tracking-tight">Каталог</h1>
        <p className="text-sm text-muted-foreground">Выберите категорию и соберите заявку</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            count={
              products.filter(
                (product) => product.categoryId === category.id && isAvailable(product),
              ).length
            }
          />
        ))}
      </div>

      {positions > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur-md">
          <div className="safe-bottom mx-auto w-full max-w-md px-4 pt-3">
            <Button asChild className="h-12 w-full text-base font-semibold shadow-sm">
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" aria-hidden />
                Корзина ({shortTotals(positions, units)})
                <ChevronRight className="ml-auto h-5 w-5 opacity-80" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
