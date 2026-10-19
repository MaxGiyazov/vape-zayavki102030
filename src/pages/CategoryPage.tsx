"use client";

import { Link } from "@/components/ui/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, PackageSearch } from "lucide-react";

import { BrandChips } from "@/components/brand-chips";
import { ProductCard } from "@/components/product-card";
import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getBrands, getCategory, isAvailable } from "@/lib/data";
import { productsLabel } from "@/lib/format";
import { useAppStore, useCartItems } from "@/lib/store";
import type { ProductSection } from "@/lib/types";

const HARDWARE_SECTION_KEY = "zayavki-hardware-section";

export function CategoryPage({ categoryId }: { categoryId: string }) {
  const products = useAppStore((state) => state.products);
  const activePointId = useAppStore((state) => state.activePointId);
  const setQuantity = useAppStore((state) => state.setQuantity);
  const setProductColorQuantities = useAppStore((state) => state.setProductColorQuantities);

  const cartItems = useCartItems(activePointId);
  const category = getCategory(categoryId);
  const isHardware = categoryId === "hardware";

  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState<string | null>(null);
  const [section, setSection] = useState<ProductSection>("device");
  // Поиск с задержкой 200 мс, чтобы не фильтровать список на каждый символ
  const debouncedQuery = useDebouncedValue(query, 200);

  useEffect(() => {
    if (!isHardware) return;
    const saved = window.localStorage.getItem(HARDWARE_SECTION_KEY);
    if (saved === "device" || saved === "consumable") setSection(saved);
  }, [isHardware]);

  const handleSectionChange = (value: ProductSection) => {
    setSection(value);
    setBrand(null);
    window.localStorage.setItem(HARDWARE_SECTION_KEY, value);
  };

  const categoryProducts = useMemo(
    () => products.filter((product) => product.categoryId === categoryId),
    [products, categoryId],
  );
  const availableProducts = useMemo(
    () => categoryProducts.filter(isAvailable),
    [categoryProducts],
  );
  const sectionProducts = useMemo(() => {
    if (!isHardware) return availableProducts;
    return availableProducts.filter((product) => (product.section ?? "device") === section);
  }, [availableProducts, isHardware, section]);
  const brands = useMemo(() => getBrands(sectionProducts, categoryId), [sectionProducts, categoryId]);

  const visibleProducts = useMemo(() => {
    const needle = debouncedQuery.trim().toLocaleLowerCase("ru-RU");
    return sectionProducts.filter((product) => {
      if (brand && product.brand !== brand) return false;
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
  }, [sectionProducts, brand, debouncedQuery]);

  const quantityByProduct = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of cartItems) {
      if (!item.color) map.set(item.productId, item.quantity);
    }
    return map;
  }, [cartItems]);

  const colorQuantitiesByProduct = useMemo(() => {
    const map = new Map<string, Record<string, number>>();
    for (const item of cartItems) {
      if (!item.color) continue;
      const mapForProduct = map.get(item.productId) ?? {};
      mapForProduct[item.color] = item.quantity;
      map.set(item.productId, mapForProduct);
    }
    return map;
  }, [cartItems]);

  if (!category) {
    return (
      <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <PackageSearch className="h-10 w-10 text-muted-foreground" aria-hidden />
        <div>
          <h1 className="text-lg font-semibold">Категория не найдена</h1>
          <p className="mt-1 text-sm text-muted-foreground">Возможно, ссылка устарела.</p>
        </div>
        <Button asChild>
          <Link href="/">Вернуться в каталог</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <div className="flex items-center gap-2 px-4 pt-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2 px-2 text-muted-foreground">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Назад
          </Link>
        </Button>
      </div>

      <div className="px-4 pt-1">
        <h1 className="text-xl font-bold tracking-tight">{category.name}</h1>
        <p className="text-sm text-muted-foreground">{productsLabel(sectionProducts.length)}</p>
      </div>

      <div className="space-y-2 px-4 pb-2 pt-3">
        {isHardware ? (
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
            {(
              [
                { value: "device", label: "Устройства" },
                { value: "consumable", label: "Расходники" },
              ] as const
            ).map((tab) => {
              const count = availableProducts.filter(
                (product) => (product.section ?? "device") === tab.value,
              ).length;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => handleSectionChange(tab.value)}
                  aria-pressed={section === tab.value}
                  className={
                    section === tab.value
                      ? "rounded-lg bg-background px-2 py-2 text-sm font-semibold shadow-sm"
                      : "rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground"
                  }
                >
                  {tab.label}
                  <span className="ml-1.5 text-xs font-normal opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        ) : null}
        <SearchBar value={query} onChange={setQuery} />
        <BrandChips brands={brands} value={brand} onChange={setBrand} />
      </div>

      <div className="space-y-2.5 px-4 pt-2">
        {visibleProducts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-12 text-center">
            <PackageSearch className="h-8 w-8 text-muted-foreground" aria-hidden />
            <p className="font-medium">Ничего не найдено</p>
            <p className="max-w-[240px] text-sm text-muted-foreground">
              Попробуйте изменить запрос, выбрать другой бренд или проверить наличие
            </p>
          </div>
        ) : (
          visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={quantityByProduct.get(product.id) ?? 0}
              onQuantityChange={(quantity) => setQuantity(activePointId, product.id, quantity)}
              colorQuantities={colorQuantitiesByProduct.get(product.id)}
              onApplyColors={(entries) =>
                setProductColorQuantities(activePointId, product.id, entries)
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
