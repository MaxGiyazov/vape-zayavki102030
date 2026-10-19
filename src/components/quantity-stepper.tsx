"use client";

import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  fullWidth?: boolean;
  /** Показывает поле ввода числа вместо статичного значения. */
  editable?: boolean;
  /** Название товара — для доступных подписей кнопок */
  itemLabel?: string;
  className?: string;
}

/** Счётчик количества с крупными тап-зонами. */
export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = 999,
  size = "md",
  fullWidth = false,
  editable = false,
  itemLabel,
  className,
}: QuantityStepperProps) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const buttonClass = cn(
    "flex items-center justify-center text-foreground transition-colors hover:bg-muted active:bg-muted disabled:opacity-40",
    size === "md" ? "h-11 w-11" : "h-10 w-10",
  );

  const suffix = itemLabel ? ` «${itemLabel}»` : "";

  const commitDraft = () => {
    const parsed = Number.parseInt(draft.replace(/\D/g, ""), 10);
    const next = Number.isFinite(parsed) ? Math.max(min, Math.min(max, parsed)) : value;
    setDraft(String(next));
    if (next !== value) onChange(next);
  };

  return (
    <div
      className={cn(
        "flex shrink-0 items-center rounded-xl border bg-background",
        fullWidth && "w-full justify-between rounded-xl border-primary/20 bg-primary/5",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Уменьшить количество${suffix}`}
        className={cn(buttonClass, "rounded-l-xl")}
      >
        <Minus className="h-4 w-4" />
      </button>

      {editable ? (
        <input
          value={draft}
          onChange={(event) => {
            const next = event.target.value.replace(/\D/g, "").slice(0, 3);
            setDraft(next);
          }}
          onBlur={commitDraft}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              commitDraft();
              event.currentTarget.blur();
            }
            if (event.key === "Escape") {
              setDraft(String(value));
              event.currentTarget.blur();
            }
          }}
          inputMode="numeric"
          aria-label={`Количество${suffix}`}
          className={cn(
            "min-w-0 select-all bg-transparent text-center text-base font-semibold tabular-nums outline-none",
            fullWidth ? "flex-1" : "w-10",
          )}
        />
      ) : (
        <span
          className={cn(
            "min-w-8 select-none text-center text-base font-semibold tabular-nums",
            fullWidth && "flex-1",
          )}
          aria-live="polite"
        >
          {value}
        </span>
      )}

      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Увеличить количество${suffix}`}
        className={cn(buttonClass, "rounded-r-xl")}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
