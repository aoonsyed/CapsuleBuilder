import React from "react";
import {
  FD_LOGO_WHITE_SRC,
  fdHeaderClass,
  fdStepLabelClass,
} from "./fdTypography";

const HERO_STYLE = {
  backgroundImage:
    'linear-gradient(180deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.65) 100%), url("/assets/ayo-ogunseinde-UqT55tGBqzI-unsplash_dark_clean.jpg")',
  backgroundSize: "cover",
  backgroundPosition: "center",
};

export function StepProgressBar({ step, total = 5 }) {
  const safeTotal = Math.max(1, total);
  const safeStep = Math.min(Math.max(step, 1), safeTotal);
  const pct = (safeStep / safeTotal) * 100;

  return (
    <div
      className="mt-5 h-[2px] w-full max-w-[190px] bg-[#D8D2C8] overflow-hidden"
      aria-hidden
    >
      <div
        className="h-full bg-[#7B6B55] transition-[width] duration-300 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function StepFormChrome({
  step,
  total = 5,
  title,
  intro,
  note,
  children,
  heroTitle = "Your Curated Capsule",
}) {
  return (
    <div className="w-full bg-white">
      <section
        className="relative w-full min-h-[420px] h-[min(52vh,500px)] sm:min-h-[460px] sm:h-[min(56vh,560px)] flex flex-col items-center justify-end pb-10 sm:pb-12 px-6 text-center"
        style={HERO_STYLE}
      >
        <div className="absolute top-8 left-0 right-0 flex items-center justify-center">
          <img
            src={FD_LOGO_WHITE_SRC}
            alt="Form Department logo"
            className="w-[210px] h-auto"
          />
        </div>
        <h2 className={`mt-10 text-white ${fdHeaderClass} normal-case`}>
          {heroTitle}
        </h2>
      </section>

      <section className="relative -mt-[110px] px-4 sm:px-6 pb-10">
        <div className="mx-auto w-full min-w-0 max-w-[560px] rounded-[34px] bg-[#F2EFEA] shadow-[0_20px_60px_rgba(0,0,0,0.10)] px-6 py-10 sm:px-10 sm:py-12 text-[#2B2A25]">
          <div className="text-left">
            <p className={fdStepLabelClass}>
              Step {step} of {total}
            </p>
            <StepProgressBar step={step} total={total} />
            <h1 className={`mt-9 ${fdHeaderClass} normal-case`}>{title}</h1>
            {intro ? (
              <p className="mt-5 font-sans text-[15px] sm:text-[16px] leading-[1.4] text-[#8C7152]">
                {intro}
              </p>
            ) : null}
          </div>

          {note ? (
            <div className="mt-8 rounded-[18px] bg-[#E9E7E1] border border-[#DFDDD6] px-5 py-4 sm:px-6 sm:py-5">
              <div className="font-heading text-[18px] font-semibold text-[#2B2A25] leading-[1.2]">
                {note.title}
              </div>
              <div className="mt-2 font-sans text-[13px] leading-[1.25] text-[#8C7152] italic">
                {note.body}
              </div>
            </div>
          ) : null}

          {children}
        </div>
      </section>
    </div>
  );
}
