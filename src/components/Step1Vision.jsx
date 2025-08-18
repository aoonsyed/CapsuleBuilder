import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIdea,setBrand } from "../formSlice";

export default function Step1Vision({ onNext, email = "demo@example.com" }) {
  const dispatch = useDispatch();
  const idea = useSelector((state) => state.form.idea);
  const localBrand = useSelector((state)=> state.form.localBrand)

  const handleSubmit = (e) => {
    e.preventDefault();
    //setBrand(localBrand);
    onNext();
  };

  return (
    <div className="bg-white/60 max-w-md mx-auto p-8 backdrop-blur-md rounded-lg shadow-xl font-[Helvetica]">
      <form onSubmit={handleSubmit} className="space-y-8 text-black">
        {/* Step Heading */}
        <div>
          <p className="ml-2 text-sm mb-2">Step 1 of 5</p>
          <h1 className="text-[26pt] font-[Garamond] font-bold">Line Strategy</h1>
        </div>

        {/* Brand Name Input */}
        <div>
          <label className="block text-base mb-1">Do you have a name for your brand?</label>
          <input
            type="text"
            className="w-full border border-black bg-[#F5F5F5] px-4 py-2 text-black placeholder-black/60 focus:outline-none rounded-md"
            placeholder="e.g. Reformation"
            value={localBrand}
            onChange={(e) =>dispatch(setBrand(e.target.value))}
          />
        </div>

        {/* Idea Textarea */}
        <div>
          <label className="block text-base mb-1">Tell us a little bit about your idea:</label>
          <textarea
            className="w-full border border-black bg-[#F5F5F5] px-4 py-2 text-black placeholder-black/60 focus:outline-none rounded-md"
            placeholder="Share a quick overview of your idea!"
            value={idea}
            onChange={(e) => dispatch(setIdea(e.target.value))}
            required
          />
        </div>

        {/* Next Button */}
        <div>
          <button
            type="submit"
            className="mt-6 px-6 py-2 text-lg font-bold font-[Helvetica] text-white bg-[#3A3A3D] hover:bg-black active:bg-[#1C1C1C] rounded-md shadow transition duration-200"
          >
            Next →
          </button>
        </div>
      </form>
    </div>
  );
}
