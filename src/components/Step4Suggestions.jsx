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

        const apikey = process.env.REACT_APP_API_KEY;
        if (!apikey) {
          throw new Error('Missing REACT_APP_API_KEY for OpenAI');
        }

        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4',
            messages: [
              { role: 'system', content: 'You are a helpful fashion designer assistant.' },
              { role: 'user', content: prompt },
            ],
            max_tokens: 1000,
          },
          {
            headers: {
              Authorization: `Bearer ${apikey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const answer = response?.data?.choices?.[0]?.message?.content || '';
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

  // ---------- Build the email payload ----------
  const buildEmailParams = () => {
    const rawAnswer = localStorage.getItem('answer') || '';
    const recipient = process.env.REACT_APP_TEAM_RECEIVER_EMAIL; // Where the email should go
    const customerEmail =
      savedAnswers?.email ||
      savedAnswers?.contactEmail ||
      savedAnswers?.userEmail ||
      '';

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

  // ---------- Send email via EmailJS ----------
  const sendScheduleEmail = async () => {
    const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
    const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      throw new Error('Missing EmailJS env vars');
    }

    const templateParams = buildEmailParams();
    return emailjs.send(serviceId, templateId, templateParams, { publicKey });
  };

  // ---------- Button handler ----------
  const handleScheduleClick = async () => {
    // Open the scheduler synchronously to avoid popup blockers
    const schedulingUrl =
      process.env.REACT_APP_SCHEDULING_URL ||
      'https://app.acuityscheduling.com/schedule/c38a96dc/appointment/32120137/calendar/3784845?appointmentTypeIds[]=32120137';
    window.open(schedulingUrl, '_blank', 'noopener,noreferrer');

    // Send the email in the background
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
            className="px-6 py-2 text-lg font-bold text-white bg-[#3A3A3D] hover:bg-black active:bg-[#1C1C1C] rounded-md shadow"
          >
            ← Back
          </button>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto mt-10 font-[Helvetica] px-4">
          <button
            type="button"
            onClick={onBack}
            className="pb-1 text-xl font-extrabold text-[#3A3A3D] border-white"
          >
            ←
          </button>

          <p className="ml-5 text-sm text-black mb-2">Step 5 of 5</p>

          <h2 className="text-[26pt] font-[Garamond] font-bold text-center text-black mb-8">
            {title}
          </h2>

          {/* Top 3 Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[
              ['Materials', suggestions.materials],
              ['Sales Price', suggestions.saleprices],
              ['Cost Production', suggestions.productionCosts],
            ].map(([label, content], index) => (
              <div
                key={index}
                className="bg-white/60 backdrop-blur-md border border-white rounded-lg shadow-xl p-6"
              >
                <h3 className="text-xl font-semibold mb-2 text-black">{label}</h3>
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="text-base leading-relaxed mb-3 text-black/70">
                        {children}
                      </p>
                    ),
                    li: ({ children }) => (
                      <li className="text-base ml-6 list-disc text-black/70">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="text-base text-black/70">{children}</strong>
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            ))}
          </div>

          {/* Bottom 2 Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-15">
            {[
              ['Color Palette', suggestions.colors],
              ['Suggested Companion Pieces', suggestions.companionItems],
            ].map(([label, content], index) => {
              const isColorPalette = label === 'Color Palette';
              const colors = isColorPalette ? extractHexColors(content) : [];

              return (
                <div
                  key={index}
                  className="bg-white/60 backdrop-blur-md border border-white rounded-lg shadow-xl p-6"
                >
                  <h3 className="text-xl font-semibold mb-2 text-black">{label}</h3>

                  {isColorPalette ? (
                    <ul>
                      {colors.map(([name, hex], idx) => (
                        <li key={idx} className="flex items-center space-x-3 mb-2">
                          <span
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: hex }}
                          ></span>
                          <span className="text-black/70 text-base">{`${name} (${hex})`}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="text-base leading-relaxed mb-3 text-black/70">
                            {children}
                          </p>
                        ),
                        li: ({ children }) => (
                          <li className="text-base ml-6 list-disc text-black/70">
                            {children}
                          </li>
                        ),
                        strong: ({ children }) => (
                          <strong className="text-base text-black/70">{children}</strong>
                        ),
                      }}
                    >
                      {content}
                    </ReactMarkdown>
                  )}
                </div>
              );
            })}
          </div>

          {/* Schedule Call Button */}
          <div className="flex justify-center mt-4 mb-7">
            <button
              onClick={handleScheduleClick}
              disabled={sendingEmail}
              className={`mt-4 px-6 py-2 text-lg font-bold text-white rounded-md shadow transition duration-200 ${
                sendingEmail
                  ? 'bg-black/50 cursor-not-allowed'
                  : 'bg-[#3A3A3D] hover:bg-black active:bg-[#1C1C1C]'
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