// A tiny in-page router for the single-file beta. Paths map to plain hash tokens ("/kriyas/havan" ↔ #kriyas.havan),
// since hosted pages only receive simple #anchors from their link.
import { useSyncExternalStore } from "react";

interface Location {
  path: string;
  search: string;
}

const listeners = new Set<() => void>();
let current: Location = { path: "/", search: "" };

export function pathToToken(path: string): string {
  const clean = path.replace(/^\/+|\/+$/g, "");
  return clean ? clean.replace(/\//g, ".") : "home";
}

export function tokenToPath(token: string): string {
  const t = token.replace(/^#/, "");
  return !t || t === "home" ? "/" : `/${t.replace(/\./g, "/")}`;
}

export function initRouter(): void {
  current = { path: tokenToPath(window.location.hash), search: "" };
  window.addEventListener("hashchange", () => {
    const path = tokenToPath(window.location.hash);
    if (path !== current.path) {
      current = { path, search: "" };
      listeners.forEach((l) => l());
    }
  });
}

export function navigate(href: string): void {
  const [pathPart, query = ""] = href.split("?");
  const path = pathPart || "/";
  const changedPath = path !== current.path;
  current = { path, search: query ? `?${query}` : "" };
  const token = `#${pathToToken(path)}`;
  if (window.location.hash !== token) {
    try {
      history.pushState(null, "", token);
    } catch {
      window.location.hash = token;
    }
  }
  if (changedPath) window.scrollTo(0, 0);
  listeners.forEach((l) => l());
}

export function useLocation(): Location {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
  );
}
