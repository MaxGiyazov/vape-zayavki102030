"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppStore } from "@/lib/store";

/** Сброс localStorage к демо-состоянию с подтверждением. */
export function ResetDataDialog() {
  const resetAll = useAppStore((state) => state.resetAll);
  const [open, setOpen] = useState(false);

  const handleReset = () => {
    resetAll();
    setOpen(false);
    toast.success("Данные сброшены", { description: "Загружены демо-каталог и точки" });
  };

  return (
    <>
      <Card className="border-destructive/20 bg-destructive/5 p-4">
        <p className="text-sm font-semibold">Сбросить все данные</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Каталог, точки и настройки вернутся к демо-значениям. Корзины и история заявок будут
          очищены.
        </p>
        <Button variant="destructive" className="mt-3 h-11 w-full" onClick={() => setOpen(true)}>
          <RotateCcw className="h-4 w-4" />
          Сбросить все данные
        </Button>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Сбросить все данные?</DialogTitle>
            <DialogDescription>
              Действие нельзя отменить. Все товары, добавленные вручную, и настройки Telegram
              будут удалены.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="h-11" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" className="h-11" onClick={handleReset}>
              Сбросить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
