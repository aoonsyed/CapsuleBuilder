import React, { useState } from "react";

export default function Step2Inspiration({ email = "demo@example.com", onNext,onBack }) {
    const [brand, setBrand] = useState("");
    const [likes, setLikes] = useState("");
    const [image, setImage] = useState(null);
    const [brandPreference, setBrandPreference] = useState({
            fit: false,
            price: false,
            aesthetic: false,
            material:false,
            brand_ethics:false
        });
    const [sharedPrefernce,setSharedPrefernece]=useState("")
    const handleSubmit = (e) => {
        e.preventDefault();
        // ✅ No backend call — just move to the next step
        onNext();
    };

    return (
        <div className="max-w-2xl mx-auto p-8 border border-white bg-white/60 backdrop-blur-md rounded-lg shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-8 text-white font-sans">
                <div>
                    
                    <h1 className="text-3xl font-inter text-black">Reference Brand</h1>
                    {/*<p className="text-sm text-white/70 mt-1 font-[Garamond]">Tell us who you admire and why.</p>*/}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-black">Is there a brand you want to reference for aesthetic?</label>
                    <input
                        type="text"
                        className="w-full border border-black bg-transparent px-4 py-2 text-black placeholder-black/50 focus:outline-none rounded-md"
                        placeholder="e.g. Reformation"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        required
                    />
                </div>
                

                    <div>
                    <label className="block text-sm font-medium mb-1 text-black">What draws you this reference brand?</label>
                    <textarea
                        className="w-full border border-black bg-transparent px-4 py-2 text-black placeholder-black/50 focus:outline-none rounded-md"
                        rows={3}
                        placeholder="Fit, materials, silhouettes, etc."
                        value={likes}
                        onChange={(e) => setLikes(e.target.value)}
                        required
                    />
                  </div>
{/*
                  <div className="flex  space-x-20">
                  <div className="flex flex-col space-y-2">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={brandPreference.fit}
                                onChange={() =>
                                    setBrandPreference((prev) => ({ ...prev, fit: !prev.fit }))
                                }
                                className="accent-white"
                            />
                            <span className="ml-2 text-sm">Fit</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                checked={brandPreference.price}
                                onChange={() =>
                                    setBrandPreference((prev) => ({ ...prev, price: !prev.price }))
                                }
                                className="accent-white"
                            />
                            <span className="ml-2 text-sm">Price</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                checked={brandPreference.material}
                                onChange={() =>
                                    setBrandPreference((prev) => ({ ...prev, material: !prev.material}))
                                }
                                className="accent-white"
                            />
                            <span className="ml-2 text-sm">Material</span>
                        </label>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                checked={brandPreference.aestheic}
                                onChange={() =>
                                    setBrandPreference((prev) => ({ ...prev, aesthetic: !prev.aesthetic }))
                                }
                                className="accent-white"
                            />
                            <span className="ml-2 text-sm">Aesthetic</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                checked={brandPreference.brand_ethics}
                                onChange={() =>
                                    setBrandPreference((prev) => ({ ...prev, brand_ethics: !prev.brand_ethics }))
                                }
                                className="accent-white"
                            />
                            <span className="ml-2 text-sm">Brand Ethics</span>
                        </label>
                    </div>
                    </div>
                </div>
               <div>
                    <label className="block text-sm font-medium mb-1">Tell us a little more about why this brand resonates with you?</label>
                    
                    <input
                    className="w-full border border-white bg-transparent px-4 py-2 text-white placeholder-white/50 focus:outline-none rounded-md"
                    placeholder="Preferred brand (optional)"
                    value={sharedPrefernce}
                    onChange={(e) => setSharedPrefernece(e.target.value)}
                />

                </div>
                */}

                <div className="flex items-center justify-between gap-4">
                   {/*
                    <label className="block w-full">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files[0])}
                            className="w-full file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-gray-100"
                        />
                    </label>
*/}
                    
                    <button
                    type = "button"
                    onClick={onBack}
                   className="px-4 py-2 text-l font-bold text-white bg-[#b89d7b] hover:bg-[#a98a67] active:bg-[#8c7152] rounded shadow transition duration-200 rounded-md">
                      ← Back
                   </button>
                   <button
                        type="submit"
                        className="px-4 py-2 text-l font-bold text-white bg-[#b89d7b] hover:bg-[#a98a67] active:bg-[#8c7152] rounded shadow transition duration-200 rounded-md"
                    >
                        Next →
                    </button>
                </div>
            </form>
        </div>
    );
}
