import React, { useEffect, useState } from "react";
import Step1Vision from "./Step1Vision";
import Step2Inspiration from "./Step2Inspiration";
import Step3ProductFocus from "./Step3ProductFocus";

const ADMIN_DASHBOARD_TOKEN =
  process.env.REACT_APP_ADMIN_DASHBOARD_TOKEN ||
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_ADMIN_DASHBOARD_TOKEN);

const CAROUSEL_ITEMS = [
    { label: "Outerwear", value: "Outerwear", image: "/assets/laura-chouette-9_KGtIF-hUk-unsplash.jpg" },
    { label: "Tee Shirt", value: "Tee Shirt", image: "/assets/marcus-santos-xw5cQNbky5A-unsplash.jpg" },
    { label: "Pants", value: "Pants", image: "/assets/armin-rastgar-06jxXFyuJhc-unsplash.jpg" },
    { label: "Dresses", value: "Dresses", image: "/assets/eve-maier-u1OuYQa0WtQ-unsplash.jpg" },
    { label: "Outerwear", value: "Outerwear", image: "/assets/navid-abedi-G6OkUIS24_g-unsplash.jpg" },
];

// Hero image framing controls (easy custom placement)
const HERO_IMAGE_PLACEMENT = {
    x: "50%",   // horizontal anchor: 0% (left) -> 100% (right)
    y: "70%",    // vertical anchor: 0% (top) -> 100% (bottom)
    size: "cover", // cover | contain | custom size like "110%"
};

export default function LandingPage2({ onNext, onContinue, startInGrid = false, isAdmin = false }) {
    const receiveHeadingStyle = {
        fontFamily: '"Montserrat", "Futura", "Gotham", "Avenir Next", "Segoe UI", sans-serif',
        fontWeight: 600,
        fontStyle: "normal",
        letterSpacing: "0.01em",
    };
    const receiveBodyStyle = {
        fontFamily: '"Montserrat", "Futura", "Gotham", "Avenir Next", "Segoe UI", sans-serif',
        fontWeight: 400,
        fontStyle: "normal",
        letterSpacing: "0.01em",
    };

    const heroImage = "/assets/ayo-ogunseinde-UqT55tGBqzI-unsplash_dark_clean.jpg";

    const [showAllForms, setShowAllForms] = useState(startInGrid);
    const [validating, setValidating] = useState(false);

    const previewImage = "/assets/navid-abedi-G6OkUIS24_g-unsplash.jpg";
    const [activeSlide, setActiveSlide] = useState(0);

    useEffect(() => {
        if (startInGrid) setShowAllForms(true);
    }, [startInGrid]);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
        }, 3500);
        return () => clearInterval(timer);
    }, []);
    // Customer validation is now handled at the CapsuleBuilderFlow level
    // No need to validate here anymore

    const handleGetStarted = () => setShowAllForms(true);

    const handleAdminDashboardClick = () => {
        if (!ADMIN_DASHBOARD_TOKEN) {
            console.error(
                "Missing admin dashboard token. Set REACT_APP_ADMIN_DASHBOARD_TOKEN or VITE_ADMIN_DASHBOARD_TOKEN in the environment."
            );
            alert("Admin dashboard token is not configured. Please set it in the deployment environment.");
            return;
        }

        // Preserve current customer_id so admin can return to the tool without being logged out
        const currentParams = new URLSearchParams(window.location.search);
        const customerId = currentParams.get("customer_id");

        const nextParams = new URLSearchParams();
        if (customerId) {
            nextParams.set("customer_id", customerId);
        }
        nextParams.set("token", ADMIN_DASHBOARD_TOKEN);

        // Navigate within this SPA to the admin dashboard route; the page itself calls the backend
        window.location.href = `/admin?${nextParams.toString()}`;
    };

    const handleContinue = async () => {
        // DEV BYPASS:
        // When running locally, skip subscription validation and continue in the flow.
        const hostname =
            typeof window !== "undefined" ? window.location.hostname : "";
        const isLocalhost =
            hostname === "localhost" ||
            hostname === "127.0.0.1" ||
            hostname === "0.0.0.0";
        if (isLocalhost) {
            if (typeof onContinue === "function") {
                onContinue();
            } else if (onNext) {
                onNext();
            }
            return;
        }

        // Get customer_id from URL
        const params = new URLSearchParams(window.location.search);
        const customerId = params.get("customer_id");
        
        if (!customerId) {
            alert("Customer ID not found. Please try again.");
            return;
        }

        // Validate subscription before proceeding
        try {
            setValidating(true);
            const response = await fetch(
                `https://backend-capsule-builder.onrender.com/proxy/validate-submission?logged_in_customer_id=${customerId}`
            );
            
            const data = await response.json();
            
            if (!data.ok) {
                // User is not subscribed - redirect smoothly to subscription page
                if (data.redirect) {
                    // Smooth redirect to subscription page
                    window.location.href = data.redirect;
                    return;
                } else {
                    alert(data.message || "Unable to validate. Please try again.");
                    setValidating(false);
                    return;
                }
            }
            
            // Validation passed - proceed to next step
            if (typeof onContinue === "function") {
                onContinue();
            } else if (onNext) {
                onNext();
            }
        } catch (err) {
            console.error("Validation error:", err);
            alert("We encountered an error. Please try again.");
        } finally {
            setValidating(false);
        }
    };

    /* ================= FULL-PAGE: THREE FORMS ONLY ================= */
    /* ================= FULL-PAGE: THREE FORMS ONLY ================= */
    if (showAllForms) {
        return (
            <div className="min-h-[10px] font-sans w-full" style={{ backgroundColor: "#E8E8E8" }}>
                <section className="w-full px-4 sm:px-6">
                    <div
                        className="
            mx-auto max-w-7xl
            grid gap-8
            grid-cols-1 lg:grid-cols-3
            justify-items-center
          "
                    >
                        {/* 380x570 wrappers; inner card can scroll */}
                        <div className="w-full h-auto lg:w-[380px] lg:h-[570px] [&>*]:h-full [&>*]:w-full [&>*]:max-w-none [&>*]:overflow-auto">
                            <Step1Vision embedded />
                        </div>

                        <div className="w-full h-auto lg:w-[380px] lg:h-[570px] [&>*]:h-full [&>*]:w-full [&>*]:max-w-none [&>*]:overflow-auto">
                            <Step2Inspiration embedded />
                        </div>

                        <div className="w-full h-auto lg:w-[380px] lg:h-[570px]">
                            {/* scrolls but HIDDEN scrollbar */}
                            <div className="h-full w-full overflow-auto no-scrollbar [&>*]:w-full [&>*]:max-w-none">
                                <Step3ProductFocus embedded />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 mx-auto max-w-7xl flex justify-end">
                        <button
                            type="button"
                            onClick={handleContinue}
                            disabled={validating}
                            className={`px-6 py-3 text-[14px] font-sans font-medium leading-[1.2] text-white rounded-md shadow transition duration-200 ${
                                validating 
                                    ? "bg-gray-400 cursor-not-allowed" 
                                    : "bg-black hover:bg-[#3A3A3D] active:bg-[#2A2A2A]"
                            }`}
                        >
                            {validating ? "Validating..." : "Continue →"}
                        </button>
                    </div>
                </section>

                {/* Make .no-scrollbar available in this view */}
                <style>{`
        .no-scrollbar {
          -ms-overflow-style: none; /* IE & Edge */
          scrollbar-width: none;    /* Firefox */
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;            /* Chrome, Safari, Opera */
        }
      `}</style>
            </div>
        );
    }


    /* ================= DEFAULT LANDING ================= */
    return (
        <div className="min-h-screen w-full font-sans overflow-x-hidden bg-[#EAE7E1] text-black">
            {/* HERO */}
            <section
                className="relative w-full min-h-[640px] flex flex-col items-center justify-end pb-10 px-6 text-center"
                style={{
                    backgroundImage:
                        `linear-gradient(180deg, rgba(0,0,0,0.007) 0%, rgba(0,0,0,0.027) 55%, rgba(0,0,0,0.053) 100%), url("${heroImage}")`,
                    backgroundSize: HERO_IMAGE_PLACEMENT.size,
                    backgroundPosition: `${HERO_IMAGE_PLACEMENT.x} ${HERO_IMAGE_PLACEMENT.y}`,
                }}
            >
                <div className="absolute top-8 left-0 right-0 flex items-center justify-center">
                    <img
                        src="/assets/form-logo-white-transparent.png"
                        alt="Form Department logo"
                        className="w-[210px] sm:w-[260px] md:w-[300px] h-auto"
                    />
                </div>

                <h1 className="font-heading font-medium text-[34px] leading-[1.15] text-[#E7D4BF] max-w-[24ch]">
                    Refine your ideas and move forward with purpose
                </h1>

                <button
                    type="button"
                    onClick={handleGetStarted}
                    className="mt-8 inline-flex items-center justify-center w-full max-w-[360px] h-[56px] rounded-full bg-[#3A3A3A]/70 text-white text-[12px] tracking-[0.18em] uppercase"
                >
                    Start your capsule collection
                </button>

                {isAdmin && (
                    <button
                        type="button"
                        onClick={handleAdminDashboardClick}
                        className="mt-3 inline-flex items-center justify-center w-full max-w-[360px] h-[48px] rounded-full bg-white/90 text-black text-[12px] tracking-[0.14em] uppercase"
                    >
                        Admin dashboard
                    </button>
                )}
            </section>

            {/* WHAT YOU'LL RECEIVE (icon grid, directly below hero) */}
            <section className="bg-white py-14 px-6">
                <div className="mx-auto max-w-[920px]">
                    <h2 className="text-center font-heading font-medium text-[34px] leading-[1.2] text-black">
                        What you&apos;ll receive
                    </h2>

                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-y-16 gap-x-16 place-items-center">
                        {[
                            {
                                title: "Curated Materials",
                                body:
                                    "Thoughtfully selected fabrics tailored to your aesthetic, function and brand goals",
                                icon: (
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55">
                                        <path d="M4 7l3-3 3 3 3-3 3 3 3-3 2 2-3 3 3 3-3 3 3 3-2 2-3-3-3 3-3-3-3 3-3-3 3-3-3-3 3-3-3-3z" />
                                        <path d="M7 4l10 10M17 4L7 14M4 10l10 10M14 10l6 6" />
                                    </svg>
                                ),
                            },
                            {
                                title: "Color Direction",
                                body:
                                    "A colour palette shaped by your feedback and market position",
                                icon: (
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55">
                                        <path d="M12 3a9 9 0 109 9c0 3-2 3-3.5 3H15c-1.1 0-2 .9-2 2s.9 2 2 2h1" />
                                        <path d="M7.5 11.5h0M10 8.5h0M14 8.5h0M16.5 11.5h0" strokeLinecap="round" />
                                    </svg>
                                ),
                            },
                            {
                                title: "Design Framework",
                                body:
                                    "A strategic breakdown of categories and silhouettes aligned with your vision",
                                icon: (
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55">
                                        <path d="M12 3l-4.5 7L10 15h4l2.5-5L12 3z" />
                                        <path d="M12 3v16" />
                                        <rect x="8" y="19" width="8" height="2.5" rx="0.8" />
                                    </svg>
                                ),
                            },
                            {
                                title: "Cost Transparency",
                                body:
                                    "Real-time production estimates to guide planning and investment",
                                icon: (
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55">
                                        <path d="M12 2v20" />
                                        <path d="M17 7.5c0-2-2.2-3.5-5-3.5s-5 1.5-5 3.5S9.2 11 12 11s5 1.5 5 3.5S14.8 18 12 18s-5-1.5-5-3.5" />
                                    </svg>
                                ),
                            },
                        ].map((card) => (
                            <div key={card.title} className="w-full max-w-[340px] text-center">
                                <div className="mx-auto w-[94px] h-[94px] rounded-full bg-[#E9E8E5] flex items-center justify-center text-[#1B1B1B]">
                                    {card.icon}
                                </div>
                                <div className="mt-5 text-[14px] leading-[1.2] text-black" style={receiveHeadingStyle}>
                                    {card.title}
                                </div>
                                <div className="mt-2 text-[13px] leading-[1.45] text-[#2F2F2F]" style={receiveBodyStyle}>
                                    {card.body}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SINGLE EXTENDED CREAM CONTAINER */}
            <section className="bg-white pt-12 pb-14 px-6">
                <div className="mx-auto max-w-[1120px] rounded-[34px] bg-[#E8E6E2] px-8 sm:px-12 pt-14 pb-12 shadow-[18px_18px_36px_rgba(0,0,0,0.10)]">
                    <div className="text-center text-[12px] tracking-[0.32em] uppercase text-[#6F6A61] font-sans">
                        Selection
                    </div>
                    <h2 className="mt-6 text-center font-heading font-medium text-[56px] leading-[1.08] text-[#171614]">
                        What Category Are You Designing?
                    </h2>

                    <div className="mt-14 mx-auto max-w-[620px]">
                        <div className="relative overflow-hidden rounded-[22px] bg-[#F5F3EF] border border-[#E2DFDA]">
                            <div className="relative aspect-[4/5] w-full">
                                {CAROUSEL_ITEMS.map((item, idx) => (
                                    <div
                                        key={`${item.value}-${idx}`}
                                        className={`absolute inset-0 bg-center bg-cover transition-opacity duration-700 ${idx === activeSlide ? "opacity-100" : "opacity-0"}`}
                                        style={{ backgroundImage: `url("${item.image}")` }}
                                    />
                                ))}
                            </div>
                            <div className="absolute inset-x-0 bottom-5 flex justify-center">
                                <span className="px-8 h-[42px] inline-flex items-center justify-center rounded-full text-[11px] tracking-[0.2em] uppercase border bg-[#1B1B1B] text-white border-[#1B1B1B]">
                                    {CAROUSEL_ITEMS[activeSlide].label}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-14 flex justify-center">
                        <div className="w-full max-w-[760px] h-px bg-[#BEBBB5] relative">
                            <div
                                className="absolute top-0 h-px w-[82px] bg-[#4A4741] transition-all duration-500"
                                style={{
                                    left: `${(activeSlide / (CAROUSEL_ITEMS.length - 1)) * 100}%`,
                                    transform: `translateX(-${(activeSlide / (CAROUSEL_ITEMS.length - 1)) * 100}%)`,
                                }}
                            />
                        </div>
                    </div>

                    <div className="mt-14 text-center text-[12px] tracking-[0.32em] uppercase text-[#6B645C] font-sans">
                        Live preview
                    </div>
                    <h2 className="mt-4 text-center font-heading font-medium text-[62px] leading-[1.12] text-[#171614]">
                        Your Curated Capsule
                    </h2>

                    <div className="mt-10 rounded-[34px] bg-[#F7F7F6] border border-[#E8E4DE] p-8 sm:p-10">
                        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 items-start">
                            <div className="rounded-2xl bg-[#F1EFEB] aspect-[4/3] overflow-hidden flex items-center justify-center">
                                <img src={previewImage} alt="Curated capsule preview" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <div className="text-[11px] tracking-[0.24em] uppercase text-[#6B645C] font-sans">Fabric selection</div>
                                <div className="mt-5 space-y-6 text-[#2B2B2B] leading-[1.3]">
                                    <div>
                                        <div className="font-sans font-semibold text-[16px] leading-[1.2]">Organic Cotton</div>
                                        <div className="text-[#6B645C] text-[12px] leading-[1.35]">Share a quick overview of your ideal</div>
                                    </div>
                                    <div>
                                        <div className="font-sans font-semibold uppercase text-[16px] leading-[1.2]">Recycled Poly</div>
                                        <div className="text-[#6B645C] text-[12px] leading-[1.35]">Share a quick overview of your ideal</div>
                                    </div>
                                    <div>
                                        <div className="font-sans font-semibold uppercase text-[16px] leading-[1.2]">Recycled Poly</div>
                                        <div className="text-[#6B645C] text-[12px] leading-[1.35]">Share a quick overview of your ideal</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10">
                            <div className="text-[11px] tracking-[0.28em] uppercase text-[#6B645C] font-sans">Seasonal palette</div>
                            <div className="mt-5 flex items-center gap-4">
                                {["#151515", "#F1EFEA", "#D9D5CE", "#6F6E6A"].map((c) => (
                                    <div key={c} className="w-[54px] h-[78px] rounded-[18px] border border-black/5" style={{ backgroundColor: c }} />
                                ))}
                                <button
                                    type="button"
                                    className="w-[54px] h-[78px] rounded-[18px] border border-dashed border-[#6B645C] text-[#6B645C] flex items-center justify-center"
                                    aria-label="Add palette color"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                    </div>

                    <div className="mt-12 rounded-[34px] bg-[#2C2A27] px-8 sm:px-10 py-10 sm:py-12 text-white">
                            <div className="text-center text-[12px] tracking-[0.32em] uppercase text-white/90 font-sans">
                                Estimated cost breakdown
                            </div>

                            <div className="mt-10 space-y-8 text-[12px] tracking-[0.08em] uppercase font-sans">
                                {[{ label: "Materials", value: "$40.00" }, { label: "Materials", value: "$40.00" }, { label: "Materials", value: "$40.00" }].map((row, idx) => (
                                    <div key={idx}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-white/95">{row.label}</span>
                                            <span className="text-white text-[20px] font-medium normal-case tracking-normal">{row.value}</span>
                                        </div>
                                        <div className="mt-5 h-px bg-white/70" />
                                    </div>
                                ))}
                                <div className="pt-2">
                                    <div className="flex items-end justify-between">
                                        <span className="text-white/95">Total est. production</span>
                                        <span className="text-white text-[44px] leading-none font-semibold normal-case tracking-normal">$120.00</span>
                                    </div>
                                </div>
                            </div>

                            <button type="button" className="mt-12 mx-auto block w-full max-w-[560px] h-[84px] rounded-full bg-white text-[#1B1B1B] text-[20px] tracking-[0.12em] uppercase font-sans font-semibold">
                                Schedule call
                            </button>
                    </div>
                </div>
            </section>

            {/* WHAT YOU'LL RECEIVE */}
            <section className="bg-white py-14 px-6">
                <div className="mx-auto max-w-[1120px]">
                    <h2 className="text-center font-heading font-medium text-[44px] leading-[1.12] text-[#171614]">
                        What you&apos;ll receive
                    </h2>

                    <div className="mt-10 relative rounded-[42px] overflow-hidden px-8 sm:px-12 py-12 text-white">
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage: 'url("/assets/pesce-huang-k7DQy4YaVXk-unsplash_DARK.jpg")',
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                            }}
                        />
                        <div
                            className="absolute inset-0"
                            style={{
                                background:
                                    "linear-gradient(90deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.00) 50%, rgba(0,0,0,0.05) 100%)",
                            }}
                        />

                        <div className="relative z-10 max-w-[760px] pl-4 sm:pl-8 space-y-8">
                            <div>
                                <h3 className="text-[20px] leading-[1.2]" style={receiveHeadingStyle}>Curated Materials</h3>
                                <p className="mt-1 text-[14px] leading-[1.45] tracking-[0.01em] text-white/95" style={receiveBodyStyle}>Thoughtfully selected fabrics tailored to your aesthetic, function and brand goals</p>
                            </div>
                            <div>
                                <h3 className="text-[20px] leading-[1.2]" style={receiveHeadingStyle}>Color Direction</h3>
                                <p className="mt-1 text-[14px] leading-[1.45] tracking-[0.01em] text-white/95" style={receiveBodyStyle}>A colour palette shaped by your feedback and market position</p>
                            </div>
                            <div>
                                <h3 className="text-[20px] leading-[1.2]" style={receiveHeadingStyle}>Design Framework</h3>
                                <p className="mt-1 text-[14px] leading-[1.45] tracking-[0.01em] text-white/95" style={receiveBodyStyle}>A strategic breakdown of categories and silhouettes aligned with your vision</p>
                            </div>
                            <div>
                                <h3 className="text-[20px] leading-[1.2]" style={receiveHeadingStyle}>Cost Transparency</h3>
                                <p className="mt-1 text-[14px] leading-[1.45] tracking-[0.01em] text-white/95" style={receiveBodyStyle}>Real-time production estimates to guide planning and investment</p>
                            </div>
                        </div>

                        <div className="relative z-10 mt-10 mx-auto w-full max-w-[700px] rounded-none bg-white overflow-hidden">
                            <img
                                src="/assets/marcus-santos-xw5cQNbky5A-unsplash.jpg"
                                alt="Creative studio"
                                className="block w-full h-[760px] object-cover rounded-none"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleGetStarted}
                            className="relative z-10 mt-10 mx-auto block w-full max-w-[820px] h-[68px] rounded-full border border-white/90 text-white text-[14px] tracking-[0.12em] uppercase font-sans"
                        >
                            Start your capsule collection
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
