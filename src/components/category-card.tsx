"use client";

import { Link } from "@/components/ui/link";

import { CategoryIcon } from "@/components/category-icon";
import { productsLabel } from "@/lib/format";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: Category;
  count: number;
}

/** Крупная карточка категории на главном экране. */
export function CategoryCard({ category, count }: CategoryCardProps) {
  return (
    <Link
      href={`/category/${category.id}`}
      className={cn(
        "flex min-h-[132px] flex-col justify-between rounded-2xl border bg-card p-4 shadow-sm transition-all hover:shadow-md active:scale-[0.98]",
        category.cardClass,
      )}
    >
      <span className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", category.iconClass)}>
        <CategoryIcon name={category.icon} />
      </span>
      <span className="mt-4 block">
        <span className="block text-[15px] font-semibold leading-tight">{category.name}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{productsLabel(count)}</span>
      </span>
    </Link>
  );
}
