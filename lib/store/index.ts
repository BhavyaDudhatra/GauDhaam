import type { Store } from "@/lib/types";
import { isFirebaseConfigured } from "@/lib/firebase";

const globalForStore = globalThis as unknown as {
  __gaudhamStore?: Promise<Store>;
};

export function getStore(): Promise<Store> {
  if (!globalForStore.__gaudhamStore) {
    globalForStore.__gaudhamStore = (async () => {
      const { isFirebaseConfigured } = await import("@/lib/firebase");
      if (isFirebaseConfigured()) {
        const { createFirestoreStore } = await import("./firestore");
        return createFirestoreStore();
      }
      const { createFallbackStore } = await import("./fallback");
      return createFallbackStore();
    })().catch((error) => {
      globalForStore.__gaudhamStore = undefined;
      throw error;
    });
  }

  return globalForStore.__gaudhamStore;
}

export function storageMode() {
  return isFirebaseConfigured() ? "firebase" : "unconfigured";
}
