import React, { useMemo } from "react";
import {
  buildLoginUrl,
  buildRegisterUrl,
  buildLogoutUrl,
  getCustomerIdFromSearch,
  isSignedIn,
} from "../utils/fdAuth";

const linkClass =
  "underline underline-offset-2 hover:opacity-80 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#EBDCC5]/60 rounded-sm";

/**
 * Sign in / Sign up (guest) or Sign out (logged in) for FD storefront accounts.
 */
export default function FdAuthBannerLinks({ className = "" }) {
  const customerId = useMemo(() => getCustomerIdFromSearch(), []);
  const signedIn = isSignedIn(customerId);

  const loginUrl = useMemo(() => buildLoginUrl(), []);
  const registerUrl = useMemo(() => buildRegisterUrl(), []);
  const logoutUrl = useMemo(() => buildLogoutUrl(), []);

  return (
    <span
      className={`inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 ${className}`}
    >
      {signedIn ? (
        <a
          href={logoutUrl}
          className={linkClass}
          target="_top"
          rel="noopener noreferrer"
        >
          Sign out
        </a>
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
        </>
      )}
    </span>
  );
}
