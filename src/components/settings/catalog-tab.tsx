"use client";

import { useMemo, useRef, useState } from "react";
import { Copy, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { BatchImportPanel } from "@/components/settings/batch-import-panel";
import { ProductEditorDialog } from "@/components/settings/product-editor-dialog";
import { StockToggle } from "@/components/settings/stock-toggle";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buildCatalogText, buildCategoryText } from "@/lib/catalog-export";
import { copyText } from "@/lib/clipboard";
import { CATEGORIES, getCategory } from "@/lib/data";
import { productsLabel } from "@/lib/format";
import { useAppStore } from "@/lib/store";
import type { Product, ProductSection } from "@/lib/types";
import { cn } from "@/lib/utils";

type SectionFilter = "all" | ProductSection;

/** Вкладка «Каталог»: массовый ввод, редактирование, наличие и текстовый экспорт. */
export function CatalogTab() {
  const products = useAppStore((state) => state.products);
  const removeProduct = useAppStore((state) => state.removeProduct);
  const removeProductColor = useAppStore((state) => state.removeProductColor);
  const setProductInStock = useAppStore((state) => state.setProductInStock);
  const setProductColorInStock = useAppStore((state) => state.setProductColorInStock);

  const [categoryId, setCategoryId] = useState("hardware");
  const [query, setQuery] = useState("");
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>("all");
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [fallbackText, setFallbackText] = useState<string | null>(null);
  const fallbackRef = useRef<HTMLTextAreaElement>(null);

  const category = getCategory(categoryId);
  const categoryProducts = useMemo(
    () => products.filter((product) => product.categoryId === categoryId),
    [products, categoryId],
  );
  const inStockCount = categoryProducts.filter((product) => product.inStock !== false).length;

  const visibleProducts = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("ru-RU");
    return categoryProducts.filter((product) => {
      if (sectionFilter !== "all" && product.section !== sectionFilter) return false;
      if (!needle) return true;
      const haystack = [
        product.brand,
        product.name,
        product.flavor,
        ...(product.colors ?? []).map((color) => color.name),
      ]
        .join(" ")
        .toLocaleLowerCase("ru-RU");
      return haystack.includes(needle);
    });
  }, [categoryProducts, query, sectionFilter]);

  const copyToClipboard = async (text: string) => {
    const copied = await copyText(text);
    if (copied) {
      toast.success("Скопировано в буфер обмена");
      return;
    }
    setFallbackText(text);
    toast.error("Не удалось скопировать автоматически");
  };

  const handleCopyAll = () => {
    if (products.length === 0) {
      toast.error("Каталог пуст");
      return;
    }
    void copyToClipboard(buildCatalogText(products));
  };

  const handleCopyCategory = () => {
    if (!category) return;
    if (categoryProducts.length === 0) {
      toast.error("В категории нет товаров для экспорта");
      return;
    }
    void copyToClipboard(buildCategoryText(category, products));
  };

  const handleDelete = () => {
    if (!deleting) return;
    removeProduct(deleting.id);
    toast.success("Товар удалён", {
      description: `${deleting.brand} ${deleting.name}`.trim(),
    });
    setDeleting(null);
  };

  const handleStockChange = (product: Product, inStock: boolean) => {
    setProductInStock(product.id, inStock);
    if (!inStock) {
      toast.success("Товар скрыт с витрины", {
        description: `${product.brand} ${product.name}`.trim(),
      });
    }
  };

  const handleColorStockChange = (product: Product, color: string, inStock: boolean) => {
    setProductColorInStock(product.id, color, inStock);
    if (!inStock) {
      toast.success("Цвет снят с наличия", {
        description: `${product.name} · ${color}`,
      });
    }
  };

  const selectFallbackText = () => {
    fallbackRef.current?.focus();
    fallbackRef.current?.select();
  };

  return (
    <div className="space-y-3">
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Copy className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold">Экспорт каталога</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Человекочитаемый текст со всеми категориями, цветами и наличием копируется в буфер
              обмена.
            </p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="h-10" onClick={handleCopyAll}>
            <Copy className="h-4 w-4" />
            Весь каталог
          </Button>
          <Button variant="outline" size="sm" className="h-10" onClick={handleCopyCategory}>
            <Copy className="h-4 w-4" />
            Категория
          </Button>
        </div>
      </Card>

      <BatchImportPanel defaultCategoryId={categoryId} />

      <Card className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold">Товары каталога</p>
            <p className="text-xs text-muted-foreground">
              {productsLabel(categoryProducts.length)} · в наличии {inStockCount}
            </p>
          </div>
          <Button size="sm" className="h-9 shrink-0" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Добавить
          </Button>
        </div>

        <div className="mt-3 space-y-2">
          <Select
            value={categoryId}
            onValueChange={(value) => {
              setCategoryId(value);
              setSectionFilter("all");
            }}
          >
            <SelectTrigger aria-label="Категория каталога">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск по бренду, названию, цвету"
              className="pl-9"
              aria-label="Поиск по каталогу"
            />
          </div>

          {categoryId === "hardware" ? (
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
              {(
                [
                  { value: "all", label: "Все" },
                  { value: "device", label: "Устройства" },
                  { value: "consumable", label: "Расходники" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setSectionFilter(tab.value)}
                  aria-pressed={sectionFilter === tab.value}
                  className={cn(
                    "h-8 rounded-lg px-1 text-xs font-medium transition-colors",
                    sectionFilter === tab.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </Card>

      <div className="space-y-2">
        {visibleProducts.length === 0 ? (
          <Card className="border-dashed p-6 text-center">
            <p className="text-sm font-medium">Товаров нет</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Добавьте позиции массово или создайте товар вручную.
            </p>
          </Card>
        ) : (
          visibleProducts.map((product) => (
            <Card
              key={product.id}
              className={cn("p-3", product.inStock === false && "opacity-75")}
            >
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {product.brand}
                    </span>
                    {product.section ? (
                      <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-medium">
                        {product.section === "device" ? "Устройство" : "Расходник"}
                      </Badge>
                    ) : null}
                    {product.inStock === false ? (
                      <Badge variant="destructive" className="px-1.5 py-0 text-[10px] font-medium">
                        Нет в наличии
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug">
                    {product.name || product.flavor}
                  </p>
                  {product.name && product.flavor ? (
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {product.flavor}
                    </p>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground"
                    onClick={() => setEditing(product)}
                    aria-label={`Редактировать ${product.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDeleting(product)}
                    aria-label={`Удалить ${product.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {product.colors && product.colors.length > 0 ? (
                <div className="mt-2 space-y-1.5">
                  {product.colors.map((color) => (
                    <div
                      key={color.name}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5",
                        !color.inStock && "bg-muted/40",
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span
                          className={cn(
                            "truncate text-xs font-medium",
                            !color.inStock && "text-muted-foreground",
                          )}
                        >
                          {color.name}
                        </span>
                        {!color.inStock ? (
                          <Badge
                            variant="secondary"
                            className="shrink-0 px-1.5 py-0 text-[10px] font-medium text-muted-foreground"
                          >
                            Нет
                          </Badge>
                        ) : null}
                      </span>
                      <span className="flex shrink-0 items-center gap-1">
                        <StockToggle
                          checked={color.inStock}
                          onChange={(checked) =>
                            handleColorStockChange(product, color.name, checked)
                          }
                          label={`Наличие цвета ${color.name} у ${product.name}`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            removeProductColor(product.id, color.name);
                            toast.success("Цвет удалён", { description: color.name });
                          }}
                          aria-label={`Удалить цвет ${color.name}`}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="mt-2 flex items-center justify-between gap-2 border-t pt-2">
                <span className="text-xs text-muted-foreground">
                  {product.inStock === false ? "Скрыт с витрины" : "Показывается на витрине"}
                </span>
                <StockToggle
                  checked={product.inStock !== false}
                  onChange={(checked) => handleStockChange(product, checked)}
                  label={`Наличие ${product.name}`}
                />
              </div>
            </Card>
          ))
        )}
      </div>

      <ProductEditorDialog
        open={creating || editing !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false);
            setEditing(null);
          }
        }}
        product={editing}
        defaultCategoryId={categoryId}
      />

      <Dialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить товар?</DialogTitle>
            <DialogDescription>
              {deleting ? `${deleting.brand} ${deleting.name}`.trim() : ""} будет удалён из
              каталога и всех корзин. Действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="h-11" onClick={() => setDeleting(null)}>
              Отмена
            </Button>
            <Button variant="destructive" className="h-11" onClick={handleDelete}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={fallbackText !== null} onOpenChange={(open) => !open && setFallbackText(null)}>
        <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle>Скопируйте текст вручную</DialogTitle>
            <DialogDescription>
              Автоматическое копирование недоступно. Выделите текст и скопируйте его
              сочетанием клавиш или долгим нажатием.
            </DialogDescription>
          </DialogHeader>
          <textarea
            ref={fallbackRef}
            value={fallbackText ?? ""}
            readOnly
            spellCheck={false}
            className="min-h-40 flex-1 resize-none rounded-xl border border-input bg-muted/40 p-3 font-mono text-xs leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <DialogFooter className="shrink-0">
            <Button variant="outline" className="h-11" onClick={() => setFallbackText(null)}>
              Закрыть
            </Button>
            <Button className="h-11 font-semibold" onClick={selectFallbackText}>
              Выделить всё
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
