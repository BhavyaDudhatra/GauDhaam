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
  // Use lh3.googleusercontent.com direct image URL with size hint
  return `https://lh3.googleusercontent.com/d/${id}=w2000`;
}
