import React, { useEffect,useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setBrand2,
  setSharedPreference,
  toggleBrandPreference,
} from "../formSlice";
export default function Step2Inspiration({ email = "demo@example.com", onNext, onBack }) {
  const dispatch = useDispatch();

  const brand2 = useSelector((state) => state.form.brand2);
  const sharedPreference = useSelector((state) => state.form.sharedPreference);
  const brandPreference = useSelector((state) => state.form.brandPreference);



  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto p-8 border border-white bg-white/60 backdrop-blur-md rounded-lg shadow-lg font-[Helvetica]">
      <form onSubmit={handleSubmit} className="space-y-8 text-black">
        {/* Step Heading */}
        <div>
          <p className="ml-2 text-sm mb-2">Step 2 of 5</p>
          <h1 className="text-[26pt] font-[Garamond] font-bold">Reference Brand</h1>
        </div>

        {/* Brand Name */}
        <div>
          <label className="block text-base mb-2">
            What current brand most closely aligns with what you are trying to create?
          </label>
          <input
            type="text"
            className="w-full border border-black bg-[#F5F5F5] px-4 py-2 text-black placeholder-black/50 focus:outline-none rounded-md"
            placeholder="Enter a similar fashion brand here"
            value={brand2}
            onChange={(e) => dispatch(setBrand2(e.target.value))}
            required
          />
        </div>

        {/* Brand Preference Checkboxes */}
        <div>
          <label className="block text-base mb-2">
            What draws you to this reference brand?
          </label>
          <div className="flex flex-col md:flex-row md:space-x-10 ml-2 space-y-4 md:space-y-0">
            <div className="flex flex-col space-y-2">
              {["fit", "price", "material"].map((key) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={brandPreference[key]}
                    onChange={() =>
                     dispatch(toggleBrandPreference(key))}
                    className="accent-[#3A3A3D]"
                  />
                  <span className="ml-2 capitalize text-base">{key}</span>
                </label>
              ))}
            </div>
            <div className="flex flex-col space-y-2">
              {["aesthetic", "brand_ethics"].map((key) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={brandPreference[key]}
                    onChange={() =>
                      dispatch(toggleBrandPreference(key))}
                    className="accent-[#3A3A3D]"
                  />
                  <span className="ml-2 capitalize text-base">
                    {key === "brand_ethics" ? "Brand Ethics" : "Aesthetic"}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Personal Connection Text */}
        <div>
          <label className="block text-base mb-2">
            Tell us a little more about why this brand resonates with you:
          </label>
          <input
            type="text"
            className="w-full border border-black bg-[#F5F5F5] px-4 py-2 text-black placeholder-black/40 focus:outline-none rounded-md"
            placeholder="Preferred brand (optional)"
            value={sharedPreference}
            onChange={(e) => dispatch(setSharedPreference(e.target.value))}
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-4 mt-8">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 text-lg font-bold text-white bg-[#3A3A3D] hover:bg-black active:bg-[#1C1C1C] rounded-md shadow transition duration-200"
          >
            ← Back
          </button>

          <button
            type="submit"
            className="px-6 py-2 text-lg font-bold text-white bg-[#3A3A3D] hover:bg-black active:bg-[#1C1C1C] rounded-md shadow transition duration-200"
          >
            Next →
          </button>
        </div>
      </form>
    </div>
  );
}
