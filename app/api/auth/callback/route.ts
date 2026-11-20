import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = typeof body.code === "string" ? body.code : "";
    const verifier = typeof body.code_verifier === "string" ? body.code_verifier : "";
    if (!code || verifier.length < 43 || verifier.length > 128) {
      return NextResponse.json({ error: "Invalid OAuth callback payload." }, { status: 400 });
    }

    const clientId = process.env.DERIV_OAUTH_CLIENT_ID || process.env.NEXT_PUBLIC_DERIV_OAUTH_CLIENT_ID;
    const redirectUri = process.env.DERIV_OAUTH_REDIRECT_URI || process.env.NEXT_PUBLIC_DERIV_REDIRECT_URI;
    if (!clientId || !redirectUri) {
      return NextResponse.json({ error: "Deriv OAuth environment variables are not configured." }, { status: 500 });
    }

    const form = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      code,
      code_verifier: verifier,
      redirect_uri: redirectUri,
    });
    const tokenResponse = await fetch("https://auth.deriv.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
      cache: "no-store",
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || typeof tokenData.access_token !== "string") {
      return NextResponse.json({ error: tokenData.error_description || tokenData.error || "Deriv token exchange failed." }, { status: tokenResponse.status || 502 });
    }

    const maxAge = Math.max(60, Math.min(Number(tokenData.expires_in) || 3600, 60 * 60 * 24 * 30));
    const cookieStore = await cookies();
    cookieStore.set("deriv_access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });
    return NextResponse.json({ ok: true, expires_in: maxAge });
  } catch {
    return NextResponse.json({ error: "Unable to complete Deriv sign-in." }, { status: 500 });
  }
}
