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
  // Google Drive public sharing URL - most reliable for embedded images
  return `https://drive.google.com/uc?export=view&id=${id}`;
}
