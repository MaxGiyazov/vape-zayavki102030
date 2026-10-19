"use client";

import { Cpu, CupSoda, Droplets, Package, Radio, Zap } from "lucide-react";

import type { CategoryIconName } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS = {
  drinks: CupSoda,
  hardware: Cpu,
  liquids: Droplets,
  snus: Radio,
  disposables: Zap,
  other: Package,
} satisfies Record<CategoryIconName, typeof CupSoda>;

export function CategoryIcon({
  name,
  className,
}: {
  name: CategoryIconName;
  className?: string;
}) {
  const Icon = ICONS[name] ?? Package;
  return <Icon className={cn("h-6 w-6", className)} aria-hidden />;
}
