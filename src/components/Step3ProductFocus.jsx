import React, { useState } from "react";

export default function Step3ProductFocus({ email, onNext ,onBack}) {
    const [productType, setProductType] = useState("");
    const [keyFeatures, setKeyFeatures] = useState("");
    const [targetPrice, setTargetPrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [materialPreference, setMaterialPreference] = useState("");
    const [manufacturingPreference, setManufacturingPreference] = useState({
        usa: false,
        international: false,
    });
    const [image, setImage] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        // ✅ No backend call, just move to next step
        onNext();
    };

    return (
        <div className="max-w-2xl mx-auto p-8 border border-white bg-black/40 backdrop-blur-md rounded-lg shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-8 text-white font-sans">
                <div>
                    <h2 className="text-3xl font-normal font-[Garamond]">Product Focus</h2>
                    <p className="text-sm text-white/70 mt-1 font-[Garamond]">
                        Let’s get into the details of your first piece.
                    </p>
                </div>

                <input
                    className="w-full border border-white bg-transparent px-4 py-2 text-white placeholder-white/50 focus:outline-none"
                    placeholder="What item do you want to design?"
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    required
                />

                <textarea
                    className="w-full border border-white bg-transparent px-4 py-2 text-white placeholder-white/50 focus:outline-none"
                    placeholder="Any key features? (color, fit, construction, etc.)"
                    value={keyFeatures}
                    onChange={(e) => setKeyFeatures(e.target.value)}
                />

                <input
                    className="w-full border border-white bg-transparent px-4 py-2 text-white placeholder-white/50 focus:outline-none"
                    placeholder="Target sale price ($)"
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    required
                />

                <input
                    className="w-full border border-white bg-transparent px-4 py-2 text-white placeholder-white/50 focus:outline-none"
                    placeholder="Quantity to produce"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                />

                <input
                    className="w-full border border-white bg-transparent px-4 py-2 text-white placeholder-white/50 focus:outline-none"
                    placeholder="Preferred material (optional)"
                    value={materialPreference}
                    onChange={(e) => setMaterialPreference(e.target.value)}
                />

                <div>
                    <p className="text-sm text-white/90 mb-2">Manufacturing preference:</p>
                    <div className="space-x-6">
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                checked={manufacturingPreference.usa}
                                onChange={() =>
                                    setManufacturingPreference((prev) => ({ ...prev, usa: !prev.usa }))
                                }
                                className="accent-white"
                            />
                            <span className="ml-2 text-sm">USA</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                checked={manufacturingPreference.international}
                                onChange={() =>
                                    setManufacturingPreference((prev) => ({ ...prev, international: !prev.international }))
                                }
                                className="accent-white"
                            />
                            <span className="ml-2 text-sm">International</span>
                        </label>
                    </div>
                </div>

                {/*<div>
                    <label className="block mb-1 text-sm font-medium">Upload reference image (optional)</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                        className="w-full file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-gray-100"
                    />
                    
                </div>
                */}
                <div className="flex items-center justify-between gap-4">
            
                 <button
                    type = "button"
                    onClick={onBack}
                   className="px-6 py-2 text-sm font-medium text-white border border-white bg-transparent hover:bg-white hover:text-black transition duration-200 rounded">
                      ← Back
                   </button>
                   <button
                    type="submit"
                    className="px-6 py-2 text-sm font-medium text-white border border-white bg-transparent hover:bg-white hover:text-black transition duration-200 rounded"
                >
                    Next →
                </button>
                   </div>
            </form>
        </div>
    );
}
