import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setProductType,
  setKeyFeatures,
  setTargetPrice,
  setQuantity,
  setMaterialPreference,
  toggleManufacturingPreference,
  toggleMaterialPreferenceOption,
  setMaterialError,
} from "../formSlice";
import FdStepDesktopLayout from "./FdStepDesktopLayout";
import { fdStepFieldLabelClass, fdStepInputClass } from "./fdTypography";
import { FD_STEP1_SPACING } from "./fdLayout";

export default function Step3ProductFocus({ email, onNext, onBack, embedded = false, validating = false }) {
  const dispatch = useDispatch();
  const {
    productType,
    keyFeatures,
    targetPrice,
    quantity,
    materialPreference,
    materialPreferenceOptions,
    manufacturingPreference,
    materialError,
  } = useSelector((state) => state.form);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!materialPreferenceOptions?.yes && !materialPreferenceOptions?.no) {
      dispatch(setMaterialError(true));
      return;
    }
    if (!embedded && onNext) onNext();
  };

  if (embedded) {
    return (
      <div className="max-w-2xl mx-auto p-8 border border-white bg-white/60 backdrop-blur-md rounded-lg shadow-lg font-sans">
        <form onSubmit={handleSubmit} className="space-y-8 text-black">
          <div className="mb-8">
            <p className="ml-5 text-sm font-sans text-[14px] font-medium leading-[1.2] mb-2">Step 3 of 5</p>
            <h2 className="text-[32px] font-heading font-semibold leading-[1.2]">Product Focus</h2>
          </div>
          <div>
            <label className="block text-[14px] font-sans font-medium leading-[1.2] mb-2">
              What article of clothing would you like to develop first?
            </label>
            <input
              className="w-full border border-black bg-transparent px-5 py-3 text-[14px] font-sans font-medium leading-[1.2] text-black placeholder-black/50 focus:outline-none rounded-md"
              placeholder="Type a clothing item to begin "
              value={productType}
              onChange={(e) => dispatch(setProductType(e.target.value))}
              required
            />
          </div>
          <div>
            <label className="block text-[14px] font-sans font-medium leading-[1.2] mb-2">
              At what price would you like to sell this item?
            </label>
            <input
              className="w-full border border-black bg-transparent px-5 py-3 text-[14px] font-sans font-medium leading-[1.2] text-black placeholder-black/40 focus:outline-none rounded-md"
              placeholder="Target sale price ($)"
              type="number"
              value={targetPrice}
              onChange={(e) => dispatch(setTargetPrice(e.target.value))}
              required
            />
          </div>
          <div>
            <label className="block text-[14px] font-sans font-medium leading-[1.2] mb-2">
              How many of this product are you looking to produce?
            </label>
            <input
              className="w-full border border-black bg-transparent px-5 py-3 text-[14px] font-sans font-medium leading-[1.2] text-black placeholder-black/40 focus:outline-none rounded-md"
              placeholder="Number of items"
              type="number"
              value={quantity}
              onChange={(e) => dispatch(setQuantity(e.target.value))}
              required
            />
          </div>
          <div>
            <label className="block text-[14px] font-sans font-medium leading-[1.2] mb-2">
              Are there any key features of your product?
            </label>
            <textarea
              className="w-full border border-black bg-transparent px-5 py-3 text-[16px] font-sans font-normal leading-[1.2] text-black placeholder-black/40 focus:outline-none rounded-md"
              placeholder="Color, fit, construction, etc."
              value={keyFeatures}
              onChange={(e) => dispatch(setKeyFeatures(e.target.value))}
            />
          </div>
        </form>
      </div>
    );
  }

  const intro =
    "Define the first piece, commercial targets, and preferences so we can route you to the right questionnaire.";

  const gap = { marginTop: FD_STEP1_SPACING.fieldGap };

  return (
    <FdStepDesktopLayout step={3} total={5} title="Product Focus" intro={intro}>
      <form onSubmit={handleSubmit} className="text-[#2B2A25]" noValidate>
        <label htmlFor="productType" className={fdStepFieldLabelClass}>
          WHAT ARTICLE OF CLOTHING WOULD YOU LIKE TO DEVELOP FIRST?
        </label>
        <input
          id="productType"
          className={fdStepInputClass}
          placeholder="Clothing item"
          value={productType}
          onChange={(e) => dispatch(setProductType(e.target.value))}
          required
        />

        <label htmlFor="targetPrice" className={fdStepFieldLabelClass} style={gap}>
          AT WHAT PRICE WOULD YOU LIKE TO SELL THIS ITEM?
        </label>
        <input
          id="targetPrice"
          type="number"
          className={fdStepInputClass}
          placeholder="Target sale price ($)"
          value={targetPrice}
          onChange={(e) => dispatch(setTargetPrice(e.target.value))}
          required
        />

        <label htmlFor="quantity" className={fdStepFieldLabelClass} style={gap}>
          HOW MANY OF THIS PRODUCT ARE YOU LOOKING TO PRODUCE?
        </label>
        <input
          id="quantity"
          type="number"
          className={fdStepInputClass}
          placeholder="Number of items"
          value={quantity}
          onChange={(e) => dispatch(setQuantity(e.target.value))}
          required
        />

        <label htmlFor="keyFeatures" className={fdStepFieldLabelClass} style={gap}>
          ARE THERE ANY KEY FEATURES OF YOUR PRODUCT?
        </label>
        <textarea
          id="keyFeatures"
          className={`${fdStepInputClass} min-h-[120px] resize-none`}
          placeholder="Color, fit, construction, etc."
          value={keyFeatures}
          onChange={(e) => dispatch(setKeyFeatures(e.target.value))}
        />

        <div style={gap}>
          <label className={fdStepFieldLabelClass}>DO YOU KNOW WHAT MATERIAL YOU WOULD LIKE TO USE?</label>
          <div className="mt-3 flex flex-wrap items-center gap-8">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="materialChoice"
                value="yes"
                checked={materialPreferenceOptions?.yes}
                onChange={() => dispatch(toggleMaterialPreferenceOption({ option: "yes" }))}
                className="accent-[#3A3A3D] h-[18px] w-[18px]"
              />
              <span className="ml-2 text-[14px] font-sans text-[#2B2A25]">Yes</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="materialChoice"
                value="no"
                checked={materialPreferenceOptions?.no}
                onChange={() => dispatch(toggleMaterialPreferenceOption({ option: "no" }))}
                className="accent-[#3A3A3D] h-[18px] w-[18px]"
              />
              <span className="ml-2 text-[14px] font-sans text-[#2B2A25]">No</span>
            </label>
          </div>

          {materialPreferenceOptions?.yes ? (
            <input
              className={`${fdStepInputClass} mt-3`}
              placeholder="Preferred material"
              value={materialPreference}
              onChange={(e) => dispatch(setMaterialPreference(e.target.value))}
              required
            />
          ) : null}
        </div>

        <div style={gap}>
          <p className={fdStepFieldLabelClass}>MANUFACTURING PREFERENCE:</p>
          <div className="mt-3 flex flex-wrap items-center gap-8">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={!!manufacturingPreference?.usa}
                onChange={() => dispatch(toggleManufacturingPreference("usa"))}
                className="accent-[#3A3A3D] h-[18px] w-[18px]"
              />
              <span className="ml-2 text-[14px] font-sans text-[#2B2A25]">USA</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={!!manufacturingPreference?.international}
                onChange={() => dispatch(toggleManufacturingPreference("international"))}
                className="accent-[#3A3A3D] h-[18px] w-[18px]"
              />
              <span className="ml-2 text-[14px] font-sans text-[#2B2A25]">International</span>
            </label>
          </div>
        </div>

        {materialError ? <p className="mt-3 text-[14px] font-sans text-red-600">Please select Yes or No to proceed.</p> : null}

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
            disabled={validating}
            className={`flex min-h-[52px] items-center justify-center gap-2 rounded-full px-5 text-white ${
              validating ? "cursor-not-allowed bg-neutral-400" : "bg-[#2B2A25] hover:bg-[#1f1d1a]"
            }`}
          >
            <span className="whitespace-nowrap font-sans text-[10px] tracking-[0.16em] uppercase">
              {validating ? "ANALYZING..." : "CONTINUE"}
            </span>
            <span className="text-[15px]" aria-hidden>
              →
            </span>
          </button>
        </div>
      </form>
    </FdStepDesktopLayout>
  );
}
