export type Market = { symbol: string; display_name: string; market?: string; submarket?: string };
export type Tick = { quote: number; epoch: number; symbol: string };

const WS_URL = "wss://ws.derivws.com/websockets/v3?app_id=";
export function createDerivSocket(appId: string) {
  return new WebSocket(WS_URL + encodeURIComponent(appId || "1089"));
}
export function formatQuote(value: number) {
  return Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 5 });
}
