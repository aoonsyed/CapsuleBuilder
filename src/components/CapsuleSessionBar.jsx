import React, { useMemo } from "react";

const ACCOUNT_URL = "https://formdepartment.com/account";
const LOGIN_URL = "https://formdepartment.com/account/login";

export default function CapsuleSessionBar({ outputSessionKey }) {
  const customerId = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("customer_id") || "";
  }, []);

  const isSignedIn = Boolean(customerId);

  const saveOutputs = () => {
    try {
      const raw = localStorage.getItem("answer") || "";
      const parsed = localStorage.getItem("parsedSuggestions") || "{}";
      const market = localStorage.getItem("marketAnalysisParsed") || "{}";
      const key = outputSessionKey || `saved_${Date.now()}`;
      const payload = {
        savedAt: Date.now(),
        customerId,
        raw,
        parsed,
        market,
      };
      localStorage.setItem(`capsuleProject_${key}`, JSON.stringify(payload));
      const index = JSON.parse(localStorage.getItem("capsuleProjectIndex") || "[]");
      if (!index.includes(key)) {
        index.unshift(key);
        localStorage.setItem("capsuleProjectIndex", JSON.stringify(index.slice(0, 50)));
      }
    } catch (err) {
      console.warn("Failed to save capsule outputs", err);
    }
  };

  return (
    <div className="sticky top-0 z-[90] bg-[#F2EFEA] border-b border-black/10 px-4 py-2.5 flex flex-wrap items-center justify-end gap-3 text-[11px] uppercase tracking-[0.18em] text-[#2B2A25] font-sans">
      {outputSessionKey ? (
        <button
          type="button"
          onClick={saveOutputs}
          className="underline underline-offset-2 hover:opacity-80"
        >
          Save project outputs
        </button>
      ) : null}
      {isSignedIn ? (
        <a href={ACCOUNT_URL} className="underline underline-offset-2 hover:opacity-80">
          Sign out
        </a>
      ) : (
        <a href={LOGIN_URL} className="underline underline-offset-2 hover:opacity-80">
          Sign in
        </a>
      )}
    </div>
  );
}
