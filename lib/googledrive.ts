import { Readable } from "stream";
import { google } from "googleapis";
import fs from "fs";
import { driveFileId } from "./drive-utils";

const SCOPES = ["https://www.googleapis.com/auth/drive"];

function getAuth() {
  let email: string | undefined;
  let key: string | undefined;

  const jsonPath = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_PATH;
  if (jsonPath && fs.existsSync(jsonPath)) {
    try {
      const content = fs.readFileSync(jsonPath, "utf8");
      const json = JSON.parse(content);
      email = json.client_email;
      key = json.private_key;
    } catch {
      // fall through to env vars
    }
  }

  if (!email || !key) {
    email = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL;
    key = process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  }

  if (!email || !key) {
    throw new Error(
      "Google Drive credentials are not configured (GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL / GOOGLE_DRIVE_PRIVATE_KEY or GOOGLE_SERVICE_ACCOUNT_JSON_PATH).",
    );
  }

  return new google.auth.JWT({ email, key, scopes: SCOPES });
}

export async function uploadToGoogleDrive(
  file: Buffer,
  fileName: string,
  mimeType: string,
): Promise<string> {
  const auth = getAuth();
  const drive = google.drive({ version: "v3", auth });
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || "1vpp_BZO3O_Og-znDLXJs5M2zV4XZjC-u";

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
    supportsAllDrives: true,
  });

  const fileId = response.data.id;
  if (!fileId) throw new Error("Google Drive did not return a file id.");

  // Anyone with the link can view the file so the storefront can render it.
  await drive.permissions.create({
    fileId,
    requestBody: { role: "reader", type: "anyone" },
    supportsAllDrives: true,
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
