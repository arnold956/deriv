import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Trade Desk | Independent Deriv Workspace",
  description: "Independent trading workspace powered by Deriv public market data."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}