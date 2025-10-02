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
    const regex = new RegExp(
      `\\*\\*${label}\\*\\*\\s*:?\\s*\\n([\\s\\S]*?)(?=\\n\\*\\*|$)`,
      'i'
    );
    const match = text.match(regex);
    return match && match[1].trim() ? match[1].trim() : '';
  };

  return {
    materials: getSection('Materials'),
    colors: getSection('Color Palette with HEX Codes') || getSection('Color Palette'),
    saleprices: getSection('Target Price'),
    productionCosts: getSection('Estimated Production Cost'),
    companionItems: getSection('Companion Items'),
    yieldConsumption: getSection('Yield & Consumption Estimates'),
    leadTime: getSection('Production Lead Time Estimate'),
    marketExamples: getSection('Comparable Market Examples'),
    targetInsight: getSection('Target Consumer Insight'),
    marginAnalysis: getSection('Margin Analysis'),
    pricing: getSection('Wholesale vs DTC Pricing'),
  };
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

    **Yield & Consumption Estimates**
    - Provide an estimate of fabric yardage required per unit, based on standard industry calculations for the type of product (EX: 2 yards for a Tee shirt, 3 yards for a sweatshirt, 3 yards for a pair of pants).
    - Scale the estimate automatically to the unit quantity input by the user.
    - Present the results clearly with both per-unit and total yardage/weight.

    **Production Lead Time Estimate**
    - Give a general turnaround time for production. Frame the response as a 4-week range (e.g., 8–12 weeks), while noting that exact times depend on supplier and order complexity.
    - Give shorter lead times for domestic vs. overseas, the overseas production should be longer.
    - Provide shorter turn around times for simple projects such as Tee shirts and sweatpants and longer lead times for more complex items like jeans or dresses.
    - All ranges should be at least 8 weeks and no more than 24 weeks.

    **Market & Brand Positioning**
    - Comparable Market Examples: List 2–3 comparable market references. Select brands at similar quality and price points to the user’s concept.
    - Target Consumer Insight: Suggest target consumer demographics and psychographics. Include age range, lifestyle, values, and buying motivations that align with the product direction described.

    **Business & Financial Tools**
    - Margin Analysis: Calculate suggested retail price vs. production cost to show the gross margin percentage. Display calculations clearly.
    - Wholesale vs. DTC Pricing: Automatically generate a suggested wholesale price and direct-to-consumer (DTC) price range. Base calculations on standard fashion industry markups, and present both ranges clearly.
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
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-6 mb-8">
          {/* Header */}
          <div className="flex items-center justify-between w-full mb-8 px-2">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-white bg-black hover:bg-gray-600 rounded-md transition"
            >
              ← Back
            </button>
            <p className="text-sm text-black font-[Garamond]">Step 5 of 5</p>
          </div>

          {/* Title */}
          <h2 className="text-[#333333] text-[32pt] font-[Albereto] leading-tight mb-6 mt-2 text-center">
            {title}
          </h2>

          {/* Sections */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
            {/* Row 1 */}
            <div className="bg-white rounded-2xl border border-[#E4E4E4] p-5">
              <h1 className="text-2xl font-[Albereto] mb-4 text-black">Materials</h1>
              <div className="text-base leading-relaxed text-black font-[Garamond]">
                <ReactMarkdown>{suggestions.materials}</ReactMarkdown>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E4E4E4] p-5">
              <h1 className="text-2xl font-[Albereto] mb-4 text-black">Sales Price</h1>
              <div className="text-base leading-relaxed text-black font-[Garamond]">
                <ReactMarkdown>{suggestions.saleprices}</ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
            {/* Color Palette */}
            <div className="bg-white rounded-2xl border border-[#E4E4E4] p-4">
              <h1 className="text-xl font-[Albereto] mb-2 text-black">Color Palette</h1>
              <ul>
                {extractHexColors(suggestions.colors).map(([name, hex], idx) => (
                  <li key={idx} className="flex items-center space-x-3 mb-2 font-[Garamond]">
                    <span
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: hex }}
                    />
                    <span className="text-black/70 text-sm">{`${name} (${hex})`}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cost Production */}
            <div className="bg-white rounded-2xl border border-[#E4E4E4] p-5">
              <h1 className="text-2xl font-[Albereto] mb-4 text-black">Cost Production</h1>
              <div className="text-base leading-relaxed text-black font-[Garamond]">
                <ReactMarkdown>{suggestions.productionCosts}</ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Companion Items */}
          <div className="bg-white rounded-2xl border border-[#E4E4E4] w-full lg:w-[920px] min-h-[220px] p-6">
            <h1 className="text-2xl font-[Albereto] mb-4 text-black">
              Suggested Companion Pieces
            </h1>
            <div className="text-base leading-relaxed text-black font-[Garamond]">
              <ReactMarkdown>{suggestions.companionItems}</ReactMarkdown>
            </div>
          </div>

          {/* Additional Sections: Yield, Lead Time, Market, and Financial Tools */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
            {/* Yield & Consumption Estimates */}
            <div className="bg-white rounded-2xl border border-[#E4E4E4] p-5">
              <h1 className="text-2xl font-[Albereto] mb-4 text-black">Yield & Consumption Estimates</h1>
              <div className="text-base leading-relaxed text-black font-[Garamond]">
                <ReactMarkdown>{suggestions.yieldConsumption}</ReactMarkdown>
              </div>
            </div>

            {/* Production Lead Time Estimate */}
            <div className="bg-white rounded-2xl border border-[#E4E4E4] p-5">
              <h1 className="text-2xl font-[Albereto] mb-4 text-black">Production Lead Time Estimate</h1>
              <div className="text-base leading-relaxed text-black font-[Garamond]">
                <ReactMarkdown>{suggestions.leadTime}</ReactMarkdown>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
            {/* Market & Brand Positioning */}
            <div className="bg-white rounded-2xl border border-[#E4E4E4] p-5">
              <h1 className="text-2xl font-[Albereto] mb-4 text-black">Market & Brand Positioning</h1>
              <h3 className="text-xl font-[Garamond] text-black">Comparable Market Examples</h3>
              <ReactMarkdown>{suggestions.marketExamples}</ReactMarkdown>
              <h3 className="text-xl font-[Garamond] text-black">Target Consumer Insight</h3>
              <ReactMarkdown>{suggestions.targetInsight}</ReactMarkdown>
            </div>

            {/* Business & Financial Tools */}
            <div className="bg-white rounded-2xl border border-[#E4E4E4] p-5">
              <h1 className="text-2xl font-[Albereto] mb-4 text-black">Business & Financial Tools</h1>
              <h3 className="text-xl font-[Garamond] text-black">Margin Analysis</h3>
              <ReactMarkdown>{suggestions.marginAnalysis}</ReactMarkdown>
              <h3 className="text-xl font-[Garamond] text-black">Wholesale vs DTC Pricing</h3>
              <ReactMarkdown>{suggestions.pricing}</ReactMarkdown>
            </div>
          </div>

        </div>

        {/* Schedule Call Button */}
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
    )}
  </>
);

}
