/* The site's colour theme. Keyline derives every colour from `.dark` / `.light` on an ancestor (keyline.css),
   so the site only decides which class <html> carries: the reader's choice, or the system's when they chose none. */

export type ThemeChoice = "light" | "dark" | "system";

export const THEME_KEY = "kl-site-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

export function readChoice(): ThemeChoice {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === "light" || v === "dark") return v;
  } catch {}
  return "system";
}

export function applyTheme(choice: ThemeChoice) {
  const dark = choice === "dark" || (choice === "system" && matchMedia(DARK_QUERY).matches);
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.classList.toggle("light", !dark);
}

export function storeChoice(choice: ThemeChoice) {
  try {
    if (choice === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, choice);
  } catch {}
  applyTheme(choice);
  listeners.forEach((l) => l());
}

const listeners = new Set<() => void>();

/** For useSyncExternalStore: the stored choice, and the system's own changes while the choice is "system". */
export function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const mq = matchMedia(DARK_QUERY);
  const onSystem = () => {
    if (readChoice() === "system") applyTheme("system");
    onChange();
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key !== THEME_KEY) return;
    applyTheme(readChoice());
    onChange();
  };
  mq.addEventListener("change", onSystem);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    mq.removeEventListener("change", onSystem);
    window.removeEventListener("storage", onStorage);
  };
}

/** Runs in <head> before first paint, so a dark reader never sees a light frame. Kept dependency-free. */
export const themeInitScript = `(function(){try{var v=localStorage.getItem(${JSON.stringify(THEME_KEY)});var d=v==="dark"||(v!=="light"&&matchMedia(${JSON.stringify(DARK_QUERY)}).matches);var c=document.documentElement.classList;c.add(d?"dark":"light");c.remove(d?"light":"dark")}catch(e){}})()`;

export const THEME_LABEL: Record<ThemeChoice, string> = { light: "Light", dark: "Dark", system: "System" };
