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
                        <label className="block text-[14px] font-sans font-medium leading-[1.2] mb-2">What article of clothing would you like to develop first?</label>
                        <input className="w-full border border-black bg-transparent px-5 py-3 text-[14px] font-sans font-medium leading-[1.2] text-black placeholder-black/50 focus:outline-none rounded-md" placeholder="Type a clothing item to begin " value={productType} onChange={(e) => dispatch(setProductType(e.target.value))} required />
                    </div>
                    <div>
                        <label className="block text-[14px] font-sans font-medium leading-[1.2] mb-2">At what price would you like to sell this item?</label>
                        <input className="w-full border border-black bg-transparent px-5 py-3 text-[14px] font-sans font-medium leading-[1.2] text-black placeholder-black/40 focus:outline-none rounded-md" placeholder="Target sale price ($)" type="number" value={targetPrice} onChange={(e) => dispatch(setTargetPrice(e.target.value))} required />
                    </div>
                    <div>
                        <label className="block text-[14px] font-sans font-medium leading-[1.2] mb-2">How many of this product are you looking to produce?</label>
                        <input className="w-full border border-black bg-transparent px-5 py-3 text-[14px] font-sans font-medium leading-[1.2] text-black placeholder-black/40 focus:outline-none rounded-md" placeholder="Number of items" type="number" value={quantity} onChange={(e) => dispatch(setQuantity(e.target.value))} required />
                    </div>
                    <div>
                        <label className="block text-[14px] font-sans font-medium leading-[1.2] mb-2">Are there any key features of your product?</label>
                        <textarea className="w-full border border-black bg-transparent px-5 py-3 text-[16px] font-sans font-normal leading-[1.2] text-black placeholder-black/40 focus:outline-none rounded-md" placeholder="Any key features? (color, fit, construction, etc.)" value={keyFeatures} onChange={(e) => dispatch(setKeyFeatures(e.target.value))} />
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="w-full bg-white">
            <section className="relative w-full h-[350px] flex flex-col items-center justify-end pb-10 px-6 text-center" style={{ backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.65) 100%), url("/assets/ayo-ogunseinde-UqT55tGBqzI-unsplash_dark_clean.jpg")', backgroundSize: "cover", backgroundPosition: "center" }}>
                <div className="absolute top-8 left-0 right-0 flex items-center justify-center">
                    <img src="/assets/form-logo-white-transparent.png" alt="Form Department logo" className="w-[210px] h-auto" />
                </div>
                <h2 className="mt-10 font-heading text-[34px] leading-[1.15] text-[#C7A15E]">Your Curated Capsule</h2>
            </section>

            <section className="relative -mt-[110px] px-6 pb-10">
                <div className="mx-auto max-w-[560px] rounded-[34px] bg-[#F2EFEA] shadow-[0_20px_60px_rgba(0,0,0,0.10)] px-10 py-12">
                    <form onSubmit={handleSubmit} className="space-y-11 text-[#2B2A25]">
                        <div className="pt-1">
                            <p className="text-[12px] tracking-[0.32em] uppercase text-[#C7A15E] font-sans">Step 3 of 5</p>
                            <div className="mt-5 h-px w-[190px] bg-[#7B6B55]" />
                            <h2 className="mt-9 text-[46px] font-heading leading-[1.05]">Product Focus</h2>
                        </div>
                        <div className="pt-1">
                            <label className="block text-[12px] tracking-[0.22em] uppercase font-sans text-[#8C7152] font-medium mb-3">WHAT ARTICLE OF CLOTHING WOULD YOU LIKE TO DEVELOP FIRST?</label>
                            <input className="w-full border border-[#7C7C7C] bg-white px-5 py-3 text-[14px] font-sans text-[#2B2A25] focus:outline-none rounded-md" placeholder="Type a clothing item to begin" value={productType} onChange={(e) => dispatch(setProductType(e.target.value))} required />
                        </div>
                        <div className="pt-1">
                            <label className="block text-[12px] tracking-[0.22em] uppercase font-sans text-[#8C7152] font-medium mb-3">AT WHAT PRICE WOULD YOU LIKE TO SELL THIS ITEM?</label>
                            <input className="w-full border border-[#7C7C7C] bg-white px-5 py-3 text-[14px] font-sans text-[#2B2A25] focus:outline-none rounded-md" placeholder="Target sale price ($)" type="number" value={targetPrice} onChange={(e) => dispatch(setTargetPrice(e.target.value))} required />
                        </div>
                        <div className="pt-1">
                            <label className="block text-[12px] tracking-[0.22em] uppercase font-sans text-[#8C7152] font-medium mb-3">HOW MANY OF THIS PRODUCT ARE YOU LOOKING TO PRODUCE?</label>
                            <input className="w-full border border-[#7C7C7C] bg-white px-5 py-3 text-[14px] font-sans text-[#2B2A25] focus:outline-none rounded-md" placeholder="Number of items" type="number" value={quantity} onChange={(e) => dispatch(setQuantity(e.target.value))} required />
                        </div>
                        <div>
                            <label className="block text-[12px] tracking-[0.22em] uppercase font-sans text-[#8C7152] font-medium mb-3">ARE THERE ANY KEY FEATURES OF YOUR PRODUCT?</label>
                            <textarea className="w-full min-h-[120px] resize-none border border-[#7C7C7C] bg-white px-5 py-3 text-[14px] font-sans text-[#2B2A25] focus:outline-none rounded-md" placeholder="Any key features? (color, fit, construction, etc.)" value={keyFeatures} onChange={(e) => dispatch(setKeyFeatures(e.target.value))} />
                        </div>

                        <div className="pt-1">
                            <label className="block text-[12px] tracking-[0.22em] uppercase font-sans text-[#8C7152] font-medium mb-3">
                                DO YOU KNOW WHAT MATERIAL YOU WOULD LIKE TO USE?
                            </label>
                            <div className="flex items-center gap-8">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="materialChoice"
                                        value="yes"
                                        checked={materialPreferenceOptions?.yes}
                                        onChange={() => dispatch(toggleMaterialPreferenceOption({ option: "yes" }))}
                                        className="accent-[#3A3A3D] w-[18px] h-[18px]"
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
                                        className="accent-[#3A3A3D] w-[18px] h-[18px]"
                                    />
                                    <span className="ml-2 text-[14px] font-sans text-[#2B2A25]">No</span>
                                </label>
                            </div>

                            {materialPreferenceOptions?.yes && (
                                <input
                                    className="w-full mt-4 border border-[#7C7C7C] bg-white px-5 py-3 text-[14px] font-sans text-[#2B2A25] placeholder-black/40 focus:outline-none rounded-md"
                                    placeholder="Preferred material"
                                    value={materialPreference}
                                    onChange={(e) => dispatch(setMaterialPreference(e.target.value))}
                                    required
                                />
                            )}
                        </div>

                        <div className="pt-1">
                            <p className="text-[12px] tracking-[0.22em] uppercase font-sans text-[#8C7152] font-medium mb-3">
                                MANUFACTURING PREFERENCE:
                            </p>
                            <div className="flex items-center gap-8">
                                <label className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={!!manufacturingPreference?.usa}
                                        onChange={() => dispatch(toggleManufacturingPreference("usa"))}
                                        className="accent-[#3A3A3D] w-[18px] h-[18px]"
                                    />
                                    <span className="ml-2 text-[14px] font-sans text-[#2B2A25]">USA</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={!!manufacturingPreference?.international}
                                        onChange={() => dispatch(toggleManufacturingPreference("international"))}
                                        className="accent-[#3A3A3D] w-[18px] h-[18px]"
                                    />
                                    <span className="ml-2 text-[14px] font-sans text-[#2B2A25]">International</span>
                                </label>
                            </div>
                        </div>

                        {materialError && <p className="text-[14px] font-sans text-red-600">Please select Yes or No to proceed.</p>}
                        <div className="mt-10 flex items-center justify-between">
                            <button type="button" onClick={onBack} className="flex items-center gap-3" aria-label="Back">
                                <span className="h-11 w-11 rounded-full border border-[#2B2A25] flex items-center justify-center text-[#2B2A25] text-[18px] leading-none">←</span>
                                <span className="text-[12px] tracking-[0.2em] uppercase font-sans font-medium text-[#2B2A25]">BACK</span>
                            </button>
                            <button type="submit" disabled={validating} className={`relative h-[52px] w-[248px] rounded-full text-white ${validating ? "bg-gray-400 cursor-not-allowed" : "bg-[#2B2A25]"}`}>
                                <span className="block w-full text-center font-sans text-[12px] tracking-[0.24em] uppercase">{validating ? "VALIDATING..." : "CONTINUE"}</span>
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[16px] leading-none">→</span>
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
}
