"use client";

import { Link } from "@/components/ui/link";
import { PackageSearch } from "lucide-react";

import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <PackageSearch className="h-8 w-8 text-muted-foreground" aria-hidden />
      </span>
      <div>
        <h1 className="text-lg font-semibold">Страница не найдена</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Такого раздела нет — вернитесь к каталогу.
        </p>
      </div>
      <Button asChild className="h-11 px-6">
        <Link href="/">На главную</Link>
      </Button>
    </div>
  );
}
