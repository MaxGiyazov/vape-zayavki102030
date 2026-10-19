"use client";

import { Store } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";

/** Селектор активной торговой точки. */
export function PointSelector() {
  const points = useAppStore((state) => state.points);
  const activePointId = useAppStore((state) => state.activePointId);
  const setActivePoint = useAppStore((state) => state.setActivePoint);

  if (points.length === 0) {
    return (
      <div className="flex h-11 items-center rounded-xl border border-dashed px-3 text-sm text-muted-foreground">
        Нет торговых точек — добавьте их в настройках
      </div>
    );
  }

  return (
    <Select value={activePointId} onValueChange={setActivePoint}>
      <SelectTrigger className="border-transparent bg-secondary/70 font-medium" aria-label="Торговая точка">
        <span className="flex min-w-0 items-center gap-2">
          <Store className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span className="min-w-0 truncate">
            <SelectValue placeholder="Выберите точку" />
          </span>
        </span>
      </SelectTrigger>
      <SelectContent>
        {points.map((point) => (
          <SelectItem key={point.id} value={point.id}>
            {point.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
