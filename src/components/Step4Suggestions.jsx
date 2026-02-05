import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Toaster, toast } from 'sonner';
import { useSelector } from 'react-redux';

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION_MS = 5 * 60 * 1000;

export default function Step4Suggestions({ onNext, onBack, userPlan }) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(true);

  const formData = useSelector((state) => state.form);
  const savedAnswers = JSON.parse(localStorage.getItem('questionnaireAnswers') || '{}');
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
    : 'Product Breakdown';

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
      const { rawAnswer: rawKey, parsedSuggestions: parsedKey } = getStorageKeys();
      const timestamp = Date.now();
      
      localStorage.setItem(rawKey, JSON.stringify({
        answer: rawAnswer,
        timestamp,
      }));
      
      localStorage.setItem(parsedKey, JSON.stringify({
        suggestions: parsedSuggestions,
        timestamp,
      }));
    } catch (err) {
      console.warn("Failed to save suggestions to cache:", err);
    }
  }, [getStorageKeys]);

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
        /(\*\*)?Suggest appropriate materials for the product based on the design requirements and target price point\.?(\*\*)?\s*/gi,
        /(\*\*)?Include fabric types, weights \(GSM\), texture, special properties \(stretch, breathability, etc\.\), and any special considerations for sustainability or performance\.?(\*\*)?\s*/gi,
      ],
      'Sales Price': [
        /(\*\*)?Provide a detailed suggested retail price analysis:(\*\*)?\s*/gi,
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
        /(\*\*)?Suggest 4-6 complementary pieces that would work well with this product in a capsule collection\.?(\*\*)?\s*/gi,
        /(\*\*)?Be specific with item names and briefly explain why each piece complements the main product\.?(\*\*)?\s*/gi,
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
      <div className="bg-[#E8E8E8] min-h-screen">
        {/* Header with Back Button - Only show if user has access to Market Analysis */}
        {userPlan === 'tier2' && (
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
        )}

        {/* Title Section */}
        <div className="w-full px-6 py-8">
          <h2 className="text-[#333333] text-[32px] font-heading font-semibold leading-[1.2] text-center mb-12">
            {title}
          </h2>
        </div>

        {/* Main Content - Full Width Layout */}
        <div className="w-full px-6 pb-12">
          
          {/* Grid Row 1: 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {/* Materials Card */}
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="text-[24px] font-heading font-semibold leading-[1.2] text-black">Materials</h3>
              </div>
              <div className="text-[16px] leading-[1.2] text-black font-sans font-normal">
                {suggestions.materials ? (
                  <div className="bg-[#E8E8E8] rounded-md p-6">
                    <ReactMarkdown
                      components={{
                        hr: () => null,
                      }}
                    >
                      {suggestions.materials}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-gray-400">No data available</p>
                )}
              </div>
            </div>

            {/* Sales Price Card */}
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="text-[24px] font-heading font-semibold leading-[1.2] text-black">Sales Price</h3>
              </div>
              <div className="text-[16px] leading-[1.2] text-black font-sans font-normal">
                {suggestions.saleprices ? (
                  <div className="bg-[#E8E8E8] rounded-md p-6">
                    <ReactMarkdown
                      components={{
                        hr: () => null,
                      }}
                    >
                      {suggestions.saleprices}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-gray-400">No data available</p>
                )}
              </div>
            </div>

            {/* Cost Production Card */}
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="text-[24px] font-heading font-semibold leading-[1.2] text-black">Cost Production</h3>
              </div>
              <div className="text-[16px] leading-[1.2] text-black font-sans font-normal">
                {suggestions.productionCosts ? (
                  <div className="bg-[#E8E8E8] rounded-md p-6">
                    <ReactMarkdown
                      components={{
                        hr: () => null,
                      }}
                    >
                      {suggestions.productionCosts}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-gray-400">No data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Grid Row 2: 2 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Color Palette Card */}
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold">4</span>
                </div>
                <h3 className="text-[24px] font-heading font-semibold leading-[1.2] text-black">Color Palette</h3>
              </div>
              <div className="text-[16px] leading-[1.2] text-black font-sans font-normal">
                {suggestions.colors && extractHexColors(suggestions.colors).length > 0 ? (
                  <div className="bg-[#E8E8E8] rounded-md p-6">
                    <div className="flex flex-wrap gap-6 justify-center">
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
                  </div>
                ) : (
                  <p className="text-gray-400 text-center">No color data available</p>
                )}
              </div>
            </div>

            {/* Companion Items Card */}
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold">5</span>
                </div>
                <h3 className="text-[24px] font-heading font-semibold leading-[1.2] text-black">Companion Pieces</h3>
              </div>
              <div className="text-[16px] leading-[1.2] text-black font-sans font-normal">
                {suggestions.companionItems ? (
                  <div className="bg-[#E8E8E8] rounded-md p-6">
                    <ReactMarkdown
                      components={{
                        hr: () => null,
                      }}
                    >
                      {suggestions.companionItems}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-gray-400">No data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Navigation - Continue to Market Analysis */}
          <div className="text-center mt-12">
            {userPlan === 'tier1' ? (
              <div className="bg-white rounded-lg border border-gray-300 p-6 max-w-md mx-auto">
                <h3 className="text-[20px] font-heading font-semibold mb-3 text-black">Upgrade to Tier 2</h3>
                <p className="text-[14px] font-sans text-gray-700 mb-4">
                  Access Market Analysis, Production Timelines, and more with Tier 2 subscription.
                </p>
                <a
                  href="https://formdepartment.com/pages/about?view=subscription-plans"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-3 text-[14px] font-bold text-white bg-black hover:bg-[#3A3A3D] rounded-lg shadow-lg transition-all hover:shadow-xl"
                >
                  Upgrade Now →
                </a>
              </div>
            ) : (
              <button
                onClick={() => {
                  toast.info('Continue to view production timelines and market analysis', {
                    style: { backgroundColor: '#3A3A3D', color: '#fff' },
                  });
                  if (onNext) onNext();
                }}
                className="px-10 py-4 text-lg font-bold text-white bg-black hover:bg-[#3A3A3D] rounded-lg shadow-lg transition-all hover:shadow-xl"
              >
                Continue to Market Analysis →
              </button>
            )}
          </div>
        </div>
      </div>
    )}
  </>
);

}
