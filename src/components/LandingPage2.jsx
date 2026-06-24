import React, { useEffect, useState } from "react";
import Step1Vision from "./Step1Vision";
import Step2Inspiration from "./Step2Inspiration";
import Step3ProductFocus from "./Step3ProductFocus";
import { FD_HOME_LOGO_SRC, fdHeaderClass } from "./fdTypography";
import { FD_HOME_SPACING, FD_PAGE_GUTTER } from "./fdLayout";
import { getCustomerIdFromSearch } from "../utils/fdAuth";

const ADMIN_DASHBOARD_TOKEN =
  process.env.REACT_APP_ADMIN_DASHBOARD_TOKEN ||
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_ADMIN_DASHBOARD_TOKEN);

const ACUITY_SCHEDULE_URL =
  "https://app.acuityscheduling.com/schedule/c38a96dc/appointment/32120137/calendar/3784845?appointmentTypeIds[]=32120137";

const CAROUSEL_VISIBLE_DESKTOP = 3;
const CAROUSEL_VISIBLE_MOBILE = 1;

function getCarouselVisibleCount() {
  if (typeof window === "undefined") return CAROUSEL_VISIBLE_DESKTOP;
  return window.matchMedia("(min-width: 768px)").matches
    ? CAROUSEL_VISIBLE_DESKTOP
    : CAROUSEL_VISIBLE_MOBILE;
}

function getCarouselMaxSlide(visibleCount, itemCount = CAROUSEL_ITEMS.length) {
  return Math.max(0, itemCount - visibleCount);
}

const CAROUSEL_ITEMS = [
  { label: "Outerwear", image: "/assets/laura-chouette-9_KGtIF-hUk-unsplash.jpg" },
  { label: "Tops", image: "/assets/marcus-santos-xw5cQNbky5A-unsplash.jpg" },
  { label: "Bottoms", image: "/assets/armin-rastgar-06jxXFyuJhc-unsplash.jpg" },
  { label: "Dresses", image: "/assets/eve-maier-u1OuYQa0WtQ-unsplash.jpg" },
];

const RECEIVE_ITEMS = [
  {
    title: "Curated Materials",
    body: "Begin sourcing fabric, now with greater clarity on what materials best suit your project.",
    iconSrc: "/assets/SVG/icon1.svg",
  },
  {
    title: "Color Direction",
    body: "Use this palette as a guide for product development, branding, packaging, and content to create a more cohesive and recognizable brand experience.",
    iconSrc: "/assets/SVG/icon2.svg",
  },
  {
    title: "Design Framework",
    body: "Your design framework acts as a filter for future decisions, helping ensure every product feels connected to the same brand vision.",
    iconSrc: "/assets/SVG/icon3.svg",
  },
  {
    title: "Cost Transparency",
    body: "Understanding your estimated costs early helps you prioritize features, manage margins, and build products that are both desirable and commercially viable.",
    iconSrc: "/assets/SVG/icon4.svg",
  },
];

const COST_ROWS = [
  { label: "Materials", value: "$15" },
  { label: "Manufacturing", value: "$35" },
  { label: "Finishing and logistics", value: "$4" },
];

const PALETTE = ["#151515", "#F1EFEA", "#D9D5CE", "#6F6E6A"];

const FABRIC_SELECTION_ITEMS = [
  {
    name: "Organic Cotton",
    uppercase: false,
    description: "Share a quick overview of your ideal",
  },
  {
    name: "Recycled Poly",
    uppercase: true,
    description: "Share a quick overview of your ideal",
  },
  {
    name: "Recycled Poly",
    uppercase: true,
    description: "Share a quick overview of your ideal",
  },
];

export default function LandingPage2({ onNext, onContinue, startInGrid = false, isAdmin = false }) {
  const heroImage = "/assets/ayo-ogunseinde-UqT55tGBqzI-unsplash_dark_clean.jpg";
  const previewImage = "/assets/navid-abedi-G6OkUIS24_g-unsplash.jpg";

  const [activeFormStep, setActiveFormStep] = useState(startInGrid ? 1 : 0);
  const [validating, setValidating] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [carouselVisibleCount, setCarouselVisibleCount] = useState(getCarouselVisibleCount);

  const carouselMaxSlide = getCarouselMaxSlide(carouselVisibleCount);
  const canGoPrevSlide = activeSlide > 0;
  const canGoNextSlide = activeSlide < carouselMaxSlide;

  useEffect(() => {
    if (startInGrid) setActiveFormStep(1);
  }, [startInGrid]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const syncVisibleCount = () => setCarouselVisibleCount(getCarouselVisibleCount());
    syncVisibleCount();
    mediaQuery.addEventListener("change", syncVisibleCount);
    return () => mediaQuery.removeEventListener("change", syncVisibleCount);
  }, []);

  useEffect(() => {
    setActiveSlide((prev) => Math.min(prev, carouselMaxSlide));
  }, [carouselMaxSlide]);

  const handleGetStarted = () => setActiveFormStep(1);
  const goPrevSlide = () => {
    if (!canGoPrevSlide) return;
    setActiveSlide((prev) => Math.max(0, prev - 1));
  };
  const goNextSlide = () => {
    if (!canGoNextSlide) return;
    setActiveSlide((prev) => Math.min(carouselMaxSlide, prev + 1));
  };

  const handleAdminDashboardClick = () => {
    if (!ADMIN_DASHBOARD_TOKEN) {
      alert("Admin dashboard token is not configured. Please set it in the deployment environment.");
      return;
    }
    const currentParams = new URLSearchParams(window.location.search);
    const customerId = getCustomerIdFromSearch(currentParams.toString());
    const nextParams = new URLSearchParams();
    if (customerId) nextParams.set("customer_id", customerId);
    nextParams.set("token", ADMIN_DASHBOARD_TOKEN);
    window.location.href = `/admin?${nextParams.toString()}`;
  };

  const handleContinue = async () => {
    const hostname = typeof window !== "undefined" ? window.location.hostname : "";
    const isLocalhost =
      hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0";
    if (isLocalhost) {
      if (typeof onContinue === "function") onContinue();
      else if (onNext) onNext();
      return;
    }

    const customerId = getCustomerIdFromSearch();
    if (!customerId) {
      alert("Customer ID not found. Please try again.");
      return;
    }

    try {
      setValidating(true);
      const response = await fetch(
        `https://backend-capsule-builder.onrender.com/proxy/validate-submission?logged_in_customer_id=${customerId}`
      );
      const data = await response.json();
      if (!data.ok) {
        if (data.redirect) window.location.href = data.redirect;
        else alert(data.message || "Unable to validate. Please try again.");
        return;
      }
      if (typeof onContinue === "function") onContinue();
      else if (onNext) onNext();
    } catch (err) {
      console.error("Validation error:", err);
      alert("We encountered an error. Please try again.");
    } finally {
      setValidating(false);
    }
  };

  if (activeFormStep > 0) {
    if (activeFormStep === 1) {
      return (
        <Step1Vision onNext={() => setActiveFormStep(2)} onBack={() => setActiveFormStep(0)} />
      );
    }
    if (activeFormStep === 2) {
      return (
        <Step2Inspiration onNext={() => setActiveFormStep(3)} onBack={() => setActiveFormStep(1)} />
      );
    }
    return (
      <Step3ProductFocus
        onBack={() => setActiveFormStep(2)}
        onNext={handleContinue}
        validating={validating}
      />
    );
  }

  const pageGutter = { paddingLeft: FD_PAGE_GUTTER, paddingRight: FD_PAGE_GUTTER };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white font-sans text-black">
      <section
        className="relative w-full text-center text-white"
        style={{
          ...pageGutter,
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.58) 100%), url("${heroImage}")`,
          backgroundSize: "cover",
          backgroundPosition: "center 32%",
          paddingTop: FD_HOME_SPACING.heroTop + FD_HOME_SPACING.heroLogoTop,
          paddingBottom: FD_HOME_SPACING.heroBottom,
        }}
      >
        <img
          src={FD_HOME_LOGO_SRC}
          alt="Form Department logo"
          className="mx-auto h-auto w-[min(72vw,300px)]"
        />
        <h1
          className={`mx-auto max-w-[18ch] text-white ${fdHeaderClass} normal-case`}
          style={{ marginTop: FD_HOME_SPACING.heroLogoToHeading, minHeight: FD_HOME_SPACING.headingBlock }}
        >
          Refine your ideas and move forward with purpose
        </h1>
        <div
          className="mx-auto flex w-full max-w-[360px] flex-col items-stretch gap-3"
          style={{ marginTop: FD_HOME_SPACING.heroHeadingToCta }}
        >
          <button
            type="button"
            onClick={handleGetStarted}
            className="inline-flex h-[56px] w-full items-center justify-center rounded-full bg-[#3A3A3A]/80 text-[12px] uppercase tracking-[0.18em] text-white"
          >
            Build your capsule
          </button>
          {isAdmin ? (
            <button
              type="button"
              onClick={handleAdminDashboardClick}
              className="inline-flex h-[56px] w-full items-center justify-center rounded-full bg-white/90 text-[12px] uppercase tracking-[0.18em] text-black"
            >
              Admin dashboard
            </button>
          ) : null}
        </div>
      </section>

      <section
        className="bg-white"
        style={{
          ...pageGutter,
          paddingTop: FD_HOME_SPACING.sectionTop,
          paddingBottom: FD_HOME_SPACING.sectionBottom,
        }}
      >
        <h2
          className={`text-center ${fdHeaderClass} normal-case`}
          style={{ minHeight: FD_HOME_SPACING.headingBlock }}
        >
          How To Use Your Results
        </h2>
        <div
          className="mx-auto grid max-w-[1180px] grid-cols-1 gap-y-12 gap-x-10 sm:grid-cols-2 lg:grid-cols-4"
          style={{ marginTop: FD_HOME_SPACING.headingToContent }}
        >
          {RECEIVE_ITEMS.map((card) => (
            <div key={card.title} className="text-center">
              <img
                src={card.iconSrc}
                alt=""
                className="mx-auto h-[94px] w-[94px] object-contain"
              />
              <p className="mt-5 font-sans text-[14px] font-medium leading-[1.2]">{card.title}</p>
              <p className="mt-2 font-sans text-[13px] leading-[1.45] text-[#2F2F2F]">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        className="bg-white"
        style={{
          ...pageGutter,
          paddingTop: FD_HOME_SPACING.carouselTop,
          paddingBottom: FD_HOME_SPACING.carouselBottom,
        }}
      >
        <h2
          className={`text-center ${fdHeaderClass} normal-case`}
          style={{ minHeight: FD_HOME_SPACING.headingBlock }}
        >
          What Category Are You Designing?
        </h2>
        <div
          className="relative mx-auto mt-[110px] flex max-w-[1180px] items-center gap-4"
          style={{ height: FD_HOME_SPACING.carouselHeight }}
        >
          <button
            type="button"
            onClick={goPrevSlide}
            disabled={!canGoPrevSlide}
            className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1B1B1B] text-white lg:flex ${
              canGoPrevSlide ? "" : "cursor-not-allowed opacity-40"
            }`}
            aria-label="Previous category"
          >
            ←
          </button>
          <div className="h-full flex-1 overflow-hidden">
            <div
              className="flex h-full transition-transform duration-500 ease-in-out"
              style={{
                width: `${(CAROUSEL_ITEMS.length / carouselVisibleCount) * 100}%`,
                transform: `translateX(-${(activeSlide * 100) / CAROUSEL_ITEMS.length}%)`,
              }}
            >
              {CAROUSEL_ITEMS.map((item, index) => (
                <div
                  key={item.label}
                  className={`relative h-full shrink-0 ${index < CAROUSEL_ITEMS.length - 1 ? "pr-4" : ""}`}
                  style={{ width: `${100 / CAROUSEL_ITEMS.length}%` }}
                >
                  <div className="relative h-full overflow-hidden rounded-[22px] border border-[#E2DFDA] bg-[#F5F3EF]">
                    <div
                      className="h-full w-full bg-cover bg-center"
                      style={{ backgroundImage: `url("${item.image}")` }}
                    />
                    <div className="absolute inset-x-0 bottom-5 flex justify-center">
                      <span className="inline-flex h-[42px] items-center justify-center rounded-full border border-[#1B1B1B] bg-[#1B1B1B] px-8 text-[11px] uppercase tracking-[0.2em] text-white">
                        {item.label}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={goNextSlide}
            disabled={!canGoNextSlide}
            className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1B1B1B] text-white lg:flex ${
              canGoNextSlide ? "" : "cursor-not-allowed opacity-40"
            }`}
            aria-label="Next category"
          >
            →
          </button>
        </div>
      </section>

      <section
        className="bg-white"
        style={{
          ...pageGutter,
          paddingTop: FD_HOME_SPACING.curatedTop,
          paddingBottom: FD_HOME_SPACING.curatedBottom,
        }}
      >
        <h2
          className={`text-center ${fdHeaderClass} normal-case`}
          style={{ minHeight: FD_HOME_SPACING.headingBlock }}
        >
          Your Curated Capsule
        </h2>
        <div
          className="mx-auto mt-[110px] grid max-w-[1180px] grid-cols-1 gap-6 lg:grid-cols-2"
          style={{ minHeight: FD_HOME_SPACING.curatedCardsHeight }}
        >
          <div className="flex h-full flex-col rounded-[28px] border border-[#E8E4DE] bg-white p-8">
            <div className="overflow-hidden rounded-[18px] bg-[#F1EFEB]">
              <img src={previewImage} alt="Curated capsule preview" className="h-[220px] w-full object-cover" />
            </div>
            <p className="mt-8 text-[11px] uppercase tracking-[0.24em] text-[#6B645C] font-sans">
              Fabric selection
            </p>
            <div className="mt-5 space-y-6">
              {FABRIC_SELECTION_ITEMS.map((item, index) => (
                <div key={`${item.name}-${index}`}>
                  <p
                    className={`font-sans text-[16px] leading-[1.2] text-[#2B2B2B] ${
                      item.uppercase ? "font-semibold uppercase" : "font-semibold"
                    }`}
                  >
                    {item.name}
                  </p>
                  <p className="mt-1 font-sans text-[12px] leading-[1.35] text-[#6B645C]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-[11px] uppercase tracking-[0.24em] text-[#6B645C] font-sans">
              Color palette
            </p>
            <div className="mt-4 flex items-center gap-4">
              {PALETTE.map((color) => (
                <div
                  key={color}
                  className="h-[78px] w-[54px] rounded-[18px] border border-black/5"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex h-full flex-col justify-between rounded-[28px] bg-[#2C2A27] px-8 py-10 text-white">
            <div>
              <p className="text-center text-[11px] uppercase tracking-[0.28em] text-white/90">
                Estimated production costs
              </p>
              <div className="mt-10 space-y-6 text-[12px] uppercase tracking-[0.08em]">
                {COST_ROWS.map((row) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-4 border-b border-white/20 pb-4">
                    <span>{row.label}</span>
                    <span className="text-[18px] font-medium normal-case tabular-nums">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-8 flex items-end justify-between gap-4">
              <span className="text-[12px] uppercase tracking-[0.08em]">Total est. production</span>
              <span className="font-heading text-[44px] leading-none tabular-nums">$54</span>
            </div>
          </div>
        </div>
      </section>

      <section
        className="bg-white"
        style={{
          ...pageGutter,
          paddingTop: FD_HOME_SPACING.sectionTop,
          paddingBottom: FD_HOME_SPACING.footerBottom,
        }}
      >
        <h2
          className={`text-center ${fdHeaderClass} normal-case`}
          style={{ minHeight: FD_HOME_SPACING.headingBlock }}
        >
          How To Use Your Results
        </h2>
        <div
          className="relative overflow-hidden rounded-[42px] px-8 py-12 text-white sm:px-12"
          style={{ marginTop: FD_HOME_SPACING.headingToContent }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url("/assets/pesce-huang-k7DQy4YaVXk-unsplash_DARK.jpg")',
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative z-10">
            <div className="mx-auto max-w-[1180px]">
              <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:gap-12">
                <div className="grid grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-2">
                  {RECEIVE_ITEMS.map((item) => (
                    <div key={`footer-${item.title}`}>
                      <h3 className="font-sans text-[18px] sm:text-[20px] font-medium leading-[1.2]">{item.title}</h3>
                      <p className="mt-2 text-[13px] sm:text-[14px] leading-[1.45] text-white/95">{item.body}</p>
                    </div>
                  ))}
                </div>
                <img
                  src="/assets/dashboard.png"
                  alt="Capsule builder dashboard"
                  className="h-[min(52vw,420px)] w-full object-cover lg:h-[460px] lg:max-w-[360px] lg:justify-self-end"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="bg-white"
        style={{
          ...pageGutter,
          paddingTop: FD_HOME_SPACING.sectionTop,
          paddingBottom: FD_HOME_SPACING.footerBottom,
        }}
      >
        <h2
          className={`text-center ${fdHeaderClass} normal-case`}
          style={{ minHeight: FD_HOME_SPACING.headingBlock }}
        >
          Your results
        </h2>
        <div
          className="relative mx-auto max-w-[1180px] overflow-hidden rounded-[42px] px-8 py-16 text-center text-white sm:px-12 sm:py-20"
          style={{ marginTop: FD_HOME_SPACING.headingToContent }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url("/assets/pesce-huang-k7DQy4YaVXk-unsplash_DARK.jpg")',
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative z-10">
            <p
              className={`mx-auto max-w-[18ch] ${fdHeaderClass} normal-case`}
              style={{ minHeight: FD_HOME_SPACING.headingBlock }}
            >
              Refine your ideas and move forward with purpose
            </p>
            <div className="mt-10 flex justify-center sm:mt-12">
              <a
                href={ACUITY_SCHEDULE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-[56px] w-full max-w-[820px] items-center justify-center rounded-full border border-white/90 px-10 text-[12px] uppercase tracking-[0.12em] hover:bg-white/10 transition-colors sm:text-[14px]"
              >
                Schedule call
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
