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
  // Already a working public view URL
  if (trimmed.includes("drive.google.com/uc?export=view")) {
    return trimmed;
  }
  // lh3.googleusercontent.com direct links often return HTML or 403;
  // use the standard public sharing endpoint instead.
  return `https://drive.google.com/uc?export=view&id=${id}`;
}
