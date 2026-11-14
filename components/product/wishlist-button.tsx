"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

export function WishlistButton({ productId }: { productId: string }) {
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((data) => {
        if (data.wishlist && data.wishlist.includes(productId)) {
          setInWishlist(true);
        }
      })
      .catch(() => {});
  }, [productId]);

  async function toggle() {
    setLoading(true);
    try {
      if (inWishlist) {
        await fetch("/api/wishlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        setInWishlist(false);
      } else {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        if (res.ok) setInWishlist(true);
        else if (res.status === 401) {
          window.location.href = "/login?next=" + encodeURIComponent(window.location.pathname);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`grid h-9 w-9 place-items-center rounded-full border transition-colors ${
        inWishlist
          ? "border-red-300 bg-red-50 text-red-500"
          : "border-line bg-white text-body/60 hover:border-brand hover:text-brand"
      }`}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart size={16} fill={inWishlist ? "currentColor" : "none"} />
    </button>
  );
}
