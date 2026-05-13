import React, { useLayoutEffect, useRef, useState } from "react";
import { FD_LOGO_WHITE_SRC, fdStepLabelClass } from "./fdTypography";
import { FD_STEP1_COLORS, FD_STEP1_SPACING } from "./fdLayout";
import { StepProgressBar } from "./StepFormChrome";

const HERO_BG =
  'linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.9) 58%, #000000 100%), url("/assets/ayo-ogunseinde-UqT55tGBqzI-unsplash_dark_clean.jpg")';

/** Same copy as Line Strategy for visual parity across steps 1–5 (desktop). */
export const FD_DEFAULT_STEP_NOTE = {
  title: "A note from Form Department",
  body:
    "'Design is not just what it looks and feels like. Design is how it works.' Focus on the 'why' before the 'what'.",
};

/**
 * Desktop shell matching Line Strategy: black hero + Curate Your Capsule,
 * cream card overlapping hero (~30%), nested white form panel with inset.
 */
export default function FdStepDesktopLayout({
  step,
  total = 5,
  title,
  intro = null,
  /** Pass `null` to hide; omit for default Form Department note. */
  note,
  children,
  /** Optional max-height + scroll on the inner white panel (e.g. long questionnaires). */
  formPanelClassName = "",
}) {
  const cardRef = useRef(null);
  const [cardOverlapPx, setCardOverlapPx] = useState(() =>
    Math.round(680 * FD_STEP1_SPACING.cardOverlapRatio)
  );

  useLayoutEffect(() => {
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
  }, []);

  const resolvedNote = note === undefined ? FD_DEFAULT_STEP_NOTE : note;

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: FD_STEP1_COLORS.pageBottom }}>
      <section
        className="relative z-0 w-full text-center text-white"
        style={{
          backgroundColor: FD_STEP1_COLORS.hero,
          backgroundImage: HERO_BG,
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
            <p className={`mt-6 ${fdStepLabelClass} text-[#8C7152]`}>
              Step {step} of {total}
            </p>
            <StepProgressBar step={step} total={total} />
            <h1 className="mt-5 font-heading font-normal normal-case text-[34px] sm:text-[40px] md:text-[44px] leading-[1.08] tracking-[0.01em]">
              {title}
            </h1>
            {intro ? (
              <p className="mt-4 max-w-[32rem] font-sans text-[14px] leading-[1.45] text-[#8C7152]">{intro}</p>
            ) : null}
            {resolvedNote ? (
              <div
                className="rounded-[16px] border border-[#DFDDD6] px-5 py-4"
                style={{
                  marginTop: FD_STEP1_SPACING.leftNoteGap,
                  backgroundColor: FD_STEP1_COLORS.note,
                }}
              >
                <div className="font-heading text-[16px] font-semibold leading-[1.2]">{resolvedNote.title}</div>
                <div className="mt-2 font-sans text-[13px] leading-[1.35] text-[#8C7152] italic">{resolvedNote.body}</div>
              </div>
            ) : null}
          </div>

          <div
            className={`rounded-[28px] shadow-[0_12px_40px_rgba(0,0,0,0.08)] ${formPanelClassName}`.trim()}
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
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
