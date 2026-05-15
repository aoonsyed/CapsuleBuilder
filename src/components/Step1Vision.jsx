import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIdea, setBrand } from "../formSlice";
import FdStepDesktopLayout from "./FdStepDesktopLayout";
import { fdStepFieldLabelClass, fdStepFieldSurfaceClass, fdStepInputClass } from "./fdTypography";
import { FD_STEP1_SPACING } from "./fdLayout";

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
                className={`w-full px-5 py-3 text-[14px] font-sans font-medium leading-[1.2] text-black placeholder-black/60 ${fdStepFieldSurfaceClass}`}
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
                className={`w-full px-5 py-3 text-[16px] font-sans font-normal leading-[1.2] text-black placeholder-black/60 ${fdStepFieldSurfaceClass}`}
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

  const intro = (
    <>
      In this phase, we define the core architecture of your brand&apos;s presence. We are looking for the thread
      that connects your vision to the market
    </>
  );

  return (
    <FdStepDesktopLayout step={1} total={5} title="Line Strategy" intro={intro}>
      <form onSubmit={handleSubmit} className="text-[#2B2A25]" noValidate>
        <label htmlFor="brandName" className={fdStepFieldLabelClass}>
          DO YOU HAVE A NAME FOR YOUR BRAND?
        </label>
        <input
          id="brandName"
          name="brandName"
          type="text"
          autoComplete="off"
          className={fdStepInputClass}
          placeholder="e.g Reformation"
          value={brandValue}
          onChange={(e) => dispatch(setBrand(e.target.value))}
          required
        />

        <label htmlFor="idea" className={fdStepFieldLabelClass} style={{ marginTop: FD_STEP1_SPACING.fieldGap }}>
          TELL US A LITTLE BIT ABOUT YOUR IDEA:
        </label>
        <textarea
          id="idea"
          name="idea"
          className={`${fdStepInputClass} resize-none`}
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
            <span className="font-sans text-[10px] tracking-[0.16em] uppercase">CONTINUE TO STEP 2</span>
            <span className="text-[15px]" aria-hidden>
              →
            </span>
          </button>
        </div>
      </form>
    </FdStepDesktopLayout>
  );
}
