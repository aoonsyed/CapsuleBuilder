import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBrand2, setSharedPreference, toggleBrandPreference } from "../formSlice";

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
              className="w-full border border-black bg-[#F5F5F5] px-5 py-3 text-[14px] font-sans font-medium leading-[1.2] text-black placeholder-black/50 focus:outline-none rounded-md"
              placeholder="Enter a similar fashion brand here"
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
              className="w-full border border-black bg-[#F5F5F5] px-5 py-3 text-[16px] font-sans font-normal leading-[1.2] text-black placeholder-black/40 focus:outline-none rounded-md"
              placeholder="Preferred brand (optional)"
              value={sharedPreference}
              onChange={(e) => dispatch(setSharedPreference(e.target.value))}
            />
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
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
          <img src="/assets/form-logo-white-transparent.png" alt="Form Department logo" className="w-[210px] h-auto" />
        </div>
        <h2 className="mt-10 font-heading text-[34px] leading-[1.15] text-[#C7A15E]">Your Curated Capsule</h2>
      </section>

      <section className="relative -mt-[110px] px-6 pb-10">
        <div className="mx-auto max-w-[560px] rounded-[34px] bg-[#F2EFEA] shadow-[0_20px_60px_rgba(0,0,0,0.10)] px-10 py-12">
          <form onSubmit={handleSubmit} className="space-y-11 text-[#2B2A25]">
            <div className="pt-1">
              <p className="text-[12px] tracking-[0.32em] uppercase text-[#C7A15E] font-sans">Step 2 of 5</p>
              <div className="mt-5 h-px w-[190px] bg-[#7B6B55]" />
              <h1 className="mt-9 text-[46px] font-heading leading-[1.05]">Reference Brand</h1>
            </div>

            <div className="pt-1">
              <label className="block text-[12px] tracking-[0.22em] uppercase font-sans text-[#8C7152] font-medium mb-4">
                WHAT CURRENT BRAND MOST CLOSELY ALIGNS WITH WHAT YOU ARE TRYING TO CREATE?
              </label>
              <input
                type="text"
                className="w-full border border-[#7C7C7C] bg-white px-5 py-3 text-[14px] font-sans font-normal leading-[1.2] text-[#2B2A25] placeholder-black/40 focus:outline-none rounded-md"
                placeholder="Enter a similar fashion brand here"
                value={brand2}
                onChange={(e) => dispatch(setBrand2(e.target.value))}
                required
              />
            </div>

            <div className="pt-1">
              <label className="block text-[12px] tracking-[0.22em] uppercase font-sans text-[#8C7152] font-medium mb-4">
                WHAT DRAWS YOU TO THIS REFERENCE BRAND?
              </label>
              <div className="grid grid-cols-2 gap-y-2 text-[#2B2A25]">
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
            </div>

            <div>
              <label className="block text-[12px] tracking-[0.22em] uppercase font-sans text-[#8C7152] font-medium mb-4">
                TELL US A LITTLE MORE ABOUT WHY THIS BRAND RESONATES WITH YOU:
              </label>
              <input
                type="text"
                className="w-full border border-[#7C7C7C] bg-white px-5 py-3 text-[14px] font-sans font-normal leading-[1.2] text-[#2B2A25] placeholder-black/40 focus:outline-none rounded-md"
                placeholder="Preferred brand (optional)"
                value={sharedPreference}
                onChange={(e) => dispatch(setSharedPreference(e.target.value))}
              />
            </div>

            <div className="mt-10 flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <button
                type="button"
                onClick={onBack}
                className="flex shrink-0 touch-manipulation items-center gap-3 self-start hover:opacity-90 active:opacity-80 transition-opacity"
                aria-label="Back"
              >
                <span className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full border border-[#2B2A25] text-[18px] leading-none text-[#2B2A25]">
                  ←
                </span>
                <span className="text-[12px] tracking-[0.2em] uppercase font-sans font-medium text-[#2B2A25]">
                  BACK
                </span>
              </button>
              <button
                type="submit"
                className="flex min-h-[52px] w-full shrink-0 touch-manipulation items-center justify-center gap-3 rounded-full bg-[#2B2A25] px-6 py-3 text-white sm:w-auto sm:min-w-[220px] sm:max-w-md hover:bg-[#1f1d1a] active:bg-[#181716] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B2A25]"
              >
                <span className="font-sans text-[11px] sm:text-[12px] tracking-[0.16em] sm:tracking-[0.22em] uppercase text-center px-1">
                  CONTINUE TO STEP 3
                </span>
                <span className="text-[16px] leading-none shrink-0" aria-hidden>
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
