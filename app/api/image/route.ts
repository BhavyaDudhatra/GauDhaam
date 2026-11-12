import { NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "node:stream";

function getDriveClient() {
  const {
    GOOGLE_OAUTH_CLIENT_ID,
    GOOGLE_OAUTH_CLIENT_SECRET,
    GOOGLE_OAUTH_REDIRECT_URI,
    GOOGLE_DRIVE_REFRESH_TOKEN,
  } = process.env;

  if (!GOOGLE_OAUTH_CLIENT_ID || !GOOGLE_OAUTH_CLIENT_SECRET || !GOOGLE_OAUTH_REDIRECT_URI || !GOOGLE_DRIVE_REFRESH_TOKEN) {
    throw new Error("Google Drive OAuth configuration is incomplete.");
  }

  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_OAUTH_CLIENT_ID,
    GOOGLE_OAUTH_CLIENT_SECRET,
    GOOGLE_OAUTH_REDIRECT_URI
  );

  oauth2Client.setCredentials({ refresh_token: GOOGLE_DRIVE_REFRESH_TOKEN });
  return google.drive({ version: "v3", auth: oauth2Client });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing file id." }, { status: 400 });
  }

  try {
    const drive = getDriveClient();

    const meta = await drive.files.get({
      fileId: id,
      fields: "mimeType,name",
      supportsAllDrives: true,
    });

    const mimeType = meta.data.mimeType || "image/jpeg";

    const response = await drive.files.get(
      { fileId: id, alt: "media", supportsAllDrives: true },
      { responseType: "stream" }
    );

    const stream = response.data as Readable;

    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return NextResponse.json({ error: "Failed to fetch image." }, { status: 500 });
  }
}
