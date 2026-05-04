import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Toaster, toast } from 'sonner';
import { useSelector } from 'react-redux';
import {
  parseMaterialsForDisplay,
  parseSalesPriceForDisplay,
  parseCompanionForDisplay,
} from "./capsuleResponseParsers";

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION_MS = 5 * 60 * 1000;

/** e.g. "Materials 50%" or "Materials: 50%" or one line "Materials 50%, Labour 30%" */
function parseCostProductionRows(text) {
  if (!text || typeof text !== "string") return [];
  const raw = text.replace(/\*\*/g, "");
  const rows = [];
  const seen = new Set();

  const tryLine = (line) => {
    const t = line.replace(/^[\s\-*•\d.]+\s*/, "").trim();
    if (!t || !/%/.test(t)) return;
    const m =
      t.match(/^(.+?)[\s:–—-]+\s*(\d{1,3})\s*%/) ||
      t.match(/^(.+?)\s+(\d{1,3})\s*%$/);
    if (m) {
      const label = m[1].replace(/^[\d.)]+\s*/, "").trim();
      const pct = Math.min(100, Math.max(0, parseInt(m[2], 10)));
      if (label.length > 1 && label.length < 56) {
        const key = label.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          rows.push({ label, pct });
        }
      }
    }
  };

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/,/.test(trimmed) && (trimmed.match(/%/g) || []).length > 1) {
      trimmed.split(/,(?=\s*[A-Za-zÀ-ÿ])/).forEach((chunk) => tryLine(chunk));
    } else {
      tryLine(trimmed);
    }
  }
  return rows;
}

export default function Step4Suggestions({ onNext, onBack, userPlan }) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(true);

  const formData = useSelector((state) => state.form);
  const savedAnswers = JSON.parse(localStorage.getItem('questionnaireAnswers') || '{}');
  const {
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
  } = formData;

  // Debug logging for form data
  console.log('Form data from Redux:', formData);

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
  const getStorageKeys = useCallback(() => {
    const hash = hashParamsKey(paramsKey);
    return {
      rawAnswer: `productBreakdownRawAnswer_${hash}`,
      parsedSuggestions: `productBreakdownParsed_${hash}`,
      marketAnalysisParsed: `marketAnalysisParsed_${hash}`,
    };
  }, [paramsKey, hashParamsKey]);

  // Load cached suggestions from localStorage
  const loadCachedSuggestions = useCallback(() => {
    try {
      const { rawAnswer: rawKey, parsedSuggestions: parsedKey } = getStorageKeys();
      
      // Check cached raw answer
      const cachedRaw = localStorage.getItem(rawKey);
      const cachedParsed = localStorage.getItem(parsedKey);
      
      if (cachedRaw && cachedParsed) {
        const rawData = JSON.parse(cachedRaw);
        const parsedData = JSON.parse(cachedParsed);
        
        // Check if cached data has timestamp and if it's expired
        if (rawData.timestamp && parsedData.timestamp) {
          const age = Date.now() - rawData.timestamp;
          if (age > CACHE_EXPIRATION_MS) {
            // Cache expired, remove it
            localStorage.removeItem(rawKey);
            localStorage.removeItem(parsedKey);
            return null;
          }
        } else {
          // Old format without timestamp - treat as expired and remove
          localStorage.removeItem(rawKey);
          localStorage.removeItem(parsedKey);
          return null;
        }
        
        // Validate structure
        if (rawData.answer && parsedData.suggestions && typeof parsedData.suggestions === 'object') {
          return {
            rawAnswer: rawData.answer,
            parsedSuggestions: parsedData.suggestions,
          };
        }
      }
    } catch (err) {
      console.warn("Failed to load cached suggestions:", err);
    }
    return null;
  }, [getStorageKeys]);

  // Save suggestions to cache
  const saveSuggestionsToCache = useCallback((rawAnswer, parsedSuggestions) => {
    try {
      const {
        rawAnswer: rawKey,
        parsedSuggestions: parsedKey,
        marketAnalysisParsed: marketKey,
      } = getStorageKeys();
      const timestamp = Date.now();

      localStorage.setItem(
        rawKey,
        JSON.stringify({
          answer: rawAnswer,
          timestamp,
        })
      );

      localStorage.setItem(
        parsedKey,
        JSON.stringify({
          suggestions: parsedSuggestions,
          timestamp,
        })
      );

      // Force Market Analysis to re-merge from the new breakdown + raw answer
      localStorage.removeItem(marketKey);
    } catch (err) {
      console.warn("Failed to save suggestions to cache:", err);
    }
  }, [getStorageKeys]);

  // Extract colors from the "Color Palette" markdown/text the AI returns
  const extractHexColors = (rawText) => {
    const sectionRegexes = [
      /\*\*Color Palette with HEX Codes\*\*\s*\n([\s\S]*?)(?=\n\*\*|$)/i,
      /\*\*Color Palette\*\*\s*\n([\s\S]*?)(?=\n\*\*|$)/i,
    ];
    let section = rawText || "";
    for (const re of sectionRegexes) {
      const m = rawText?.match(re);
      if (m && m[1]) {
        section = m[1];
        break;
      }
    }

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

  // Remove prompt instructions that the AI sometimes includes in responses
  const removePromptInstructions = (text, sectionLabel) => {
    if (!text || typeof text !== 'string') return text;
    
    // First, remove markdown bold formatting from instruction text
    // Instructions often come as **instruction text** which we need to detect
    let cleaned = text;
    
    // Check if the text contains actual content indicators (not just instructions)
    const hasActualContent = (content) => {
      // Remove markdown formatting for content detection
      const contentWithoutMarkdown = content.replace(/\*\*/g, '').replace(/`/g, '').trim();
      
      // If content is empty, no actual content
      if (!contentWithoutMarkdown || contentWithoutMarkdown.length === 0) {
        return false;
      }
      
      // Look for indicators of actual results vs instructions
      const contentIndicators = [
        /\$\d+/,  // Dollar amounts
        /\d+%/,   // Percentages
        /\d+\s*(GSM|yards?|lbs?|weeks?|months?|inches?)/i,  // Measurements
        /[A-Z][a-z]+\s+(Blend|Cotton|Wool|Leather|Silk|Polyester|Twill|Denim|Linen|Cashmere|Nylon|Spandex)/i,  // Material names
        /#[0-9A-Fa-f]{6}/,  // Hex colors
        /^\s*[-*•]\s+[A-Z][a-z]+/,  // Bullet points with capitalized items
        /\d+-\d+/,  // Ranges (e.g., 10-14, $80-$100)
        /[A-Z][a-z]+\s+[A-Z][a-z]+.*\$\d+/,  // Product names with prices
        /\d+\s*(weeks?|days?|months?)\s*(for|to|of|with)/i,  // Timeframes
        /[A-Z][a-z]+.*\$\d+.*\$\d+/,  // Multiple prices mentioned
        /(Fabric|Material|Weight|Texture|Property|Cost|Price|Production|Lead time|Timeline|Yardage|Consumption|Waste|Factor)/i,  // Content keywords
        /[A-Z][a-z]+\s+(Blazer|Turtleneck|Boots|Overcoat|Belt|Bag|Jacket|Pants|Shirt|Dress)/i,  // Product names
        /(domestic|overseas|production|manufacturing|wholesale|retail|DTC|margin|gross|net)/i,  // Business terms
        /\d+\s*(units?|pieces?|items?)/i,  // Quantities
        /[A-Z][a-z]+.*:\s*[A-Z]/,  // Colon followed by capitalized text (structured content)
        /(approximately|about|around|roughly|typically|usually|generally)\s+\d+/i,  // Approximations with numbers
      ];
      
      // Check if any content indicator is present
      const hasIndicator = contentIndicators.some(pattern => pattern.test(contentWithoutMarkdown));
      
      // Also check if content is substantial (more than just a few words)
      // If it's longer than 50 characters and doesn't look like pure instructions, it might have content
      const isSubstantial = contentWithoutMarkdown.length > 50;
      
      // Check if it contains sentences (has periods, colons, or structured formatting)
      const hasStructure = /[.:]\s+[A-Z]/.test(contentWithoutMarkdown) || 
                          /^\s*[-*•]\s+/.test(contentWithoutMarkdown) ||
                          /\n/.test(contentWithoutMarkdown);
      
      return hasIndicator || (isSubstantial && hasStructure);
    };
    
    // Define instruction patterns that can appear with or without markdown formatting
    const instructionPatterns = {
      'Materials': [
        /(\*\*)?You MUST output exactly four \(4\) different materials[^\n]*\n?/gi,
        /(\*\*)?Repeat this block four times[^\n]*\n?/gi,
        /(\*\*)?Suggest appropriate materials for the product based on the design requirements and target price point\.?(\*\*)?\s*/gi,
        /(\*\*)?Include fabric types, weights \(GSM\), texture, special properties \(stretch, breathability, etc\.\), and any special considerations for sustainability or performance\.?(\*\*)?\s*/gi,
      ],
      'Sales Price': [
        /(\*\*)?Put the price range on its own line first[^\n]*\n?/gi,
        /(\*\*)?You MUST include one explicit retail range[^\n]*\n?/gi,
        /(\*\*)?Provide a detailed suggested retail price analysis:(\*\*)?\s*/gi,
        /(\*\*)?Then write 2–4 short paragraphs[^\n]*\n?/gi,
        /(\*\*)?Recommended retail price range\s*\(provide a specific range, e\.g\., \$80-\$100\)(\*\*)?\s*/gi,
        /(\*\*)?Justify the pricing based on materials, market positioning, and target audience(\*\*)?\s*/gi,
        /(\*\*)?Mention competitive pricing context if relevant\.?(\*\*)?\s*/gi,
        /(\*\*)?Include any seasonal or promotional pricing considerations\.?(\*\*)?\s*/gi,
        /(\*\*)?- Recommended retail price range\s*\(provide a specific range, e\.g\., \$80-\$100\)(\*\*)?\s*/gi,
        /(\*\*)?- Justify the pricing based on materials, market positioning, and target audience(\*\*)?\s*/gi,
        /(\*\*)?- Mention competitive pricing context if relevant(\*\*)?\s*/gi,
        /(\*\*)?- Include any seasonal or promotional pricing considerations(\*\*)?\s*/gi,
      ],
      'Cost Production': [
        /(\*\*)?Provide a detailed production cost breakdown:(\*\*)?\s*/gi,
        /(\*\*)?Cost per unit\s*\(specific number\)(\*\*)?\s*/gi,
        /(\*\*)?Brief breakdown of major cost components\s*\(materials %, labor %, overhead %\)(\*\*)?\s*/gi,
        /(\*\*)?Mention any economies of scale considerations\.?(\*\*)?\s*/gi,
        /(\*\*)?Note factors that could affect cost\s*\(complexity, special finishes, etc\.\)(\*\*)?\s*/gi,
        /(\*\*)?Include comparison between domestic vs overseas production costs if relevant\.?(\*\*)?\s*/gi,
        /(\*\*)?- Cost per unit\s*\(specific number\)(\*\*)?\s*/gi,
        /(\*\*)?- Brief breakdown of major cost components\s*\(materials %, labor %, overhead %\)(\*\*)?\s*/gi,
        /(\*\*)?- Mention any economies of scale considerations(\*\*)?\s*/gi,
        /(\*\*)?- Note factors that could affect cost\s*\(complexity, special finishes, etc\.\)(\*\*)?\s*/gi,
        /(\*\*)?- Include comparison between domestic vs overseas production costs if relevant(\*\*)?\s*/gi,
      ],
      'Companion Items': [
        /(\*\*)?You MUST output exactly four \(4\) different companion pieces[^\n]*\n?/gi,
        /(\*\*)?Suggest 4-6 complementary pieces that would work well with this product in a capsule collection\.?(\*\*)?\s*/gi,
        /(\*\*)?Suggest 6[–-]8 complementary pieces for a capsule with this product\.?(\*\*)?\s*/gi,
        /(\*\*)?Be specific with item names and briefly explain why each piece complements the main product\.?(\*\*)?\s*/gi,
        /(\*\*)?Use ONLY this format[^\n]*(\*\*)?\s*/gi,
        /(\*\*)?Optional: you may add one short category line[^\n]*(\*\*)?\s*/gi,
      ],
      'Color Palette': [
        /(\*\*)?Provide ONLY 3-4 color suggestions with color names and hex codes in this EXACT format\s*\(one per line\):(\*\*)?\s*/gi,
        /(\*\*)?DO NOT include any descriptions or additional text, ONLY the format above\.?(\*\*)?\s*/gi,
      ],
      'Yield & Consumption Estimates': [
        /(\*\*)?Provide a comprehensive fabric consumption analysis:(\*\*)?\s*/gi,
        /(\*\*)?Fabric yardage per unit with justification\s*\(e\.g\., "2\.5 yards per hoodie to account for body, sleeves, hood, and ribbing"\)(\*\*)?\s*/gi,
        /(\*\*)?Total yardage for the full production run(\*\*)?\s*/gi,
        /(\*\*)?Mention fabric width assumptions\s*\(typically 58-60 inches\)(\*\*)?\s*/gi,
        /(\*\*)?Include waste factor percentage\s*\(typically 10-15%\)(\*\*)?\s*/gi,
        /(\*\*)?Note any special cutting or pattern considerations\.?(\*\*)?\s*/gi,
        /(\*\*)?Provide weight estimates if relevant\s*\(e\.g\., "Approximately 0\.8 lbs per unit"\)\.?(\*\*)?\s*/gi,
      ],
      'Production Lead Time Estimate': [
        /(\*\*)?Provide detailed production timeline estimates:(\*\*)?\s*/gi,
        /(\*\*)?Domestic production:\s*specific week range\s*\(e\.g\., 10-14 weeks\)\s*with breakdown of phases if possible\s*\(sampling, production, finishing, shipping\)(\*\*)?\s*/gi,
        /(\*\*)?Overseas production:\s*specific week range\s*\(e\.g\., 14-18 weeks\)\s*with breakdown of phases(\*\*)?\s*/gi,
        /(\*\*)?Explain key factors affecting timeline\s*\(complexity, MOQ, quality checks, customs, etc\.\)(\*\*)?\s*/gi,
        /(\*\*)?Note rush production options if available\.?(\*\*)?\s*/gi,
        /(\*\*)?Mention seasonal considerations\s*\(Chinese New Year, holiday rushes, etc\.\)(\*\*)?\s*/gi,
        /(\*\*)?All ranges should be realistic:\s*minimum 8 weeks, maximum 24 weeks\.?(\*\*)?\s*/gi,
      ],
      'Comparable Market Examples': [
        /(\*\*)?List 2–3 comparable market references\.?(\*\*)?\s*/gi,
        /(\*\*)?Select brands at similar quality and price points to the user's concept\.?(\*\*)?\s*/gi,
      ],
      'Target Consumer Insight': [
        /(\*\*)?Suggest target consumer demographics and psychographics\.?(\*\*)?\s*/gi,
        /(\*\*)?Include age range, lifestyle, values, and buying motivations that align with the product direction described\.?(\*\*)?\s*/gi,
      ],
      'Margin Analysis': [
        /(\*\*)?Calculate suggested retail price vs\. production cost to show the gross margin percentage\.?(\*\*)?\s*/gi,
        /(\*\*)?Display calculations clearly\.?(\*\*)?\s*/gi,
      ],
      'Wholesale vs. DTC Pricing': [
        /(\*\*)?Automatically generate a suggested wholesale price and direct-to-consumer\s*\(DTC\)\s*price range\.?(\*\*)?\s*/gi,
        /(\*\*)?Base calculations on standard fashion industry markups, and present both ranges clearly\.?(\*\*)?\s*/gi,
      ],
    };
    
    const patterns = instructionPatterns[sectionLabel] || [];
    
    // Remove each instruction pattern (with or without markdown formatting)
    for (const pattern of patterns) {
      cleaned = cleaned.replace(pattern, '');
    }
    
    // Remove standalone markdown bold instruction text (e.g., **instruction**)
    cleaned = cleaned.replace(/\*\*([^*]+(?:Justify|Cost per unit|Recommended|Brief|Mention|Note|Include|Suggest|Provide|List|Explain|Select|Calculate|Be specific|DO NOT|Automatically generate)[^*]*)\*\*/gi, '');
    
    // Remove bullet points that are just instructions (lines starting with "-" or "*" followed by instruction text)
    cleaned = cleaned.replace(/^[-*]\s*(\*\*)?(Suggest|Provide|List|Include|Mention|Note|Explain|Select|Calculate|Be specific|DO NOT|Automatically generate|Recommended|Brief|Justify|Cost per unit)[^\n]*(\*\*)?$/gim, '');
    
    // Remove lines that are only markdown bold instructions
    cleaned = cleaned.replace(/^\*\*[^*]*(?:Justify|Cost per unit|Recommended|Brief|Mention|Note|Include|Suggest|Provide|List|Explain|Select|Calculate|Be specific|DO NOT|Automatically generate)[^*]*\*\*\s*$/gim, '');
    
    // Clean up multiple consecutive newlines that might result from removals
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    cleaned = cleaned.trim();
    
    // Only return empty if we're CERTAIN it's ONLY instructions with NO actual content
    // Be conservative - if there's any doubt, show the content
    if (cleaned && !hasActualContent(cleaned)) {
      const cleanedForCheck = cleaned.replace(/\*\*/g, '').trim();
      
      // If content is very short (less than 15 chars), it's likely just leftover instruction fragments
      if (cleanedForCheck.length < 15) {
        console.log(`Section "${sectionLabel}" is too short after cleaning, returning empty. Content: "${cleanedForCheck}"`);
        return '';
      }
      
      // Check for EXACT instruction phrases (must match exactly, not just contain the words)
      const exactInstructionPhrases = [
        /^justify the pricing based on materials, market positioning, and target audience\.?$/i,
        /^cost per unit\s*\(specific number\)\.?$/i,
        /^recommended retail price range\s*\(provide a specific range/i,
        /^brief breakdown of major cost components\s*\(materials %, labor %, overhead %\)\.?$/i,
        /^suggest appropriate materials for the product based on the design requirements/i,
        /^include fabric types, weights \(GSM\), texture/i,
        /^suggest 4-6 complementary pieces that would work well/i,
        /^be specific with item names and briefly explain/i,
      ];
      
      const isExactInstruction = exactInstructionPhrases.some(phrase => phrase.test(cleanedForCheck));
      
      // Check if it starts with instruction keywords AND is very short (likely just instructions)
      const instructionKeywords = /^(Suggest|Provide|List|Include|Mention|Note|Explain|Select|Calculate|Be specific|DO NOT|Automatically generate|Recommended|Brief|Justify|Cost per unit)/im;
      const startsWithInstruction = instructionKeywords.test(cleanedForCheck);
      const isVeryShort = cleanedForCheck.length < 30;
      
      // Only return empty if it's an exact instruction match OR (starts with instruction keyword AND is very short)
      if (isExactInstruction || (startsWithInstruction && isVeryShort)) {
        console.log(`Section "${sectionLabel}" appears to contain only instructions, returning empty. Content: "${cleanedForCheck.substring(0, 100)}"`);
        return '';
      }
      
      // If we're not certain, return the cleaned content (better to show something than nothing)
      console.log(`Section "${sectionLabel}" has no clear content indicators but might contain results. Showing content. Length: ${cleanedForCheck.length}`);
    }
    
    return cleaned;
  };

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

  // Remove prompt text if it's accidentally included in the response
  const removePromptFromResponse = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    // Look for common prompt markers that indicate the prompt is included
    const promptMarkers = [
      /Act as a fashion design assistant\. Based on the following details:/i,
      /Please provide your response in EXACTLY this format/i,
      /DO NOT include any descriptions or additional text/i,
      /Act as a fashion design assistant/i,
    ];
    
    // Also check for prompt structure patterns (user input fields)
    const promptStructurePatterns = [
      /- Idea:\s*\S+/i,
      /- Brand:\s*\S+/i,
      /- Product Type:\s*\S+/i,
      /- Target Price:\s*\S+/i,
    ];
    
    // Check if any prompt markers exist
    let hasPrompt = false;
    for (const marker of promptMarkers) {
      if (marker.test(text)) {
        hasPrompt = true;
        break;
      }
    }
    
    // Also check if prompt structure patterns appear before section headers
    // (which would indicate the prompt is included)
    if (!hasPrompt) {
      const firstSectionMatch = text.search(/\*\*Materials\*\*/i);
      if (firstSectionMatch > 0) {
        const textBeforeSection = text.substring(0, firstSectionMatch);
        for (const pattern of promptStructurePatterns) {
          if (pattern.test(textBeforeSection)) {
            hasPrompt = true;
            break;
          }
        }
      }
    }
    
    if (!hasPrompt) {
      return text; // No prompt detected, return as-is
    }
    
    // Find the first occurrence of a section header (the actual response starts here)
    const firstSectionPattern = /\*\*Materials\*\*/i;
    const firstSectionMatch = text.search(firstSectionPattern);
    
    if (firstSectionMatch > 0) {
      // Remove everything before the first section
      const cleaned = text.substring(firstSectionMatch);
      console.log('Removed prompt text from response. Original length:', text.length, 'Cleaned length:', cleaned.length);
      return cleaned;
    }
    
    // Fallback: try to find any section header
    const anySectionPattern = /\*\*[A-Z][a-zA-Z\s]+\*\*/;
    const anySectionMatch = text.search(anySectionPattern);
    
    if (anySectionMatch > 0) {
      const cleaned = text.substring(anySectionMatch);
      console.log('Removed prompt text from response (fallback). Original length:', text.length, 'Cleaned length:', cleaned.length);
      return cleaned;
    }
    
    // If we can't find a section header, return the text as-is
    // (better to show something than nothing)
    console.warn('Could not detect section headers to remove prompt. Returning text as-is.');
    return text;
  };

  const parseAIResponse = (text) => {
    // Note: text should already be cleaned by removePromptFromResponse before calling this function
    // But we'll use the text as-is here since it's already cleaned
    
  const getSection = (label) => {
    // Try multiple patterns to catch different formatting
    const patterns = [
      new RegExp(`\\*\\*${label}\\*\\*\\s*:?\\s*\\n([\\s\\S]*?)(?=\\n\\*\\*|\\n⸻|$)`, 'i'),
      new RegExp(`\\*\\*${label}\\*\\*\\s*([\\s\\S]*?)(?=\\n\\*\\*|\\n⸻|$)`, 'i'),
      new RegExp(`${label}\\s*:?\\s*\\n([\\s\\S]*?)(?=\\n\\*\\*|\\n⸻|$)`, 'i'),
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].trim()) {
        let sectionContent = match[1].trim();
        
        // Remove prompt instructions from the section content first
        sectionContent = removePromptInstructions(sectionContent, label);
        
        // If after cleaning, content is completely empty, return empty
        if (!sectionContent || sectionContent.trim().length === 0) {
          console.log(`Section "${label}" is empty after cleaning instructions`);
          return '';
        }
        
        // Then sanitize (remove dashes, etc.)
        const sanitized = sanitizeSectionText(sectionContent);
        
        // Only reject if sanitized content is extremely short (less than 10 chars) 
        // AND starts with instruction keywords - this catches obvious instruction-only cases
        const finalCheck = sanitized.replace(/\*\*/g, '').trim();
        if (finalCheck.length < 10) {
          const instructionStarters = /^(Suggest|Provide|List|Include|Mention|Note|Explain|Select|Calculate|Be specific|DO NOT|Automatically generate|Recommended|Brief|Justify|Cost per unit)/i;
          if (instructionStarters.test(finalCheck)) {
            console.log(`Section "${label}" final content is too short and appears to be only instructions: "${finalCheck}"`);
            return '';
          }
        }
        
        // Return the sanitized content - let removePromptInstructions handle the filtering
        // If it passed that function, it likely has some content worth showing
        return sanitized;
      }
    }
    return '';
  };

  const result = {
    materials: getSection('Materials'),
    colors:
      getSection('Color Palette') ||
      getSection('Color Palette with HEX Codes') ||
      getSection('Colours') ||
      getSection('Colors'),
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
    You MUST output exactly four (4) different materials or fabrics. Repeat this block four times — no fewer than four:
    **Material name (include GSM or weight)**
    Two or three sentences on fiber content, hand feel, durability, breathability, sustainability, or relevant performance. Do not prefix lines with hyphens.

    **Sales Price**
    Put the price range on its own line first, exactly:
    **Retail price:** $XX–$YY
    Then write 2–4 short paragraphs (not bullet lists) on pricing rationale, competitors, and promotions. Do not begin lines with "-" or "*".


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
    You MUST output exactly four (4) different companion pieces. Repeat this block four times — no fewer than four:
    **Piece name**
    Two or three sentences explaining how it complements the hero product, styling, layering, and the target customer. Do not prefix lines with hyphens.

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


  // Fetch AI suggestions (check cache first)
  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      
      // First, try to load from cache
      const cached = loadCachedSuggestions();
      if (cached) {
        console.log("Loading Product Breakdown from cache");
        
        // Clean cached parsed suggestions to remove any prompt instructions
        // (handles old cached data that might contain instructions)
        const cleanedSuggestions = {};
        if (cached.parsedSuggestions) {
          Object.keys(cached.parsedSuggestions).forEach(key => {
            const sectionLabel = {
              materials: 'Materials',
              saleprices: 'Sales Price',
              productionCosts: 'Cost Production',
              companionItems: 'Companion Items',
              colors: 'Color Palette',
              yieldConsumption: 'Yield & Consumption Estimates',
              leadTime: 'Production Lead Time Estimate',
              marketExamples: 'Comparable Market Examples',
              targetInsight: 'Target Consumer Insight',
              marginAnalysis: 'Margin Analysis',
              pricing: 'Wholesale vs. DTC Pricing',
            }[key] || key;
            
            const sectionContent = cached.parsedSuggestions[key];
            if (sectionContent) {
              cleanedSuggestions[key] = sanitizeSectionText(
                removePromptInstructions(sectionContent, sectionLabel)
              );
            } else {
              cleanedSuggestions[key] = sectionContent;
            }
          });
        }
        
        // Also save to legacy keys for backward compatibility
        localStorage.setItem('answer', cached.rawAnswer);
        localStorage.setItem('parsedSuggestions', JSON.stringify(cleanedSuggestions));
        setSuggestions(cleanedSuggestions);
        setLoading(false);
        toast.success('Product Breakdown loaded from cache', {
          style: { backgroundColor: '#3A3A3D', color: '#fff' },
        });
        return;
      }

      // Cache miss - fetch from API
      try {
        const prompt = generatePrompt();
        const response = await axios.post('/api/openai', { prompt });

        console.log("OpenAI Response:", response.data); // Log the full response

        if (response?.data?.error) {
          throw new Error(`OpenAI API error: ${response.data.error}`);
        }

        let answer = response?.data?.choices?.[0]?.message?.content ?? response?.data?.choices?.[0]?.text ?? '';
        
        // Clean the response to remove any prompt text that might be included
        answer = removePromptFromResponse(answer);
        
        console.log("Parsed Answer:", answer); // Log parsed answer

        // Save to legacy keys for backward compatibility
        localStorage.setItem('answer', answer);
        console.log('Raw AI Response:', answer);
        const parsed = parseAIResponse(answer);
        console.log('Parsed Suggestions:', parsed);
        setSuggestions(parsed);

        // Store parsed suggestions for the next screen (legacy)
        localStorage.setItem('parsedSuggestions', JSON.stringify(parsed));

        // Save to cache with timestamp
        saveSuggestionsToCache(answer, parsed);

        toast.success('Product Breakdown generated successfully!', {
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

    fetchSuggestions();
  }, [paramsKey, loadCachedSuggestions, saveSuggestionsToCache]); // eslint-disable-line react-hooks/exhaustive-deps

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
        {userPlan === 'tier2' && (
          <button
            onClick={onBack}
            className="px-6 py-2 text-lg font-bold text-white bg-black hover:bg-gray-600 rounded-md transition"
          >
            ← Back
          </button>
        )}
      </div>
    ) : (
      <div
        className="bg-[#E8E8E8] min-h-screen w-full overflow-x-hidden"
        data-capsule-results="structured-v2"
        data-capsule-step="your-results"
      >
        <section
          className="relative flex flex-col items-center justify-end min-h-[min(42vw,260px)] sm:min-h-[280px] pt-10 pb-10 sm:pb-12 px-4 text-white"
          style={{
            backgroundImage:
              'linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.58) 100%), url("/assets/ayo-ogunseinde-UqT55tGBqzI-unsplash_dark_clean.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center 32%',
          }}
        >
          <img
            src="/assets/form-logo-white-transparent.png"
            alt="Form Department"
            className="absolute top-6 sm:top-8 left-1/2 -translate-x-1/2 w-[min(42vw,210px)] sm:w-[200px] md:w-[220px] h-auto"
          />
          <div className="mt-24 sm:mt-28 md:mt-24 text-center max-w-xl">
            <h2 className="font-heading text-[clamp(1.65rem,4.5vw,2.625rem)] leading-tight tracking-tight">
              Your Results
            </h2>
          </div>
        </section>

        <section className="relative -mt-6 sm:-mt-10 pb-12 sm:pb-16 px-3 sm:px-5 lg:px-8">
          <div className="mx-auto w-full max-w-xl sm:max-w-2xl lg:max-w-3xl rounded-[28px] sm:rounded-[34px] bg-[#ECEAE7] shadow-[0_14px_42px_rgba(0,0,0,0.08)] px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-11">
            <p className="text-[11px] sm:text-[12px] uppercase tracking-[0.28em] text-[#6B6560]">
              Your capsule focus
            </p>
            <h3 className="mt-3 sm:mt-4 font-heading text-[clamp(1.75rem,5vw,2.75rem)] leading-[1.05] text-[#1E1D1B] break-words">
              {productType?.trim() || category?.trim() || "Your product"}
            </h3>
            <p className="mt-3 sm:mt-4 font-sans text-sm sm:text-base text-[#1E1D1B] leading-relaxed max-w-prose">
              A technical overview of construction, sourcing, positioning, and economics for this capsule concept—generated from your inputs and questionnaire.
            </p>

            {(() => {
              const titleSerif =
                "font-heading text-2xl sm:text-3xl md:text-[2rem] text-[#1E1D1B] tracking-tight";
              const titleSerifOnDark =
                "font-heading text-2xl sm:text-3xl md:text-[2rem] text-white tracking-tight";
              const mdBody =
                "text-sm sm:text-[15px] leading-relaxed text-[#232220] break-words [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_strong]:font-semibold";
              const mdBodyDark =
                "text-sm sm:text-[15px] leading-relaxed text-white/90 break-words [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ul]:list-none [&_ul]:pl-0 [&_li]:mb-2 [&_li]:pl-0 [&_strong]:font-semibold";

              const materials = parseMaterialsForDisplay(
                suggestions.materials || ""
              );
              const costRows = parseCostProductionRows(
                suggestions.productionCosts || ""
              );
              const sales = parseSalesPriceForDisplay(suggestions.saleprices || "");
              const salesNarrative =
                (sales.body && sales.body.trim()) ||
                (!sales.retailValue
                  ? (suggestions.saleprices || "").trim()
                  : "");
              const companion = parseCompanionForDisplay(
                suggestions.companionItems || ""
              );

              const colorLines = (suggestions.colors || "")
                .split(/\r?\n/)
                .map((l) =>
                  l
                    .replace(/^[\s\-*•\d.]+\s*/, "")
                    .replace(/\*\*/g, "")
                    .trim()
                )
                .filter(Boolean);

              return (
                <>
                  {/* Materials — bold sub-headings + body (reference layout) */}
                  <div className="mt-6 sm:mt-8 rounded-[24px] sm:rounded-[28px] bg-white border border-black/[0.08] p-6 sm:p-8 shadow-sm">
                    <h4 className={`${titleSerif}`}>Materials</h4>
                    {materials.mode === "blocks" &&
                    materials.blocks.length > 0 ? (
                      <div className="mt-6 space-y-8">
                        {materials.blocks.map((b, i) => (
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
                    ) : (
                      <div className={`mt-5 ${mdBody}`}>
                        <ReactMarkdown>
                          {suggestions.materials || "No data available."}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {/* Sales Price — dark card, body + optional retail callout */}
                  <div className="mt-4 sm:mt-5 rounded-[24px] sm:rounded-[28px] bg-[#262624] p-6 sm:p-10 text-white shadow-md">
                    <h4 className={titleSerifOnDark}>Sales Price</h4>
                    <div className={`mt-5 font-sans ${mdBodyDark}`}>
                      {salesNarrative ? (
                        <ReactMarkdown>{salesNarrative}</ReactMarkdown>
                      ) : sales.retailValue ? null : (
                        <p className="text-white/80 text-sm">
                          No data available.
                        </p>
                      )}
                    </div>
                    {sales.retailValue ? (
                      <div
                        className="mt-8 text-left"
                        role="region"
                        aria-label="Retail price"
                      >
                        <p className="font-sans text-[13px] sm:text-[14px] font-semibold tracking-wide text-white">
                          Retail Price
                        </p>
                        <p className="mt-3 font-heading text-[clamp(1.5rem,5vw,2.15rem)] font-medium tabular-nums leading-tight tracking-tight text-white">
                          {sales.retailValue}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {/* Cost Production — label / % / bar rows */}
                  <div className="mt-4 sm:mt-5 rounded-[24px] sm:rounded-[28px] bg-[#F2F0E9] p-6 sm:p-8 border border-black/[0.05]">
                    <h4 className={titleSerif}>Cost Production</h4>
                    {costRows.length >= 1 ? (
                      <div className="mt-7 space-y-7">
                        {costRows.map((row) => (
                          <div key={row.label}>
                            <div className="flex justify-between items-baseline gap-4 text-left">
                              <span className="text-[13px] font-semibold text-[#1E1D1B] font-sans">
                                {row.label}
                              </span>
                              <span className="text-[13px] font-semibold text-[#1E1D1B] font-sans shrink-0 tabular-nums">
                                {row.pct}%
                              </span>
                            </div>
                            <div className="mt-3 h-[4px] w-full rounded-full bg-black/10 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#1E1D1B] transition-[width] duration-300"
                                style={{ width: `${row.pct}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={`mt-5 ${mdBody}`}>
                        <ReactMarkdown>
                          {suggestions.productionCosts || "No data available."}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {/* Color palette — 2-col grid, pill + label grouped left */}
                  <div className="mt-4 sm:mt-5 rounded-[24px] sm:rounded-[28px] bg-white border border-black/[0.08] p-6 sm:p-8 shadow-sm">
                    <h4 className={titleSerif}>Color Palette</h4>
                    {extractHexColors(suggestions.colors).length > 0 ? (
                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                        {extractHexColors(suggestions.colors)
                          .slice(0, 8)
                          .map(([name, hex], idx) => (
                            <div
                              key={`${hex}-${idx}`}
                              className="flex items-center gap-3 min-w-0"
                            >
                              <div
                                className="h-9 w-[5.25rem] shrink-0 rounded-full border border-black/10"
                                style={{ backgroundColor: hex }}
                                aria-label={name}
                              />
                              <span className="text-left text-[11px] sm:text-[12px] font-mono tracking-wide text-[#232220] uppercase truncate">
                                {name.trim() || hex}
                              </span>
                            </div>
                          ))}
                      </div>
                    ) : colorLines.length > 0 ? (
                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                        {colorLines.slice(0, 8).map((line, idx) => (
                          <div
                            key={`${idx}-${line.slice(0, 20)}`}
                            className="flex items-center gap-3 min-w-0"
                          >
                            <div
                              className="h-9 w-[5.25rem] shrink-0 rounded-full border border-black/10 bg-gradient-to-br from-[#e8e6e1] to-[#c4c2bd]"
                              aria-hidden
                            />
                            <span className="text-left text-[12px] sm:text-[13px] text-[#232220] font-sans leading-snug">
                              {line}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={`mt-5 ${mdBody}`}>
                        <ReactMarkdown>
                          {suggestions.colors || "No color direction generated."}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {/* Companion Pieces — same hierarchy as Materials */}
                  <div className="mt-4 sm:mt-5 rounded-[24px] sm:rounded-[28px] bg-white border border-black/[0.08] p-6 sm:p-8 shadow-sm">
                    <h4 className={titleSerif}>Companion Pieces</h4>
                    {companion.mode === "blocks" &&
                    companion.blocks.length > 0 ? (
                      <div className="mt-6 space-y-8">
                        {companion.blocks.map((b, i) => (
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
                    ) : (
                      <div className={`mt-5 ${mdBody}`}>
                        <ReactMarkdown>
                          {suggestions.companionItems || "No data available."}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex w-full flex-row flex-nowrap items-center justify-between gap-2 sm:gap-4">
                    <button
                      type="button"
                      onClick={onBack}
                      className="flex min-w-0 shrink-0 touch-manipulation items-center gap-2 text-[#302D29] hover:opacity-90 active:opacity-80 transition-opacity sm:gap-3"
                      aria-label="Back"
                    >
                      <span className="flex h-9 w-9 shrink-0 touch-manipulation items-center justify-center rounded-full border border-[#302D29] text-base leading-none sm:h-11 sm:w-11 sm:text-lg md:h-12 md:w-12 md:text-xl">
                        ←
                      </span>
                      <span className="text-[11px] tracking-[0.18em] uppercase font-sans font-medium sm:text-[12px] sm:tracking-[0.2em]">
                        BACK
                      </span>
                    </button>
                    {userPlan === "tier1" ? (
                      <a
                        href="https://formdepartment.com/pages/about?view=subscription-plans"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-[44px] max-w-[min(11rem,calc(100%-6.75rem))] shrink touch-manipulation items-center justify-center rounded-full bg-[#2D2A25] px-3 py-2 text-[9px] uppercase leading-snug tracking-[0.12em] text-white text-center hover:bg-[#1a1816] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2D2A25] sm:max-w-none sm:min-h-[46px] sm:gap-2 sm:px-5 sm:text-[11px] sm:tracking-[0.18em]"
                      >
                        Upgrade To Tier 2
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          toast.info(
                            "Continue to view production timelines and market analysis",
                            {
                              style: {
                                backgroundColor: "#3A3A3D",
                                color: "#fff",
                              },
                            }
                          );
                          if (onNext) onNext();
                        }}
                        className="flex min-h-[44px] max-w-[min(10.75rem,calc(100%-6.5rem))] shrink touch-manipulation items-center justify-center gap-1.5 rounded-full bg-[#2D2A25] px-2.5 py-2 uppercase tracking-[0.1em] text-white hover:bg-[#1a1816] active:bg-[#141210] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2D2A25] sm:max-w-none sm:min-h-[46px] sm:gap-2 sm:px-4 sm:tracking-[0.15em]"
                      >
                        <span className="text-center font-sans text-[8px] leading-tight sm:text-[10px] sm:leading-snug">
                          Continue To Market Analysis
                        </span>
                        <span className="shrink-0 text-[13px] leading-none sm:text-[14px]" aria-hidden>
                          →
                        </span>
                      </button>
                    )}
                  </div>
                </>
              );
            })()}
          </div>

          <div
            className="mx-auto mt-8 sm:mt-10 w-full max-w-xl sm:max-w-2xl lg:max-w-3xl rounded-[22px] sm:rounded-[26px] overflow-hidden px-4 py-10 sm:px-8 sm:py-12 text-center text-white"
            style={{
              backgroundImage:
                'linear-gradient(90deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.35) 100%), url("/assets/pesce-huang-k7DQy4YaVXk-unsplash_DARK.jpg")',
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <h3 className="font-heading text-[clamp(1.25rem,4vw,2.75rem)] leading-snug max-w-xl mx-auto">
              Refine your ideas and move forward with purpose
            </h3>
            <button
              type="button"
              className="mt-6 sm:mt-8 inline-flex min-h-[44px] w-full max-w-sm mx-auto items-center justify-center rounded-full border border-white/80 px-6 text-[11px] sm:text-[12px] uppercase tracking-[0.22em]"
            >
              Start Your Capsule Collection
            </button>
          </div>
        </section>
      </div>
    )}
  </>
);

}
