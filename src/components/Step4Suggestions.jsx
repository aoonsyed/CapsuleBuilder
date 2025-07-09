import React, { useEffect, useState } from "react";

export default function Step4Suggestions({ email, onNext,onBack }) {
    const [suggestions, setSuggestions] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate async fetch delay
        const timeout = setTimeout(() => {
            setSuggestions({
                summary: "A minimal yet versatile wardrobe of elevated basics.",
                fabricAdvice: `Cotton isn’t ideal for swimwear due to its absorbency, limited stretch, and poor performance in chlorinated water. A recycled nylon-spandex blend (like ECONYL® or REPREVE®) is a better option and offers:
                 • Eco-friendly sourcing
                 • Excellent stretch and recovery
                 • Compatibility with vivid tropical prints
                 • Quick drying and long-lasting wear`,
                colors: `Inspired by Loleia’s tropical energy and your palm-themed details: 
                      • #49A078 – Jungle Green 
                      • #FFA66D – Mango Orange 
                      • #EF5DA8 – Hibiscus Pink  `,
                fabrics: ["Organic Cotton", "Linen", "Modal", "Recycled Polyester"],
                saleprices : `$100 remains a solid and competitive target based on: 
                           •  Loleia’s pricing ($95–$110 per set) 
                           •  Eco swim fabrics ($8–$15/yd) 
                           •  Simple silhouette but added charm detail 
                          → Final Suggested Sales Price: $100 `,
                costProduction: "$24 estimated production cost per unit ",
                companionItems:`Build a versatile collection and reduce fabric waste with:
                    • Triangle Halter Top
                    • Cheeky Bottom with Side Rings
                    • Reversible Swim Bandana or Scarf`,
            });
            setLoading(false);
        }, 1000); // Simulate delay

        return () => clearTimeout(timeout);
    }, []);

    if (loading) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen text-white/70 font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white/70 mb-4"></div>

                In progress...
            </div>
        );
    }

    const colorList = Array.isArray(suggestions.colors)
        ? suggestions.colors
        : suggestions.colors?.split(",") || [];

    const fabricList = Array.isArray(suggestions.fabrics)
        ? suggestions.fabrics
        : suggestions.fabrics?.split(",") || [];

    return (
        <div className="max-w-2xl mx-auto mt-10 p-8 border border-white bg-black/60 backdrop-blur-md rounded-lg shadow-lg font-sans text-white">
            <h2 className="text-3xl font-normal mb-4 font-[Garamond]">Smart Suggestions</h2>
            <p className="text-sm text-white/70 mb-8 font-[Garamond]">
                Based on your clothing item, here’s what we recommend:
            </p>

           <div className="mb-6">
  <h3 className="text-base font-semibold mb-2">Suggested Material:</h3>
  <div className=" text-sm text-white space-y-1">
    {suggestions.fabricAdvice.split('\n').map((line, index) =>
      line.trim().startsWith('•') ? (
        <div key={index}>
          • <span className="font-bold">{line.replace('•', '').trim()}</span>
        </div>
      ) : (
        <p key={index} className="whitespace-pre-line">{line}</p>
      )
    )}
  </div>
</div>

            <div className="mb-6">
                <h3 className="text-base font-semibold mb-2">Suggested Sales Price:</h3>
                <p className=" text-sm text-left rounded whitespace-pre-line">
                    {suggestions.saleprices}
                </p>
            </div>
            <div className="mb-6">
                <h3 className="text-base font-semibold mb-2">Estimated Cost Production:</h3>
                <p className=" text-sm text-left rounded whitespace-pre-line">
                    {suggestions.costProduction}
                </p>
            </div>
            <div className="mb-6">
                <h3 className="text-base font-semibold mb-2">Suggested Color Palette:</h3>
                <p className=" text-sm text-left rounded whitespace-pre-line">
                    {suggestions.colors}
                </p>
            </div>

           <div className="mb-6">
                <h3 className="text-base font-semibold mb-2">Suggested Companion Items:</h3>
                <p className=" text-sm text-left rounded whitespace-pre-line">
                    {suggestions.companionItems}
                </p>
            </div>
           {/*} 
            <div className="mb-6">
                <h3 className="text-base font-semibold mb-2">Recommended Fabrics</h3>
                <ul className="list-disc pl-5 text-sm space-y-1">
                    {fabricList.map((fabric, i) => (
                        <li key={i}>{fabric.trim()}</li>
                    ))}
                </ul>
            </div>

            <div className="mb-10">
                <h3 className="text-base font-semibold mb-2">Construction Tips</h3>
                <p className="text-sm">{suggestions.tips}</p>
            </div>
*/}
            <div className="flex items-center justify-between gap-4">
            <button
                    type = "button"
                    onClick={onBack}
                   className="px-4 py-2 text-sm font-medium text-white border border-white bg-transparent hover:bg-white hover:text-black transition duration-200 rounded">
                      ← Back
                   </button>
                   <button
                onClick={onNext}
                className="px-6 py-2 text-sm font-medium text-white border border-white bg-transparent hover:bg-white hover:text-black transition duration-200 rounded"
            >
                Next →
            </button>
                   </div>
        </div>
    );
}
