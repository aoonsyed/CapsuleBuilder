import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Toaster, toast } from 'sonner';
import { useSelector } from 'react-redux';
import emailjs from '@emailjs/browser';

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION_MS = 5 * 60 * 1000;

export default function Step4bMarketFinancials({ onNext, onBack }) {
  const savedAnswers = JSON.parse(localStorage.getItem('questionnaireAnswers') || '{}');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [sections, setSections] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [userPlan, setUserPlan] = useState(null);

  // All hooks must be called before any early returns
  const formData = useSelector((state) => state.form);
  const {
    localBrand,
    brand2,
    productType,
    idea,
    sharedPrefernce,
    targetPrice,
    quantity,
    category,
    keyFeatures,
    materialPreferenceOptions,
    manufacturingPreference,
  } = formData;

  const title = localBrand?.trim()
    ? `${localBrand.trim()} ${productType?.trim()}`
    : `Your ${productType?.trim()}`;

  // Create paramsKey based on all inputs that affect AI output
  const paramsKey = useMemo(
    () =>
      JSON.stringify({
        idea,
        brand2,
        sharedPrefernce,
        productType,
        targetPrice,
        quantity,
        category,
        keyFeatures,
        materialPreferenceOptions,
        manufacturingPreference,
        savedAnswers,
      }),
    [idea, brand2, sharedPrefernce, productType, targetPrice, quantity, category, keyFeatures, materialPreferenceOptions, manufacturingPreference, savedAnswers]
  );

  // Hash function to create consistent localStorage keys
  const hashParamsKey = useCallback((key) => {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }, []);

  // Get localStorage keys for current paramsKey
  // Note: We use the same raw answer cache key as Step4Suggestions since they share the same paramsKey
  const getStorageKeys = useCallback(() => {
    const hash = hashParamsKey(paramsKey);
    return {
      rawAnswer: `productBreakdownRawAnswer_${hash}`, // Same as Step4Suggestions
      parsedSections: `marketAnalysisParsed_${hash}`, // Separate cache for Market Analysis sections
    };
  }, [paramsKey, hashParamsKey]);

  // Load cached sections from localStorage
  const loadCachedSections = useCallback(() => {
    try {
      const { rawAnswer: rawKey, parsedSections: parsedKey } = getStorageKeys();
      
      // First check if we have cached parsed sections
      const cachedParsed = localStorage.getItem(parsedKey);
      if (cachedParsed) {
        const parsedData = JSON.parse(cachedParsed);
        
        // Check if cached data has timestamp and if it's expired
        if (parsedData.timestamp) {
          const age = Date.now() - parsedData.timestamp;
          if (age > CACHE_EXPIRATION_MS) {
            // Cache expired, remove it
            localStorage.removeItem(parsedKey);
            return null;
          }
        } else {
          // Old format without timestamp - treat as expired and remove
          localStorage.removeItem(parsedKey);
          return null;
        }
        
        // Validate structure
        if (parsedData.sections && typeof parsedData.sections === 'object') {
          return {
            sections: parsedData.sections,
          };
        }
      }
      
      // If no cached sections, check if we have the raw answer (from Step4Suggestions cache)
      const cachedRaw = localStorage.getItem(rawKey);
      if (cachedRaw) {
        const rawData = JSON.parse(cachedRaw);
        if (rawData.timestamp) {
          const age = Date.now() - rawData.timestamp;
          if (age > CACHE_EXPIRATION_MS) {
            // Cache expired
            return null;
          }
        }
        // Return null to trigger parsing from raw answer
        return null;
      }
    } catch (err) {
      console.warn("Failed to load cached sections:", err);
    }
    return null;
  }, [getStorageKeys]);

  // Save sections to cache (only cache parsed sections, raw answer is cached by Step4Suggestions)
  const saveSectionsToCache = useCallback((sections) => {
    try {
      const { parsedSections: parsedKey } = getStorageKeys();
      const timestamp = Date.now();
      
      localStorage.setItem(parsedKey, JSON.stringify({
        sections: sections,
        timestamp,
      }));
    } catch (err) {
      console.warn("Failed to save sections to cache:", err);
    }
  }, [getStorageKeys]);

  // Get suggestions from localStorage (legacy) or cache
  const rawAnswer = localStorage.getItem('answer') || '';
  const suggestions = JSON.parse(localStorage.getItem('parsedSuggestions') || '{}');

  // Remove trailing dashes and similar AI artifacts from section text
  const sanitizeSectionText = (text) => {
    if (!text || typeof text !== 'string') return text;
    let s = text.trim();
    
    // Remove the triple em dash separator (⸻) and similar characters
    s = s.replace(/⸻/g, '');
    
    // Remove all types of dashes (em dash —, en dash –, hyphen -, and similar characters)
    // Remove trailing lines that are only dashes, underscores, or whitespace
    s = s.replace(/\n[\s\-–—_⸻]*$/g, '');
    
    // Remove trailing dashes (all types) with optional whitespace at end of each line
    s = s.replace(/[\s\-–—⸻]+$/gm, '');
    
    // Remove trailing dash/hyphen/underscore at end of last line (after all line breaks)
    s = s.replace(/[\s\-–—_⸻]+$/, '');
    
    // Remove any standalone dash lines (lines that are only dashes or separators)
    s = s.replace(/^[\s\-–—_⸻]+\n?$/gm, '');
    
    // Remove lines containing only the separator character with optional whitespace
    s = s.replace(/^\s*⸻\s*$/gm, '');
    
    // Final trim
    return s.trim();
  };

  // Parse sections for this screen
  const parseSections = useCallback((rawText) => {
    const getSection = (label) => {
      const patterns = [
        new RegExp(`\\*\\*${label}\\*\\*\\s*:?\\s*\\n([\\s\\S]*?)(?=\\n\\*\\*|\\n⸻|$)`, 'i'),
        new RegExp(`\\*\\*${label}\\*\\*\\s*([\\s\\S]*?)(?=\\n\\*\\*|\\n⸻|$)`, 'i'),
        new RegExp(`${label}\\s*:?\\s*\\n([\\s\\S]*?)(?=\\n\\*\\*|\\n⸻|$)`, 'i'),
      ];
      
      for (const pattern of patterns) {
        const match = rawText.match(pattern);
        if (match && match[1] && match[1].trim()) {
          return match[1].trim();
        }
      }
      return '';
    };

    return {
      marketExamples: sanitizeSectionText(suggestions.marketExamples || getSection('Comparable Market Examples')),
      targetInsight: sanitizeSectionText(suggestions.targetInsight || getSection('Target Consumer Insight')),
      marginAnalysis: sanitizeSectionText(suggestions.marginAnalysis || getSection('Margin Analysis')),
      pricing: sanitizeSectionText(suggestions.pricing || getSection('Wholesale vs. DTC Pricing') || getSection('Wholesale vs DTC Pricing') || getSection('Wholesale vs DTC')),
      yieldConsumption: sanitizeSectionText(suggestions.yieldConsumption || getSection('Yield & Consumption Estimates')),
      leadTime: sanitizeSectionText(suggestions.leadTime || getSection('Production Lead Time Estimate')),
    };
  }, [suggestions]);

  // Check page access on mount
  useEffect(() => {
    const checkAccess = async () => {
      const params = new URLSearchParams(window.location.search);
      const cid = params.get("customer_id");
      
      if (!cid) {
        window.location.href = "https://formdepartment.com/pages/about?view=subscription-plans";
        return;
      }
      
      try {
        const response = await fetch(
          `https://backend-capsule-builder.onrender.com/proxy/check-page-access?customer_id=${cid}&page=market-analysis`
        );
        const data = await response.json();
        
        if (data.ok && data.allowed) {
          setHasAccess(true);
          setAccessChecked(true);
        } else {
          // Show upgrade page instead of redirecting
          setAccessDenied(true);
          setUserPlan(data.plan || 'tier1');
          setAccessChecked(true);
        }
      } catch (err) {
        console.error("Access check error:", err);
        // On error, still show upgrade page
        setAccessDenied(true);
        setAccessChecked(true);
      }
    };

    checkAccess();
  }, []);

  // Load cached sections or parse from localStorage
  useEffect(() => {
    if (!hasAccess) return;

    const cached = loadCachedSections();
    if (cached && cached.sections) {
      console.log("Loading Market Analysis from cache");
      setSections(cached.sections);
      return;
    }

    // Parse from legacy localStorage or cached raw answer
    if (rawAnswer) {
      const parsed = parseSections(rawAnswer);
      setSections(parsed);
      
      // Save parsed sections to cache
      saveSectionsToCache(parsed);
    }
  }, [hasAccess, rawAnswer, loadCachedSections, parseSections, saveSectionsToCache]);

  // Show loading while checking access
  if (!accessChecked) {
    return (
      <div className="bg-[#E8E8E8] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black font-sans text-[16px] font-normal leading-[1.2]">
            Verifying access...
          </p>
        </div>
      </div>
    );
  }

  // Show upgrade page if access is denied
  if (accessDenied && !hasAccess) {
    const tier2ProductId = 8424683241647;
    const tier2CheckoutUrl = `https://formdepartment.com/cart/${tier2ProductId}:1`;
    
    return (
      <>
        <Toaster position="top-right" richColors />
        <div className="bg-[#E8E8E8] min-h-screen flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-[32px] font-heading font-semibold text-black mb-4">
              Upgrade Required
            </h2>
            <p className="text-[16px] font-sans text-gray-700 mb-8 leading-relaxed">
              Your current subscription plan doesn't include access to the Market Analysis page. 
              Upgrade to Tier 2 to unlock production timelines, market analysis, and more advanced features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onBack}
                className="px-6 py-3 text-[16px] font-bold text-black bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
              >
                ← Go Back
              </button>
              <a
                href={tier2CheckoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 text-[16px] font-bold text-white bg-black hover:bg-[#3A3A3D] rounded-lg transition-all inline-block"
              >
                Buy Tier 2 →
              </a>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show loading while loading sections
  if (!hasAccess || !sections) {
    return (
      <div className="bg-[#E8E8E8] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black font-sans text-[16px] font-normal leading-[1.2]">
            Loading Market Analysis...
          </p>
        </div>
      </div>
    );
  }

  const marketExamples = sections?.marketExamples || '';
  const targetInsight = sections?.targetInsight || '';
  const marginAnalysis = sections?.marginAnalysis || '';
  const pricing = sections?.pricing || '';
  const yieldConsumption = sections?.yieldConsumption || '';
  const leadTime = sections?.leadTime || '';

  // Build email params
  const buildEmailParams = () => {
    const recipient = process.env.REACT_APP_TEAM_RECEIVER_EMAIL;
    const customerEmail =
      savedAnswers?.email || savedAnswers?.contactEmail || savedAnswers?.userEmail || '';

    return {
      to_email: recipient,
      customer_email: customerEmail,
      title,
      brand: brand2 || localBrand || '',
      product_type: productType || '',
      raw_answer: rawAnswer,
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
      toast.error('We could not send the email. We will still see your booking.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors />
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
        <div className="w-full px-6 py-8">
        <h2 className="text-[#333333] text-[32px] font-heading font-semibold leading-[1.2] text-center mb-12">
            Production & Market Analysis
          </h2>
        </div>

        {/* Main Content - Full Width Layout */}
        <div className="w-full px-6 pb-12">
          
          {/* Production Timeline Section */}
          <div className="mb-10">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Yield Card - Takes 2 columns on large screens */}
              <div className="xl:col-span-2 bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <h3 className="text-[24px] font-heading font-semibold leading-[1.2] text-black">Yield & Consumption Estimates</h3>
                </div>
                <div className="text-[16px] leading-[1.2] text-black font-sans font-normal pl-13">
                  {yieldConsumption ? (
                    <div className="bg-[#E8E8E8] rounded-md p-6">
                      <ReactMarkdown
                        components={{
                          hr: () => null,
                        }}
                      >
                        {yieldConsumption}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-400">No data available</p>
                  )}
                </div>
              </div>

              {/* Lead Time Card - Takes 1 column */}
              <div className="xl:col-span-1 bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <h3 className="text-[24px] font-heading font-semibold leading-[1.2] text-black">Lead Time</h3>
                </div>
                <div className="text-[16px] leading-[1.2] text-black font-sans font-normal pl-13">
                  {leadTime ? (
                    <div className="bg-[#E8E8E8] rounded-md p-6">
                      <ReactMarkdown
                        components={{
                          hr: () => null,
                        }}
                      >
                        {leadTime}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-400">No data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Market Positioning Section */}
          <div className="mb-10">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Comparable Market Examples */}
              <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <h4 className="text-[24px] font-heading font-semibold leading-[1.2] text-black">Comparable Market Examples</h4>
                </div>
                <div className="text-[16px] leading-[1.2] text-black font-sans font-normal">
                  {marketExamples ? (
                    <div className="bg-[#E8E8E8] rounded-md p-6">
                      <ReactMarkdown
                        components={{
                          hr: () => null,
                        }}
                      >
                        {marketExamples}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-400">No data available</p>
                  )}
                </div>
              </div>

              {/* Target Consumer */}
              <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <h4 className="text-[24px] font-heading font-semibold leading-[1.2] text-black">Target Consumer Insight</h4>
                </div>
                <div className="text-[16px] leading-[1.2] text-black font-sans font-normal">
                  {targetInsight ? (
                    <div className="bg-[#E8E8E8] rounded-md p-6">
                      <ReactMarkdown
                        components={{
                          hr: () => null,
                        }}
                      >
                        {targetInsight}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-400">No data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Financial Analysis Section */}
          <div className="mb-10">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Margin Analysis */}
              <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">5</span>
                  </div>
                  <h4 className="text-[24px] font-heading font-semibold leading-[1.2] text-black">Margin Analysis</h4>
                </div>
                <div className="text-[16px] leading-[1.2] text-black font-sans font-normal">
                  {marginAnalysis ? (
                    <div className="bg-[#E8E8E8] rounded-md p-6">
                      <ReactMarkdown
                        components={{
                          hr: () => null,
                        }}
                      >
                        {marginAnalysis}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-400">No data available</p>
                  )}
                </div>
              </div>

              {/* Pricing Strategy */}
              <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">6</span>
                  </div>
                  <h4 className="text-[24px] font-heading font-semibold leading-[1.2] text-black">Wholesale vs DTC Pricing</h4>
                </div>
                <div className="text-[16px] leading-[1.2] text-black font-sans font-normal">
                  {pricing ? (
                    <div className="bg-[#E8E8E8] rounded-md p-6">
                      <ReactMarkdown
                        components={{
                          hr: () => null,
                        }}
                      >
                        {pricing}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-400">No data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Call Button */}
          <div className="text-center mt-16 mb-8">
            <button
              onClick={handleScheduleClick}
              disabled={sendingEmail}
              className={`px-10 py-4 text-lg font-bold text-white rounded-lg shadow-lg transition-all ${
                sendingEmail ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-[#3A3A3D] hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {sendingEmail ? 'Sending details…' : 'Schedule Call →'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

