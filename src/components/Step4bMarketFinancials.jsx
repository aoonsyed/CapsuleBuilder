import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Toaster, toast } from 'sonner';
import { useSelector } from 'react-redux';
import emailjs from '@emailjs/browser';
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
      /^(Age\s*range|Lifestyle|Values|Buying\s*motivations?|Psychographics)\s*:?\s*(.+)$/i
    );
    if (!m) continue;
    const label = m[1].trim();
    const normalized =
      /^buying/i.test(label)
        ? "Buying motivations"
        : /^age/i.test(label)
          ? "Age Range"
          : /^lifestyle|^psychographics/i.test(label)
            ? "Lifestyle"
            : "Values";
    tiles.push({ key: normalized, value: m[2].trim() });
  }
  return tiles;
}

/** Pull "18–35" style spans from prose (e.g. "Targeting adults aged 18–35 who…"). */
function extractAgeSpanFromProse(fullText) {
  const s = stripMdLight(fullText).replace(/\s+/g, " ");
  let m =
    s.match(/\badults?\s+aged\s+(\d{1,2})\s*[-–]\s*(\d{1,3})\b/i) ||
    s.match(/\baged\s+(\d{1,2})\s*[-–]\s*(\d{1,3})\b/i) ||
    s.match(/\b(?:age\s*range)\s*[:\s]+(\d{1,2})\s*[-–]\s*(\d{1,3})\b/i);
  if (m) return `${m[1]}–${m[2]}`;
  m = s.match(/\b(\d{1,2})\s+(?:to|through)\s+(\d{1,3})\s+years?\b/i);
  if (m) return `${m[1]}–${m[2]}`;
  return null;
}

/** Fills Age / Lifestyle etc. when the model returned a paragraph instead of four lines. */
function buildAudienceSlotsByKey(rawInsight, parsedOrdered) {
  const keys = ["Age Range", "Lifestyle", "Values", "Buying motivations"];
  const map = {};
  for (const t of parsedOrdered) {
    if (t.value) map[t.key] = t.value;
  }
  const flat = stripMdLight(rawInsight || "").trim();
  const prose = flat.replace(/\s*\n+\s*/g, " ").trim();

  if (!map["Age Range"] && prose) {
    const g = extractAgeSpanFromProse(prose);
    if (g) map["Age Range"] = g;
  }

  const parsedFilled = parsedOrdered.filter((t) => (t.value || "").trim()).length;

  if (!map["Lifestyle"] && prose && parsedFilled < 2) {
    map["Lifestyle"] = prose.length > 420 ? `${prose.slice(0, 417)}…` : prose;
  }

  const out = {};
  for (const k of keys) {
    const v = (map[k] || "").trim();
    out[k] = v;
  }
  return out;
}

function orderConsumerInsightTiles(tiles) {
  const order = ["Age Range", "Lifestyle", "Values", "Buying motivations"];
  const used = new Set();
  const out = [];
  for (const key of order) {
    const hit = tiles.find((t) => t.key === key);
    if (hit) {
      out.push(hit);
      used.add(hit);
    }
  }
  for (const t of tiles) {
    if (!used.has(t)) out.push(t);
  }
  return out;
}

function sanitizePctHighlight(str) {
  if (!str || typeof str !== "string") return "";
  return str.replace(/\uFEFF|[\u200B-\u200D\u2060]/g, "").trim();
}

/** Optional "(note)" after a dollar range only — keeps margin formulas intact. */
function splitFinancialValueAndSub(fullVal) {
  const val = stripMdLight(fullVal).trim();
  if (!val) return { mainVal: "", sub: "" };
  if (/=/.test(val) && /[()]/.test(val)) return { mainVal: val, sub: "" };
  const tailNote = val.match(/^(.+)\s+\(([^)]+)\)\s*$/);
  if (!tailNote) return { mainVal: val, sub: "" };
  let mainVal = tailNote[1].trim();
  const sub = tailNote[2].trim();
  if (mainVal.includes("(") || /^[\s(]+$/.test(mainVal)) return { mainVal: val, sub: "" };
  if (mainVal.length > 72) return { mainVal: val, sub: "" };
  return { mainVal, sub };
}

function parseFinancialDarkCard(text) {
  const raw = stripMdLight(text);
  let highlight =
    raw.match(/=\s*([\d.]+%)/)?.[1] ||
    raw.match(/\b([\d.]+%)\s*$/m)?.[1] ||
    "";
  highlight = sanitizePctHighlight(highlight);
  const lines = [];
  for (const part of text.split(/\n+/).map((l) => l.trim()).filter(Boolean)) {
    const t = stripMdLight(part).replace(/^[-*•\d.]+\s*/, "");
    const m = t.match(/^([^:]+):\s*(.+)$/);
    if (!m) continue;
    const label = m[1].trim();
    if (label.length < 2 || label.length > 96) continue;
    const rawVal = m[2].trim();
    const { mainVal, sub } = splitFinancialValueAndSub(rawVal);
    lines.push({ label, value: mainVal, sub });
  }
  if (!highlight && lines.length) {
    const joined = lines.map((l) => l.value).join("\n");
    const fromRows =
      joined.match(/=\s*([\d.]+%)/)?.[1] ||
      joined.match(/\b([\d.]+%)\b/)?.[1] ||
      "";
    highlight = sanitizePctHighlight(fromRows);
  }
  return { lines, highlight };
}

function MarketMdBody({ children }) {
  return (
    <div className="text-[13px] sm:text-[14px] font-normal leading-relaxed text-[#232220] [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:list-none [&_ul]:pl-0 [&_li]:mb-2 [&_strong]:font-normal">
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

/** Light section cards — Market Analysis PDF: white cards use soft float shadow; serif titles. */
function MarketSectionCard({ title, children, tone = "white", bodyClassName = "" }) {
  const shells = {
    white:
      "rounded-[18px] sm:rounded-[20px] bg-white border border-black/[0.06] shadow-[0_18px_48px_rgba(0,0,0,0.072)]",
    muted:
      "rounded-[18px] sm:rounded-[20px] bg-[#E8E6E1] border border-[#D5D1CA] shadow-[0_12px_36px_rgba(0,0,0,0.045)]",
  };
  return (
    <article className={`${shells[tone]} p-8 sm:p-9 lg:p-10`}>
      <h3 className="font-heading text-[1.3125rem] sm:text-xl md:text-[1.375rem] text-[#1E1D1B] tracking-tight leading-snug">
        {title}
      </h3>
      <div className={`mt-6 sm:mt-8 ${bodyClassName}`}>{children}</div>
    </article>
  );
}

const DEMO_TILE_SHELLS = [
  "rounded-[14px] sm:rounded-2xl border border-[#D5D2CA] bg-[#EBEBE8] px-5 py-6 sm:px-7 sm:py-8",
  "rounded-[14px] sm:rounded-2xl border border-[#DAD6CF] bg-[#E7E6E2] px-5 py-6 sm:px-7 sm:py-8",
  "rounded-[14px] sm:rounded-2xl border border-[#D8D6D0] bg-[#F0EFEC] px-5 py-6 sm:px-7 sm:py-8",
  "rounded-[14px] sm:rounded-2xl border border-[#D9D8D2] bg-[#E4E3DD] px-5 py-6 sm:px-7 sm:py-8",
];

function DemographicMutedCard({ label, children, toneIndex = 0 }) {
  const shell = DEMO_TILE_SHELLS[toneIndex % DEMO_TILE_SHELLS.length];
  return (
    <div
      className={`flex min-h-[10rem] sm:min-h-[10.75rem] flex-col justify-center ${shell} text-center shadow-none`}
    >
      <span className="font-sans text-[13px] font-medium text-[#292724]">
        {label}
      </span>
      <div className="mt-4 text-[#1E1D1B]">{children}</div>
    </div>
  );
}

/** PDF ref: Comparable card + fixed 2×2 audience dashboard (four small muted tiles). */
function AudienceDashboardFourGrid({ audienceByKey }) {
  const keys = ["Age Range", "Lifestyle", "Values", "Buying motivations"];
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {keys.map((key, idx) => {
        const raw = (audienceByKey[key] || "").trim();
        return (
          <DemographicMutedCard
            key={key}
            label={`${key}:`}
            toneIndex={idx}
          >
            {key === "Age Range" ? (
              raw ? (
                <span className="block font-sans text-[clamp(2.35rem,7.5vw,3.85rem)] font-extralight tabular-nums leading-[0.98] tracking-[-0.02em] text-[#1a1816]">
                  {raw}
                </span>
              ) : (
                <span className="font-sans text-[13px] text-[#8f8b82]">Not specified</span>
              )
            ) : raw ? (
              <p className="mx-auto max-w-[18rem] font-sans text-[13px] sm:text-[14px] leading-snug text-[#2a2723]">
                {raw}
              </p>
            ) : (
              <p className="font-sans text-[13px] text-[#8f8b82]">Not specified</p>
            )}
          </DemographicMutedCard>
        );
      })}
    </div>
  );
}

function DarkFinancialCard({ title, parsed, fallbackText, showHighlight }) {
  const { lines, highlight } = parsed;
  const showHL = Boolean(showHighlight && highlight && lines.length > 0);
  const pct = sanitizePctHighlight(highlight);

  /** Single tone for Margin + Wholesale cards (dark olive-brown, not navy). */
  const shell =
    "rounded-[28px] sm:rounded-[30px] bg-[#2C2C26] px-7 sm:px-9 py-8 sm:py-10 text-white shadow-[0_24px_58px_rgba(20,19,14,0.26)] ring-1 ring-[#faf9f5]/10";

  return (
    <div className={shell}>
      <h3 className="font-heading text-[clamp(1.45rem,3.8vw,1.8rem)] font-normal tracking-tight text-white mb-8 sm:mb-9">
        {title}
      </h3>
      {lines.length > 0 ? (
        <>
          {lines.map((row, i) => (
            <div
              key={`${row.label}-${i}`}
              className={i > 0 ? "mt-5 pt-5 border-t border-[#484844]/90" : ""}
            >
              <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 items-baseline font-sans">
                <span className="max-w-[52%] text-[10px] sm:text-[11px] font-normal uppercase tracking-[0.2em] text-[#C9C5BE] leading-relaxed">
                  {row.label}:
                </span>
                <span className="text-right text-[14px] sm:text-[15px] font-normal not-italic text-white tabular-nums">
                  {row.value}
                </span>
              </div>
              {row.sub ? (
                <p className="mt-2 text-right text-[11px] sm:text-[12px] font-normal text-[#A8A49C] not-italic tracking-tight">
                  ({row.sub})
                </p>
              ) : null}
            </div>
          ))}
          {showHL ? (
            <div className="mt-8 pt-2 text-right font-heading text-[clamp(1.25rem,3.6vw,1.85rem)] font-light not-italic text-white tracking-tight tabular-nums">
              {`= ${pct}`}
            </div>
          ) : null}
        </>
      ) : (
        <div className="text-white/92 text-sm font-normal [&_p]:mb-3 [&_strong]:font-normal">
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
      parsedSections: `marketAnalysisParsed_v4_${hash}`, // bump when section shape changes
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
      <div className="bg-white min-h-screen flex items-center justify-center">
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
        <div className="bg-white min-h-screen flex items-center justify-center px-4">
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
        <div className="bg-white min-h-screen flex items-center justify-center px-4">
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
      <div className="bg-white min-h-screen flex items-center justify-center">
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

  const yieldRows = parseLabelValueLines(yieldConsumption);
  const leadParts = splitLeadTimeSections(leadTime);
  const leadRows = parseLeadTimelineRows(leadParts.main || leadTime || "");
  const leadSummaryRows = parseLeadSummaryLines(leadParts.summary || "");
  const comparableBrands = parseComparableBrandsList(marketExamples);
  const consumerTiles = parseConsumerInsightTiles(targetInsight);
  const orderedConsumerTiles = orderConsumerInsightTiles(consumerTiles);
  const audienceByKey = buildAudienceSlotsByKey(targetInsight, orderedConsumerTiles);
  const marginParsed = parseFinancialDarkCard(marginAnalysis);
  const wholesaleParsed = parseFinancialDarkCard(pricing);

  const categoryLabel = (category || "Capsule").trim().toUpperCase() + " CATEGORY";
  const productTitle =
    productType?.trim() || category?.trim() || "Your product";

  const marketBlurb =
    "A technical deep-dive into the construction, sourcing and economic blueprint of this performance silhouette.";

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
        className="bg-[#f5f4f1] min-h-screen w-full overflow-x-hidden pb-10 sm:pb-12"
        data-capsule-step="market-analysis"
      >
        {/* PDF / product mock: thin trial announcement */}
        <div className="w-full bg-[#2a2928] py-2.5 px-4 text-center">
          <p className="font-sans text-[9px] sm:text-[10px] font-normal uppercase tracking-[0.22em] text-[#b5b3ae] leading-snug">
            You are currently using a free trial. Upgrade to unlock all features
          </p>
        </div>

        {/* Hero — full-bleed image + overlay (Market Analysis screen) */}
        <section
          className="relative flex w-full flex-col items-center justify-end min-h-[min(52vh,420px)] sm:min-h-[min(52vh,480px)] pt-14 pb-12 sm:pt-16 sm:pb-14 px-4 text-center text-white"
          style={{
            backgroundImage:
              'linear-gradient(180deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.66) 100%), url("/assets/ayo-ogunseinde-UqT55tGBqzI-unsplash_dark_clean.jpg")',
            backgroundSize: "cover",
            backgroundPosition: "center 28%",
          }}
        >
          <img
            src="/assets/form-logo-white-transparent.png"
            alt="Form Department"
            className="absolute top-8 sm:top-10 left-1/2 z-10 w-[min(40vw,200px)] sm:w-[208px] md:w-[220px] h-auto -translate-x-1/2"
          />

          <h1 className="relative z-10 mt-28 sm:mt-32 mb-2 font-heading text-[clamp(1.85rem,5vw,2.75rem)] text-white tracking-tight leading-[1.1] drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)]">
            Market Analysis
          </h1>

          <p className="sr-only">
            Production and market positioning for your capsule concept
          </p>
        </section>

        <div className="relative z-10 mx-auto max-w-[1100px] -mt-14 sm:-mt-20 lg:-mt-[5.25rem] px-3 sm:px-5 lg:px-8 space-y-5 sm:space-y-6">
          {/* Market summary — cream shell (PDF): category, hero title, blurb + nested white Yield */}
          <div className="rounded-t-[36px] sm:rounded-t-[40px] rounded-b-[36px] sm:rounded-b-[40px] bg-[#F2F1ED] shadow-[0_32px_80px_rgba(0,0,0,0.14)] px-6 pt-9 pb-8 sm:px-10 sm:pt-11 sm:pb-10 border border-black/[0.06]">
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[#6B665E] font-sans">
              {categoryLabel}
            </p>
            <h2 className="mt-4 font-heading text-[clamp(1.9rem,5.2vw,2.85rem)] text-[#161514] leading-[1.04] tracking-tight">
              {productTitle}
            </h2>
            <p className="mt-5 max-w-xl text-[14px] sm:text-[15px] leading-relaxed text-[#2a2825] font-sans">
              {marketBlurb}
            </p>

            <div className="mt-9 sm:mt-10 rounded-[16px] sm:rounded-[20px] bg-white border border-black/[0.06] shadow-[0_14px_44px_rgba(0,0,0,0.07)] px-7 py-8 sm:px-9 sm:py-10">
              <h3 className="font-heading text-[1.3125rem] sm:text-xl text-[#1E1D1B] tracking-tight leading-snug">
                Yield &amp; Consumption Estimates
              </h3>
              <div className="mt-6 sm:mt-7 space-y-3.5 text-[13px] sm:text-[14px] font-sans text-[#232220] leading-relaxed">
                {yieldRows.length ? (
                  yieldRows.map((r) => (
                    <p key={`${r.label}-${r.value.slice(0, 40)}`} className="m-0 font-normal">
                      <span className="text-[#141312]">{r.label}: </span>
                      <span className="text-[#4a463f]">{r.value}</span>
                    </p>
                  ))
                ) : yieldConsumption ? (
                  <MarketMdBody>{yieldConsumption}</MarketMdBody>
                ) : (
                  <p className="text-sm text-[#756F68] font-sans">No data available</p>
                )}
              </div>
            </div>
          </div>

            {/* Lead Time — label + detail rows, subtle dividers, regular-weight body */}
            <section className="rounded-[20px] sm:rounded-[22px] bg-[#F9F8F3] px-6 py-8 sm:px-10 sm:py-11 shadow-[0_14px_40px_rgba(0,0,0,0.055)] border border-black/[0.05]">
              <h3 className="font-heading text-[1.625rem] sm:text-[1.875rem] text-[#1E1D1B] tracking-tight leading-tight mb-7 sm:mb-8">
                Lead Time
              </h3>
              {leadRows.length ? (
                <div className="space-y-0">
                  {leadRows.map((r, i) => (
                    <div
                      key={`${r.label}-${i}`}
                      className="border-b border-[#bfb8ae] pb-5 mb-5 last:border-b-0 last:pb-0 last:mb-0"
                    >
                      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-6 text-[13px] sm:text-[14px] font-sans font-normal text-[#2a2825]">
                        <span className="text-[#353330] shrink-0 sm:max-w-[42%]">
                          {r.label}:
                        </span>
                        <span className="sm:text-right sm:flex-1 sm:min-w-0">{r.value}</span>
                      </div>
                    </div>
                  ))}
                  {leadSummaryRows.length > 0 ? (
                    <div className="mt-8 rounded-[14px] sm:rounded-2xl bg-[#D9D6D0] px-5 py-5 sm:px-6 sm:py-6 font-sans text-[13px] sm:text-[14px] leading-relaxed text-[#292724] space-y-2.5 font-normal">
                      {leadSummaryRows.map((row) => (
                        <p key={row.label} className="m-0">
                          <span className="text-[#1a1816]">{row.label}: </span>
                          {row.value}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : leadTime ? (
                <div className="text-[#232220]">
                  <MarketMdBody>{leadTime}</MarketMdBody>
                </div>
              ) : (
                <p className="text-sm text-[#756F68] font-sans">No data available</p>
              )}
            </section>

            <MarketSectionCard tone="white" title="Comparable Market Examples">
              {comparableBrands.length ? (
                <div className="-mt-6 sm:-mt-8 flex flex-col gap-3 sm:gap-3.5 font-sans text-[14px] sm:text-[15px] text-[#3a3834] text-left">
                  {comparableBrands.map((b, i) => (
                    <div key={`${i}-${b.slice(0, 24)}`}>{b}</div>
                  ))}
                </div>
              ) : marketExamples ? (
                <div className="-mt-6 sm:-mt-8 [&_.font-heading]:text-[#3a3834]">
                  <MarketMdBody>{marketExamples}</MarketMdBody>
                </div>
              ) : (
                <p className="-mt-6 sm:-mt-8 text-sm text-[#756F68] font-sans">No data available</p>
              )}
            </MarketSectionCard>

            <AudienceDashboardFourGrid audienceByKey={audienceByKey} />

            <div className="flex flex-col gap-5 pt-2">
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
                className="flex min-w-0 shrink-0 touch-manipulation items-center gap-2 font-sans text-[10px] font-semibold tracking-[0.2em] text-[#282522] hover:opacity-80 active:opacity-70 transition-opacity sm:gap-3 sm:text-[11px] sm:tracking-[0.22em]"
              >
                <span className="inline-flex h-9 w-9 shrink-0 touch-manipulation items-center justify-center rounded-full border border-[#282522]/85 text-[15px] font-light leading-none sm:h-10 sm:w-10 sm:text-base">
                  ←
                </span>
                <span className="font-semibold uppercase">Back</span>
              </button>
              <button
                type="button"
                onClick={handleScheduleClick}
                disabled={sendingEmail}
                className={`flex min-h-[44px] max-w-[min(12.5rem,calc(100%-6.5rem))] shrink touch-manipulation items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:max-w-none sm:min-h-[46px] sm:gap-2.5 sm:px-6 sm:text-[10px] sm:tracking-[0.18em] ${
                  sendingEmail
                    ? "cursor-not-allowed bg-neutral-400"
                    : "bg-[#2D2D2A] hover:bg-[#252522] focus-visible:outline-white/40"
                }`}
              >
                <span className={sendingEmail ? "text-center whitespace-normal leading-tight" : ""}>
                  {sendingEmail ? "Sending details…" : "Schedule a call"}
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
    </>
  );
}

