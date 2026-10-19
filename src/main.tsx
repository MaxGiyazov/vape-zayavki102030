import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "@/App";

import "./index.css";

const container = document.getElementById("root");
if (!container) throw new Error("Root element #root not found");

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    try {
      const base = import.meta.env.BASE_URL;
      const swUrl = `${base}sw.js`;
      navigator.serviceWorker
        .register(swUrl, { scope: base })
        .catch((error) => console.warn("Service worker registration failed", error));
    } catch (error) {
      console.warn("Service worker registration failed", error);
    }
  });
}
