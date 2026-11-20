import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Trade Desk | Independent Trading Workspace",
  description: "Independent trading workspace with Deriv market data and authorised account connectivity."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}