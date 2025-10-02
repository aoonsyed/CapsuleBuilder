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

  const formData = useSelector((state) => state.form);
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
        return match[1].trim();
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
    Suggest appropriate materials for the product based on the design requirements and target price point. Include fabric types, weights, and any special considerations.

    **Sales Price**
    Provide a suggested retail price for the product based on the target price input and market positioning.

    **Color Palette**
    Provide ONLY 3-4 color suggestions with color names and hex codes in this EXACT format (one per line):
    - Electric Blue (#0066FF)
    - Sunset Orange (#FF6347)
    - Forest Green (#228B22)
    - Charcoal Gray (#36454F)
    
    DO NOT include any descriptions or additional text, ONLY the format above.

    **Cost Production**
    Estimate the production cost per unit, including materials, labor, and overhead considerations.

    **Companion Items**
    Suggest complementary pieces that would work well with this product in a capsule collection.

    **Yield & Consumption Estimates**
    Provide an estimate of fabric yardage required per unit, based on standard industry calculations for the type of product (EX: 2 yards for a Tee shirt, 3 yards for a sweatshirt, 3 yards for a pair of pants. Scale the estimate automatically to the unit quantity input by the user. Present the results clearly with both per-unit and total yardage/weight.

    **Production Lead Time Estimate**
    Give a general turnaround time for production. Frame the response as a 4 week range (e.g., 8–12 weeks), while noting that exact times depend on supplier and order complexity. Give shorter lead times for domestic than overseas, give a comparison of production time domestic vs overseas, the overseas production should be longer. Give shorter turn around times for simple projects such as Tee shirts and sweatpants and longer lead times for more complex items like jeans or dresses. All ranges should be at least 8 weeks and no more than 24 weeks.

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

  // Build email params
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

  // Send email
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


return (
  <>
    <Toaster position="top-right" richColors />
    {loading ? (
      <div className="fixed inset-0 flex flex-col items-center justify-center h-screen text-black/70 font-[Garamond]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black/70 mb-4"></div>
        In progress...
      </div>
    ) : !suggestions ? (
      <div className="flex flex-col items-center justify-center min-h-screen text-[#3A3A3D] font-[Garamond] text-lg">
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
          <h2 className="text-[#333333] text-4xl md:text-5xl font-[Albereto Regular] text-center mb-8">
            {title}
          </h2>
        </div>

        {/* Main Content Grid */}
        <div className="container mx-auto px-4 pb-12">
          
          {/* Grid Row 1: 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Materials Card */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-[Albereto Regular] mb-4 text-black">Materials</h3>
              <div className="text-base leading-relaxed text-black font-[Garamond]">
                {suggestions.materials ? <ReactMarkdown>{suggestions.materials}</ReactMarkdown> : <p className="text-gray-400">No data available</p>}
              </div>
            </div>

            {/* Sales Price Card */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-[Albereto Regular] mb-4 text-black">Sales Price</h3>
              <div className="text-base leading-relaxed text-black font-[Garamond]">
                {suggestions.saleprices ? <ReactMarkdown>{suggestions.saleprices}</ReactMarkdown> : <p className="text-gray-400">No data available</p>}
              </div>
            </div>

            {/* Cost Production Card */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-[Albereto Regular] mb-4 text-black">Cost Production</h3>
              <div className="text-base leading-relaxed text-black font-[Garamond]">
                {suggestions.productionCosts ? <ReactMarkdown>{suggestions.productionCosts}</ReactMarkdown> : <p className="text-gray-400">No data available</p>}
              </div>
            </div>
          </div>

          {/* Grid Row 2: 2 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Color Palette Card */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-[Albereto Regular] mb-4 text-black">Color Palette</h3>
              {suggestions.colors && extractHexColors(suggestions.colors).length > 0 ? (
                <div className="flex flex-wrap gap-6 mt-4 justify-center">
                  {extractHexColors(suggestions.colors).slice(0, 4).map(([name, hex], idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2">
                      <div
                        className="w-16 h-16 rounded-full border-2 border-gray-300 shadow-md"
                        style={{ backgroundColor: hex }}
                        title={name}
                      />
                      <span className="text-black text-xs font-[Garamond] font-bold">{hex}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 font-[Garamond] text-center mt-4">No color data available</p>
              )}
            </div>

            {/* Companion Items Card */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-[Albereto Regular] mb-4 text-black">Companion Pieces</h3>
              <div className="text-base leading-relaxed text-black font-[Garamond]">
                {suggestions.companionItems ? <ReactMarkdown>{suggestions.companionItems}</ReactMarkdown> : <p className="text-gray-400">No data available</p>}
              </div>
            </div>
          </div>

          {/* Grid Row 3: 2 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Yield Card */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-[Albereto Regular] mb-4 text-black">Yield & Consumption</h3>
              <div className="text-base leading-relaxed text-black font-[Garamond]">
                {suggestions.yieldConsumption ? <ReactMarkdown>{suggestions.yieldConsumption}</ReactMarkdown> : <p className="text-gray-400">No data available</p>}
              </div>
            </div>

            {/* Lead Time Card */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-[Albereto Regular] mb-4 text-black">Production Lead Time</h3>
              <div className="text-base leading-relaxed text-black font-[Garamond]">
                {suggestions.leadTime ? <ReactMarkdown>{suggestions.leadTime}</ReactMarkdown> : <p className="text-gray-400">No data available</p>}
              </div>
            </div>
          </div>

          {/* Grid Row 4: 2 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Market Positioning Card */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-[Albereto Regular] mb-4 text-black">Market & Brand Positioning</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-[Garamond] font-semibold text-black mb-2">Market Examples</h4>
                  <div className="text-base leading-relaxed text-black font-[Garamond]">
                    {suggestions.marketExamples ? <ReactMarkdown>{suggestions.marketExamples}</ReactMarkdown> : <p className="text-gray-400">No data available</p>}
                  </div>
                </div>
                <div>
                  <h4 className="text-base font-[Garamond] font-semibold text-black mb-2">Target Consumer</h4>
                  <div className="text-base leading-relaxed text-black font-[Garamond]">
                    {suggestions.targetInsight ? <ReactMarkdown>{suggestions.targetInsight}</ReactMarkdown> : <p className="text-gray-400">No data available</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Tools Card */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-[Albereto Regular] mb-4 text-black">Business & Financial Tools</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-[Garamond] font-semibold text-black mb-2">Margin Analysis</h4>
                  <div className="text-base leading-relaxed text-black font-[Garamond]">
                    {suggestions.marginAnalysis ? <ReactMarkdown>{suggestions.marginAnalysis}</ReactMarkdown> : <p className="text-gray-400">No data available</p>}
                  </div>
                </div>
                <div>
                  <h4 className="text-base font-[Garamond] font-semibold text-black mb-2">Wholesale vs DTC</h4>
                  <div className="text-base leading-relaxed text-black font-[Garamond]">
                    {suggestions.pricing ? <ReactMarkdown>{suggestions.pricing}</ReactMarkdown> : <p className="text-gray-400">No data available</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Call Button */}
          <div className="text-center mt-12">
            <button
              onClick={handleScheduleClick}
              disabled={sendingEmail}
              className={`px-8 py-3 text-lg font-bold text-white rounded-lg shadow-lg transition-all ${
                sendingEmail ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-[#3A3A3D] hover:shadow-xl'
              }`}
            >
              {sendingEmail ? 'Sending details…' : 'Schedule Call →'}
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);

}
