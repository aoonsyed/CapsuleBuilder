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
        <div className="max-w-2xl mx-auto p-8 border border-white bg-white/60 backdrop-blur-md rounded-lg shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-8 text-white font-sans">
                <div>
                    <p className=" ml-5 text-sm font-[Helvetica] text-black">Step 3 of 5</p>
                    <h2 className="text-[26pt] font-[Garamond] font-bold text-black ">Product Focus</h2>
                </div>

                <div>
                    <label className="block text-base font-[Helvetica]  text-black">What article of clothing would you like to develop first?</label>
                    <input
                        className="w-full border border-black bg-transparent px-4 py-2 text-black placeholder-black/50 focus:outline- rounded-md"
                        placeholder="Type a clothing item to begin "
                        value={productType}
                        onChange={(e) => dispatch(setProductType(e.target.value))}
                        required
                    />
                </div>

                <div>
                    <label className="block text-base font-[Helvetica]  text-black">At what price would you like to sell this item?</label>
                    <input
                        className="w-full border border-black bg-transparent px-4 py-2 text-black placeholder-black/40 focus:outline-none rounded-md"
                        placeholder="Target sale price ($)"
                        type="number"
                        value={targetPrice}
                        onChange={(e) => dispatch(setTargetPrice(e.target.value))}
                        required
                    />
                </div>

                <div>
                    <label className="block text-base font-[Helvetica]  text-black">How many of this product are you looking to produce?</label>
                    <input
                        className="w-full border border-black bg-transparent px-4 py-2 text-black placeholder-black/40 focus:outline-none rounded-md"
                        placeholder="Number of items"
                        type="number"
                        value={quantity}
                        onChange={(e) => dispatch(setQuantity(e.target.value))}
                        required
                    />
                </div>

                <div>
                    <label className="block text-base font-[Helvetica] text-black">Are there any key features of your product?</label>
                    <textarea
                        className="w-full border border-black bg-transparent px-4 py-2 text-black placeholder-black/40 focus:outline-none rounded-md"
                        placeholder="Any key features? (color, fit, construction, etc.)"
                        value={keyFeatures}
                        onChange={(e) => dispatch(setKeyFeatures(e.target.value))}
                    />
                </div>

                <div className="-mt-4">
                    <label className="block text-base font-[Helvetica] text-black">
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
                            <span className="ml-2 text-sm font-[Helvetica] text-black">Yes</span>
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
                            <span className="ml-2 text-sm font-[Helvetica] text-black">No</span>
                        </label>
                    </div>

                    {materialError && <p className="text-sm text-red-600 mt-1">Please select Yes or No to proceed.</p>}

                    {materialPreferenceOptions?.yes && (
                        <input
                            className="w-full mt-4 border border-black bg-transparent px-4 py-2 text-black placeholder-black/40 focus:outline-none rounded-md"
                            placeholder="Preferred material"
                            value={materialPreference}
                            onChange={(e) => dispatch(setMaterialPreference(e.target.value))}
                            required
                        />
                    )}
                </div>

                <div>
                    <p className="text-base font-[Helvetica] text-black">Manufacturing preference:</p>
                    <div className="space-x-6">
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                checked={!!manufacturingPreference?.usa}
                                onChange={() => dispatch(toggleManufacturingPreference("usa"))}
                                className="accent-[#3A3A3D]"
                            />
                            <span className="ml-2 text-sm font-[Helvetica] text-black">USA</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                checked={!!manufacturingPreference?.international}
                                onChange={() => dispatch(toggleManufacturingPreference("international"))}
                                className="accent-[#3A3A3D]"
                            />
                            <span className="ml-2 text-sm font-[Helvetica] text-black">International</span>
                        </label>
                    </div>
                </div>

            </form>
        </div>
    );
}
