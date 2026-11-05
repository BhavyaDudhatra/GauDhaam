import type { Store } from "@/lib/types";
import { isFirebaseConfigured } from "@/lib/firebase";

const globalForStore = globalThis as unknown as {
  __gaudhaamStore?: Promise<Store>;
};

export function getStore(): Promise<Store> {
  if (!globalForStore.__gaudhaamStore) {
    globalForStore.__gaudhaamStore = (async () => {
      const { isFirebaseConfigured } = await import("@/lib/firebase");
      if (isFirebaseConfigured()) {
        const { createFirestoreStore } = await import("./firestore");
        return createFirestoreStore();
      }
      const { createFallbackStore } = await import("./fallback");
      return createFallbackStore();
    })().catch((error) => {
      globalForStore.__gaudhaamStore = undefined;
      throw error;
    });
  }

  return globalForStore.__gaudhaamStore;
}

export function storageMode() {
  return isFirebaseConfigured() ? "firebase" : "unconfigured";
}
