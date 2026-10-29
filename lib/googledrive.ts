import { Readable } from "stream";
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/drive"];

function getAuth() {
  const email = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !key) {
    throw new Error(
      "Google Drive credentials are not configured (GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL / GOOGLE_DRIVE_PRIVATE_KEY).",
    );
  }

  return new google.auth.JWT({ email, key, scopes: SCOPES });
}

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

/**
 * Google Drive "view" links are HTML pages, not images, so they break in
 * <img> tags. Convert any Drive link into the direct thumbnail endpoint.
 */
export function normalizeDriveLink(link: string) {
  const trimmed = link.trim();
  if (!trimmed) return "";
  const id = driveFileId(trimmed);
  if (!id) return trimmed;
  if (trimmed.includes("lh3.googleusercontent.com") || trimmed.includes("drive.google.com/thumbnail")) {
    return trimmed;
  }
  return `https://lh3.googleusercontent.com/d/${id}`;
}

export async function uploadToGoogleDrive(
  file: Buffer,
  fileName: string,
  mimeType: string,
): Promise<string> {
  const auth = getAuth();
  const drive = google.drive({ version: "v3", auth });
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: folderId ? [folderId] : undefined,
    },
    media: {
      mimeType,
      body: Readable.from(file),
    },
    fields: "id",
  });

  const fileId = response.data.id;
  if (!fileId) throw new Error("Google Drive did not return a file id.");

  // Anyone with the link can view the file so the storefront can render it.
  await drive.permissions.create({
    fileId,
    requestBody: { role: "reader", type: "anyone" },
  });

  return `https://lh3.googleusercontent.com/d/${fileId}`;
}

export async function deleteFromGoogleDrive(link: string) {
  const fileId = driveFileId(link);
  if (!fileId) return;
  const auth = getAuth();
  const drive = google.drive({ version: "v3", auth });
  try {
    await drive.files.delete({ fileId });
  } catch (error) {
    console.error("Google Drive delete failed", error);
  }
}
