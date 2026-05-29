/** Shared helpers for capsule AI cache keys and questionnaire answers. */

export function hashParamsKey(key) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function getQuestionnaireParamsKey(form) {
  return JSON.stringify({
    productType: form.productType || "",
    keyFeatures: form.keyFeatures || "",
    targetPrice: form.targetPrice || "",
    idea: form.idea || "",
    materialPreference: form.materialPreference || "",
  });
}

/** Load questionnaire answers for the current product (hashed key, then legacy fallback). */
export function loadQuestionnaireAnswers(form) {
  const hash = hashParamsKey(getQuestionnaireParamsKey(form));
  try {
    const cached = localStorage.getItem(`questionnaireAnswers_${hash}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.answers && typeof parsed.answers === "object") {
        return parsed.answers;
      }
    }
  } catch (_) {
    /* ignore */
  }
  try {
    const legacy = JSON.parse(localStorage.getItem("questionnaireAnswers") || "{}");
    return typeof legacy === "object" && legacy !== null ? legacy : {};
  } catch (_) {
    return {};
  }
}

/** Params that affect the Product Breakdown AI output (must match Step4Suggestions). */
export function buildCapsuleParamsKey(form, savedAnswers, outputSessionKey) {
  return JSON.stringify({
    outputSessionKey: outputSessionKey || "",
    idea: form.idea || "",
    brand2: form.brand2 || "",
    localBrand: form.localBrand || "",
    sharedPreference: form.sharedPreference || "",
    productType: form.productType || "",
    targetPrice: form.targetPrice || "",
    quantity: form.quantity || "",
    keyFeatures: form.keyFeatures || "",
    materialPreferenceOptions: form.materialPreferenceOptions || {},
    manufacturingPreference: form.manufacturingPreference || {},
    savedAnswers: savedAnswers || {},
  });
}

export function getProductBreakdownStorageKeys(paramsKey) {
  const hash = hashParamsKey(paramsKey);
  return {
    rawAnswer: `productBreakdownRawAnswer_${hash}`,
    parsedSuggestions: `productBreakdownParsed_${hash}`,
    marketAnalysisParsed: `marketAnalysisParsed_${hash}`,
  };
}

const LEGACY_BREAKDOWN_SESSION_KEY = "breakdownParamsKey";

/** Read cached product breakdown for this paramsKey, or null if missing / stale. */
export function loadProductBreakdown(paramsKey, maxAgeMs) {
  const { rawAnswer: rawKey, parsedSuggestions: parsedKey } =
    getProductBreakdownStorageKeys(paramsKey);

  try {
    const cachedRaw = localStorage.getItem(rawKey);
    const cachedParsed = localStorage.getItem(parsedKey);
    if (!cachedRaw || !cachedParsed) return null;

    const rawData = JSON.parse(cachedRaw);
    const parsedData = JSON.parse(cachedParsed);

    if (!rawData.timestamp || !parsedData.timestamp) {
      localStorage.removeItem(rawKey);
      localStorage.removeItem(parsedKey);
      return null;
    }

    if (maxAgeMs != null) {
      const age = Date.now() - rawData.timestamp;
      if (age > maxAgeMs) {
        localStorage.removeItem(rawKey);
        localStorage.removeItem(parsedKey);
        return null;
      }
    }

    if (
      rawData.answer &&
      parsedData.suggestions &&
      typeof parsedData.suggestions === "object"
    ) {
      return {
        rawAnswer: rawData.answer,
        parsedSuggestions: parsedData.suggestions,
      };
    }
  } catch (_) {
    /* ignore */
  }
  return null;
}

/** Persist breakdown under hashed keys and sync legacy keys for ImageGeneration. */
export function saveProductBreakdown(paramsKey, rawAnswer, parsedSuggestions) {
  const {
    rawAnswer: rawKey,
    parsedSuggestions: parsedKey,
    marketAnalysisParsed: marketKey,
  } = getProductBreakdownStorageKeys(paramsKey);
  const timestamp = Date.now();

  localStorage.setItem(
    rawKey,
    JSON.stringify({ answer: rawAnswer, timestamp })
  );
  localStorage.setItem(
    parsedKey,
    JSON.stringify({ suggestions: parsedSuggestions, timestamp })
  );
  localStorage.removeItem(marketKey);

  localStorage.setItem("answer", rawAnswer);
  localStorage.setItem("parsedSuggestions", JSON.stringify(parsedSuggestions));
  localStorage.setItem(LEGACY_BREAKDOWN_SESSION_KEY, paramsKey);
}

/** Remove cached breakdown for this paramsKey (e.g. when validation fails). */
export function clearProductBreakdown(paramsKey) {
  const {
    rawAnswer: rawKey,
    parsedSuggestions: parsedKey,
    marketAnalysisParsed: marketKey,
  } = getProductBreakdownStorageKeys(paramsKey);
  localStorage.removeItem(rawKey);
  localStorage.removeItem(parsedKey);
  localStorage.removeItem(marketKey);
  if (localStorage.getItem(LEGACY_BREAKDOWN_SESSION_KEY) === paramsKey) {
    localStorage.removeItem("answer");
    localStorage.removeItem("parsedSuggestions");
    localStorage.removeItem(LEGACY_BREAKDOWN_SESSION_KEY);
  }
}

/** Legacy keys are only valid when they belong to the current paramsKey. */
export function loadLegacyProductBreakdown(paramsKey) {
  try {
    if (localStorage.getItem(LEGACY_BREAKDOWN_SESSION_KEY) !== paramsKey) {
      return null;
    }
    const rawAnswer = localStorage.getItem("answer") || "";
    const parsed = JSON.parse(localStorage.getItem("parsedSuggestions") || "null");
    if (!rawAnswer || !parsed || typeof parsed !== "object") return null;
    return { rawAnswer, parsedSuggestions: parsed };
  } catch (_) {
    return null;
  }
}
