import React, { useEffect, useState } from "react";

export default function Step4Suggestions({ email, onNext,onBack }) {
    const [suggestions, setSuggestions] = useState(null);
    const [loading, setLoading] = useState(true);
    const colorData = [
                     { hex: "#49A078", name: "Jungle Green" },
                       { hex: "#FFA66D", name: "Mango Orange" },
                     { hex: "#EF5DA8", name: "Hibiscus Pink" },
                 ];
    useEffect(() => {
        // Simulate async fetch delay
        const timeout = setTimeout(() => {
            setSuggestions({
                summary: `• 6 pieces
                 • Dresses category
                 • $100-$250 per piece`,
                fabrics: "Crepe de Chine, Linen blends",
                saleprices : `$100 remains a solid and competitive target based on: 
                           •  Loleia’s pricing ($95–$110 per set) 
                           •  Eco swim fabrics ($8–$15/yd) 
                           •  Simple silhouette but added charm detail 
                          → Final Suggested Sales Price: $100 `,
                cNotes: "Avoid bias cut, Add lining for drape ",
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
             <div className="flex flex-col items-center justify-center min-h-screen text-black/70 font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black/70 mb-4"></div>

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
        <div className="max-w-2xl mx-auto mt-10 p-8 border border-white bg-white/60 backdrop-blur-md rounded-lg shadow-lg font-sans text-white">
            <h2 className="text-3xl font-normal mb-4 font-inter text-black text-black">AI-Powered Suggestions</h2>
            {/*<p className="text-sm text-white/70 mb-8 font-[Garamond]">
                Based on your clothing item, here’s what we recommend:
            </p>*/}
           <div className="mb-6">
                <h3 className="text-base font-semibold mb-2 text-black">Capsule Summary:</h3>
                <p className=" text-sm text-left rounded whitespace-pre-line text-black">
                    {suggestions.summary}
                </p>
            </div>
           <div className="mb-6 ">
  <h3 className="text-base font-semibold mb-2 text-black">Suggested Fabrics:</h3>
  <p className=" text-sm text-left rounded whitespace-pre-line w-full border border-[#b89d7b] bg-transparent px-4 py-2 text-black placeholder-black/50 focus:outline- rounded-md">
                    {suggestions.fabrics}
                </p>
            </div>

            
           
        <div className="mb-6">
  <h3 className="text-base font-semibold mb-2 text-black">Recommended Colors:</h3>

  <div className="flex flex-wrap gap-6">
    {colorData.map((color, index) => (
      <div key={index} className="flex items-center space-x-2">
        <div
          className="w-8 h-8 rounded-md border border-gray-300"
          style={{ backgroundColor: color.hex }}
        ></div>
        <span className="text-sm text-black">{color.name}</span>
      </div>
    ))}
  </div>
</div>


             <div className="mb-6">
                <h3 className="text-base font-semibold mb-2 text-black">Construction Notes:</h3>
                <p className=" text-sm text-left rounded whitespace-pre-line text-black">
                    {suggestions.cNotes}
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
                    onClick={onNext}
                   className="px-4 py-2 text-l font-bold text-white bg-[#b89d7b] hover:bg-[#a98a67] active:bg-[#8c7152] rounded shadow transition duration-200 rounded-md">
                      Generate Tech Pack
                   </button>
                   <button
                onClick={onNext}
                className="px-4 py-2 text-l font-bold text-white bg-[#b89d7b] hover:bg-[#a98a67] active:bg-[#8c7152] rounded shadow transition duration-200 rounded-md"
            >
                Estimate Cost
            </button>
                   </div>
        </div>
    );
}
