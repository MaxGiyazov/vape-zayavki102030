"use client";

import { useEffect, useState } from "react";

import { useAppStore } from "@/lib/store";

/** Заглушка на время чтения localStorage — исключает рассинхрон с серверной разметкой. */
function AppSkeleton() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 animate-pulse rounded-xl bg-muted" />
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="px-4 pb-3">
          <div className="h-11 w-full animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 p-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-[136px] animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  );
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (useAppStore.persist.hasHydrated()) {
      setReady(true);
      return;
    }

    const unsubscribe = useAppStore.persist.onFinishHydration(() => setReady(true));
    // Гидратация отключена в конфиге стора (skipHydration) — запускаем вручную
    void useAppStore.persist.rehydrate();
    return unsubscribe;
  }, []);

  if (!ready) return <AppSkeleton />;

  return <>{children}</>;
}
