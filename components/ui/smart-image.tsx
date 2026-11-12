import { Img, type ImgProps } from "@/components/ui/Img";

/**
 * Renders an  tag. Google Drive links are normalized to a direct image URL.
 * No Next.js image optimization — the browser handles the src directly.
 */
export function SmartImage(props: ImgProps) {
  return <Img {...props} />;
}

export default SmartImage;
