"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Moon, Sun } from "lucide-react";

type ThemeMode = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemeMode) => void;
  toggle: () => void;
};

const STORAGE_KEY = "gaudham-theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  const apply = useCallback((mode: ThemeMode) => {
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next = mode === "system" ? (prefersDark ? "dark" : "light") : mode;
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.style.colorScheme = next;
    setResolvedTheme(next);
  }, []);

  useEffect(() => {
    let stored: ThemeMode = "system";
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === "light" || raw === "dark" || raw === "system") stored = raw;
    } catch {
      /* ignore */
    }
    setThemeState(stored);
    apply(stored);
  }, [apply]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (theme === "system") apply("system");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme, apply]);

  const setTheme = useCallback(
    (mode: ThemeMode) => {
      setThemeState(mode);
      try {
        window.localStorage.setItem(STORAGE_KEY, mode);
      } catch {
        /* ignore */
      }
      apply(mode);
    },
    [apply],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggle: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
    }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}

/** Script that runs before paint so the first frame already has the right theme. */
export const themeScript = `(function(){try{var s=localStorage.getItem("${STORAGE_KEY}")||"system";var d=s==="dark"||(s==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, toggle } = useTheme();

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className="grid h-10 w-10 place-items-center rounded-full text-brand-dark transition-colors hover:bg-light dark:text-[#d4d4d4] dark:hover:bg-[#2a322a]"
    >
      {mounted ? (
        isDark ? (
          <Sun size={18} strokeWidth={1.8} />
        ) : (
          <Moon size={18} strokeWidth={1.8} />
        )
      ) : (
        <span className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}
