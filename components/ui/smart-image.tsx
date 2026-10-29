import Image, { type ImageProps } from "next/image";

/**
 * Local artwork is optimised by Next; Google Drive links are served directly.
 */
export function SmartImage({ src, alt, ...props }: ImageProps) {
  const remote = typeof src === "string" && /^https?:/i.test(src);
  return (
    <Image
      src={src}
      alt={alt}
      unoptimized={remote || props.unoptimized}
      {...props}
    />
  );
}
