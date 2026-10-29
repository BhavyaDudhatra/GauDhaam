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

export type CartLine = {
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  image: string;
  variantLabel: string;
  /** Price actually charged (after offers). */
  price: number;
  /** Pre-offer price, when there is one. */
  originalPrice?: number;
  stock: number;
  qty: number;
};

export type AddableItem = Omit<CartLine, "qty">;

type CartContextValue = {
  lines: CartLine[];
  hydrated: boolean;
  isOpen: boolean;
  count: number;
  subtotal: number;
  savings: number;
  addItem: (item: AddableItem, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "gaudham-cart-v2";

export function lineKey(line: Pick<CartLine, "productId" | "variantId">) {
  return `${line.productId}:${line.variantId}`;
}

function readStored(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (line) =>
          line &&
          typeof line.productId === "string" &&
          typeof line.variantId === "string" &&
          typeof line.price === "number" &&
          typeof line.qty === "number" &&
          typeof line.stock === "number",
      )
      .map((line) => ({
        ...line,
        originalPrice:
          typeof line.originalPrice === "number" ? line.originalPrice : undefined,
        qty: Math.max(1, Math.min(line.qty, Math.max(1, line.stock))),
      }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setLines(readStored());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const addItem = useCallback((item: AddableItem, qty = 1) => {
    if (item.stock <= 0) return;
    const key = lineKey(item);
    setLines((current) => {
      const existing = current.find((line) => lineKey(line) === key);
      if (existing) {
        return current.map((line) =>
          lineKey(line) === key
            ? {
                ...line,
                ...item,
                qty: Math.min(
                  Math.max(1, item.stock),
                  line.qty + Math.max(1, qty),
                ),
              }
            : line,
        );
      }
      return [
        ...current,
        {
          ...item,
          qty: Math.min(Math.max(1, item.stock), Math.max(1, qty)),
        },
      ];
    });
    setIsOpen(true);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setLines((current) =>
      current.map((line) =>
        lineKey(line) === key
          ? {
              ...line,
              qty: Math.max(1, Math.min(qty, Math.max(1, line.stock))),
            }
          : line,
      ),
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setLines((current) => current.filter((line) => lineKey(line) !== key));
  }, []);

  const clear = useCallback(() => setLines([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, line) => sum + line.qty, 0);
    const subtotal = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
    const savings = lines.reduce(
      (sum, line) =>
        sum +
        Math.max(0, (line.originalPrice ?? line.price) - line.price) * line.qty,
      0,
    );
    return {
      lines,
      hydrated,
      isOpen,
      count,
      subtotal,
      savings,
      addItem,
      setQty,
      removeItem,
      clear,
      openCart,
      closeCart,
    };
  }, [
    lines,
    hydrated,
    isOpen,
    addItem,
    setQty,
    removeItem,
    clear,
    openCart,
    closeCart,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
