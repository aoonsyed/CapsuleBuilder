import React, { useLayoutEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIdea, setBrand } from "../formSlice";
import { StepProgressBar } from "./StepFormChrome";
import { FD_LOGO_WHITE_SRC, fdStepLabelClass } from "./fdTypography";
import { FD_STEP1_COLORS, FD_STEP1_SPACING } from "./fdLayout";

export default function Step1Vision({
  onNext,
  onBack,
  email: _email = "demo@example.com",
  embedded = false,
  height,
  minHeight,
  maxHeight,
}) {
  const dispatch = useDispatch();
  const brandFromSlice = useSelector((state) => state.form?.brand);
  const localBrandFromSlice = useSelector((state) => state.form?.localBrand);
  const brandValue = brandFromSlice ?? localBrandFromSlice ?? "";
  const idea = useSelector((state) => state.form?.idea ?? "");
  const cardRef = useRef(null);
  const [cardOverlapPx, setCardOverlapPx] = useState(() =>
    Math.round(680 * FD_STEP1_SPACING.cardOverlapRatio)
  );

  useLayoutEffect(() => {
    if (embedded) return undefined;

    const updateOverlap = () => {
      const card = cardRef.current;
      if (!card) return;
      const nextOverlap = Math.round(card.offsetHeight * FD_STEP1_SPACING.cardOverlapRatio);
      if (nextOverlap > 0) {
        setCardOverlapPx((current) => (current === nextOverlap ? current : nextOverlap));
      }
    };

    updateOverlap();
    const observer = new ResizeObserver(updateOverlap);
    const card = cardRef.current;
    if (card) observer.observe(card);
    window.addEventListener("resize", updateOverlap);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateOverlap);
    };
  }, [embedded]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!embedded && onNext) onNext();
  };

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
            <div>
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
                className="w-full border border-[#7C7C7C] bg-[#F5F5F5] px-5 py-3 text-[14px] font-sans font-medium leading-[1.2] text-black placeholder-black/60 focus:outline-none rounded-md"
                placeholder="e.g Reformation"
                value={brandValue}
                onChange={(e) => dispatch(setBrand(e.target.value))}
              />
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
                placeholder="Share a quick overview of your idea"
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
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: FD_STEP1_COLORS.pageBottom }}>
      <section
        className="relative z-0 w-full text-center text-white"
        style={{
          backgroundColor: FD_STEP1_COLORS.hero,
          backgroundImage:
            'linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.9) 58%, #000000 100%), url("/assets/ayo-ogunseinde-UqT55tGBqzI-unsplash_dark_clean.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          paddingTop: FD_STEP1_SPACING.heroLogoTop,
          paddingBottom: FD_STEP1_SPACING.heroTitleToCard + cardOverlapPx,
        }}
      >
        <img
          src={FD_LOGO_WHITE_SRC}
          alt="Form Department logo"
          className="mx-auto h-auto w-[min(64vw,240px)]"
        />
        <h2
          className="mx-auto max-w-[16ch] font-heading font-normal normal-case text-[#E7D4BF] text-[30px] sm:text-[38px] md:text-[46px] leading-[1.08] tracking-[0.01em]"
          style={{ marginTop: FD_STEP1_SPACING.heroLogoToTitle }}
        >
          Curate Your Capsule
        </h2>
      </section>

      <div
        className="relative z-20 w-full shrink-0"
        style={{
          paddingLeft: FD_STEP1_SPACING.cardSideInset,
          paddingRight: FD_STEP1_SPACING.cardSideInset,
          paddingBottom: FD_STEP1_SPACING.cardBottom,
          marginTop: cardOverlapPx ? -cardOverlapPx : undefined,
        }}
      >
        <div
          ref={cardRef}
          className="mx-auto grid w-full max-w-[1240px] gap-6 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.12)] lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)] lg:items-stretch lg:gap-8"
          style={{
            backgroundColor: FD_STEP1_COLORS.card,
          }}
        >
          <div
            className="text-left text-[#2B2A25]"
            style={{
              paddingTop: FD_STEP1_SPACING.leftLogoTop,
              paddingLeft: FD_STEP1_SPACING.leftLogoSide,
              paddingRight: FD_STEP1_SPACING.leftLogoSide,
              paddingBottom: FD_STEP1_SPACING.leftBottom,
            }}
          >
            <img src="/assets/11.png" alt="Form Department" className="h-7 w-auto" />
            <p className={`mt-6 ${fdStepLabelClass} text-[#8C7152]`}>Step 1 of 5</p>
            <StepProgressBar step={1} total={5} />
            <h1 className="mt-5 font-heading font-normal normal-case text-[34px] sm:text-[40px] md:text-[44px] leading-[1.08] tracking-[0.01em]">
              Line Strategy
            </h1>
            <p className="mt-4 max-w-[32rem] font-sans text-[14px] leading-[1.45] text-[#8C7152]">
              In this phase, we define the core architecture of your brand&apos;s presence. We are looking for
              the thread that connects your vision to the market
            </p>
            <div
              className="rounded-[16px] border border-[#DFDDD6] px-5 py-4"
              style={{
                marginTop: FD_STEP1_SPACING.leftNoteGap,
                backgroundColor: FD_STEP1_COLORS.note,
              }}
            >
              <div className="font-heading text-[16px] font-semibold leading-[1.2]">
                A note from Form Department
              </div>
              <p className="mt-2 font-sans text-[13px] leading-[1.35] text-[#8C7152] italic">
                &apos;Design is not just what it looks and feels like. Design is how it works.&apos; Focus on
                the &apos;why&apos; before the &apos;what&apos;.
              </p>
            </div>
          </div>

          <div
            className="rounded-[28px] shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
            style={{
              backgroundColor: FD_STEP1_COLORS.form,
              marginTop: FD_STEP1_SPACING.formCardTopInset,
              marginRight: FD_STEP1_SPACING.formCardRightInset,
              marginBottom: FD_STEP1_SPACING.formCardBottomInset,
              paddingTop: FD_STEP1_SPACING.formInnerTop,
              paddingLeft: FD_STEP1_SPACING.formInnerSide,
              paddingRight: FD_STEP1_SPACING.formInnerSide,
              paddingBottom: FD_STEP1_SPACING.formInnerBottom,
            }}
          >
            <form onSubmit={handleSubmit} className="text-[#2B2A25]" noValidate>
              <label
                htmlFor="brandName"
                className="block text-[12px] tracking-[0.22em] uppercase font-sans text-[#8C7152] font-medium"
              >
                DO YOU HAVE A NAME FOR YOUR BRAND?
              </label>
              <input
                id="brandName"
                name="brandName"
                type="text"
                autoComplete="off"
                className="mt-3 w-full border border-[#7C7C7C] bg-[#F5F5F5] px-4 py-2.5 text-[14px] font-sans text-[#2B2A25] placeholder-black/40 focus:outline-none rounded-md"
                placeholder="e.g Reformation"
                value={brandValue}
                onChange={(e) => dispatch(setBrand(e.target.value))}
                required
              />

              <label
                htmlFor="idea"
                className="block text-[12px] tracking-[0.22em] uppercase font-sans text-[#8C7152] font-medium"
                style={{ marginTop: FD_STEP1_SPACING.fieldGap }}
              >
                TELL US A LITTLE BIT ABOUT YOUR IDEA:
              </label>
              <textarea
                id="idea"
                name="idea"
                className="mt-3 w-full resize-none border border-[#7C7C7C] bg-[#F5F5F5] px-4 py-2.5 text-[14px] font-sans text-[#2B2A25] placeholder-black/40 focus:outline-none rounded-md"
                style={{ height: FD_STEP1_SPACING.ideaHeight }}
                placeholder="Share a quick overview of your idea"
                value={idea}
                onChange={(e) => dispatch(setIdea(e.target.value))}
                required
              />

              <div
                className="flex w-full flex-row flex-nowrap items-center justify-between gap-3"
                style={{
                  marginTop: FD_STEP1_SPACING.navTopGap,
                  minHeight: FD_STEP1_SPACING.navHeight,
                }}
              >
                <button
                  type="button"
                  onClick={onBack}
                  className="flex min-w-0 shrink-0 items-center gap-2 hover:opacity-90"
                  aria-label="Back"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2B2A25] text-[16px] leading-none">
                    ←
                  </span>
                  <span className="text-[12px] tracking-[0.2em] uppercase font-sans font-medium">BACK</span>
                </button>
                <button
                  type="submit"
                  className="flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[#2B2A25] px-5 text-white hover:bg-[#1f1d1a]"
                >
                  <span className="font-sans text-[10px] tracking-[0.16em] uppercase">
                    CONTINUE TO STEP 2
                  </span>
                  <span className="text-[15px]" aria-hidden>
                    →
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
