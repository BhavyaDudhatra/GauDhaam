"use client";

import { useEffect } from "react";
import { trackRecentlyViewed } from "@/lib/recently-viewed";

export function TrackView({ productId }: { productId: string }) {
  useEffect(() => {
    trackRecentlyViewed(productId);
  }, [productId]);
  return null;
}
