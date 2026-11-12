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
        const store = await createFirestoreStore();
        await store.ready();
        return store;
      }
      const { createFallbackStore } = await import("./fallback");
      const store = createFallbackStore();
      await store.ready();
      return store;
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
