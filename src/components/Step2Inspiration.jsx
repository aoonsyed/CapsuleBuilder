import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBrand2, setSharedPreference, toggleBrandPreference } from "../formSlice";
import FdStepDesktopLayout from "./FdStepDesktopLayout";
import { fdStepFieldLabelClass, fdStepFieldSurfaceClass, fdStepInputClass } from "./fdTypography";
import { FD_STEP1_SPACING } from "./fdLayout";

export default function Step2Inspiration({ email = "demo@example.com", onNext, onBack, embedded = false }) {
  const dispatch = useDispatch();
  const brand2 = useSelector((state) => state.form.brand2);
  const sharedPreference = useSelector((state) => state.form.sharedPreference);
  const brandPreference = useSelector((state) => state.form.brandPreference);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!embedded && onNext) onNext();
  };

  if (embedded) {
    return (
      <div className="max-w-2xl mx-auto p-8 border border-white bg-white/60 backdrop-blur-md rounded-lg shadow-lg font-sans">
        <form onSubmit={handleSubmit} className="space-y-8 text-black">
          <div className="mb-8">
            <p className="ml-2 text-sm mb-2 font-sans text-[14px] font-medium leading-[1.2]">Step 2 of 5</p>
            <h1 className="text-[32px] font-heading font-semibold leading-[1.2]">Reference Brand</h1>
          </div>

          <div>
            <label className="block text-[14px] font-sans font-medium leading-[1.2] mb-2">
              What current brand most closely aligns with what you are trying to create?
            </label>
            <input
              type="text"
              className={`w-full px-5 py-3 text-[14px] font-sans font-medium leading-[1.2] text-black placeholder-black/50 ${fdStepFieldSurfaceClass}`}
              placeholder="Enter a similar brand here"
              value={brand2}
              onChange={(e) => dispatch(setBrand2(e.target.value))}
              required
            />
          </div>

          <div>
            <label className="block text-[14px] font-sans font-medium leading-[1.2] mb-2">What draws you to this reference brand?</label>
            <div className="flex flex-col md:flex-row md:space-x-10 ml-2 space-y-4 md:space-y-0">
              <div className="flex flex-col space-y-2">
                {["fit", "price", "material"].map((key) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={brandPreference[key]}
                      onChange={() => dispatch(toggleBrandPreference(key))}
                      className="accent-[#3A3A3D] w-[18px] h-[18px]"
                    />
                    <span className="ml-2 capitalize text-[14px] font-sans font-medium leading-[1.2]">{key}</span>
                  </label>
                ))}
              </div>
              <div className="flex flex-col space-y-2">
                {["aesthetic", "brand_ethics"].map((key) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={brandPreference[key]}
                      onChange={() => dispatch(toggleBrandPreference(key))}
                      className="accent-[#3A3A3D]"
                    />
                    <span className="ml-2 capitalize text-[14px] font-sans font-medium leading-[1.2]">
                      {key === "brand_ethics" ? "Brand Ethics" : "Aesthetic"}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[14px] font-sans font-medium leading-[1.2] mb-2">
              Tell us a little more about why this brand resonates with you:
            </label>
            <input
              type="text"
              className={`w-full px-5 py-3 text-[16px] font-sans font-normal leading-[1.2] text-black placeholder-black/40 ${fdStepFieldSurfaceClass}`}
              placeholder="Optional"
              value={sharedPreference}
              onChange={(e) => dispatch(setSharedPreference(e.target.value))}
              required={false}
              aria-required={false}
            />
          </div>
        </form>
      </div>
    );
  }

  const intro =
    "Share a reference brand that captures the direction you want so we can align aesthetic, positioning, and craft.";

  return (
    <FdStepDesktopLayout step={2} total={5} title="Reference Brand" intro={intro}>
      <form onSubmit={handleSubmit} className="text-[#2B2A25]" noValidate>
        <label htmlFor="brand2" className={fdStepFieldLabelClass}>
          WHAT CURRENT BRAND MOST CLOSELY ALIGNS WITH WHAT YOU ARE TRYING TO CREATE?
        </label>
        <input
          id="brand2"
          type="text"
          className={fdStepInputClass}
          placeholder="Enter a similar brand here"
          value={brand2}
          onChange={(e) => dispatch(setBrand2(e.target.value))}
          required
        />

        <div className={fdStepFieldLabelClass} style={{ marginTop: FD_STEP1_SPACING.fieldGap }}>
          WHAT DRAWS YOU TO THIS REFERENCE BRAND?
        </div>
        <div className="mt-3 grid grid-cols-2 gap-y-2 gap-x-4 text-[#2B2A25]">
          {["fit", "price", "material", "aesthetic", "brand_ethics"].map((key) => (
            <label key={key} className="flex items-center">
              <input
                type="checkbox"
                checked={brandPreference[key]}
                onChange={() => dispatch(toggleBrandPreference(key))}
                className="accent-[#3A3A3D]"
              />
              <span className="ml-2 capitalize text-[14px] font-sans">
                {key === "brand_ethics" ? "Brand Ethics" : key}
              </span>
            </label>
          ))}
        </div>

        <label htmlFor="sharedPreference" className={fdStepFieldLabelClass} style={{ marginTop: FD_STEP1_SPACING.fieldGap }}>
          TELL US A LITTLE MORE ABOUT WHY THIS BRAND RESONATES WITH YOU:
        </label>
        <input
          id="sharedPreference"
          type="text"
          className={fdStepInputClass}
          placeholder="Optional"
          value={sharedPreference}
          onChange={(e) => dispatch(setSharedPreference(e.target.value))}
          required={false}
          aria-required={false}
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
            <span className="font-sans text-[10px] tracking-[0.16em] uppercase">CONTINUE TO STEP 3</span>
            <span className="text-[15px]" aria-hidden>
              →
            </span>
          </button>
        </div>
      </form>
    </FdStepDesktopLayout>
  );
}
