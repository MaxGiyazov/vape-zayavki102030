"use client";

import { cn } from "@/lib/utils";

interface BrandChipsProps {
  brands: string[];
  /** null — выбраны все бренды */
  value: string | null;
  onChange: (brand: string | null) => void;
}

/** Горизонтальный скролл чипов брендов. */
export function BrandChips({ brands, value, onChange }: BrandChipsProps) {
  const chips: { label: string; key: string | null }[] = [
    { label: "Все", key: null },
    ...brands.map((brand) => ({ label: brand, key: brand })),
  ];

  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1">
      {chips.map((chip) => {
        const active = chip.key === value;
        return (
          <button
            key={chip.key ?? "all"}
            type="button"
            onClick={() => onChange(chip.key)}
            aria-pressed={active}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-background text-muted-foreground hover:bg-muted",
            )}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
