import React, { useMemo } from "react";

const STORE_HOMEPAGE = "https://formdepartment.com";

export default function Navbar({ showTrialBanner = false }) {
    // Preserve customer_id when redirecting to store so user stays in logged-in context
    const storeHref = useMemo(() => {
        const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
        const cid = params.get("customer_id");
        if (cid) {
            const u = new URL(STORE_HOMEPAGE);
            u.searchParams.set("customer_id", cid);
            return u.toString();
        }
        return STORE_HOMEPAGE;
    }, []);

    return (
        <div>
            {showTrialBanner ? (
                <div
                    className="bg-[#25221D] py-2 text-center font-sans text-[10px] uppercase leading-snug tracking-[0.22em] text-[#EBDCC5] sm:text-[11px] sm:tracking-[0.24em]"
                    role="status"
                >
                    You are currently using a free trial. Upgrade to unlock all features
                </div>
            ) : null}
            <nav className="bg-[#E8E8E8] font-sans sticky top-0 z-50 text-black leading-[1.2] px-4 md:px-6 py-4 md:py-6">
                <div className="max-w-7xl mx-auto">
                    {/* Centered Logo */}
                    <div className="flex items-center justify-center">
                        <a
                            href={storeHref}
                            target="_top"
                            rel="noopener noreferrer"
                            className="block focus:outline-none focus:ring-2 focus:ring-black/20 rounded-2xl"
                            aria-label="Form Department – go to store homepage"
                        >
                            <img
                                src="/assets/11.png"
                                alt="Form Department Logo"
                                className="h-16 md:h-20 lg:h-24 w-auto hover:opacity-90 transition-opacity"
                            />
                        </a>
                    </div>
                </div>
            </nav>
        </div>
    );
}
