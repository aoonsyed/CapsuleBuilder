import React, { useState } from "react";

export default function Step2Inspiration({ email = "demo@example.com", onNext,onBack }) {
    const [brand, setBrand] = useState("");
    const [likes, setLikes] = useState("");
    const [image, setImage] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        // ✅ No backend call — just move to the next step
        onNext();
    };

    return (
        <div className="max-w-2xl mx-auto p-8 border border-white bg-black/40 backdrop-blur-md rounded-lg shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-8 text-white font-sans">
                <div>
                    
                    <h1 className="text-3xl font-normal font-[Garamond]">Brand Inspiration</h1>
                    <p className="text-sm text-white/70 mt-1 font-[Garamond]">Tell us who you admire and why.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">What brand inspires you?</label>
                    <input
                        type="text"
                        className="w-full border border-white bg-transparent px-4 py-2 text-white placeholder-white/50 focus:outline-none"
                        placeholder="e.g. Reformation"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">What do you like about them?</label>
                    <textarea
                        className="w-full border border-white bg-transparent px-4 py-2 text-white placeholder-white/50 focus:outline-none"
                        rows={3}
                        placeholder="Fit, materials, silhouettes, etc."
                        value={likes}
                        onChange={(e) => setLikes(e.target.value)}
                        required
                    />
                </div>
              
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
