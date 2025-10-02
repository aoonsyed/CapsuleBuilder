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

  // Extract hex colors from response
  const extractHexColors = (rawText) => {
    const sectionRegex = /\*\*Color Palette with HEX Codes\*\*\n([\s\S]*?)(?=\n\*\*|$)/;
    const match = rawText?.match(sectionRegex);
    const section = match ? match[1] : (rawText || '');

    const hexColors = [];
    const pattern = /#?([0-9A-Fa-f]{6})/gi;
    let m;
    let colorIndex = 1;
    while ((m = pattern.exec(section)) !== null) {
      const hex = '#' + m[1].toUpperCase();
      const name = `Color ${colorIndex}`;
      hexColors.push([name, hex]);
      colorIndex++;
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
    Suggest a color palette with specific color names and descriptions that align with the brand vision.

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
      <div className="min-h-screen w-full">
        {/* Header */}
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-white bg-black hover:bg-gray-600 rounded-md transition"
            >
              ← Back
            </button>
            <p className="text-sm text-black font-[Garamond]">Step 5 of 5</p>
          </div>
        </div>

        {/* Title */}
        <div className="w-full px-6 mb-6">
          <h2 className="text-[#333333] text-[32pt] font-[Albereto Regular] leading-tight text-center">
            {title}
          </h2>
        </div>

        {/* Sections - Full Width Column Layout */}
        <div className="w-full px-6 pb-6 space-y-6">
            {/* Materials */}
            <div className="bg-white rounded-2xl border border-[#E4E4E4] p-6">
              <h1 className="text-2xl font-[Albereto Regular] mb-4 text-black">Materials</h1>
              <div className="text-base leading-relaxed text-black font-[Garamond]">
                {suggestions.materials ? <ReactMarkdown>{suggestions.materials}</ReactMarkdown> : <p className="text-gray-500">No materials data available</p>}
              </div>
            </div>

            {/* Sales Price */}
            <div className="bg-white rounded-2xl border border-[#E4E4E4] p-6">
              <h1 className="text-2xl font-[Albereto Regular] mb-4 text-black">Sales Price</h1>
              <div className="text-base leading-relaxed text-black font-[Garamond]">
                {suggestions.saleprices ? <ReactMarkdown>{suggestions.saleprices}</ReactMarkdown> : <p className="text-gray-500">No pricing data available</p>}
              </div>
            </div>

            {/* Color Palette */}
            <div className="bg-white rounded-2xl border border-[#E4E4E4] p-6">
              <h1 className="text-2xl font-[Albereto Regular] mb-4 text-black">Color Palette</h1>
              {suggestions.colors && extractHexColors(suggestions.colors).length > 0 ? (
                <ul className="space-y-2">
                  {extractHexColors(suggestions.colors).map(([name, hex], idx) => (
                    <li key={idx} className="flex items-center space-x-3 font-[Garamond]">
                      <span
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="text-black text-sm">{`${name} (${hex})`}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-base leading-relaxed text-black font-[Garamond]">
                  {suggestions.colors ? <ReactMarkdown>{suggestions.colors}</ReactMarkdown> : <p className="text-gray-500">No color data available</p>}
                </div>
              )}
            </div>

            {/* Cost Production */}
            <div className="bg-white rounded-2xl border border-[#E4E4E4] p-6">
              <h1 className="text-2xl font-[Albereto Regular] mb-4 text-black">Cost Production</h1>
              <div className="text-base leading-relaxed text-black font-[Garamond]">
                {suggestions.productionCosts ? <ReactMarkdown>{suggestions.productionCosts}</ReactMarkdown> : <p className="text-gray-500">No cost data available</p>}
              </div>
            </div>

            {/* Companion Items */}
            <div className="bg-white rounded-2xl border border-[#E4E4E4] p-6">
              <h1 className="text-2xl font-[Albereto Regular] mb-4 text-black">
                Suggested Companion Pieces
              </h1>
              <div className="text-base leading-relaxed text-black font-[Garamond]">
                {suggestions.companionItems ? <ReactMarkdown>{suggestions.companionItems}</ReactMarkdown> : <p className="text-gray-500">No companion items available</p>}
              </div>
            </div>

            {/* Yield & Consumption Estimates */}
            <div className="bg-white rounded-2xl border border-[#E4E4E4] p-6">
              <h1 className="text-2xl font-[Albereto Regular] mb-4 text-black">Yield & Consumption Estimates</h1>
              <div className="text-base leading-relaxed text-black font-[Garamond]">
                {suggestions.yieldConsumption ? <ReactMarkdown>{suggestions.yieldConsumption}</ReactMarkdown> : <p className="text-gray-500">No yield data available</p>}
              </div>
            </div>

            {/* Production Lead Time Estimate */}
            <div className="bg-white rounded-2xl border border-[#E4E4E4] p-6">
              <h1 className="text-2xl font-[Albereto Regular] mb-4 text-black">Production Lead Time Estimate</h1>
              <div className="text-base leading-relaxed text-black font-[Garamond]">
                {suggestions.leadTime ? <ReactMarkdown>{suggestions.leadTime}</ReactMarkdown> : <p className="text-gray-500">No lead time data available</p>}
              </div>
            </div>

            {/* Market & Brand Positioning */}
            <div className="bg-white rounded-2xl border border-[#E4E4E4] p-6">
              <h1 className="text-2xl font-[Albereto Regular] mb-4 text-black">Market & Brand Positioning</h1>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-[Garamond] text-black mb-3">Comparable Market Examples</h3>
                  <div className="text-base leading-relaxed text-black font-[Garamond]">
                    {suggestions.marketExamples ? <ReactMarkdown>{suggestions.marketExamples}</ReactMarkdown> : <p className="text-gray-500">No market examples available</p>}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-[Garamond] text-black mb-3">Target Consumer Insight</h3>
                  <div className="text-base leading-relaxed text-black font-[Garamond]">
                    {suggestions.targetInsight ? <ReactMarkdown>{suggestions.targetInsight}</ReactMarkdown> : <p className="text-gray-500">No consumer insight available</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Business & Financial Tools */}
            <div className="bg-white rounded-2xl border border-[#E4E4E4] p-6">
              <h1 className="text-2xl font-[Albereto Regular] mb-4 text-black">Business & Financial Tools</h1>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-[Garamond] text-black mb-3">Margin Analysis</h3>
                  <div className="text-base leading-relaxed text-black font-[Garamond]">
                    {suggestions.marginAnalysis ? <ReactMarkdown>{suggestions.marginAnalysis}</ReactMarkdown> : <p className="text-gray-500">No margin analysis available</p>}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-[Garamond] text-black mb-3">Wholesale vs DTC Pricing</h3>
                  <div className="text-base leading-relaxed text-black font-[Garamond]">
                    {suggestions.pricing ? <ReactMarkdown>{suggestions.pricing}</ReactMarkdown> : <p className="text-gray-500">No pricing analysis available</p>}
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* Schedule Call Button */}
        <div className="w-full px-6">
          <div className="flex justify-center mt-12 mb-7">
          <button
            onClick={handleScheduleClick}
            disabled={sendingEmail}
            className={`px-6 py-2 text-lg font-bold text-white rounded-md transition duration-200 ${
              sendingEmail ? 'bg-black/50 cursor-not-allowed' : 'bg-black hover:bg-gray-600'
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
