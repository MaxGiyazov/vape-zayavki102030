"use client";

import { Switch } from "@/components/ui/switch";

interface StockToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

/** Переключатель «В наличии / Нет в наличии». */
export function StockToggle({ checked, onChange, label = "Наличие товара" }: StockToggleProps) {
  return <Switch checked={checked} onCheckedChange={onChange} label={label} />;
}
