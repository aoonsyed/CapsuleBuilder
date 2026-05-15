import React, { useMemo } from "react";
import { FD_LOGO_WHITE_SRC } from "./fdTypography";
import FdAuthBannerLinks from "./FdAuthBannerLinks";
import {
  buildStoreUrlWithCustomer,
  FD_STORE_URL,
  FD_UPGRADE_URL,
  getCustomerIdFromSearch,
} from "../utils/fdAuth";

export default function Navbar({ showTrialBanner = false }) {
  const customerId = useMemo(() => getCustomerIdFromSearch(), []);

  const storeHref = useMemo(
    () => buildStoreUrlWithCustomer(customerId) || FD_STORE_URL,
    [customerId]
  );

  return (
    <div>
      {showTrialBanner ? (
        <div
          className="bg-[#25221D] py-2.5 px-4 text-center font-sans text-[10px] uppercase leading-snug tracking-[0.2em] text-[#EBDCC5] sm:text-[11px] sm:tracking-[0.22em]"
          role="status"
        >
          <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5">
            <span>
              You are currently using a free trial.{" "}
              <a
                href={FD_UPGRADE_URL}
                className="underline underline-offset-2 hover:opacity-90"
                target="_top"
                rel="noopener noreferrer"
              >
                Upgrade
              </a>{" "}
              to unlock all features
            </span>
            <span className="hidden sm:inline opacity-40" aria-hidden>
              |
            </span>
            <FdAuthBannerLinks />
          </span>
        </div>
      ) : null}
      <nav className="bg-[#E8E8E8] font-sans sticky top-0 z-50 text-black leading-[1.2] px-4 md:px-6 py-4 md:py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center relative">
            <a
              href={storeHref}
              target="_top"
              rel="noopener noreferrer"
              className="block focus:outline-none focus:ring-2 focus:ring-black/20 rounded-2xl"
              aria-label="Form Department – go to store homepage"
            >
              <img
                src={FD_LOGO_WHITE_SRC}
                alt="Form Department Logo"
                className="h-16 md:h-20 lg:h-24 w-auto invert hover:opacity-90 transition-opacity"
              />
            </a>
            {!showTrialBanner ? (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden sm:block">
                <FdAuthBannerLinks className="text-[10px] tracking-[0.18em] text-[#2B2A25] normal-case" />
              </div>
            ) : null}
          </div>
        </div>
      </nav>
    </div>
  );
}
