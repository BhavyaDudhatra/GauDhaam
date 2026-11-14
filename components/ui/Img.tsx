"use client";

import Image from "next/image";
import { normalizeDriveLink } from "@/lib/drive-utils";

export type ImgProps = {
  src: string;
  alt?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
  unoptimized?: boolean;
};

/**
 * Renders an image. Google Drive links are normalized to proxy URLs.
 * Remote images use unoptimized mode to avoid Next.js optimization failures.
 */
export function Img({
  src,
  alt = "",
  className = "",
  width,
  height,
  priority,
  fill,
  sizes,
  style,
  unoptimized,
}: ImgProps) {
  const isRemote = typeof src === "string" && /^https?:/i.test(src);
  const normalizedSrc = isRemote ? normalizeDriveLink(src) : src;
  const isProxyUrl = normalizedSrc.startsWith("/api/image");

  return (
    <Image
      src={normalizedSrc}
      alt={alt}
      width={width ? Number(width) : undefined}
      height={height ? Number(height) : undefined}
      fill={fill}
      sizes={sizes}
      priority={priority}
      unoptimized={isRemote || isProxyUrl || unoptimized}
      className={className}
      style={style}
    />
  );
}

export default Img;
