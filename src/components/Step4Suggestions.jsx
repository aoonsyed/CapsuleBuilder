import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Toaster, toast } from 'sonner';
import { useSelector } from 'react-redux';
import emailjs from '@emailjs/browser';

export default function Step4Suggestions({ onNext, onBack }) {
  const savedAnswers = JSON.parse(localStorage.getItem('questionnaireAnswers'));
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);

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
  } = useSelector((state) => state.form);

  const title = localBrand?.trim()
    ? `${localBrand.trim()} ${productType?.trim()}`
    : `Your ${productType?.trim()}`;

  // ---------- Helpers ----------
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

  // Parse the AI response into sections
  const parseAIResponse = (text) => {
    const getSection = (label) => {
      const patterns = [
        new RegExp(`\\*\\*${label}\\*\\*\\s*:?\\s*\\n([\\s\\S]*?)(?=\\n\\*\\*|$)`, 'i'),
        new RegExp(`${label}\\s*:\\s*\\n([\\s\\S]*?)(?=\\n[A-Z][^:]*:|$)`, 'i'),
        new RegExp(`##\\s*${label}\\s*\\n([\\s\\S]*?)(?=\\n##|$)`, 'i'),
        new RegExp(`\\d+\\.\\s*\\*\\*${label}\\*\\*\\s*:?\\s*\\n([\\s\\S]*?)(?=\\n\\d+\\.|$)`, 'i'),
      ];
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1].trim()) return match[1].trim();
      }
      return '';
    };

    return {
      materials: getSection('Materials'),
      colors: getSection('Color Palette with HEX Codes') || getSection('Color Palette'),
      saleprices: getSection('Target Price'),
      productionCosts: getSection('Estimated Production Cost'),
      companionItems: getSection('Companion Items'),
      suggestions: getSection('Suggested Items'),
      construction: getSection('Construction Notes'),
    };
  };

  // ---------- Fetch AI suggestions on mount ----------
  useEffect(() => {
    const callOpenAI = async () => {
      try {
        const prompt = `Act as a fashion design assistant. Based on the following details:
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
[Only list suitable materials and their properties here]

**Color Palette with HEX Codes**
[Always list three colors with their HEX codes here]

**Target Price**
[Only state the recommended sale price and some comments for the target price here]

**Estimated Production Cost**
[Only provide production cost estimate here. Also provide some information]

**Companion Items**
[Only list 2-3 accessory or styling suggestions here]`;

       const response = await axios.post('/api/openai', { prompt });

if (response?.data?.error) {
  throw new Error(`OpenAI API error: ${response.data.error}`);
}

        const answer =
          response?.data?.choices?.[0]?.message?.content ??
          response?.data?.choices?.[0]?.text ??
          '';

        localStorage.setItem('answer', answer);
        const parsed = parseAIResponse(answer);
        setSuggestions(parsed);

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

  const buildEmailParams = () => {
    const rawAnswer = localStorage.getItem('answer') || '';
    const recipient = process.env.REACT_APP_TEAM_RECEIVER_EMAIL; // Where the email should go
    const customerEmail =
      savedAnswers?.email || savedAnswers?.contactEmail || savedAnswers?.userEmail || '';

    return {
      to_email: recipient,
      customer_email: customerEmail,

      // High-level identifiers
      title,
      brand: brand2 || localBrand || '',
      idea: idea || '',
      product_type: productType || '',
      target_price: targetPrice || '',
      quantity: quantity || '',
      category: category || '',
      key_features: keyFeatures || '',
      material_preferences: JSON.stringify(materialPreferenceOptions || []),
      manufacturing_preference: manufacturingPreference || '',
      shared_preferences: sharedPrefernce || '',

      // Parsed sections
      materials: suggestions?.materials || '',
      colors: suggestions?.colors || '',
      saleprices: suggestions?.saleprices || '',
      production_costs: suggestions?.productionCosts || '',
      companion_items: suggestions?.companionItems || '',

      // Raw answer for full context
      raw_answer: rawAnswer,

      // Optional: include the scheduling URL that will be opened
      scheduling_url:
        process.env.REACT_APP_SCHEDULING_URL ||
        'https://app.acuityscheduling.com/schedule/c38a96dc/appointment/32120137/calendar/3784845?appointmentTypeIds[]=32120137',
    };
  };
  const [imageLoading, setImageLoading] = useState(false);
  const [storedImageUrl, setStoredImageUrl] = useState(
  localStorage.getItem("generatedImageUrl") || ""
);

const formatForImage = (rawText) => {
  const getSection = (label) => {
    const regex = new RegExp(
      `\\*\\*${label}\\*\\*\\s*\\n*([\\s\\S]*?)(?=\\n\\*\\*|$)`,
      "i"
    );
    const match = rawText.match(regex);
    return match ? match[1].trim() : "";
  };

  const trimText = (text, max = 200) =>
    text?.length > max ? text.slice(0, max) + "..." : text;

  const materials = trimText(getSection("Materials").replace(/\n/g, ", "));
  const colors = getSection("Color Palette with HEX Codes").replace(/\n/g, ", ");

  // ✅ rename here
  const productTypeValue = trimText(productType || "clothing");

  const construction = trimText(getSection("Construction Notes").replace(/\n/g, " , "));

  return `Create a high-resolution, realistic image of a ${productTypeValue} made from ${materials}, in shades such as ${colors}. Display it neatly on a hanger or mannequin, clean neutral background. Construction details: ${construction}. No text or logos.`;
};


const generateImage = async () => {
  setImageLoading(true);
  try {
    const rawText = localStorage.getItem("answer") || "";
    if (!rawText) return;

    const visualPrompt = formatForImage(rawText);
    const basePrompt = `A realistic, photographic fashion image. ${visualPrompt}`;
    const imagePrompt =
      basePrompt.length > 1000 ? basePrompt.slice(0, 997) + "..." : basePrompt;

    const response = await fetch("/api/generateImage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: imagePrompt }),
    });

    const data = await response.json();
    const url = data?.data?.[0]?.url || "";
    if (url) {
      localStorage.setItem("generatedImageUrl", url);
      setStoredImageUrl(url);
    }
  } catch (err) {
    console.error("Image generation failed:", err);
  } finally {
    setImageLoading(false);
  }
};

useEffect(() => {
  if (suggestions) {
    generateImage();
  }
}, [suggestions]);

  // ---------- Send email via EmailJS ----------
  const sendScheduleEmail = async () => {
    const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
    const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
    if (!serviceId || !templateId || !publicKey) throw new Error('Missing EmailJS env vars');
    const templateParams = buildEmailParams();
    return emailjs.send(serviceId, templateId, templateParams, { publicKey });
  };

  const handleScheduleClick = async () => {
    const schedulingUrl =
      process.env.REACT_APP_SCHEDULING_URL ||
      'https://app.acuityscheduling.com/schedule/c38a96dc/appointment/32120137/calendar/3784845?appointmentTypeIds[]=32120137';
    window.open(schedulingUrl, '_blank', 'noopener,noreferrer');
    try {
      setSendingEmail(true);
      await sendScheduleEmail();
      toast.success('Your details were emailed to our team.');
    } catch (err) {
      console.error('Email send failed:', err);
      toast.error('We couldn’t send the email. We’ll still see your booking.');
    } finally {
      setSendingEmail(false);
    }
  };

  // ---------- Render ----------
return (
  <>
    <Toaster position="top-right" richColors />
    {loading ? (
      <div className="fixed inset-0 flex flex-col items-center justify-center h-screen text-black/70 font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black/70 mb-4"></div>
        In progress...
      </div>
    ) : !suggestions ? (
      <div className="flex flex-col items-center justify-center min-h-screen text-[#3A3A3D] font-[Helvetica] text-lg">
        <p className="mb-4">No Suggestions For Now</p>
        <button
          onClick={onBack}
          className="px-6 py-2 text-lg font-bold text-white bg-[#3A3A3D] hover:bg-black active:bg-[#1C1C1C] rounded-md "
        >
          ← Back
        </button>
      </div>
    ) : (
      <div className=" min-h-screen">
        <div className="max-w-7xl mx-auto px-6 mb-8">
          {/* Header Section */}
         <div className="flex items-center justify-between w-full mb-8 px-2">
  <button
    type="button"
    onClick={onBack}
    className="text-xl font-extrabold text-[#3A3A3D]"
  >
    ←
  </button>
  <p className="text-sm text-black">Step 5 of 5</p>
</div>


          {/* Title */}
          <h2 className="text-[#333333] text-[32pt] font-serif leading-tight mb-6 mt-2 text-center">
            {title}
          </h2>

          {/* Main Grid */}
          <div className="flex flex-col items-center justify-center gap-6 p-6">
            {/* Row 1 */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Suggested Image */}
      <div className="bg-white rounded-2xl -lg border border-[#E4E4E4] w-[450px] h-[380px] flex flex-col items-center justify-center p-5">
  <h1 className="text-2xl font-[Garamond] font-semibold mb-4 text-black">
    Suggested Image
  </h1>
  {imageLoading ? (
    <div className="flex flex-col items-center justify-center text-black/70">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black mb-4"></div>
      Generating image...
    </div>
  ) : storedImageUrl ? (
    <img
      src={storedImageUrl}
      alt={title}
      className="w-auto h-[250px] object-contain rounded"
    />
  ) : (
    <div className="text-gray-500">No image generated yet</div>
  )}
</div>



              {/* Right Column */}
              <div className="flex flex-col gap-6">
                {/* Materials */}
               <div className="bg-white rounded-2xl -lg border border-[#E4E4E4] w-[450px] min-h-[220px] p-5">
  <h1 className="text-2xl font-[Garamond] font-semibold mb-4 text-black">
    Materials
  </h1>
  <div className="text-base leading-relaxed text-black">
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-2">{children}</p>,
        li: ({ children }) => (
          <li className="ml-5 list-disc">{children}</li>
        ),
        strong: ({ children }) => (
          <strong className="text-black">{children}</strong>
        ),
      }}
    >
      {suggestions.materials}
    </ReactMarkdown>
  </div>
</div>


                {/* Sales Price */}
              <div className="bg-white rounded-2xl -lg border border-[#E4E4E4] w-[450px] min-h-[180px] p-5">
  <h1 className="text-2xl font-[Garamond] font-semibold mb-4 text-black">
    Sales Price
  </h1>
  <div className="text-base leading-relaxed text-black">
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-2">{children}</p>,
        li: ({ children }) => (
          <li className="ml-5 list-disc">{children}</li>
        ),
        strong: ({ children }) => (
          <strong className="text-black">{children}</strong>
        ),
      }}
    >
      {suggestions.saleprices}
    </ReactMarkdown>
  </div>
</div>

              </div>
            </div>

            {/* Row 2 */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Color Palette */}
              <div className="bg-white rounded-2xl -lg border border-[#E4E4E4] w-[450px] h-[180px] overflow-hidden p-4">
                <h1 className="text-xl font-[Helvetica] font-semibold mb-2 text-black">
                  Color Palette
                </h1>
                <ul>
                  {extractHexColors(suggestions.colors).map(([name, hex], idx) => (
                    <li key={idx} className="flex items-center space-x-3 mb-2">
                      <span
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="text-black/70 text-sm">
                        {`${name} (${hex})`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cost Production */}
           <div className="bg-white rounded-2xl -lg border border-[#E4E4E4] w-[450px] min-h-[220px] p-5">
  <h1 className="text-2xl font-[Garamond] font-semibold mb-4 text-black">
    Cost Production
  </h1>
  <div className="text-base leading-relaxed text-black">
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-2">{children}</p>,
        li: ({ children }) => (
          <li className="ml-5 list-disc">{children}</li>
        ),
        strong: ({ children }) => (
          <strong className="text-black">{children}</strong>
        ),
      }}
    >
      {suggestions.productionCosts}
    </ReactMarkdown>
  </div>
</div>

            </div>

            {/* Row 3: Companion Items */}
  <div className="bg-white rounded-2xl -md border border-[#E4E4E4] 
     w-full lg:w-[920px] min-h-[220px] p-6">
  <h1 className="text-2xl font-[Garamond] font-semibold mb-4 text-black">
    Suggested Companion Pieces
  </h1>
  <div className="text-base leading-relaxed text-black">
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-2">{children}</p>,
        li: ({ children }) => <li className="ml-5 list-disc">{children}</li>,
        strong: ({ children }) => (
          <strong className="text-black">{children}</strong>
        ),
      }}
    >
      {suggestions.companionItems}
    </ReactMarkdown>
  </div>
</div>


          </div>

          {/* Schedule Call Button */}
          <div className="flex justify-center mt-12 mb-7">
            <button
              onClick={handleScheduleClick}
              disabled={sendingEmail}
              className={`px-6 py-2 text-lg font-bold text-white rounded-md  transition duration-200 ${
                sendingEmail
                  ? 'bg-black/50 cursor-not-allowed'
                  : 'bg-[#3A3A3D] hover:bg-black active:bg-[#1C1C1C]'
              }`}
            >
              {sendingEmail ? 'Sending details…' : 'Schedule Call'}
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);



}