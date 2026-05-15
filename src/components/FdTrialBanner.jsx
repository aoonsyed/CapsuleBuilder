import React from "react";
import FdAuthBannerLinks from "./FdAuthBannerLinks";
import { FD_UPGRADE_URL } from "../utils/fdAuth";

/**
 * Free-trial stripe: message centered in the bar; Sign in / Sign up pinned right (guests only).
 */
export default function FdTrialBanner({
  upgradePhrase = "to unlock all features",
}) {
  return (
    <div
      className="relative bg-[#25221D] py-2.5 px-4 sm:px-6 font-sans text-[10px] sm:text-[11px] uppercase leading-snug tracking-[0.2em] sm:tracking-[0.24em] text-[#EBDCC5] border-b border-black/40"
      role="status"
    >
      <p className="mx-auto max-w-[calc(100%-11rem)] text-center sm:max-w-[calc(100%-13rem)]">
        You are currently using a free trial.{" "}
        <a
          href={FD_UPGRADE_URL}
          className="underline underline-offset-2 hover:opacity-90"
          target="_top"
          rel="noopener noreferrer"
        >
          Upgrade
        </a>{" "}
        {upgradePhrase}
      </p>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 sm:right-6">
        <FdAuthBannerLinks />
      </div>
    </div>
  );
}
