import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("deriv_access_token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let accountId = "";
  try {
    const body = await request.json();
    accountId = typeof body.account_id === "string" ? body.account_id : "";
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!/^[A-Za-z0-9_-]{3,64}$/.test(accountId)) {
    return NextResponse.json({ error: "A valid Deriv account ID is required." }, { status: 400 });
  }

  const response = await fetch(
    `https://api.derivws.com/trading/v1/options/accounts/${encodeURIComponent(accountId)}/otp`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );
  const result = await response.json();
  if (!response.ok || typeof result.data?.url !== "string") {
    return NextResponse.json(
      { error: result.errors?.[0]?.message || "Could not create an authenticated trading session." },
      { status: response.status || 502 }
    );
  }
  return NextResponse.json({ url: result.data.url }, { headers: { "Cache-Control": "no-store" } });
}
