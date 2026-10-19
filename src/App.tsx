import { Header } from "@/components/header";
import { StoreProvider } from "@/components/store-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { useHashRoute } from "@/lib/use-hash-route";
import { CartPage } from "@/pages/CartPage";
import { CategoryPage } from "@/pages/CategoryPage";
import { HomePage } from "@/pages/HomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { SettingsPage } from "@/pages/SettingsPage";

function renderPage(route: string) {
  if (route === "/") return <HomePage />;
  if (route === "/cart") return <CartPage />;
  if (route === "/settings") return <SettingsPage />;

  const categoryMatch = route.match(/^\/category\/([^/]+)$/);
  if (categoryMatch) {
    return <CategoryPage categoryId={decodeURIComponent(categoryMatch[1])} />;
  }

  return <NotFoundPage />;
}

export default function App() {
  const route = useHashRoute();

  return (
    <ThemeProvider>
      <StoreProvider>
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background shadow-sm">
          <Header />
          <main className="flex-1">{renderPage(route)}</main>
        </div>
      </StoreProvider>
      <Toaster />
    </ThemeProvider>
  );
}
