"use client";

import { useEffect, useState } from "react";

export default function AuthCallbackPage() {
  const [message, setMessage] = useState("Completing secure Deriv sign-in…");

  useEffect(() => {
    let cancelled = false;
    const finish = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const returnedState = params.get("state");
      const expectedState = sessionStorage.getItem("deriv_oauth_state");
      const verifier = sessionStorage.getItem("deriv_pkce_verifier");

      if (params.has("error")) {
        setMessage(params.get("error_description") || params.get("error") || "Deriv sign-in was cancelled.");
        sessionStorage.removeItem("deriv_oauth_state");
        sessionStorage.removeItem("deriv_pkce_verifier");
        return;
      }
      if (!code || !returnedState || !expectedState || returnedState !== expectedState || !verifier) {
        setMessage("The sign-in could not be verified. Please return and try again.");
        return;
      }

      try {
        const response = await fetch("/api/auth/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, code_verifier: verifier }),
        });
        const result = await response.json();
        sessionStorage.removeItem("deriv_oauth_state");
        sessionStorage.removeItem("deriv_pkce_verifier");
        if (!response.ok) throw new Error(result.error || "Deriv sign-in failed.");
        if (!cancelled) window.location.replace("/");
      } catch (error) {
        if (!cancelled) setMessage(error instanceof Error ? error.message : "Deriv sign-in failed.");
      }
    };
    finish();
    return () => { cancelled = true; };
  }, []);

  return <main className="auth-callback"><div className="auth-callback-card"><div className="auth-callback-mark">◈</div><h1>Connecting your account</h1><p>{message}</p><a href="/">Return to workspace</a></div></main>;
}
