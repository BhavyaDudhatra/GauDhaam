export function driveFileId(link: string) {
  const patterns = [
    /\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /^([a-zA-Z0-9_-]{20,})$/,
  ];
  for (const pattern of patterns) {
    const match = link.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function normalizeDriveLink(link: string) {
  const trimmed = link.trim();
  if (!trimmed) return "";
  const id = driveFileId(trimmed);
  if (!id) return trimmed;
  // Already a direct lh3 image URL — ensure it has a size suffix so it renders
  if (trimmed.includes("lh3.googleusercontent.com/d/")) {
    if (/=[a-z]+\d+$/i.test(trimmed)) return trimmed;
    return `${trimmed}=w2000`;
  }
  // Convert any Drive sharing link to a direct image URL
  return `https://lh3.googleusercontent.com/d/${id}=w2000`;
}
