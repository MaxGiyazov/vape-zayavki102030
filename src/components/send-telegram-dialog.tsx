"use client";

import { Link } from "@/components/ui/link";
import { Copy, ExternalLink, Send } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/clipboard";
import { buildShareUrl } from "@/lib/telegram";

interface SendTelegramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  /** Вызывается после того, как заявка считается отправленной */
  onSent: (via: "copy" | "telegram") => void;
}

/**
 * Резервный сценарий отправки: бот не настроен, поэтому показываем готовый текст
 * и даём скопировать его либо открыть системный диалог Telegram.
 */
export function SendTelegramDialog({
  open,
  onOpenChange,
  message,
  onSent,
}: SendTelegramDialogProps) {
  const handleCopy = async () => {
    const copied = await copyText(message);
    if (!copied) {
      toast.error("Не удалось скопировать", { description: "Выделите текст вручную" });
      return;
    }
    onSent("copy");
  };

  const handleOpenTelegram = () => {
    window.open(buildShareUrl(message), "_blank", "noopener,noreferrer");
    onSent("telegram");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" aria-hidden />
            Отправить в Telegram
          </DialogTitle>
          <DialogDescription>
            Бот не настроен — скопируйте текст заявки и отправьте его в чат вручную.{" "}
            <Link href="/settings" className="font-medium text-primary underline-offset-2 hover:underline">
              Настроить бота
            </Link>
          </DialogDescription>
        </DialogHeader>

        <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-muted p-3 text-xs leading-relaxed text-foreground">
          {message}
        </pre>

        <DialogFooter>
          <Button variant="outline" className="h-11" onClick={handleOpenTelegram}>
            <ExternalLink className="h-4 w-4" />
            Открыть Telegram
          </Button>
          <Button className="h-11 font-semibold" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
            Скопировать текст
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
