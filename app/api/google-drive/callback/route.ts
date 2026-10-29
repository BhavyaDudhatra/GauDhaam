import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const savedState = request.cookies.get("google_oauth_state")?.value;
  const oauthError = request.nextUrl.searchParams.get("error");

  if (oauthError) {
    return NextResponse.json({ error: "Google authorization denied." }, { status: 400 });
  }
  if (!code || state !== savedState) {
    return NextResponse.json({ error: "Invalid OAuth state." }, { status: 400 });
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ error: "OAuth env missing." }, { status: 500 });
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  const { tokens } = await oauth2Client.getToken(code);
  
  if (!tokens.refresh_token) {
    return NextResponse.json({ error: "No refresh token returned. Revoke and retry." }, { status: 400 });
  }

  // Return refresh token for user to copy into .env.local
  const response = NextResponse.json({
    message: "Authorization successful. Copy refresh_token to GOOGLE_DRIVE_REFRESH_TOKEN in .env.local",
    refresh_token: tokens.refresh_token,
  });
  response.cookies.delete("google_oauth_state");
  return response;
}
