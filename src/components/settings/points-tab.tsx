"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Pencil, Plus, Store, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/lib/store";
import { isValidChatId } from "@/lib/telegram";
import type { Point } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Вкладка «Точки»: добавление, редактирование и удаление торговых точек. */
export function PointsTab() {
  const points = useAppStore((state) => state.points);
  const activePointId = useAppStore((state) => state.activePointId);
  const setActivePoint = useAppStore((state) => state.setActivePoint);
  const addPoint = useAppStore((state) => state.addPoint);
  const updatePoint = useAppStore((state) => state.updatePoint);
  const removePoint = useAppStore((state) => state.removePoint);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Point | null>(null);
  const [name, setName] = useState("");
  const [chatId, setChatId] = useState("");
  const [error, setError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Point | null>(null);

  const canDelete = points.length > 1;

  const openCreate = () => {
    setEditing(null);
    setName("");
    setChatId("");
    setError("");
    setFormOpen(true);
  };

  const openEdit = (point: Point) => {
    setEditing(point);
    setName(point.name);
    setChatId(point.telegramChatId);
    setError("");
    setFormOpen(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedChatId = chatId.trim();

    if (!trimmedName) {
      setError("Укажите название точки");
      return;
    }
    const duplicate = points.some(
      (point) =>
        point.id !== editing?.id &&
        point.name.toLocaleLowerCase("ru-RU") === trimmedName.toLocaleLowerCase("ru-RU"),
    );
    if (duplicate) {
      setError("Точка с таким названием уже есть");
      return;
    }
    if (trimmedChatId && !isValidChatId(trimmedChatId)) {
      setError("Chat ID: число (например -1001234567890) или @username");
      return;
    }

    if (editing) {
      updatePoint(editing.id, { name: trimmedName, telegramChatId: trimmedChatId });
      toast.success("Точка обновлена");
    } else {
      const created = addPoint({ name: trimmedName, telegramChatId: trimmedChatId });
      setActivePoint(created.id);
      toast.success("Точка добавлена");
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    removePoint(deleteTarget.id);
    toast.success("Точка удалена");
    setDeleteTarget(null);
  };

  // Активная точка всегда сверху
  const orderedPoints = useMemo(
    () => [...points].sort((a, b) => Number(b.id === activePointId) - Number(a.id === activePointId)),
    [points, activePointId],
  );

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Корзина ведётся отдельно для каждой точки. Активная точка выбирается в шапке приложения.
      </p>

      <Card className="divide-y">
        {orderedPoints.map((point) => {
          const active = point.id === activePointId;
          return (
            <div key={point.id} className="flex items-center gap-1 p-3 pl-4">
              <button
                type="button"
                onClick={() => setActivePoint(point.id)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
                aria-label={`Сделать точку «${point.name}» активной`}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                    active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                  )}
                >
                  <Store className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-semibold">{point.name}</span>
                    {active ? (
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 px-1.5 py-0 text-[10px] font-medium text-primary"
                      >
                        активная
                      </Badge>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {point.telegramChatId || "chat_id не задан"}
                  </span>
                </span>
              </button>

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-muted-foreground"
                onClick={() => openEdit(point)}
                aria-label={`Редактировать точку «${point.name}»`}
              >
                <Pencil className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setDeleteTarget(point)}
                disabled={!canDelete}
                aria-label={`Удалить точку «${point.name}»`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </Card>

      <Button variant="outline" className="h-11 w-full" onClick={openCreate}>
        <Plus className="h-4 w-4" />
        Добавить точку
      </Button>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>{editing ? "Изменить точку" : "Новая точка"}</DialogTitle>
              <DialogDescription>
                Телеграм-чат можно указать позже — тогда будет использован общий Chat ID из настроек.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-2">
              <Label htmlFor="point-name">Название</Label>
              <Input
                id="point-name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setError("");
                }}
                placeholder="Например, Мира 47"
                autoFocus
                maxLength={60}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="point-chat">Telegram Chat ID</Label>
              <Input
                id="point-chat"
                value={chatId}
                onChange={(event) => {
                  setChatId(event.target.value);
                  setError("");
                }}
                placeholder="-1001234567890"
                autoComplete="off"
                spellCheck={false}
                className="font-mono text-sm"
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <DialogFooter>
              <Button type="button" variant="outline" className="h-11" onClick={() => setFormOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" className="h-11 font-semibold">
                {editing ? "Сохранить" : "Добавить"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить точку?</DialogTitle>
            <DialogDescription>
              Точка «{deleteTarget?.name}» и её корзина будут удалены безвозвратно.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="h-11" onClick={() => setDeleteTarget(null)}>
              Отмена
            </Button>
            <Button variant="destructive" className="h-11" onClick={handleDelete}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
