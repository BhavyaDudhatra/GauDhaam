import type { Store } from "@/lib/types";
import { isFirebaseConfigured } from "@/lib/firebase";

const globalForStore = globalThis as unknown as {
  __gaudhamStore?: Promise<Store>;
};

export function getStore(): Promise<Store> {
  if (!globalForStore.__gaudhamStore) {
    globalForStore.__gaudhamStore = (async () => {
      // Firestore is wired up but disabled until the project credentials are
      // fixed. Both stores implement the same contract, so switching is a
      // one-line change here.
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
