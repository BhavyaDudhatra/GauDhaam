import { Img } from "@/components/ui/Img";

/**
 * Renders an  tag. Google Drive links are normalized to a direct image URL.
 * No Next.js image optimization — the browser handles the src directly.
 */
export function SmartImage({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <Img src={src} alt={alt} {...props} />;
}

export default SmartImage;
