"use client";

import { Link } from "@/components/ui/link";
import { ArrowLeft } from "lucide-react";

import { CatalogTab } from "@/components/settings/catalog-tab";
import { PointsTab } from "@/components/settings/points-tab";
import { ResetDataDialog } from "@/components/settings/reset-data-dialog";
import { TelegramTab } from "@/components/settings/telegram-tab";
import { ThemeSetting } from "@/components/settings/theme-setting";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SettingsPage() {
  return (
    <div className="px-4 pb-10 pt-3">
      <Button asChild variant="ghost" size="sm" className="-ml-2 px-2 text-muted-foreground">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Назад
        </Link>
      </Button>

      <div className="pb-4 pt-1">
        <h1 className="text-xl font-bold tracking-tight">Настройки</h1>
        <p className="text-sm text-muted-foreground">Точки, каталог, тема и отправка в Telegram</p>
      </div>

      <Tabs defaultValue="points">
        <TabsList>
          <TabsTrigger value="points">Точки</TabsTrigger>
          <TabsTrigger value="catalog">Каталог</TabsTrigger>
          <TabsTrigger value="telegram">Telegram</TabsTrigger>
        </TabsList>

        <TabsContent value="points">
          <PointsTab />
        </TabsContent>
        <TabsContent value="catalog">
          <CatalogTab />
        </TabsContent>
        <TabsContent value="telegram">
          <TelegramTab />
        </TabsContent>
      </Tabs>

      <div className="mt-6 space-y-3">
        <ThemeSetting />
        <ResetDataDialog />
      </div>

      <p className="mt-6 text-center text-[11px] text-muted-foreground">
        Данные хранятся только на этом устройстве (localStorage)
      </p>
    </div>
  );
}
