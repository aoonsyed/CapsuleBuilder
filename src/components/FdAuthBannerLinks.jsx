import React, { useMemo } from "react";
import {
  buildLoginUrl,
  buildRegisterUrl,
  getCustomerIdFromSearch,
  isSignedIn,
} from "../utils/fdAuth";

const linkClass =
  "underline underline-offset-2 hover:opacity-80 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#EBDCC5]/60 rounded-sm";

/**
 * Sign in / Sign up for guests only — hidden when customer_id is present (signed in).
 */
export default function FdAuthBannerLinks({ className = "" }) {
  const customerId = useMemo(() => getCustomerIdFromSearch(), []);
  const signedIn = isSignedIn(customerId);

  const loginUrl = useMemo(() => buildLoginUrl(), []);
  const registerUrl = useMemo(() => buildRegisterUrl(), []);

  if (signedIn) return null;

  return (
    <span
      className={`inline-flex shrink-0 flex-wrap items-center justify-end gap-x-3 gap-y-1 ${className}`}
    >
      <a
        href={loginUrl}
        className={linkClass}
        target="_top"
        rel="noopener noreferrer"
      >
        Sign in
      </a>
      <span className="opacity-50" aria-hidden>
        |
      </span>
      <a
        href={registerUrl}
        className={linkClass}
        target="_top"
        rel="noopener noreferrer"
      >
        Sign up
      </a>
    </span>
  );
}
