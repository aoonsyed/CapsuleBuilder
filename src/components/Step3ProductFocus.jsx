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

export default function Step3ProductFocus({ email, onNext, onBack, embedded = false }) {
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
        if (!materialPreferenceOptions) {
            dispatch(setMaterialError(true));
            return;
        }
        if (!embedded && onNext) onNext();
    };

    return (
        <div className="max-w-2xl mx-auto p-8 border border-white bg-white/60 backdrop-blur-md rounded-lg shadow-lg font-aboreto">
            <form onSubmit={handleSubmit} className="space-y-8 text-black">
                <div className="mb-8">
                    <p className="ml-5 text-sm font-aboreto text-[14px] font-medium leading-[140%] mb-2">Step 3 of 5</p>
                    <h2 className="text-[32px] font-aboreto font-semibold leading-[120%] tracking-[-0.2%]">Product Focus</h2>
                </div>

                <div>
                    <label className="block text-[14px] font-aboreto font-medium leading-[140%] mb-2">What article of clothing would you like to develop first?</label>
                    <input
                        className="w-full border border-black bg-transparent px-5 py-3 text-[14px] font-aboreto font-medium leading-[140%] text-black placeholder-black/50 focus:outline-none rounded-md"
                        placeholder="Type a clothing item to begin "
                        value={productType}
                        onChange={(e) => dispatch(setProductType(e.target.value))}
                        required
                    />
                </div>

                <div>
                    <label className="block text-[14px] font-aboreto font-medium leading-[140%] mb-2">At what price would you like to sell this item?</label>
                    <input
                        className="w-full border border-black bg-transparent px-5 py-3 text-[14px] font-aboreto font-medium leading-[140%] text-black placeholder-black/40 focus:outline-none rounded-md"
                        placeholder="Target sale price ($)"
                        type="number"
                        value={targetPrice}
                        onChange={(e) => dispatch(setTargetPrice(e.target.value))}
                        required
                    />
                </div>

                <div>
                    <label className="block text-[14px] font-aboreto font-medium leading-[140%] mb-2">How many of this product are you looking to produce?</label>
                    <input
                        className="w-full border border-black bg-transparent px-5 py-3 text-[14px] font-aboreto font-medium leading-[140%] text-black placeholder-black/40 focus:outline-none rounded-md"
                        placeholder="Number of items"
                        type="number"
                        value={quantity}
                        onChange={(e) => dispatch(setQuantity(e.target.value))}
                        required
                    />
                </div>

                <div>
                    <label className="block text-[14px] font-aboreto font-medium leading-[140%] mb-2">Are there any key features of your product?</label>
                    <textarea
                        className="w-full border border-black bg-transparent px-5 py-3 text-[16px] font-aboreto font-normal leading-[150%] text-black placeholder-black/40 focus:outline-none rounded-md"
                        placeholder="Any key features? (color, fit, construction, etc.)"
                        value={keyFeatures}
                        onChange={(e) => dispatch(setKeyFeatures(e.target.value))}
                    />
                </div>

                <div>
                    <label className="block text-[14px] font-aboreto font-medium leading-[140%] mb-2">
                        Do you know what material you would like to use? <span className="text-red-500">*</span>
                    </label>

                    <div className="space-x-6">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="materialChoice"
                                value="yes"
                                checked={materialPreferenceOptions?.yes}
                                onChange={() => dispatch(toggleMaterialPreferenceOption({ option: "yes" }))}
                                className="accent-[#3A3A3D]"
                            />
                            <span className="ml-2 text-[14px] font-aboreto font-medium leading-[140%]">Yes</span>
                        </label>

                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="materialChoice"
                                value="no"
                                checked={materialPreferenceOptions?.no}
                                onChange={() => dispatch(toggleMaterialPreferenceOption({ option: "no" }))}
                                className="accent-[#3A3A3D]"
                            />
                            <span className="ml-2 text-[14px] font-aboreto font-medium leading-[140%]">No</span>
                        </label>
                    </div>

                    {materialError && <p className="text-[14px] font-aboreto font-medium leading-[140%] text-red-600 mt-2">Please select Yes or No to proceed.</p>}

                    {materialPreferenceOptions?.yes && (
                        <input
                            className="w-full mt-4 border border-black bg-transparent px-5 py-3 text-[14px] font-aboreto font-medium leading-[140%] text-black placeholder-black/40 focus:outline-none rounded-md"
                            placeholder="Preferred material"
                            value={materialPreference}
                            onChange={(e) => dispatch(setMaterialPreference(e.target.value))}
                            required
                        />
                    )}
                </div>

                <div>
                    <p className="text-[14px] font-aboreto font-medium leading-[140%] mb-2">Manufacturing preference:</p>
                    <div className="space-x-6">
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                checked={!!manufacturingPreference?.usa}
                                onChange={() => dispatch(toggleManufacturingPreference("usa"))}
                                className="accent-[#3A3A3D]"
                            />
                            <span className="ml-2 text-[14px] font-aboreto font-medium leading-[140%]">USA</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                checked={!!manufacturingPreference?.international}
                                onChange={() => dispatch(toggleManufacturingPreference("international"))}
                                className="accent-[#3A3A3D]"
                            />
                            <span className="ml-2 text-[14px] font-aboreto font-medium leading-[140%]">International</span>
                        </label>
                    </div>
                </div>

            </form>
        </div>
    );
}
