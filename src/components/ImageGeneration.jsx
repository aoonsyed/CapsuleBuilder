import { color } from "framer-motion";
import { useState,useEffect } from "react";

function ImageGeneration({onBack}) {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [hexColors, setHexColors] = useState([]);
  const [suggestions,setSuggestion] = useState([]);
  const[construction,setConstruction]=useState(" ");
  //to format text for use as a prompt for image
  const formatForImage = (rawText) => {
    const getSection = (label) => {
      const regex = new RegExp(
        `\\*\\*\\s*${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\*\\*\\s*\\n*([\\s\\S]*?)(?=\\n\\s*\\*\\*|$)`,
        "i"
      );
      const match = rawText.match(regex);
      return match ? match[1].trim() : "";
    };

    const trimText = (text, max = 200) =>
      text?.length > max ? text.slice(0, max) + "..." : text;

    const materials = trimText(getSection("Materials").replace(/\n/g, ", "));
    const colors = getSection("Color Palette with HEX Codes").replace(/\n/g, ", ");
    const suggestions = trimText(getSection("Suggested Items").replace(/\n/g, ","));
    const productType = trimText(localStorage.getItem("productType") || "clothing");
    const construction = trimText(getSection("Construction Notes").replace(/\n/g, " , "));

    return `Create a high-resolution, realistic image of a ${productType} made from ${materials}, presented in shades such as ${colors}. The ${productType} should be displayed neatly on a hanger or worn by a mannequin, with a clean, neutral background to highlight the product.

    Focus exclusively on the ${productType} itself—avoid branding, text, or background distractions.

    Design suggestions to incorporate: ${suggestions}.
    Construction details to consider (do not show in the image): ${construction}.

    Note: The last two parts are for context only. Do not include any text or instructions in the image.`;

};

//to get the colors from a prompt


  const sanitizeColorSection = (rawText) => {
    return rawText.replace(
      /(in colors such as|the following are shades of.*?):/i,
      "**Color Palette with HEX Codes**\n"
    );
  };

  const extractHexColors = (rawText) => {
    const sectionRegex = /\*\*Color Palette with HEX Codes\*\*\n([\s\S]*?)(?=\n\*\*|$)/;
    const match = rawText.match(sectionRegex);
    const section = match ? match[1] : "";

  const hexColors = [];
  
  // Pattern 1: Name (HEX) - e.g., "Black (#000000)"
  const pattern1 = /([a-zA-Z\s]+)\s*\(#?([0-9A-Fa-f]{6})\)/gi;
  
  // Pattern 2: Numbered/bulleted lists - e.g., "1. Black - #000000"
  const pattern2 = /(?:[-*•]\s*|\d+\.\s*)([a-zA-Z\s]+)\s*[-:]\s*(?:HEX Code\s*)?#?([0-9A-Fa-f]{6})/gi;
  
  // Pattern 3: Simple format - e.g., "Black: #000000" or "Black #000000"
  const pattern3 = /([a-zA-Z\s]+)[\s:]\s*#?([0-9A-Fa-f]{6})/gi;
  
  // Pattern 4: Hex first - e.g., "#000000 Black" or "#000000: Black"
  const pattern4 = /#?([0-9A-Fa-f]{6})[\s:]+([a-zA-Z\s]+)/gi;
  
  // Pattern 5: Just hex codes - e.g., "#000000, #FF0000"
  const pattern5 = /#?([0-9A-Fa-f]{6})/gi;

  // Try each pattern in order of preference
  const patterns = [
    { regex: pattern1, nameIndex: 1, hexIndex: 2 },
    { regex: pattern2, nameIndex: 1, hexIndex: 2 },
    { regex: pattern3, nameIndex: 1, hexIndex: 2 },
    { regex: pattern4, nameIndex: 2, hexIndex: 1 }
  ];

    let foundColors = false;

    for (const pattern of patterns) {
      const { regex, nameIndex, hexIndex } = pattern;
      let m;
      const tempColors = [];

      while ((m = regex.exec(section)) !== null) {
        const name = m[nameIndex].trim();
        const hex = "#" + m[hexIndex].toUpperCase();
        tempColors.push([name, hex]);
      }

      if (tempColors.length > 0) {
        hexColors.push(...tempColors);
        foundColors = true;
        break;
      }

      regex.lastIndex = 0;
    }

    if (!foundColors) {
      let colorIndex = 1;
      let m;
      while ((m = pattern5.exec(section)) !== null) {
        const hex = "#" + m[1].toUpperCase();
        const name = `Color ${colorIndex}`;
        hexColors.push([name, hex]);
        colorIndex++;
      }
    }

    return hexColors;
  };

  const extractSuggestedItems = (rawText) => {
    const match = rawText.match(
      /(?:\*\*)?Suggested Items(?:\*\*)?\s*([\s\S]*?)(?=\n{2,}|^\s*$|\n(?:\*\*|\#)|$)/im
    );
    if (!match) return [];

    const section = match[1].trim();
    const bulletItems = section
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => /^[-*•]\s*/.test(line))
      .map((line) => line.replace(/^[-*•]\s*/, "").trim());

    if (bulletItems.length > 0) {
      return bulletItems;
    }
    return section
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  const getConstructionNotes = (rawText) => {
    const sectionRegex = /\*\*Construction Notes\*\*\n([\s\S]*?)(?=\n\*\*|$)/;
    const match = rawText.match(sectionRegex);
    return match ? match[1].trim() : "";
  };

  // --------- Effect to generate image ---------
  useEffect(() => {
    const generateImage = async () => {
      setLoading(true);
      try {
        const rawText = localStorage.getItem("answer") || "";
        const visualPrompt = formatForImage(rawText);
        const basePrompt = `A realistic, photographic fashion image. ${visualPrompt} No people, only full clothing. No sketches, only real textures and folds.`;
        const imagePrompt =
          basePrompt.length > 1000 ? basePrompt.slice(0, 997) + "..." : basePrompt;

        // extract colors, suggestions, notes
        const sanitized = sanitizeColorSection(rawText);
        setHexColors(extractHexColors(sanitized));
        setSuggestion(extractSuggestedItems(rawText));
        setConstruction(getConstructionNotes(rawText));

        // call backend API
        const response = await fetch("/api/generateImage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: imagePrompt }),
        });

        const data = await response.json();
        setImageUrl(data?.data?.[0]?.url || "");
        if (data?.data?.[0]?.url) {
  localStorage.setItem("generatedImageUrl", data.data[0].url);
}

      } catch (err) {
        console.error("Image generation failed:", err);
      } finally {
        setLoading(false);
      }
    };

    generateImage();
  }, []);

if (loading) {
    return <div className="flex flex-col items-center justify-center min-h-screen text-black/70 font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black/70 mb-4"></div>

                In progress...
            </div>
  }
  return (
    <div className="bg-[#EDEDED] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 mb-8">
        {/**
        <button
          type="button"
          onClick={onBack}
          className="pb-1 text-xl font-extrabold text-[#3A3A3D]"
        >
          ←
        </button>

  */}
   
      
             <button
           type = "button"
                    onClick={onBack}
                   className=" pb-1 text-xl font-extrabold text-[#3A3A3D] border-white justify-start items-start">

               ←
           </button>
           
        <h1 className="text-[#333333] text-[32pt] font-serif leading-tight mb-6 mt-8">
          Your Curated Capsule
        </h1>

      
        <div className="flex flex-col items-center justify-center gap-6 p-6">
          
          {/* Row 1 */}
          <div className="flex gap-4">
            {/* Suggested Image */}
            <div className="bg-white rounded-2xl shadow-lg border border-[#E4E4E4] w-[450px] overflow-hidden flex flex-col">
              <h1 className="text-xl font-[Helvetica] font-semibold mb-4 text-black px-7 py-4">
                Suggested Image
              </h1>
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Capsule Preview"
                  className="w-auto h-[300px] object-contain rounded-t-2xl"
                />
              )}
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              {/* Suggested Product */}
              <div className="bg-white rounded-2xl shadow-lg border border-[#E4E4E4] w-[450px] h-[220px] overflow-hidden p-4">
                <h1 className="text-xl font-[Helvetica] font-semibold mb-4 text-black">
                  Suggested Product
                </h1>
                <div className="flex flex-wrap gap-4">
                  {suggestions.map((item, index) => (
                    <div
                      key={index}
                      className="w-[150px] h-[60px] bg-[#EDEDED] rounded-2xl p-4 shadow text-black flex items-center justify-center text-sm font-[Helvetica]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Color Palette */}
              <div className="bg-white rounded-2xl shadow-lg border border-[#E4E4E4] w-[450px] h-[150px] overflow-hidden p-4">
                <h1 className="text-xl font-[Helvetica] font-semibold mt-2 mb-2 text-black">Suggested Color Palette</h1>
                <div className="flex gap-4 p-4">
                  {hexColors.map(([name, hex]) => (
                    <div
                      key={name}
                      title={name}
                      className="w-10 h-10 rounded-full border "
                      style={{ backgroundColor: hex }}
                    >
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="mr-10 flex gap-6">
           
            <div className=" bg-white rounded-2xl shadow-lg border border-[#E4E4E4] w-[450px] h-[150px] overflow-hidden p-4">
              <h1 className="text-xl font-[Helvetica] font-semibold mt-2 mb-2 text-black">Suggested Color Palette</h1>
              <div className="flex gap-4 p-4">
                {hexColors.map(([name, hex]) => (
                  <div
                    key={name}
                    title={name}
                    className="w-10 h-10 rounded-full border border-gray-300"
                    style={{ backgroundColor: hex }}
                  ></div>
                ))}
              </div>
            </div>

            
            <div className="bg-white rounded-2xl shadow-lg border border-[#E4E4E4] w-[400px] h-auto overflow-hidden p-4">
              <h1 className="text-xl font-[Helvetica] font-semibold mt-2 mb-2 text-black">Construction Notes</h1>
              <div className="text-black font-[Helvetica] text-sm">
                {construction}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageGeneration;
