import React, { useState } from "react";
import ImageUploader from "../ImageUploader";

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
    const[materialPreferenceOptions,setMaterialPreferenceOptions]= useState({
        yes:false,
        no:false
    });
    const[category,setCategory] = useState("")
    const [image, setImage] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        // ✅ No backend call, just move to next step
        onNext();
    };

    return (
        <div className="max-w-2xl mx-auto p-8 border border-white bg-white/60 backdrop-blur-md rounded-lg shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-8 text-white font-sans">
                <div>
                    <p className=" ml-5 text-sm text-black mb-2">
                        Step 3 of 4
                    </p>
                    <h2 className="text-3xl font-normal font-inter text-black">Product Focus</h2>
                    {/*<p className="text-sm text-white/70 mt-1 font-[Garamond]">
                        Let’s get into the details of your first piece.
                    </p>
                    */}
                </div>
                <div>
                <label className="block text-sm font-medium mb-1 text-black">What are you creating first?</label>
                <input
                    className="w-full border border-black bg-transparent px-4 py-2 text-black placeholder-black/50 focus:outline- rounded-md"
                    placeholder="Type a clothing item to begin "
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    required
                />
                <div className="pt-6">
                    <label className="block text-sm font-medium mb-1 text-black">Is this a foundational or statement piece?</label>
                    <div className="flex space-x-32 pt-4">
  <label className="flex items-center space-x-4">
    <input
      type="radio"
      name="category"
      value="Foundational"
      checked={category === "Foundational"}
      onChange={(e) => setCategory(e.target.value)}
      className="accent-[#b89d7b]"
    />
    <span className="text-sm text-[#333]">Foundational</span>
  </label>

  <label className="flex items-center space-x-4">
    <input
      type="radio"
      name="category"
      value="Statement"
      checked={category === "Statement"}
      onChange={(e) => setCategory(e.target.value)}
      className="accent-[#b89d7b]"
    />
    <span className="text-sm text-[#333]">Statement</span>
  </label>
  </div>
</div>
</div>
                <div>
                <label className="block text-sm font-medium mb-1 text-black">Do you have visual preference?</label>
                {/*<input
                    className="w-full border border-white bg-transparent px-4 py-2 text-white placeholder-white/50 focus:outline-none"
                    placeholder="Target sale price ($)"
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    required
                />
                */}
                <ImageUploader/>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-black">How do you want someone to feel wearing it?</label>
                 <textarea
                    className="w-full border border-black bg-transparent px-4 py-2 text-black placeholder-black/50 focus:outline-none rounded-md"
                    placeholder="e.g., Confident, empowered, elegant..."
                    type="text"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                />
                </div>
                {/*<div>
                     <label className="block text-sm font-medium mb-1"></label>
                <textarea
                    className="w-full border border-white bg-transparent px-4 py-2 text-white placeholder-white/50 focus:outline-none"
                    placeholder="Any key features? (color, fit, construction, etc.)"
                    value={keyFeatures}
                    onChange={(e) => setKeyFeatures(e.target.value)}
                />
                </div>

               <div className="-mt-4">
               <label className="block text-sm font-medium mb-1 text-white"> Do you know what material you would like to use?</label>

                <div className="space-x-6">
   
                  <label className="inline-flex items-center">
            <input
            type="checkbox"
           name="materialChoice"
          checked={materialPreferenceOptions === 'yes'}
          onChange={() => setMaterialPreferenceOptions('yes')}
          className="accent-white"
          
      />
      <span className="ml-2 text-sm text-white">Yes</span>
    </label>

    
    <label className="inline-flex items-center">
      <input
        type="checkbox"
        name="materialChoice"
        checked={materialPreferenceOptions === 'no'}
        onChange={() => setMaterialPreferenceOptions('no')}
        className="accent-white"
      />
      <span className="ml-2 text-sm text-white">No</span>
    </label>
  </div>

  
  {materialPreferenceOptions === 'yes' && (
    <input
      className="w-full mt-4 border border-white bg-transparent px-4 py-2 text-white placeholder-white/50 focus:outline-none"
      placeholder="Preferred material"
      value={materialPreference}
      onChange={(e) => setMaterialPreference(e.target.value)}
      required
    />
  )}
</div>

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
