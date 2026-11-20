import { NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "node:stream";
import fs from "fs";

function getAuth() {
  // Try service account JSON file first
  const jsonPath = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_PATH;
  if (jsonPath && fs.existsSync(jsonPath)) {
    try {
      const content = fs.readFileSync(jsonPath, "utf8");
      const json = JSON.parse(content);
      const auth = new google.auth.GoogleAuth({
        credentials: json,
        scopes: ["https://www.googleapis.com/auth/drive.readonly"],
      });
      return auth;
    } catch (e) {
      console.error("Failed to load service account JSON:", e);
    }
  }

  // Fall back to env vars
  const email = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (email && key) {
    return new google.auth.JWT({
      email,
      key,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
  }

  throw new Error("No Google Drive credentials available.");
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
    },
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  let id = url.searchParams.get("id");
  const urlParam = url.searchParams.get("url");
  if (!id && urlParam) {
    // extract id from drive url
    const m = urlParam.match(/\/file\/d\/([^/?#]+)/) || urlParam.match(/[?&]id=([^&]+)/) || urlParam.match(/lh3\.googleusercontent\.com\/d\/([^/?#]+)/);
    if (m) id = m[1];
    else if (!urlParam.includes("://") && urlParam.length >= 20) id = urlParam;
  }
  if (!id) {
    return NextResponse.json({ error: "Missing file id." }, { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const auth = getAuth();
    const drive = google.drive({ version: "v3", auth });

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
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return NextResponse.json({ error: "Failed to fetch image." }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
  }
}
