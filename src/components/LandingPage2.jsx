import React, { useEffect, useState } from "react";
import Step1Vision from "./Step1Vision";
import Step2Inspiration from "./Step2Inspiration";
import Step3ProductFocus from "./Step3ProductFocus";
import { FD_LOGO_WHITE_SRC, fdHeaderClass, fdSubheaderClass } from "./fdTypography";
import { FD_HOME_SPACING, FD_PAGE_GUTTER } from "./fdLayout";

const ADMIN_DASHBOARD_TOKEN =
  process.env.REACT_APP_ADMIN_DASHBOARD_TOKEN ||
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_ADMIN_DASHBOARD_TOKEN);

const CAROUSEL_ITEMS = [
  { label: "Outerwear", image: "/assets/laura-chouette-9_KGtIF-hUk-unsplash.jpg" },
  { label: "Tops", image: "/assets/marcus-santos-xw5cQNbky5A-unsplash.jpg" },
  { label: "Bottoms", image: "/assets/armin-rastgar-06jxXFyuJhc-unsplash.jpg" },
  { label: "Dresses", image: "/assets/eve-maier-u1OuYQa0WtQ-unsplash.jpg" },
];

const RECEIVE_ITEMS = [
  {
    title: "Curated Materials",
    body: "Thoughtfully selected fabrics tailored to your aesthetic, function and brand goals",
    iconSrc: "/assets/SVG/icon1.svg",
  },
  {
    title: "Color Direction",
    body: "A colour palette shaped by your feedback and market position",
    iconSrc: "/assets/SVG/icon2.svg",
  },
  {
    title: "Design Framework",
    body: "A strategic breakdown of categories and silhouettes aligned with your vision",
    iconSrc: "/assets/SVG/icon3.svg",
  },
  {
    title: "Cost Transparency",
    body: "Real-time production estimates to guide planning and investment",
    iconSrc: "/assets/SVG/icon4.svg",
  },
];

const COST_ROWS = [
  { label: "Materials", value: "$15" },
  { label: "Manufacturing", value: "$35" },
  { label: "Finishing and logistics", value: "$4" },
];

const PALETTE = ["#151515", "#F1EFEA", "#D9D5CE", "#6F6E6A"];

export default function LandingPage2({ onNext, onContinue, startInGrid = false, isAdmin = false }) {
  const heroImage = "/assets/ayo-ogunseinde-UqT55tGBqzI-unsplash_dark_clean.jpg";
  const previewImage = "/assets/navid-abedi-G6OkUIS24_g-unsplash.jpg";

  const [activeFormStep, setActiveFormStep] = useState(startInGrid ? 1 : 0);
  const [validating, setValidating] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (startInGrid) setActiveFormStep(1);
  }, [startInGrid]);

  const handleGetStarted = () => setActiveFormStep(1);
  const goPrevSlide = () =>
    setActiveSlide((prev) => (prev - 1 + CAROUSEL_ITEMS.length) % CAROUSEL_ITEMS.length);
  const goNextSlide = () => setActiveSlide((prev) => (prev + 1) % CAROUSEL_ITEMS.length);

  const handleAdminDashboardClick = () => {
    if (!ADMIN_DASHBOARD_TOKEN) {
      alert("Admin dashboard token is not configured. Please set it in the deployment environment.");
      return;
    }
    const currentParams = new URLSearchParams(window.location.search);
    const customerId = currentParams.get("customer_id");
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

    const params = new URLSearchParams(window.location.search);
    const customerId = params.get("customer_id");
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
          src={FD_LOGO_WHITE_SRC}
          alt="Form Department logo"
          className="mx-auto h-auto w-[min(72vw,300px)]"
        />
        <h1
          className={`mx-auto max-w-[18ch] text-[#E7D4BF] ${fdHeaderClass} normal-case`}
          style={{ marginTop: FD_HOME_SPACING.heroLogoToHeading, minHeight: FD_HOME_SPACING.headingBlock }}
        >
          Refine your ideas and move forward with purpose
        </h1>
        <p
          className={`mx-auto mt-4 max-w-[28ch] text-white/90 ${fdSubheaderClass}`}
          style={{ marginTop: 70 }}
        >
          With Form Capsule Builder
        </p>
        <button
          type="button"
          onClick={handleGetStarted}
          className="mx-auto inline-flex h-[56px] w-full max-w-[360px] items-center justify-center rounded-full bg-[#3A3A3A]/80 text-[12px] uppercase tracking-[0.18em] text-white"
          style={{ marginTop: FD_HOME_SPACING.heroHeadingToCta }}
        >
          Build your capsule
        </button>
        {isAdmin ? (
          <button
            type="button"
            onClick={handleAdminDashboardClick}
            className="mx-auto mt-3 inline-flex h-[48px] w-full max-w-[360px] items-center justify-center rounded-full bg-white/90 text-[12px] uppercase tracking-[0.14em] text-black"
          >
            Admin dashboard
          </button>
        ) : null}
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
          What you&apos;ll receive
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
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1B1B1B] text-white lg:flex"
            aria-label="Previous category"
          >
            ←
          </button>
          <div className="grid h-full flex-1 grid-cols-1 gap-4 md:grid-cols-3">
            {[-1, 0, 1].map((offset) => {
              const index = (activeSlide + offset + CAROUSEL_ITEMS.length) % CAROUSEL_ITEMS.length;
              const item = CAROUSEL_ITEMS[index];
              const isActive = offset === 0;
              return (
                <div
                  key={`${item.label}-${index}-${offset}`}
                  className={`relative overflow-hidden rounded-[22px] border border-[#E2DFDA] bg-[#F5F3EF] transition-opacity ${
                    isActive ? "opacity-100" : "hidden opacity-70 md:block"
                  }`}
                >
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
              );
            })}
          </div>
          <button
            type="button"
            onClick={goNextSlide}
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1B1B1B] text-white lg:flex"
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
            <p className="mt-6 font-sans text-[16px] font-semibold">Organic Cotton</p>
            <p className="mt-1 font-sans text-[12px] text-[#6B645C]">100% Cotton</p>
            <p className="mt-8 text-[11px] uppercase tracking-[0.24em] text-[#6B645C]">Color palette</p>
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
        style={{
          ...pageGutter,
          paddingBottom: FD_HOME_SPACING.footerBottom,
        }}
      >
        <div className="relative overflow-hidden rounded-[42px] px-8 py-12 text-white sm:px-12">
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
            <h2
              className={`${fdHeaderClass} normal-case`}
              style={{ minHeight: FD_HOME_SPACING.headingBlock }}
            >
              What you&apos;ll receive
            </h2>
            <div
              className="mt-[110px] grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]"
            >
              <div className="space-y-8">
                {RECEIVE_ITEMS.map((item) => (
                  <div key={`footer-${item.title}`}>
                    <h3 className="font-sans text-[20px] font-medium leading-[1.2]">{item.title}</h3>
                    <p className="mt-1 text-[14px] leading-[1.45] text-white/95">{item.body}</p>
                  </div>
                ))}
              </div>
              <img
                src="/assets/marcus-santos-xw5cQNbky5A-unsplash.jpg"
                alt="Creative studio"
                className="h-[360px] w-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={handleGetStarted}
              className="mx-auto mt-10 flex h-[68px] w-full max-w-[820px] items-center justify-center rounded-full border border-white/90 text-[14px] uppercase tracking-[0.12em]"
            >
              Build your capsule
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
