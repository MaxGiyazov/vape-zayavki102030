"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Loader2, PackagePlus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseBatchInput, type BatchParseResult } from "@/lib/batch";
import { CATEGORIES } from "@/lib/data";
import { useAppStore } from "@/lib/store";

interface BatchImportPanelProps {
  defaultCategoryId: string;
}

interface PreviewState {
  result: BatchParseResult;
  categoryId: string;
}

/** Массовый ввод позиций текстом с предпросмотром перед импортом. */
export function BatchImportPanel({ defaultCategoryId }: BatchImportPanelProps) {
  const importProducts = useAppStore((state) => state.importProducts);
  const [text, setText] = useState("");
  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    setCategoryId(defaultCategoryId);
  }, [defaultCategoryId]);

  const handleParse = () => {
    if (!text.trim()) {
      toast.error("Вставьте список позиций");
      return;
    }
    const result = parseBatchInput(text, categoryId);
    if (result.items.length === 0 && result.errors.length === 0) {
      toast.error("Не удалось распознать позиции");
      return;
    }
    setPreview({ result, categoryId });
  };

  const handleConfirm = () => {
    if (!preview) return;
    setImporting(true);
    try {
      const report = importProducts(preview.categoryId, preview.result.items);
      if (report.added + report.updated > 0) {
        toast.success("Импорт завершён", {
          description: `Добавлено: ${report.added}, обновлено: ${report.updated}`,
        });
        setText("");
        setPreview(null);
      } else {
        toast.error("Позиции не добавлены", { description: "Проверьте формат списка" });
      }
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <PackagePlus className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold">Массовое добавление</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Вставьте список и проверьте распознанные позиции перед импортом.
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-2">
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger aria-label="Категория массового импорта">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={
            "Vaporesso | Xros 4 Nano | Чёрный, Синий, Розовый\n\n" +
            "Жидкости:\nMonstervapor 20мг:\nПерсик с маракуйей\nБанан с дыней\n" +
            "Chrome 20:\nGenetic:\nПеречная мята"
          }
          spellCheck={false}
          className="min-h-40 w-full rounded-xl border border-input bg-background px-3 py-2 font-mono text-sm leading-relaxed placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />

        <div className="rounded-xl bg-muted/60 p-3 text-[11px] leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground">Формат A — устройства с цветами</p>
          <p className="font-mono">Бренд | Устройство | Цвет1, Цвет2</p>
          <p className="mt-2 font-semibold text-foreground">Формат B — группы и вложенность</p>
          <p className="font-mono">
            Жидкости:
            {"\n"}Monstervapor 20мг:
            {"\n"}Персик с маракуйей
            {"\n"}Chrome 20:
            {"\n"}Genetic:
            {"\n"}Перечная мята
          </p>
        </div>

        <Button className="h-11" onClick={handleParse}>
          <ClipboardList className="h-4 w-4" />
          Разобрать список
        </Button>
      </div>

      <Dialog open={preview !== null} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle>Предпросмотр импорта</DialogTitle>
            <DialogDescription>
              Распознано: {preview?.result.items.length ?? 0}. Проверьте позиции и подтвердите импорт.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
            {preview?.result.items.length === 0 ? (
              <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">
                Позиции не распознаны.
              </p>
            ) : (
              preview?.result.items.map((item) => (
                <div key={`${item.line}-${item.brand}-${item.name}-${item.flavor}`} className="rounded-lg border px-3 py-2">
                  <p className="text-sm font-medium">
                    {[item.brand, item.name, item.flavor].filter(Boolean).join(" · ")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    строка {item.line}
                    {item.colors?.length ? ` · цвета: ${item.colors.join(", ")}` : ""}
                  </p>
                </div>
              ))
            )}
          </div>

          {preview && preview.result.errors.length > 0 ? (
            <div className="shrink-0 rounded-xl bg-amber-50 p-3 dark:bg-amber-500/10">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                Замечания ({preview.result.errors.length})
              </p>
              <ul className="mt-1 max-h-32 space-y-1 overflow-y-auto text-xs text-amber-800 dark:text-amber-300">
                {preview.result.errors.map((error) => (
                  <li key={error}>• {error}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <DialogFooter className="shrink-0">
            <Button variant="outline" className="h-11" onClick={() => setPreview(null)}>
              Отменить
            </Button>
            <Button
              className="h-11 font-semibold"
              onClick={handleConfirm}
              disabled={importing || (preview?.result.items.length ?? 0) === 0}
            >
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Импортировать {preview?.result.items.length ?? 0}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
