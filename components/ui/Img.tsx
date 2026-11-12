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
};

/**
 * Renders an  tag. Google Drive links are normalized to a direct image URL.
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
}: ImgProps) {
  const isRemote = typeof src === "string" && /^https?:/i.test(src);
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
      src={isRemote ? normalizeDriveLink(src) : src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      style={{ ...imgStyle, ...style }}
    />
  );
}

export default Img;
