"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  accountId: string;
  accountType: string;
  currency: string;
  symbol: string;
  contract: string;
  stake: string;
  duration: string;
  unit: string;
};

type Proposal = {
  id: string;
  ask_price: number;
  payout?: number;
  spot?: number;
};

const durationUnits: Record<string, string> = {
  Ticks: "t",
  Seconds: "s",
  Minutes: "m",
  Hours: "h",
  Days: "d",
};

export default function AuthenticatedTrade({
  accountId, accountType, currency, symbol, contract, stake, duration, unit,
}: Props) {
  const socketRef = useRef<WebSocket | null>(null);
  const requestId = useRef(1);
  const [connected, setConnected] = useState(false);
  const [direction, setDirection] = useState<"CALL" | "PUT">("CALL");
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [message, setMessage] = useState("Connect a Deriv account to request live pricing.");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let ws: WebSocket | null = null;
    setConnected(false);
    setProposal(null);
    if (!accountId || accountId === "Not connected") {
      setMessage("Connect a Deriv account to request live pricing.");
      return;
    }
    setMessage("Authorising trading session…");
    (async () => {
      try {
        const response = await fetch("/api/account/otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ account_id: accountId }),
          cache: "no-store",
        });
        const result = await response.json();
        if (!response.ok || typeof result.url !== "string") {
          throw new Error(result.error || "Could not authorise the trading session.");
        }
        if (cancelled) return;
        ws = new WebSocket(result.url);
        socketRef.current = ws;
        ws.onopen = () => {
          if (cancelled) return;
          setConnected(true);
          setMessage("Secure account session connected.");
        };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.error) {
              setMessage(data.error.message || "Deriv rejected the request.");
              setBusy(false);
              return;
            }
            if (data.proposal) {
              setProposal(data.proposal);
              setMessage("Live proposal received. Review the price before buying.");
            }
            if (data.buy) {
              setBusy(false);
              setMessage(`Contract purchased successfully · ID ${data.buy.contract_id}`);
            }
          } catch {
            setMessage("Received an unreadable response from Deriv.");
          }
        };
        ws.onerror = () => setMessage("Trading connection error. Reconnect your account.");
        ws.onclose = () => {
          setConnected(false);
          setProposal(null);
          if (!cancelled) setMessage("Trading session closed. Reconnect your account.");
        };
      } catch (error) {
        if (!cancelled) setMessage(error instanceof Error ? error.message : "Unable to connect.");
      }
    })();
    return () => {
      cancelled = true;
      socketRef.current = null;
      ws?.close();
    };
  }, [accountId]);

  useEffect(() => {
    const ws = socketRef.current;
    if (!connected || !ws || ws.readyState !== WebSocket.OPEN) return;
    if (contract !== "Rise / Fall") {
      setProposal(null);
      setMessage("Live execution is currently enabled for Rise / Fall contracts. Other contract types are not enabled yet.");
      return;
    }
    const amount = Number(stake);
    const ticks = Number(duration);
    const durationUnit = durationUnits[unit];
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(ticks) || ticks < 1 || !durationUnit) {
      setProposal(null);
      setMessage("Enter a valid stake and duration to request a proposal.");
      return;
    }
    const timer = window.setTimeout(() => {
      const req_id = requestId.current++;
      setProposal(null);
      setMessage("Requesting live proposal…");
      ws.send(JSON.stringify({
        proposal: 1,
        amount,
        basis: "stake",
        contract_type: direction,
        currency: currency || "USD",
        duration: ticks,
        duration_unit: durationUnit,
        underlying_symbol: symbol,
        req_id,
      }));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [connected, contract, stake, duration, unit, direction, currency, symbol]);

  const buy = useCallback(() => {
    const ws = socketRef.current;
    if (!proposal || !ws || ws.readyState !== WebSocket.OPEN || busy) return;
    const accountLabel = accountType === "demo" ? "DEMO" : "REAL";
    const confirmed = window.confirm(
      `Confirm ${accountLabel} trade?\n\n${direction === "CALL" ? "Rise" : "Fall"} · ${symbol}\nStake: ${currency} ${Number(stake).toFixed(2)}\nDuration: ${duration} ${unit}\nMaximum purchase price: ${currency} ${Number(proposal.ask_price).toFixed(2)}\n\nThis submits an actual order to Deriv.`
    );
    if (!confirmed) return;
    setBusy(true);
    setMessage("Submitting order to Deriv…");
    ws.send(JSON.stringify({
      buy: proposal.id,
      price: Number(proposal.ask_price),
      req_id: requestId.current++,
    }));
  }, [proposal, busy, accountType, direction, symbol, currency, stake, duration, unit]);

  const accountConnected = Boolean(accountId && accountId !== "Not connected");
  return (
    <div className="authenticated-trade">
      <div className="direction-row">
        <button type="button" className={direction === "CALL" ? "direction-choice selected-rise" : "direction-choice"} onClick={() => setDirection("CALL")}>Rise</button>
        <button type="button" className={direction === "PUT" ? "direction-choice selected-fall" : "direction-choice"} onClick={() => setDirection("PUT")}>Fall</button>
      </div>
      <div className="proposal-values">
        <div><span>Purchase price</span><b>{proposal ? `${currency} ${Number(proposal.ask_price).toFixed(2)}` : "—"}</b></div>
        <div><span>Potential payout</span><b>{proposal?.payout !== undefined ? `${currency} ${Number(proposal.payout).toFixed(2)}` : "—"}</b></div>
      </div>
      <p className="trade-feedback" role="status">{message}</p>
      <button type="button" className="buy-btn" onClick={buy} disabled={!accountConnected || !connected || !proposal || busy || contract !== "Rise / Fall"}>
        {busy ? "Submitting…" : proposal ? `Buy ${direction === "CALL" ? "Rise" : "Fall"}` : accountConnected ? "Waiting for live proposal…" : "Connect account to trade"}
      </button>
      <small className="trade-account-mode">{accountType === "demo" ? "Demo account" : accountType === "real" ? "Real account" : "No account selected"} · {connected ? "Authenticated session" : "Not connected"}</small>
    </div>
  );
}
