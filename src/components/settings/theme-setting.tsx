"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/** Переключатель темы оформления. */
export function ThemeSetting() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">Тёмная тема</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Выбор сохраняется на этом устройстве
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Sun
            className={cn("h-5 w-5", dark ? "text-muted-foreground" : "text-amber-500")}
            aria-hidden
          />
          <Switch checked={dark} onCheckedChange={toggleTheme} label="Тёмная тема" />
          <Moon
            className={cn("h-5 w-5", dark ? "text-primary" : "text-muted-foreground")}
            aria-hidden
          />
        </div>
      </div>
    </Card>
  );
}
