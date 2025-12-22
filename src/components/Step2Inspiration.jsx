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

  return (
    <div className="max-w-2xl mx-auto p-8 border border-white bg-white/60 backdrop-blur-md rounded-lg shadow-lg font-aboreto">
      <form onSubmit={handleSubmit} className="space-y-8 text-black">
        <div className="mb-8">
          <p className="ml-2 text-sm mb-2 font-aboreto text-[14px] font-medium leading-[140%]">Step 2 of 5</p>
          <h1 className="text-[32px] font-aboreto font-semibold leading-[120%] tracking-[-0.2%]">Reference Brand</h1>
        </div>

        <div>
          <label className="block text-[14px] font-aboreto font-medium leading-[140%] mb-2">
            What current brand most closely aligns with what you are trying to create?
          </label>
          <input
            type="text"
            className="w-full border border-black bg-[#F5F5F5] px-5 py-3 text-[14px] font-aboreto font-medium leading-[140%] text-black placeholder-black/50 focus:outline-none rounded-md"
            placeholder="Enter a similar fashion brand here"
            value={brand2}
            onChange={(e) => dispatch(setBrand2(e.target.value))}
            required
          />
        </div>

        <div>
          <label className="block text-[14px] font-aboreto font-medium leading-[140%] mb-2">What draws you to this reference brand?</label>
          <div className="flex flex-col md:flex-row md:space-x-10 ml-2 space-y-4 md:space-y-0">
            <div className="flex flex-col space-y-2">
              {["fit", "price", "material"].map((key) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={brandPreference[key]}
                    onChange={() => dispatch(toggleBrandPreference(key))}
                    className="accent-[#3A3A3D]"
                  />
                  <span className="ml-2 capitalize text-[14px] font-aboreto font-medium leading-[140%]">{key}</span>
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
                  <span className="ml-2 capitalize text-[14px] font-aboreto font-medium leading-[140%]">
                    {key === "brand_ethics" ? "Brand Ethics" : "Aesthetic"}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[14px] font-aboreto font-medium leading-[140%] mb-2">
            Tell us a little more about why this brand resonates with you:
          </label>
          <input
            type="text"
            className="w-full border border-black bg-[#F5F5F5] px-5 py-3 text-[16px] font-aboreto font-normal leading-[150%] text-black placeholder-black/40 focus:outline-none rounded-md"
            placeholder="Preferred brand (optional)"
            value={sharedPreference}
            onChange={(e) => dispatch(setSharedPreference(e.target.value))}
          />
        </div>

        {!embedded && (
          <div className="flex items-center justify-between gap-4 mt-8">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 text-[14px] font-aboreto font-medium leading-[140%] text-white bg-[#3A3A3D] hover:bg-black active:bg-[#1C1C1C] rounded-md shadow transition duration-200"
            >
              ← Back
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-[14px] font-aboreto font-medium leading-[140%] text-white bg-[#3A3A3D] hover:bg-black active:bg-[#1C1C1C] rounded-md shadow transition duration-200"
            >
              Next →
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
