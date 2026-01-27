import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIdea, setBrand } from "../formSlice";

export default function Step1Vision({
  onNext,
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

  // Build an inline style object so you can set exact heights
  const toSize = (v) =>
    typeof v === "number" ? `${v}px` : (typeof v === "string" ? v : undefined);

  const containerStyle = {
    ...(height ? { height: toSize(height) } : null),
    ...(minHeight ? { minHeight: toSize(minHeight) } : null),
    ...(maxHeight ? { maxHeight: toSize(maxHeight) } : null),
  };

  // Slightly tighter padding when embedded, and make the card a flex column
  const cardClass = embedded
    ? "bg-white/60 w-full max-w-[380px] p-6 pb-4 backdrop-blur-md rounded-lg shadow-xl font-sans flex flex-col overflow-hidden"
    : "bg-white/60 max-w-md mx-auto p-8 pb-6 backdrop-blur-md rounded-lg shadow-xl font-sans flex flex-col overflow-hidden";

  return (
    <div className={cardClass} style={containerStyle}>
      {/* The form is a flex column and will expand; the fields area scrolls if needed */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col text-black" noValidate>
        {/* Header */}
        <div className="mb-8">
          <p className="ml-2 text-sm mb-2 font-sans text-[14px] font-medium leading-[1.2]">Step 1 of 5</p>
          <h1 className="text-[32px] font-heading font-semibold leading-[1.2]">Line Strategy</h1>
        </div>

        {/* Scrollable fields block (adjust internal spacing here) */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6">
          <div>
            <label htmlFor="brandName" className="block text-[14px] font-sans font-medium leading-[1.2] mb-2">
              Do you have a name for your brand?
            </label>
            <input
              id="brandName"
              name="brandName"
              type="text"
              autoComplete="off"
              className="w-full border border-black bg-[#F5F5F5] px-5 py-3 text-[14px] font-sans font-medium leading-[1.2] text-black placeholder-black/60 focus:outline-none rounded-md"
              placeholder="e.g. Reformation"
              value={brandValue}
              onChange={(e) => dispatch(setBrand(e.target.value))}
            />
          </div>

          <div>
            <label htmlFor="idea" className="block text-[14px] font-sans font-medium leading-[1.2] mb-2">
              Tell us a little bit about your idea:
            </label>
            <textarea
              id="idea"
              name="idea"
              rows={4}
              className="w-full border border-black bg-[#F5F5F5] px-5 py-3 text-[16px] font-sans font-normal leading-[1.2] text-black placeholder-black/60 focus:outline-none rounded-md"
              placeholder="Share a quick overview of your idea!"
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
