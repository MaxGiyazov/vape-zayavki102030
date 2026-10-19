"use client";

import { useEffect, useState } from "react";
import { Palette, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { StockToggle } from "@/components/settings/stock-toggle";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import type { Product, ProductColor, ProductSection } from "@/lib/types";

interface ProductEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null — создание новой позиции. */
  product: Product | null;
  defaultCategoryId: string;
}

export function ProductEditorDialog({
  open,
  onOpenChange,
  product,
  defaultCategoryId,
}: ProductEditorDialogProps) {
  const addProduct = useAppStore((state) => state.addProduct);
  const updateProduct = useAppStore((state) => state.updateProduct);

  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [flavor, setFlavor] = useState("");
  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const [section, setSection] = useState<ProductSection>("device");
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [colorInput, setColorInput] = useState("");
  const [inStock, setInStock] = useState(true);

  useEffect(() => {
    if (!open) return;
    setBrand(product?.brand ?? "");
    setName(product?.name ?? "");
    setFlavor(product?.flavor ?? "");
    setCategoryId(product?.categoryId ?? defaultCategoryId);
    setSection(product?.section ?? "device");
    setColors(product?.colors ? product.colors.map((color) => ({ ...color })) : []);
    setColorInput("");
    setInStock(product?.inStock !== false);
  }, [open, product, defaultCategoryId]);

  const isHardware = categoryId === "hardware";
  const isDevice = isHardware && section === "device";

  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    if (value !== "hardware") {
      setSection("device");
      setColors([]);
    }
  };

  const handleSectionChange = (value: string) => {
    const next = value as ProductSection;
    setSection(next);
    if (next === "consumable") setColors([]);
  };

  const addColors = () => {
    const parts = colorInput
      .split(/[,;]+/)
      .map((part) => part.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    if (parts.length === 0) return;

    setColors((current) => {
      const next = [...current];
      for (const part of parts) {
        if (
          !next.some(
            (color) =>
              color.name.toLocaleLowerCase("ru-RU") === part.toLocaleLowerCase("ru-RU"),
          )
        ) {
          next.push({ name: part, inStock: true });
        }
      }
      return next;
    });
    setColorInput("");
  };

  const handleSave = () => {
    if (!brand.trim() || !name.trim()) {
      toast.error("Укажите бренд и название");
      return;
    }
    if (isDevice && colors.length === 0) {
      toast.error("Добавьте хотя бы одну расцветку устройства");
      return;
    }

    const payload = {
      categoryId,
      brand: brand.trim(),
      name: name.trim(),
      flavor: flavor.trim(),
      section: isHardware ? section : undefined,
      colors: isDevice ? colors : [],
      inStock,
    };

    if (product) {
      updateProduct(product.id, payload);
      toast.success("Товар обновлён", { description: `${payload.brand} ${payload.name}` });
    } else {
      addProduct(payload);
      toast.success("Товар добавлен", { description: `${payload.brand} ${payload.name}` });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>{product ? "Редактировать товар" : "Новый товар"}</DialogTitle>
          <DialogDescription>
            Изменения сразу сохраняются в локальном каталоге на этом устройстве.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          <div className="grid gap-1.5">
            <Label htmlFor="product-brand">Бренд</Label>
            <Input
              id="product-brand"
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              placeholder="Например, Vaporesso"
              autoComplete="off"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="product-name">
              {isDevice ? "Модель устройства" : "Название"}
            </Label>
            <Input
              id="product-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={isDevice ? "Например, Xros 4 Nano" : "Например, Energy 500 мл"}
              autoComplete="off"
            />
          </div>

          {!isDevice ? (
            <div className="grid gap-1.5">
              <Label htmlFor="product-flavor">Вкус / характеристика</Label>
              <Input
                id="product-flavor"
                value={flavor}
                onChange={(event) => setFlavor(event.target.value)}
                placeholder="Например, Манго или 0.6 Ом"
                autoComplete="off"
              />
            </div>
          ) : null}

          <div className="grid gap-1.5">
            <Label>Категория</Label>
            <Select value={categoryId} onValueChange={handleCategoryChange}>
              <SelectTrigger aria-label="Категория товара">
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
          </div>

          {isHardware ? (
            <div className="grid gap-1.5">
              <Label>Подраздел «Железа»</Label>
              <Select value={section} onValueChange={handleSectionChange}>
                <SelectTrigger aria-label="Подраздел железа">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="device">Устройства</SelectItem>
                  <SelectItem value="consumable">Расходники</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {isDevice ? (
            <div className="grid gap-2 rounded-xl border bg-muted/30 p-3">
              <Label className="flex items-center gap-1.5">
                <Palette className="h-4 w-4 text-primary" aria-hidden />
                Расцветки
              </Label>
              <div className="space-y-1.5">
                {colors.length === 0 ? (
                  <span className="text-xs text-muted-foreground">Добавьте цвета модели</span>
                ) : (
                  colors.map((color) => (
                    <div
                      key={color.name}
                      className="flex items-center justify-between gap-2 rounded-lg border bg-background px-2.5 py-1.5"
                    >
                      <span
                        className={
                          color.inStock
                            ? "min-w-0 truncate text-xs font-medium"
                            : "min-w-0 truncate text-xs font-medium text-muted-foreground"
                        }
                      >
                        {color.name}
                        {color.inStock ? "" : " · нет в наличии"}
                      </span>
                      <span className="flex shrink-0 items-center gap-1">
                        <Switch
                          checked={color.inStock}
                          onCheckedChange={(checked) =>
                            setColors((current) =>
                              current.map((item) =>
                                item.name === color.name
                                  ? { ...item, inStock: checked }
                                  : item,
                              ),
                            )
                          }
                          label={`Наличие цвета ${color.name} у ${name || "товара"}`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setColors((current) =>
                              current.filter((item) => item.name !== color.name),
                            )
                          }
                          aria-label={`Удалить цвет ${color.name}`}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </span>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={colorInput}
                  onChange={(event) => setColorInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addColors();
                    }
                  }}
                  placeholder="Цвет или список: Чёрный, Синий"
                  autoComplete="off"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addColors}
                  aria-label="Добавить цвет"
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between rounded-xl border bg-muted/30 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">В наличии</p>
              <p className="text-xs text-muted-foreground">
                {inStock ? "Товар виден на витрине" : "Товар скрыт с витрины"}
              </p>
            </div>
            <StockToggle checked={inStock} onChange={setInStock} />
          </div>
        </div>

        <DialogFooter className="shrink-0">
          <Button variant="outline" className="h-11" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button className="h-11 font-semibold" onClick={handleSave}>
            {product ? "Сохранить" : "Добавить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
