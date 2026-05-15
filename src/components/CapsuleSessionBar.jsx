import React, { useMemo } from "react";
import {
  buildLoginUrl,
  buildRegisterUrl,
  buildLogoutUrl,
  FD_ACCOUNT_URL,
  getCustomerIdFromSearch,
  isSignedIn,
} from "../utils/fdAuth";

export default function CapsuleSessionBar({ outputSessionKey }) {
  const customerId = useMemo(() => getCustomerIdFromSearch(), []);
  const signedIn = isSignedIn(customerId);

  const loginUrl = useMemo(() => buildLoginUrl(), []);
  const registerUrl = useMemo(() => buildRegisterUrl(), []);
  const logoutUrl = useMemo(() => buildLogoutUrl(), []);

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

  const linkClass =
    "underline underline-offset-2 hover:opacity-80 focus:outline-none focus-visible:ring-1 focus-visible:ring-black/30 rounded-sm";

  return (
    <div className="sticky top-0 z-[90] bg-[#F2EFEA] border-b border-black/10 px-4 py-2.5 flex flex-wrap items-center justify-end gap-3 text-[11px] uppercase tracking-[0.18em] text-[#2B2A25] font-sans">
      {outputSessionKey ? (
        <button
          type="button"
          onClick={saveOutputs}
          className={linkClass}
        >
          Save project outputs
        </button>
      ) : null}
      {signedIn ? (
        <>
          <a
            href={FD_ACCOUNT_URL}
            className={linkClass}
            target="_top"
            rel="noopener noreferrer"
          >
            My account
          </a>
          <a
            href={logoutUrl}
            className={linkClass}
            target="_top"
            rel="noopener noreferrer"
          >
            Sign out
          </a>
        </>
      ) : (
        <>
          <a
            href={loginUrl}
            className={linkClass}
            target="_top"
            rel="noopener noreferrer"
          >
            Sign in
          </a>
          <a
            href={registerUrl}
            className={linkClass}
            target="_top"
            rel="noopener noreferrer"
          >
            Sign up
          </a>
        </>
      )}
    </div>
  );
}
