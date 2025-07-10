import React, { useState } from "react";

export default function Step1Vision({ onNext, email = "demo@example.com" }) {
    const [pieces, setPieces] = useState("");
    const [types, setTypes] = useState([]);
    const [priceRange, setPriceRange] = useState("");
    const [materialPreference, setMaterialPreference] = useState("");
    const [materialUse, setMaterialUse] = useState({
                dresses: false,
                pants: false,
                tops: false,
                outwear:false,
                activewear:false,
                swim:false
            });
    const[price,setPrice]= useState("")        

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
        <div className="max-w-md mx-auto p-8 border border-white bg-white/60 backdrop-blur-md rounded-lg shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-8 text-white font-sans">
                <div>
                    <h1 className="text-3xl font-inter text-black">Line Strategy</h1>
                    {/*<p className="text-sm text-white/70 mt-1 font-[Garamond] ">
                        Let’s begin defining your capsule collection
                    </p>*/}
                </div>

                <div>
                    <label className="pb-4 block text-sm font-medium mb-1 text-black">What category are you designing?</label>
                    {/*<select
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
                    */}
                    
                  <div className="flex  space-x-20">
                  <div className="flex flex-col space-y-2">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={materialUse.dresses}
                                onChange={() =>
                                    setMaterialUse((prev) => ({ ...prev, dresses: !prev.dresses }))
                                }
                                className="accent-[#b89d7b]"
                            />
                            <span className="ml-2 text-sm text-black">Dresses</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                checked={materialUse.tops}
                                onChange={() =>
                                    setMaterialUse((prev) => ({ ...prev, tops: !prev.tops }))
                                }
                                className="accent-[#b89d7b]"
                            />
                            <span className="ml-2 text-sm text-black">Tops</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                checked={materialUse.pants}
                                onChange={() =>
                                    setMaterialUse((prev) => ({ ...prev, pants: !prev.pants}))
                                }
                                className="accent-[#b89d7b]"
                            />
                            <span className="ml-2 text-sm text-black">Pants</span>
                        </label>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                checked={materialUse.outwear}
                                onChange={() =>
                                    setMaterialUse((prev) => ({ ...prev, outwear: !prev.outwear }))
                                }
                                className="accent-[#b89d7b]"
                            />
                            <span className="ml-2 text-sm text-black">Outwear</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                checked={materialUse.activewear}
                                onChange={() =>
                                    setMaterialUse((prev) => ({ ...prev, activewear: !prev.activewear}))
                                }
                                className="accent-[#b89d7b]"
                            />
                            <span className="ml-2 text-sm text-black">Activewear</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                checked={materialUse.swim}
                                onChange={() =>
                                    setMaterialUse((prev) => ({ ...prev, swim: !prev.swim}))
                                }
                                className="accent-[#b89d7b]"
                            />
                            <span className="ml-2 text-sm text-black">Swim</span>
                        </label>
                    </div>
                    </div>
                </div>


               {/* <div>
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
                */}

                <div>
                    <label className="block text-sm font-medium mb-1 text-black">How many pieces will be in your capsule?</label>
                    {/*<select
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
                    */}
                    <input
                        className="w-full border border-black bg-transparent px-4 py-2 text-black placeholder-black/50 focus:outline-none rounded-md"
                        type = "number"
                        placeholder="No. of pieces"
                        value={pieces}
                        onChange={(e) => setPieces(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-black">How many pieces will be in your capsule?</label>
                    <div className="space-y-2">
  <label className="flex items-center space-x-2">
    <input
      type="radio"
      name="price"
      value="under_100"
      checked={price === "under_100"}
      onChange={(e) => setPrice(e.target.value)}
      className="accent-[#b89d7b]"
    />
    <span className="text-sm text-[#333]">Under $100</span>
  </label>

  <label className="flex items-center space-x-2">
    <input
      type="radio"
      name="price"
      value="100_250"
      checked={price === "100_250"}
      onChange={(e) => setPrice(e.target.value)}
      className="accent-[#b89d7b]"
    />
    <span className="text-sm text-[#333]">$100–$250</span>
  </label>

  <label className="flex items-center space-x-2">
    <input
      type="radio"
      name="price"
      value="250_plus"
      checked={price === "250_plus"}
      onChange={(e) => setPrice(e.target.value)}
      className="accent-[#b89d7b]"
    />
    <span className="text-sm text-[#333]">Over $250</span>
  </label>
</div>

                    
                    
                    
                 </div>
                <div>
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
