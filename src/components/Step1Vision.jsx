import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIdea, setBrand } from "../formSlice";

export default function Step1Vision({
  onNext,
  onBack,
  // keep prop but don't trip eslint by not using it
  email: _email = "demo@example.com",
  embedded = false,

  // NEW: height controls (all optional)
  height,            // number (px) or string (e.g. "460px" or "28rem")
  minHeight,         // number or string
  maxHeight,         // number or string
}) {
  const dispatch = useDispatch();

  // Call hooks unconditionally, then derive values
  const brandFromSlice = useSelector((state) => state.form?.brand);
  const localBrandFromSlice = useSelector((state) => state.form?.localBrand);
  const brandValue = brandFromSlice ?? localBrandFromSlice ?? "";
  const idea = useSelector((state) => state.form?.idea ?? "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!embedded && onNext) onNext();
  };

  // If embedded is true, keep the original lightweight card.
  if (embedded) {
    return (
      <div className="bg-[#F1EEE8] w-full max-w-[380px] p-8 pb-6 rounded-[34px] shadow-[0_20px_60px_rgba(0,0,0,0.10)] font-sans flex flex-col overflow-hidden">
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col text-black" noValidate>
          <div className="mb-6">
            <p className="ml-2 text-sm mb-2 font-sans text-[14px] font-medium leading-[1.2]">Step 1 of 5</p>
            <h1 className="text-[34px] font-heading font-semibold leading-[1.1]">Line Strategy</h1>

            <p className="mt-4 ml-2 text-[13px] leading-[1.35] text-[#8C7152]">
              In this phase, we define the core architecture of your brand&apos;s presence. We are looking for
              the thread that connects your vision to the market
            </p>

            <div className="mt-6 rounded-[14px] bg-[#E9E7E1] border border-[#DFDDD6] px-5 py-4">
              <div className="font-heading text-[15px] font-semibold text-[#2B2A25]">
                A note from Form Department
              </div>
              <div className="mt-2 font-sans text-[12px] leading-[1.25] text-[#8C7152] italic">
                &apos;Design is not just what it looks and feels like. Design is how it works&apos;
                &nbsp;Focus on the &apos;why&apos; before the &apos;what&apos;.
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-6">
            <div className="relative">
              <label
                htmlFor="brandName"
                className="block text-[12px] tracking-[0.22em] uppercase font-sans font-medium leading-[1.2] mb-3 text-[#8C7152]"
              >
                DO YOU HAVE A NAME FOR YOUR BRAND?
              </label>
              <input
                id="brandName"
                name="brandName"
                type="text"
                autoComplete="off"
                className="w-full border border-[#7C7C7C] bg-[#F5F5F5] px-5 py-3 text-[14px] font-sans font-medium leading-[1.2] text-black placeholder-black/60 focus:outline-none rounded-md pr-12"
                placeholder="e.g Reformation"
                value={brandValue}
                onChange={(e) => dispatch(setBrand(e.target.value))}
              />
              <span className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 w-[6px] h-[6px] rounded-full bg-[#0B8A61]" />
            </div>

            <div>
              <label
                htmlFor="idea"
                className="block text-[12px] tracking-[0.22em] uppercase font-sans font-medium leading-[1.2] mb-3 text-[#8C7152]"
              >
                TELL US A LITTLE BIT ABOUT YOUR IDEA:
              </label>
              <textarea
                id="idea"
                name="idea"
                rows={4}
                className="w-full border border-[#7C7C7C] bg-[#F5F5F5] px-5 py-3 text-[16px] font-sans font-normal leading-[1.2] text-black placeholder-black/60 focus:outline-none rounded-md"
                placeholder="Share a quick overview of your ideal"
                value={idea}
                onChange={(e) => dispatch(setIdea(e.target.value))}
                required
              />
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      {/* Hero */}
      <section
        className="relative w-full min-h-[420px] h-[min(52vh,500px)] sm:min-h-[460px] sm:h-[min(56vh,560px)] flex flex-col items-center justify-end pb-10 sm:pb-12 px-6 text-center"
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.65) 100%), url("/assets/ayo-ogunseinde-UqT55tGBqzI-unsplash_dark_clean.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute top-8 left-0 right-0 flex items-center justify-center">
          <img
            src="/assets/form-logo-white-transparent.png"
            alt="Form Department logo"
            className="w-[210px] h-auto"
          />
        </div>

        <h2 className="mt-10 font-heading text-[34px] leading-[1.15] text-[#C7A15E]">
          Your Curated Capsule
        </h2>

      </section>

      {/* Main card: ~25% overlaps hero, ~75% on light background */}
      <section className="relative -mt-[110px] px-6 pb-10">
        <div className="mx-auto max-w-[560px] rounded-[34px] bg-[#F2EFEA] shadow-[0_20px_60px_rgba(0,0,0,0.10)] px-10 py-12">
            <form onSubmit={handleSubmit} className="text-[#2B2A25]" noValidate>
              {/* Top */}
              <div className="text-left">
                <p className="text-[12px] tracking-[0.32em] uppercase text-[#C7A15E] font-sans">Step 1 of 5</p>
                <div className="mt-5 h-px w-[190px] bg-[#7B6B55]" />
                <h1 className="mt-9 font-heading text-[46px] leading-[1.05]">Line Strategy</h1>
                <p className="mt-5 font-sans text-[15px] leading-[1.4] text-[#8C7152]">
                  In this phase, we define the core architecture of your brand&apos;s presence. We are looking
                  for the thread that connects your vision to the market
                </p>
              </div>

              {/* Note */}
              <div className="mt-8 rounded-[18px] bg-[#E9E7E1] border border-[#DFDDD6] px-6 py-5">
                <div className="font-heading text-[18px] font-semibold text-[#2B2A25] leading-[1.2]">
                  A note from Form Department
                </div>
                <div className="mt-2 font-sans text-[13px] leading-[1.25] text-[#8C7152] italic">
                  &apos;Design is not just what it looks and feels like. Design is how it works&apos; Focus on
                  the &apos;why&apos; before the &apos;what&apos;.
                </div>
              </div>

              {/* Fields */}
              <div className="mt-10 space-y-8">
                <div>
                  <label
                    htmlFor="brandName"
                    className="block text-[12px] tracking-[0.22em] uppercase font-sans text-[#8C7152] font-medium mb-4"
                  >
                    DO YOU HAVE A NAME FOR YOUR BRAND?
                  </label>
                  <div className="relative">
                    <input
                      id="brandName"
                      name="brandName"
                      type="text"
                      autoComplete="off"
                      className="w-full border border-[#7C7C7C] bg-white px-5 py-3 text-[14px] font-sans font-normal leading-[1.2] text-[#2B2A25] placeholder-black/40 focus:outline-none rounded-md"
                      placeholder="e.g Reformation"
                      value={brandValue}
                      onChange={(e) => dispatch(setBrand(e.target.value))}
                      required
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 w-[8px] h-[8px] rounded-full bg-[#0B8A61] flex items-center justify-center pointer-events-none">
                      <span className="w-[3px] h-[3px] rounded-full bg-white" />
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="idea"
                    className="block text-[12px] tracking-[0.22em] uppercase font-sans text-[#8C7152] font-medium mb-4"
                  >
                    TELL US A LITTLE BIT ABOUT YOUR IDEA:
                  </label>
                  <textarea
                    id="idea"
                    name="idea"
                    rows={5}
                    className="w-full min-h-[165px] resize-none border border-[#7C7C7C] bg-white px-5 py-3 text-[14px] font-sans font-normal leading-[1.2] text-[#2B2A25] placeholder-black/40 focus:outline-none rounded-md"
                    placeholder="Share a quick overview of your ideal"
                    value={idea}
                    onChange={(e) => dispatch(setIdea(e.target.value))}
                    required
                  />
                </div>
              </div>

              {/* Bottom controls */}
              <div className="mt-10 flex w-full flex-row flex-nowrap items-center justify-between gap-2 sm:gap-4">
                <button
                  type="button"
                  onClick={onBack}
                  className="flex min-w-0 shrink-0 touch-manipulation items-center gap-2 hover:opacity-90 active:opacity-80 transition-opacity sm:gap-3"
                  aria-label="Back"
                >
                  <span className="flex h-9 w-9 shrink-0 touch-manipulation items-center justify-center rounded-full border border-[#2B2A25] text-[16px] leading-none text-[#2B2A25] sm:h-11 sm:w-11 sm:text-[18px]">
                    ←
                  </span>
                  <span className="text-[11px] tracking-[0.18em] uppercase font-sans font-medium text-[#2B2A25] sm:text-[12px] sm:tracking-[0.2em]">
                    BACK
                  </span>
                </button>

                <button
                  type="submit"
                  className="flex min-h-[44px] max-w-[min(11.5rem,calc(100%-6.75rem))] shrink touch-manipulation items-center justify-center gap-1.5 rounded-full bg-[#2B2A25] px-3 py-2 text-white sm:max-w-none sm:min-h-[46px] sm:gap-2 sm:px-5 hover:bg-[#1f1d1a] active:bg-[#181716] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B2A25]"
                >
                  <span className="whitespace-normal text-center font-sans text-[9px] leading-tight tracking-[0.1em] uppercase sm:text-[10px] sm:leading-snug sm:tracking-[0.16em]">
                    CONTINUE TO STEP 2
                  </span>
                  <span className="shrink-0 text-[13px] leading-none sm:text-[15px]" aria-hidden>
                    →
                  </span>
                </button>
              </div>
            </form>
        </div>
      </section>
    </div>
  );
}
