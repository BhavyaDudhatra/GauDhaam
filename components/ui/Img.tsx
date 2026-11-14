"use client";

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
 * Renders an img tag. Google Drive links are normalized to proxy URLs.
 * No Next.js image optimization — the browser handles the src directly.
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

  if (!normalizedSrc) {
    return null;
  }

  const imgStyle: React.CSSProperties = {};
  if (fill) {
    imgStyle.position = "absolute";
    imgStyle.top = 0;
    imgStyle.left = 0;
    imgStyle.width = "100%";
    imgStyle.height = "100%";
    imgStyle.objectFit = "cover";
  }

  return (
    <img
      src={normalizedSrc}
      alt={alt}
      width={width ? Number(width) : undefined}
      height={height ? Number(height) : undefined}
      loading={priority ? "eager" : "lazy"}
      className={className}
      style={{ ...imgStyle, ...style }}
    />
  );
}

export default Img;
