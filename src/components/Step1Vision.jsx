import React, { useState } from "react";

export default function Step1Vision({ onNext, email = "demo@example.com" }) {
    const [pieces, setPieces] = useState("");
    const [types, setTypes] = useState([]);
    const [priceRange, setPriceRange] = useState("");

    const toggleType = (type) => {
        setTypes((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // No backend call, just go to next step
        onNext();
    };

    return (
        <div className="max-w-md mx-auto p-8 border border-white bg-black/40 backdrop-blur-md rounded-lg shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-8 text-white font-sans">
                <div>
                    <h1 className="text-3xl font-normal font-[Garamond]">Welcome</h1>
                    <p className="text-sm text-white/70 mt-1 font-[Garamond] ">
                        Let’s begin defining your capsule collection
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">How many pieces?</label>
                    <select
                        className="w-full border border-white bg-transparent px-4 py-2 text-white focus:outline-none appearance-none rounded-md"
                        value={pieces}
                        onChange={(e) => setPieces(e.target.value)}
                        required
                    >
                        <option className="text-black" value="">Select...</option>
                        <option className="text-black" value="4">4 pieces</option>
                        <option className="text-black" value="6">6 pieces</option>
                        <option className="text-black" value="8">8 pieces</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">What types of items?</label>
                    <div className="flex flex-wrap gap-2">
                        {["Tops", "Bottoms", "Dresses", "Outerwear"].map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => toggleType(type)}
                                className={`px-4 py-2 text-sm border transition font-medium rounded-md
                                    ${types.includes(type)
                                        ? "bg-white text-black border-white"
                                        : "bg-transparent text-white border-white"
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Price range per item:</label>
                    <select
                        className="w-full border border-white bg-transparent px-4 py-2 text-white focus:outline-none appearance-none rounded-md"
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value)}
                        required
                    >
                        <option className="text-black" value="">Select range...</option>
                        <option className="text-black" value="$50–150">$50–150</option>
                        <option className="text-black" value="$100–250">$100–250</option>
                        <option className="text-black" value="$250+">$250+</option>
                    </select>
                </div>

                <div>
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
