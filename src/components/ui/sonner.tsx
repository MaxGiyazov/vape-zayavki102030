"use client";

import type { ComponentProps } from "react";
import { Toaster as Sonner } from "sonner";

import { useTheme } from "@/components/theme-provider";

type ToasterProps = ComponentProps<typeof Sonner>;

/** Тост-уведомления (sonner). Размещаем сверху — снизу sticky-панели. */
export function Toaster(props: ToasterProps) {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme}
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "rounded-xl border-border",
        },
      }}
      {...props}
    />
  );
}
