import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Toaster, toast } from 'sonner';
import { useSelector } from 'react-redux';

export default function Step4Suggestions({ onNext, onBack }) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(true);

  const formData = useSelector((state) => state.form);
  const savedAnswers = JSON.parse(localStorage.getItem('questionnaireAnswers'));
  const {
    idea,
    localBrand,
    brand2,
    sharedPrefernce,
    productType,
    targetPrice,
    quantity,
    category,
    keyFeatures,
    materialPreferenceOptions,
    manufacturingPreference,
  } = formData;

  // Debug logging for form data
  console.log('Form data from Redux:', formData);

  const title = localBrand?.trim()
    ? `${localBrand.trim()} ${productType?.trim()}`
    : `Your ${productType?.trim()}`;

 // Extract colors from the "Color Palette" markdown/text the AI returns
  const extractHexColors = (rawText) => {
    const sectionRegex = /\*\*Color Palette with HEX Codes\*\*\n([\s\S]*?)(?=\n\*\*|$)/;
    const match = rawText?.match(sectionRegex);
    const section = match ? match[1] : (rawText || '');

    const hexColors = [];

    const pattern1 = /([a-zA-Z\s]+)\s*\(#?([0-9A-Fa-f]{6})\)/gi;
    const pattern2 =
      /(?:[-*•]\s*|\d+\.\s*)([a-zA-Z\s]+)\s*[-:]\s*(?:HEX Code\s*)?#?([0-9A-Fa-f]{6})/gi;
    const pattern3 = /([a-zA-Z\s]+)[\s:]\s*#?([0-9A-Fa-f]{6})/gi;
    const pattern4 = /#?([0-9A-Fa-f]{6})[\s:]+([a-zA-Z\s]+)/gi;
    const pattern5 = /#?([0-9A-Fa-f]{6})/gi;

    const patterns = [
      { regex: pattern1, nameIndex: 1, hexIndex: 2 },
      { regex: pattern2, nameIndex: 1, hexIndex: 2 },
      { regex: pattern3, nameIndex: 1, hexIndex: 2 },
      { regex: pattern4, nameIndex: 2, hexIndex: 1 },
    ];

    let foundColors = false;

    for (const pattern of patterns) {
      const { regex, nameIndex, hexIndex } = pattern;
      let m;
      const tempColors = [];

      while ((m = regex.exec(section)) !== null) {
        const name = m[nameIndex].trim();
        const hex = '#' + m[hexIndex].toUpperCase();
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
        const hex = '#' + m[1].toUpperCase();
        const name = `Color ${colorIndex}`;
        hexColors.push([name, hex]);
        colorIndex++;
      }
    }

    return hexColors;
  };

  // Remove trailing dashes and similar AI artifacts from section text
  const sanitizeSectionText = (text) => {
    if (!text || typeof text !== 'string') return text;
    let s = text.trim();
    
    // Remove all types of dashes (em dash —, en dash –, hyphen -, and similar characters)
    // Remove trailing lines that are only dashes, underscores, or whitespace
    s = s.replace(/\n[\s\-–—_]*$/g, '');
    
    // Remove trailing dashes (all types) with optional whitespace at end of each line
    s = s.replace(/[\s\-–—]+$/gm, '');
    
    // Remove trailing dash/hyphen/underscore at end of last line (after all line breaks)
    s = s.replace(/[\s\-–—_]+$/, '');
    
    // Remove any standalone dash lines (lines that are only dashes)
    s = s.replace(/^[\s\-–—_]+\n?$/gm, '');
    
    // Final trim
    return s.trim();
  };

  const parseAIResponse = (text) => {
  const getSection = (label) => {
    // Try multiple patterns to catch different formatting
    const patterns = [
      new RegExp(`\\*\\*${label}\\*\\*\\s*:?\\s*\\n([\\s\\S]*?)(?=\\n\\*\\*|$)`, 'i'),
      new RegExp(`\\*\\*${label}\\*\\*\\s*([\\s\\S]*?)(?=\\n\\*\\*|$)`, 'i'),
      new RegExp(`${label}\\s*:?\\s*\\n([\\s\\S]*?)(?=\\n\\*\\*|$)`, 'i'),
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].trim()) {
        return sanitizeSectionText(match[1].trim());
      }
    }
    return '';
  };

  const result = {
    materials: getSection('Materials'),
    colors: getSection('Color Palette'),
    saleprices: getSection('Sales Price'),
    productionCosts: getSection('Cost Production'),
    companionItems: getSection('Companion Items'),
    yieldConsumption: getSection('Yield & Consumption Estimates'),
    leadTime: getSection('Production Lead Time Estimate'),
    marketExamples: getSection('Comparable Market Examples'),
    targetInsight: getSection('Target Consumer Insight'),
    marginAnalysis: getSection('Margin Analysis'),
    pricing: getSection('Wholesale vs. DTC Pricing') || getSection('Wholesale vs DTC Pricing') || getSection('Wholesale vs DTC'),
  };

  // Debug logging for each section
  console.log('Section parsing results:', result);
  return result;
};


const generatePrompt = () => {
  return `
    Act as a fashion design assistant. Based on the following details:
    - Idea: ${idea}
    - Brand: ${brand2}
    - Shared Preferences: ${sharedPrefernce}
    - Product Type: ${productType}
    - Target Price: ${targetPrice}
    - Quantity: ${quantity}
    - Category: ${category}
    - Key Features: ${keyFeatures}
    - Material Preferences: ${JSON.stringify(materialPreferenceOptions)}
    - Manufacturing Preference: ${manufacturingPreference}
    - Questionnaire Answers: ${JSON.stringify(savedAnswers, null, 2)}

    Please provide your response in EXACTLY this format with these exact headings:

    **Materials**
    Suggest appropriate materials for the product based on the design requirements and target price point. Include fabric types, weights (GSM), texture, special properties (stretch, breathability, etc.), and any special considerations for sustainability or performance.

    **Sales Price**
    Provide a detailed suggested retail price analysis:
    - Recommended retail price range (provide a specific range, e.g., $80-$100)
    - Justify the pricing based on materials, market positioning, and target audience
    - Mention competitive pricing context if relevant
    - Include any seasonal or promotional pricing considerations

    **Color Palette**
    Provide ONLY 3-4 color suggestions with color names and hex codes in this EXACT format (one per line):
    - Electric Blue (#0066FF)
    - Sunset Orange (#FF6347)
    - Forest Green (#228B22)
    - Charcoal Gray (#36454F)
    
    DO NOT include any descriptions or additional text, ONLY the format above.

    **Cost Production**
    Provide a detailed production cost breakdown:
    - Cost per unit (specific number)
    - Brief breakdown of major cost components (materials %, labor %, overhead %)
    - Mention any economies of scale considerations
    - Note factors that could affect cost (complexity, special finishes, etc.)
    - Include comparison between domestic vs overseas production costs if relevant

    **Companion Items**
    Suggest 4-6 complementary pieces that would work well with this product in a capsule collection. Be specific with item names and briefly explain why each piece complements the main product.

    **Yield & Consumption Estimates**
    Provide a comprehensive fabric consumption analysis:
    - Fabric yardage per unit with justification (e.g., "2.5 yards per hoodie to account for body, sleeves, hood, and ribbing")
    - Total yardage for the full production run
    - Mention fabric width assumptions (typically 58-60 inches)
    - Include waste factor percentage (typically 10-15%)
    - Note any special cutting or pattern considerations
    - Provide weight estimates if relevant (e.g., "Approximately 0.8 lbs per unit")

    **Production Lead Time Estimate**
    Provide detailed production timeline estimates:
    - Domestic production: specific week range (e.g., 10-14 weeks) with breakdown of phases if possible (sampling, production, finishing, shipping)
    - Overseas production: specific week range (e.g., 14-18 weeks) with breakdown of phases
    - Explain key factors affecting timeline (complexity, MOQ, quality checks, customs, etc.)
    - Note rush production options if available
    - Mention seasonal considerations (Chinese New Year, holiday rushes, etc.)
    - All ranges should be realistic: minimum 8 weeks, maximum 24 weeks

    ⸻

    **Market & Brand Positioning**

    **Comparable Market Examples**
    List 2–3 comparable market references. Select brands at similar quality and price points to the user's concept.

    **Target Consumer Insight**
    Suggest target consumer demographics and psychographics. Include age range, lifestyle, values, and buying motivations that align with the product direction described.

    ⸻

    **Business & Financial Tools**

    **Margin Analysis**
    Calculate suggested retail price vs. production cost to show the gross margin percentage. Display calculations clearly.

    **Wholesale vs. DTC Pricing**
    Automatically generate a suggested wholesale price and direct-to-consumer (DTC) price range. Base calculations on standard fashion industry markups, and present both ranges clearly.
  `.trim();
};


  // Fetch AI suggestions
  useEffect(() => {
   const callOpenAI = async () => {
  try {
    const prompt = generatePrompt();
    const response = await axios.post('/api/openai', { prompt });

    console.log("OpenAI Response:", response.data); // Log the full response

    if (response?.data?.error) {
      throw new Error(`OpenAI API error: ${response.data.error}`);
    }

    const answer = response?.data?.choices?.[0]?.message?.content ?? response?.data?.choices?.[0]?.text ?? '';
    
    console.log("Parsed Answer:", answer); // Log parsed answer

    localStorage.setItem('answer', answer);
    console.log('Raw AI Response:', answer);
    const parsed = parseAIResponse(answer);
    console.log('Parsed Suggestions:', parsed);
    setSuggestions(parsed);

    // Store parsed suggestions for the next screen
    localStorage.setItem('parsedSuggestions', JSON.stringify(parsed));

    toast.success('Suggestions loaded successfully!', {
      style: { backgroundColor: '#3A3A3D', color: '#fff' },
    });
  } catch (err) {
    console.error('OpenAI error:', err);
    toast.error('Something went wrong while fetching suggestions.', {
      style: { backgroundColor: '#3A3A3D', color: 'white' },
    });
  } finally {
    setLoading(false);
  }
};


    callOpenAI();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
  <>
    <Toaster position="top-right" richColors />
    {loading ? (
      <div className="fixed inset-0 flex flex-col items-center justify-center h-screen text-black/70 font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black/70 mb-4"></div>
        In progress...
      </div>
    ) : !suggestions ? (
      <div className="flex flex-col items-center justify-center min-h-screen text-[#3A3A3D] font-sans text-lg leading-[1.2]">
        <p className="mb-4">No Suggestions For Now</p>
        <button
          onClick={onBack}
          className="px-6 py-2 text-lg font-bold text-white bg-black hover:bg-gray-600 rounded-md transition"
        >
          ← Back
        </button>
      </div>
    ) : (
      <div className="bg-[#E8E8E8] min-h-screen">
        {/* Header with Back Button */}
        <div className="bg-[#E8E8E8]">
          <div className="container mx-auto px-4 py-6">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-white bg-black hover:bg-[#3A3A3D] rounded-md transition"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Title Section */}
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-[#333333] text-4xl md:text-5xl font-heading text-center mb-8 leading-[1.2]">
            {title}
          </h2>
        </div>

        {/* Main Content Grid */}
        <div className="container mx-auto px-4 pb-12">
          
          {/* Grid Row 1: 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Materials Card */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-heading mb-4 text-black leading-[1.2]">Materials</h3>
              <div className="text-lg leading-[1.2] text-black font-sans">
                {suggestions.materials ? <ReactMarkdown>{suggestions.materials}</ReactMarkdown> : <p className="text-gray-400">No data available</p>}
              </div>
            </div>

            {/* Sales Price Card */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-heading mb-4 text-black leading-[1.2]">Sales Price</h3>
              <div className="text-lg leading-[1.2] text-black font-sans">
                {suggestions.saleprices ? <ReactMarkdown>{suggestions.saleprices}</ReactMarkdown> : <p className="text-gray-400">No data available</p>}
              </div>
            </div>

            {/* Cost Production Card */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-heading mb-4 text-black leading-[1.2]">Cost Production</h3>
              <div className="text-lg leading-[1.2] text-black font-sans">
                {suggestions.productionCosts ? <ReactMarkdown>{suggestions.productionCosts}</ReactMarkdown> : <p className="text-gray-400">No data available</p>}
              </div>
            </div>
          </div>

          {/* Grid Row 2: 2 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Color Palette Card */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-heading mb-4 text-black leading-[1.2]">Color Palette</h3>
              {suggestions.colors && extractHexColors(suggestions.colors).length > 0 ? (
                <div className="flex flex-wrap gap-6 mt-4 justify-center">
                  {extractHexColors(suggestions.colors).slice(0, 4).map(([name, hex], idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2">
                      <div
                        className="w-16 h-16 rounded-full border-2 border-gray-300 shadow-md"
                        style={{ backgroundColor: hex }}
                        title={name}
                      />
                      <span className="text-black text-xs font-sans font-bold">{hex}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 font-sans text-center mt-4">No color data available</p>
              )}
            </div>

            {/* Companion Items Card */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-heading mb-4 text-black leading-[1.2]">Companion Pieces</h3>
              <div className="text-lg leading-[1.2] text-black font-sans">
                {suggestions.companionItems ? <ReactMarkdown>{suggestions.companionItems}</ReactMarkdown> : <p className="text-gray-400">No data available</p>}
              </div>
            </div>
          </div>

          {/* Navigation - Continue to Market Analysis */}
          <div className="text-center mt-12">
            <button
              onClick={() => {
                toast.info('Continue to view production timelines and market analysis', {
                  style: { backgroundColor: '#3A3A3D', color: '#fff' },
                });
                onNext();
              }}
              className="px-10 py-4 text-lg font-bold text-white bg-black hover:bg-[#3A3A3D] rounded-lg shadow-lg transition-all hover:shadow-xl"
            >
              Continue to Market Analysis →
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);

}
