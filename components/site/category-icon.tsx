import { Hexagon, Leaf, Milk, Sparkles } from "lucide-react";

const icons = {
  ghee: Milk,
  herbal: Leaf,
  honey: Hexagon,
  soap: Sparkles,
};

export function CategoryIcon({
  name,
  size = 20,
}: {
  name: keyof typeof icons;
  size?: number;
}) {
  const Icon = icons[name] ?? Leaf;
  return <Icon size={size} strokeWidth={1.7} />;
}
