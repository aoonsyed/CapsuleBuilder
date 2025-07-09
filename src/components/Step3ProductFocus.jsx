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
    const[materialPreferenceOptions,setMaterialPreferenceOptions]= useState({
        yes:false,
        no:false
    });
    const [image, setImage] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        // ✅ No backend call, just move to next step
        onNext();
    };

    return (
        <div className="max-w-2xl mx-auto p-8 border border-white bg-black/60 backdrop-blur-md rounded-lg shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-8 text-white font-sans">
                <div>
                    <h2 className="text-3xl font-normal font-[Garamond]">Product Focus</h2>
                    <p className="text-sm text-white/70 mt-1 font-[Garamond]">
                        Let’s get into the details of your first piece.
                    </p>
                </div>
                <div>
                <label className="block text-sm font-medium mb-1">What article of clothing would you like to develop first?</label>
                <input
                    className="w-full border border-white bg-transparent px-4 py-2 text-white placeholder-white/50 focus:outline-none"
                    placeholder="Type a clothing item to begin "
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    required
                />
</div>
                <div>
                <label className="block text-sm font-medium mb-1">At what price would you like to sell this item?</label>
                <input
                    className="w-full border border-white bg-transparent px-4 py-2 text-white placeholder-white/50 focus:outline-none"
                    placeholder="Target sale price ($)"
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    required
                />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">How many of this product are you looking to produce?</label>
                 <input
                    className="w-full border border-white bg-transparent px-4 py-2 text-white placeholder-white/50 focus:outline-none"
                    placeholder="Quantity to produce"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                />
                </div>
                <div>
                     <label className="block text-sm font-medium mb-1">Are there any key features of your product?</label>
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
