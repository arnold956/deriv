import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("deriv_access_token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const response = await fetch("https://api.derivws.com/trading/v1/options/accounts", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json({ error: data.errors?.[0]?.message || "Could not load Deriv accounts." }, { status: response.status });
  }
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
