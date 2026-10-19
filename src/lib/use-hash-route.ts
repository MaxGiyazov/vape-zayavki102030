import { useEffect, useState } from "react";

function normalizeHash(): string {
  const raw = window.location.hash.replace(/^#/, "").split("?")[0];
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  const trimmed = path.replace(/\/+$/, "");
  return trimmed || "/";
}

/** Минимальный hash-роутер: работает на статическом хостинге без fallback-сервера. */
export function useHashRoute(): string {
  const [route, setRoute] = useState(() =>
    typeof window === "undefined" ? "/" : normalizeHash(),
  );

  useEffect(() => {
    const onHashChange = () => setRoute(normalizeHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  return route;
}
