export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function orderNumber(date = new Date()) {
  const stamp = [
    String(date.getFullYear()).slice(2),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
  const code = Math.floor(1000 + Math.random() * 9000);
  return `GD-${stamp}-${code}`;
}

export function uniqueSlug(base: string, taken: string[]) {
  let candidate = base || "item";
  let counter = 2;
  while (taken.includes(candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }
  return candidate;
}

