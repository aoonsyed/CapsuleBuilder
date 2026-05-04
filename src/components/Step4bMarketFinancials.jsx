import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Toaster, toast } from 'sonner';
import { useSelector } from 'react-redux';
import emailjs from '@emailjs/browser';
import {
  parseMaterialsForDisplay,
  parseCompanionForDisplay,
  parseSalesPriceForDisplay,
} from "./capsuleResponseParsers";

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION_MS = 5 * 60 * 1000;

/**
 * Testing only: skips Market Analysis subscription check (same path as localhost).
 * Set to `false` before any production deploy that should enforce Tier 2.
 */
const TEMP_BYPASS_MARKET_ACCESS_FOR_TESTING = true;

function stripMdLight(s) {
  if (!s || typeof s !== "string") return "";
  return s.replace(/\*\*/g, "").trim();
}

function parseLabelValueLines(text) {
  const rows = [];
  for (const line of stripMdLight(text)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)) {
    const cleaned = line.replace(/^[-*•\d.]+\s*/, "");
    const m = cleaned.match(/^([^:]{2,92}):\s*(.+)$/);
    if (m) rows.push({ label: m[1].trim(), value: m[2].trim() });
  }
  return rows;
}

function splitLeadTimeSections(markdownText) {
  if (!markdownText?.trim()) return { main: "", summary: "" };
  const rawLines = markdownText.split(/\r?\n/);
  let cut = rawLines.length;
  for (let i = 0; i < rawLines.length; i++) {
    const L = stripMdLight(rawLines[i]);
    if (/^(?:Key factors|Rush production|Seasonal considerations)\s*:/i.test(L)) {
      cut = i;
      break;
    }
  }
  if (cut === rawLines.length) return { main: markdownText.trim(), summary: "" };
  return {
    main: rawLines.slice(0, cut).join("\n").trim(),
    summary: rawLines.slice(cut).join("\n").trim(),
  };
}

function parseLeadTimelineRows(text) {
  const lines = stripMdLight(text)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const temp = [];
  let maxWeeks = 20;
  for (const line of lines) {
    const cleaned = line.replace(/^[-*•\d.]+\s*/, "");
    const m = cleaned.match(/^([^:]{2,100}):\s*(.+)$/);
    if (!m) continue;
    const label = m[1].trim();
    const value = m[2].trim();
    const wr = value.match(/(\d+)\s*[-–]\s*(\d+)\s*weeks?/i);
    const wo = value.match(/(\d+)\s*weeks?/i);
    let w = 12;
    if (wr)
      w = (parseInt(wr[1], 10) + parseInt(wr[2], 10)) / 2;
    else if (wo) w = parseInt(wo[1], 10);
    temp.push({ label, value, w });
    maxWeeks = Math.max(maxWeeks, w);
  }
  return temp.map((r) => ({
    label: r.label,
    value: r.value,
    pct: Math.min(100, Math.round((r.w / maxWeeks) * 100)),
  }));
}

function parseLeadSummaryLines(text) {
  const rows = [];
  for (const line of stripMdLight(text)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)) {
    const cleaned = line.replace(/^[-*•]\s*/, "");
    const m = cleaned.match(/^([^:]{2,80}):\s*(.+)$/);
    if (m) rows.push({ label: m[1].trim(), value: m[2].trim() });
  }
  return rows;
}

function parseComparableBrandsList(text) {
  const t = stripMdLight(text);
  const lines = t.split(/\r?\n/).map((l) => l.replace(/^[-*•\d.]+\s*/, "").trim()).filter(Boolean);
  if (lines.length >= 1) return lines;
  const comma = t.split(/(?:,|•|\/)\s*/).map((s) => s.trim()).filter(Boolean);
  return comma.length ? comma : t ? [t] : [];
}

function parseConsumerInsightTiles(text) {
  const tiles = [];
  const lines = stripMdLight(text)
    .split(/\r?\n/)
    .map((l) => l.replace(/^[-*•\d.]+\s*/, "").trim())
    .filter(Boolean);
  for (const line of lines) {
    const m = line.match(
      /^(Age\s*range|Lifestyle|Values|Buying\s*motivations?)\s*:?\s*(.+)$/i
    );
    if (!m) continue;
    const label = m[1].trim();
    const normalized =
      /^buying/i.test(label) ? "Buying motivations" : /^age/i.test(label)
        ? "Age Range"
        : /^lifestyle/i.test(label)
          ? "Lifestyle"
          : "Values";
    tiles.push({ key: normalized, value: m[2].trim() });
  }
  return tiles;
}

function parseFinancialDarkCard(text) {
  const raw = stripMdLight(text);
  const highlight =
    raw.match(/=\s*([\d.]+%)/)?.[1] ||
    raw.match(/\b([\d.]+%)\s*$/m)?.[1] ||
    "";
  const lines = [];
  for (const part of text.split(/\n+/).map((l) => l.trim()).filter(Boolean)) {
    const t = stripMdLight(part).replace(/^[-*•\d.]+\s*/, "");
    const m = t.match(/^([^:]{2,55}):\s*(.+)$/);
    if (m) {
      let val = m[2].trim();
      let sub = "";
      const paren = val.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
      let mainVal = val;
      if (paren) {
        mainVal = paren[1].trim();
        sub = paren[2].trim();
      }
      lines.push({ label: m[1].trim(), value: mainVal, sub });
    }
  }
  return { lines, highlight };
}

function MarketMdBody({ children }) {
  return (
    <div className="text-[13px] sm:text-[14px] leading-relaxed text-[#232220] [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:list-none [&_ul]:pl-0 [&_li]:mb-2 [&_strong]:font-semibold">
      <ReactMarkdown
        components={{
          hr: () => null,
        }}
      >
        {children || ""}
      </ReactMarkdown>
    </div>
  );
}

function NumberedMarketCard({ index, title, children }) {
  return (
    <div className="rounded-[26px] bg-white shadow-[0_14px_44px_rgba(0,0,0,0.07)] border border-black/[0.06] p-6 sm:p-8">
      <div className="flex items-start gap-4 mb-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-[15px] font-bold text-white font-sans">
          {index}
        </div>
        <h3 className="font-heading text-xl sm:text-2xl text-[#1E1D1B] leading-tight pt-1">{title}</h3>
      </div>
      <div className="rounded-2xl bg-[#E8E8E8] p-5 sm:p-6">{children}</div>
    </div>
  );
}

function DarkFinancialCard({ title, parsed, fallbackText, showHighlight }) {
  const { lines, highlight } = parsed;
  const showHL = Boolean(showHighlight && highlight && lines.length > 0);

  return (
    <div className="rounded-[28px] bg-[#1A1A1A] px-6 sm:px-8 py-8 text-white shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
      <h3 className="font-heading text-[1.5rem] sm:text-[1.65rem] tracking-tight mb-6">{title}</h3>
      {lines.length > 0 ? (
        <>
          {lines.map((row, i) => (
            <div
              key={`${row.label}-${i}`}
              className={i > 0 ? "mt-5 pt-5 border-t border-white/15" : ""}
            >
              <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 items-baseline font-sans">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-white/90">
                  {row.label}
                </span>
                <span className="text-right text-[15px] sm:text-base italic font-medium text-white tabular-nums">
                  {row.value}
                </span>
              </div>
              {row.sub ? (
                <p className="mt-2 text-right text-[11px] sm:text-[12px] italic text-white/50">
                  ({row.sub})
                </p>
              ) : null}
            </div>
          ))}
          {showHL ? (
            <div className="mt-8 pt-2 text-right font-heading text-[clamp(1.35rem,3.5vw,1.95rem)] font-semibold text-white tracking-tight">
              = {highlight}
            </div>
          ) : null}
        </>
      ) : (
        <div className="text-white/92 text-sm [&_p]:mb-3 [&_strong]:font-semibold">
          <ReactMarkdown
            components={{
              hr: () => null,
            }}
          >
            {fallbackText || "No data available."}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default function Step4bMarketFinancials({ onNext, onBack }) {
  const savedAnswers = JSON.parse(localStorage.getItem('questionnaireAnswers') || '{}');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [sections, setSections] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [missingCustomerId, setMissingCustomerId] = useState(false);

  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const isLocalhost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0";

  /** Dev / preview only: set REACT_APP_BYPASS_MARKET_ANALYSIS_ACCESS=true at build time. Never enable on the public production storefront. */
  const bypassMarketPaywall =
    process.env.REACT_APP_BYPASS_MARKET_ANALYSIS_ACCESS === "true";

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
      parsedSections: `marketAnalysisParsed_v2_${hash}`, // bump when section shape changes
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

  const buildMarketSections = useCallback((rawText, parsedSuggestions) => {
    const safeParsed =
      parsedSuggestions && typeof parsedSuggestions === "object"
        ? parsedSuggestions
        : {};

    const getSection = (label) => {
      const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const patterns = [
        new RegExp(
          `\\*\\*${escaped}\\*\\*\\s*:?\\s*\\n([\\s\\S]*?)(?=\\n\\*\\*|\\n⸻|$)`,
          "i"
        ),
        new RegExp(
          `\\*\\*${escaped}\\*\\*\\s*([\\s\\S]*?)(?=\\n\\*\\*|\\n⸻|$)`,
          "i"
        ),
        new RegExp(
          `${escaped}\\s*:?\\s*\\n([\\s\\S]*?)(?=\\n\\*\\*|\\n⸻|$)`,
          "i"
        ),
      ];

      for (const pattern of patterns) {
        const match = rawText.match(pattern);
        if (match && match[1] && match[1].trim()) {
          return match[1].trim();
        }
      }
      return "";
    };

    const merge = (parsedKey, ...labels) => {
      const fromParsed = safeParsed[parsedKey];
      if (typeof fromParsed === "string" && fromParsed.trim()) {
        return sanitizeSectionText(fromParsed);
      }
      for (const label of labels) {
        const fromRaw = getSection(label);
        if (fromRaw && fromRaw.trim()) {
          return sanitizeSectionText(fromRaw);
        }
      }
      return "";
    };

    return {
      materials: merge("materials", "Materials"),
      companionItems: merge("companionItems", "Companion Items"),
      saleprices: merge("saleprices", "Sales Price"),
      marketExamples: merge(
        "marketExamples",
        "Comparable Market Examples"
      ),
      targetInsight: merge("targetInsight", "Target Consumer Insight"),
      marginAnalysis: merge("marginAnalysis", "Margin Analysis"),
      pricing: merge(
        "pricing",
        "Wholesale vs. DTC Pricing",
        "Wholesale vs DTC Pricing",
        "Wholesale vs DTC"
      ),
      yieldConsumption: merge(
        "yieldConsumption",
        "Yield & Consumption Estimates"
      ),
      leadTime: merge(
        "leadTime",
        "Production Lead Time Estimate",
        "Production Lead Time"
      ),
    };
  }, []);

  // Check page access on mount (no hard redirect — use in-app states)
  useEffect(() => {
    const checkAccess = async () => {
      const params = new URLSearchParams(window.location.search);
      const cid = params.get("customer_id");

      if (
        isLocalhost ||
        bypassMarketPaywall ||
        TEMP_BYPASS_MARKET_ACCESS_FOR_TESTING
      ) {
        setHasAccess(true);
        setAccessChecked(true);
        setAccessDenied(false);
        setMissingCustomerId(false);
        return;
      }

      if (!cid) {
        setMissingCustomerId(true);
        setHasAccess(false);
        setAccessDenied(false);
        setAccessChecked(true);
        return;
      }

      try {
        const response = await fetch(
          `https://backend-capsule-builder.onrender.com/proxy/check-page-access?customer_id=${cid}&page=market-analysis`
        );
        const data = await response.json();

        if (data.ok && data.allowed) {
          setHasAccess(true);
          setAccessDenied(false);
          setMissingCustomerId(false);
        } else {
          setAccessDenied(true);
          setHasAccess(false);
          setMissingCustomerId(false);
        }
      } catch (err) {
        console.error("Access check error:", err);
        setAccessDenied(true);
        setHasAccess(false);
        setMissingCustomerId(false);
      }
      setAccessChecked(true);
    };

    checkAccess();
  }, [isLocalhost, bypassMarketPaywall]);

  // Load cached sections or parse fresh from localStorage whenever inputs change
  useEffect(() => {
    if (!hasAccess) return;

    const cached = loadCachedSections();
    if (cached && cached.sections) {
      console.log("Loading Market Analysis from cache");
      setSections(cached.sections);
      return;
    }

    let rawText = "";
    let parsed = {};
    try {
      rawText = localStorage.getItem("answer") || "";
    } catch {
      rawText = "";
    }
    try {
      parsed = JSON.parse(localStorage.getItem("parsedSuggestions") || "{}");
    } catch {
      parsed = {};
    }

    const built = buildMarketSections(rawText, parsed);
    setSections(built);
    if (
      built.materials ||
      built.companionItems ||
      built.saleprices ||
      built.marketExamples ||
      built.targetInsight ||
      built.marginAnalysis ||
      built.pricing ||
      built.yieldConsumption ||
      built.leadTime
    ) {
      saveSectionsToCache(built);
    }
  }, [
    hasAccess,
    paramsKey,
    loadCachedSections,
    saveSectionsToCache,
    buildMarketSections,
  ]);

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

  if (missingCustomerId) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <div className="bg-[#E8E8E8] min-h-screen flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-[28px] font-heading font-semibold text-black mb-3">
              Sign in required
            </h2>
            <p className="text-[15px] font-sans text-gray-700 mb-6 leading-relaxed">
              Open the Capsule Builder from your Form Department account so your session
              includes a customer ID. The subscription page opened before because the app
              could not verify access without it.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 text-[15px] font-semibold text-black bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
              >
                ← Back to results
              </button>
              <a
                href="https://formdepartment.com/account/login"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 text-[15px] font-semibold text-white bg-black hover:bg-[#3A3A3D] rounded-lg transition-all inline-block"
              >
                Go to account login
              </a>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show upgrade page if access is denied (tier / plan from backend)
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

  const materialsMd = sections?.materials || "";
  const companionMd = sections?.companionItems || "";
  const salepricesMd = sections?.saleprices || "";
  const marketExamples = sections?.marketExamples || '';
  const targetInsight = sections?.targetInsight || '';
  const marginAnalysis = sections?.marginAnalysis || '';
  const pricing = sections?.pricing || '';
  const yieldConsumption = sections?.yieldConsumption || '';
  const leadTime = sections?.leadTime || '';

  const recapMaterials = parseMaterialsForDisplay(materialsMd);
  const recapCompanion = parseCompanionForDisplay(companionMd);
  const recapSales = parseSalesPriceForDisplay(salepricesMd);
  const recapSalesNarrative =
    (recapSales.body && recapSales.body.trim()) ||
    (!recapSales.retailValue ? salepricesMd.trim() : "");

  const yieldRows = parseLabelValueLines(yieldConsumption);
  const leadParts = splitLeadTimeSections(leadTime);
  const leadRows = parseLeadTimelineRows(leadParts.main || leadTime || "");
  const leadSummaryRows = parseLeadSummaryLines(leadParts.summary || "");
  const comparableBrands = parseComparableBrandsList(marketExamples);
  const consumerTiles = parseConsumerInsightTiles(targetInsight);
  const marginParsed = parseFinancialDarkCard(marginAnalysis);
  const wholesaleParsed = parseFinancialDarkCard(pricing);

  const categoryLabel = (category || "Capsule").trim().toUpperCase() + " CATEGORY";
  const productTitle =
    productType?.trim() || category?.trim() || "Your product";

  const marketBlurb =
    "A technical deep-dive into the construction, sourcing, positioning, and economics for this capsule concept—based on your inputs and questionnaire.";

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
      raw_answer: (() => {
        try {
          return localStorage.getItem("answer") || "";
        } catch {
          return "";
        }
      })(),
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

  async function handleScheduleClick() {
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
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      <div
        className="bg-[#E8E8E8] min-h-screen w-full overflow-x-hidden pb-8"
        data-capsule-step="market-analysis"
      >
        {/* Hero — aligned with Results: no overlay back button (footer retains Back) */}
        <section
          className="relative flex w-full flex-col items-center justify-end min-h-[min(42vw,260px)] sm:min-h-[280px] pt-10 pb-10 sm:pb-12 px-4 text-center text-white"
          style={{
            backgroundImage:
              'linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.58) 100%), url("/assets/ayo-ogunseinde-UqT55tGBqzI-unsplash_dark_clean.jpg")',
            backgroundSize: "cover",
            backgroundPosition: "center 32%",
          }}
        >
          <img
            src="/assets/form-logo-white-transparent.png"
            alt="Form Department"
            className="absolute top-6 sm:top-8 left-1/2 z-10 w-[min(42vw,210px)] sm:w-[200px] md:w-[220px] h-auto -translate-x-1/2"
          />

          <h1 className="relative z-10 mt-24 sm:mt-28 md:mt-24 mb-1 font-heading text-[clamp(1.65rem,4.5vw,2.625rem)] text-white tracking-tight leading-tight">
            Market Analysis
          </h1>

          <p className="sr-only">
            Production and market positioning for your capsule concept
          </p>
        </section>

        <div className="relative z-10 mx-auto max-w-[1100px] -mt-6 sm:-mt-10 px-3 sm:px-5 lg:px-6">
          <div className="rounded-t-[32px] sm:rounded-t-[36px] bg-[#ECEAE7] shadow-[0_24px_60px_rgba(0,0,0,0.12)] px-5 pt-10 pb-8 sm:px-10 sm:pt-11 sm:pb-10 border border-black/[0.06]">
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.26em] text-[#6B6560] font-sans">
              {categoryLabel}
            </p>
            <h2 className="mt-4 font-heading text-[clamp(1.875rem,5vw,2.625rem)] text-[#1E1D1B] leading-[1.05]">
              {productTitle}
            </h2>
            <p className="mt-4 max-w-xl text-[14px] sm:text-[15px] leading-relaxed text-[#1E1D1B] font-sans">
              {marketBlurb}
            </p>

            {/* Capsule recap — same building blocks as Your Results */}
            <p className="mt-10 text-[10px] sm:text-[11px] uppercase tracking-[0.26em] text-[#6B6560] font-sans">
              Capsule recap
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
              <div className="rounded-[24px] sm:rounded-[28px] bg-white border border-black/[0.08] p-6 sm:p-8 shadow-sm">
                <h3 className="font-heading text-xl sm:text-2xl text-[#1E1D1B] tracking-tight">
                  Materials
                </h3>
                {recapMaterials.mode === "blocks" && recapMaterials.blocks.length > 0 ? (
                  <div className="mt-6 space-y-8">
                    {recapMaterials.blocks.map((b, i) => (
                      <div key={`${b.title}-${i}`}>
                        <div className="font-heading text-[17px] sm:text-[19px] text-[#1E1D1B] tracking-tight">
                          {b.title}
                        </div>
                        <div className="mt-2 text-[13px] sm:text-[14px] leading-[1.55] text-[#4a4744] whitespace-pre-wrap">
                          {b.body}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : materialsMd ? (
                  <div className="mt-5 text-[13px] sm:text-[14px] leading-relaxed text-[#232220] [&_p]:mb-3">
                    <ReactMarkdown components={{ hr: () => null }}>{materialsMd}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-[#756F68] font-sans">No data available</p>
                )}
              </div>

              <div className="rounded-[24px] sm:rounded-[28px] bg-white border border-black/[0.08] p-6 sm:p-8 shadow-sm">
                <h3 className="font-heading text-xl sm:text-2xl text-[#1E1D1B] tracking-tight">
                  Companion Pieces
                </h3>
                {recapCompanion.mode === "blocks" && recapCompanion.blocks.length > 0 ? (
                  <div className="mt-6 space-y-8">
                    {recapCompanion.blocks.map((b, i) => (
                      <div key={`${b.title}-${i}`}>
                        <div
                          className={
                            b.body?.trim()
                              ? "font-heading text-[17px] sm:text-[19px] text-[#1E1D1B] tracking-tight"
                              : "font-sans font-semibold text-[14px] uppercase tracking-[0.12em] text-[#5c5349]"
                          }
                        >
                          {b.title}
                        </div>
                        <div className="mt-2 text-[13px] sm:text-[14px] leading-[1.55] text-[#4a4744] whitespace-pre-wrap">
                          {b.body}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : companionMd ? (
                  <div className="mt-5 text-[13px] sm:text-[14px] leading-relaxed text-[#232220] [&_p]:mb-3">
                    <ReactMarkdown components={{ hr: () => null }}>{companionMd}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-[#756F68] font-sans">No data available</p>
                )}
              </div>

              <div className="rounded-[24px] sm:rounded-[28px] bg-[#262624] p-6 sm:p-10 text-white shadow-md lg:col-span-2">
                <h3 className="font-heading text-xl sm:text-2xl text-white tracking-tight">
                  Sales Price
                </h3>
                <div className="mt-5 text-sm sm:text-[15px] leading-relaxed text-white/90 [&_p]:mb-3 [&_p:last-child]:mb-0">
                  {recapSalesNarrative ? (
                    <ReactMarkdown components={{ hr: () => null }}>{recapSalesNarrative}</ReactMarkdown>
                  ) : recapSales.retailValue ? null : (
                    <p className="text-white/80 text-sm">No data available.</p>
                  )}
                </div>
                {recapSales.retailValue ? (
                  <div className="mt-8 text-left" role="region" aria-label="Retail price">
                    <p className="font-sans text-[13px] sm:text-[14px] font-semibold tracking-wide text-white">
                      Retail Price
                    </p>
                    <div className="mt-3 rounded-xl border border-white/15 bg-[#F2EFE9] px-5 py-4">
                      <p className="font-heading text-[clamp(1.5rem,5vw,2.15rem)] font-medium tabular-nums leading-tight tracking-tight text-[#161514]">
                        {recapSales.retailValue}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <h2 className="mt-10 sm:mt-12 mb-6 sm:mb-8 text-center font-heading text-xl sm:text-2xl text-[#292724] tracking-tight">
              Production &amp; Market Analysis
            </h2>

            {/* 1 · Yield · 2 · Lead */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
              <NumberedMarketCard index={1} title="Yield & Consumption Estimates">
                {yieldRows.length ? (
                  <div className="space-y-3.5 text-[13px] sm:text-[14px] font-sans text-[#232220] leading-relaxed">
                    {yieldRows.map((r) => (
                      <p key={`${r.label}-${r.value.slice(0, 40)}`} className="m-0">
                        <span className="font-semibold text-[#1a1a1a]">{r.label}: </span>
                        <span>{r.value}</span>
                      </p>
                    ))}
                  </div>
                ) : yieldConsumption ? (
                  <MarketMdBody>{yieldConsumption}</MarketMdBody>
                ) : (
                  <p className="text-sm text-[#756F68] font-sans">No data available</p>
                )}
              </NumberedMarketCard>

              <NumberedMarketCard index={2} title="Lead Time">
                {leadRows.length ? (
                  <div className="space-y-5">
                    {leadRows.map((r, i) => (
                      <div key={`${r.label}-${i}`}>
                        <div className="flex justify-between gap-3 items-baseline text-[13px] sm:text-[14px] font-sans text-[#1a1a1a]">
                          <span className="font-semibold">{r.label}</span>
                          <span className="text-[#45423e]">{r.value}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="relative h-[5px] flex-1 overflow-hidden rounded-full bg-black/[0.1]">
                            <div
                              className="h-full rounded-full bg-[#2c2c2c]"
                              style={{ width: `${r.pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {leadSummaryRows.length > 0 ? (
                      <div className="mt-6 rounded-xl bg-[#DFDCD6] px-4 py-4 font-sans text-[13px] leading-relaxed text-[#292724] space-y-2">
                        {leadSummaryRows.map((row) => (
                          <p key={row.label} className="m-0">
                            <span className="font-semibold">{row.label}: </span>
                            {row.value}
                          </p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : leadTime ? (
                  <MarketMdBody>{leadTime}</MarketMdBody>
                ) : (
                  <p className="text-sm text-[#756F68] font-sans">No data available</p>
                )}
              </NumberedMarketCard>
            </div>

            {/* 3 · Market examples · 4 · Target */}
            <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
              <NumberedMarketCard index={3} title="Comparable Market Examples">
                {comparableBrands.length ? (
                  <div className="flex flex-col gap-2 font-sans text-[14px] sm:text-[15px] text-[#232220]">
                    {comparableBrands.map((b, i) => (
                      <div key={`${i}-${b}`}>{b}</div>
                    ))}
                  </div>
                ) : marketExamples ? (
                  <MarketMdBody>{marketExamples}</MarketMdBody>
                ) : (
                  <p className="text-sm text-[#756F68] font-sans">No data available</p>
                )}
              </NumberedMarketCard>

              <NumberedMarketCard index={4} title="Target Consumer Insight">
                {consumerTiles.length >= 2 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {consumerTiles.slice(0, 4).map((t) => (
                      <div
                        key={t.key}
                        className="relative flex min-h-[6.75rem] flex-col justify-center rounded-2xl bg-[#DFDCD6]/90 px-3 py-3 text-center"
                      >
                        <span className="text-[11px] font-bold uppercase tracking-wide text-[#4a463f]">
                          {t.key}
                        </span>
                        <span className="mt-2 block text-[12px] sm:text-[13px] leading-snug text-[#1E1D1B]">
                          {t.value}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : targetInsight ? (
                  <MarketMdBody>{targetInsight}</MarketMdBody>
                ) : (
                  <p className="text-sm text-[#756F68] font-sans">No data available</p>
                )}
              </NumberedMarketCard>
            </div>

            {/* 5 · 6 dark financial cards */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-stretch">
              <DarkFinancialCard
                title="Margin Analysis"
                parsed={marginParsed}
                fallbackText={marginAnalysis}
                showHighlight
              />
              <DarkFinancialCard
                title="Wholesale vs DTC Pricing"
                parsed={wholesaleParsed}
                fallbackText={pricing}
                showHighlight={false}
              />
            </div>

            {/* Footer actions */}
            <div className="mt-11 flex w-full flex-row flex-nowrap items-center justify-between gap-2 border-t border-black/[0.08] pt-9 sm:gap-6">
              <button
                type="button"
                onClick={onBack}
                className="flex min-w-0 shrink-0 touch-manipulation items-center gap-2 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-[#282522] hover:opacity-80 active:opacity-70 transition-opacity sm:gap-3 sm:text-[11px] sm:tracking-[0.2em]"
              >
                <span className="inline-flex h-9 w-9 shrink-0 touch-manipulation items-center justify-center rounded-full border border-[#282522]/80 text-sm leading-none sm:h-10 sm:w-10 sm:text-base">
                  ←
                </span>
                Back
              </button>
              <button
                type="button"
                onClick={handleScheduleClick}
                disabled={sendingEmail}
                className={`flex min-h-[44px] max-w-[min(10.75rem,calc(100%-6.5rem))] shrink touch-manipulation items-center justify-center gap-2 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:max-w-none sm:min-h-[46px] sm:gap-2.5 sm:px-5 sm:text-[11px] sm:tracking-[0.16em] ${
                  sendingEmail
                    ? "cursor-not-allowed bg-neutral-400"
                    : "bg-[#1a1918] hover:bg-black focus-visible:outline-white/40"
                }`}
              >
                <span className={sendingEmail ? "text-center whitespace-normal leading-tight" : ""}>
                  {sendingEmail ? "Sending details…" : "Schedule Call"}
                </span>
                {!sendingEmail ? (
                  <span className="text-sm leading-none shrink-0 sm:text-base" aria-hidden>
                    →
                  </span>
                ) : null}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

