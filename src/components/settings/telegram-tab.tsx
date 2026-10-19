"use client";

import { useState } from "react";
import { Check, Eye, EyeOff, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/lib/store";
import { testTelegramConnection } from "@/lib/telegram";

/** Вкладка «Telegram»: токен бота, общий chat_id и проверка настроек. */
export function TelegramTab() {
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const points = useAppStore((state) => state.points);
  const activePointId = useAppStore((state) => state.activePointId);

  const [showToken, setShowToken] = useState(false);
  const [testing, setTesting] = useState(false);

  const activePoint = points.find((point) => point.id === activePointId);
  const effectiveChatId = activePoint?.telegramChatId || settings.telegramChatId;
  const configured = Boolean(settings.telegramBotToken.trim() && effectiveChatId.trim());

  const handleTest = async () => {
    setTesting(true);
    try {
      await testTelegramConnection(settings.telegramBotToken, effectiveChatId);
      toast.success("Тест пройден", {
        description: `Заявки будут уходить в чат ${effectiveChatId}`,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Проверка не удалась");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
        Chat ID точки имеет приоритет над общим. Если у активной точки chat_id не задан,
        используется значение ниже.
      </div>

      <div className="grid gap-2">
        <Label htmlFor="bot-token">Bot Token</Label>
        <div className="relative">
          <Input
            id="bot-token"
            type={showToken ? "text" : "password"}
            value={settings.telegramBotToken}
            onChange={(event) => updateSettings({ telegramBotToken: event.target.value })}
            placeholder="123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            autoComplete="off"
            spellCheck={false}
            className="pr-11 font-mono text-sm"
          />
          <button
            type="button"
            onClick={() => setShowToken((value) => !value)}
            aria-label={showToken ? "Скрыть токен" : "Показать токен"}
            className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
          >
            {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Получите у <span className="font-medium">@BotFather</span> командой /newbot
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="chat-id">Общий Chat ID</Label>
        <Input
          id="chat-id"
          value={settings.telegramChatId}
          onChange={(event) => updateSettings({ telegramChatId: event.target.value })}
          placeholder="-1001234567890"
          autoComplete="off"
          spellCheck={false}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Узнать chat_id можно у бота <span className="font-medium">@userinfobot</span>
        </p>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span
          className={
            configured
              ? "flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
              : "flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground"
          }
        >
          <Check className="h-3.5 w-3.5" aria-hidden />
        </span>
        {configured ? "Отправка через бота включена" : "Bot Token или Chat ID не заполнены"}
      </div>

      <Button className="h-11 w-full" onClick={handleTest} disabled={testing}>
        {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {testing ? "Проверяем…" : "Тест"}
      </Button>

      <p className="rounded-xl bg-muted/60 p-3 text-[11px] leading-relaxed text-muted-foreground">
        Демо-режим без бэкенда: обращение к Telegram Bot API имитируется. Реальную отправку
        выполняет приложение Telegram — очистите поля, и корзина предложит готовый текст
        заявки для копирования или диалог «Поделиться».
      </p>
    </div>
  );
}
