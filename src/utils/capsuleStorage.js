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

/** Storage keys scoped to a build run so questions/answers stay stable until a new run. */
export function buildQuestionnaireStorageKey(form, runKey) {
  return JSON.stringify({
    runKey: runKey || "",
    ...JSON.parse(getQuestionnaireParamsKey(form)),
  });
}

export function getQuestionnaireStorageKeys(form, runKey) {
  const hash = hashParamsKey(buildQuestionnaireStorageKey(form, runKey));
  return {
    questions: `questionnaireQuestions_${hash}`,
    answers: `questionnaireAnswers_${hash}`,
  };
}

function readTimestampedEntry(raw, maxAgeMs) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.timestamp) return null;
    if (maxAgeMs != null && Date.now() - parsed.timestamp > maxAgeMs) {
      return null;
    }
    return parsed;
  } catch (_) {
    return null;
  }
}

/** Load cached clarifying questions for this run (null maxAge = no expiry within run). */
export function loadQuestionnaireQuestions(form, runKey, maxAgeMs = null) {
  if (!runKey) return null;
  try {
    const { questions: key } = getQuestionnaireStorageKeys(form, runKey);
    const parsed = readTimestampedEntry(localStorage.getItem(key), maxAgeMs);
    const questions = parsed?.questions;
    if (!Array.isArray(questions) || questions.length === 0) return null;
    const isValid = questions.every(
      (cat) =>
        cat &&
        typeof cat === "object" &&
        cat.title &&
        Array.isArray(cat.questions)
    );
    return isValid ? questions : null;
  } catch (_) {
    return null;
  }
}

export function saveQuestionnaireQuestions(form, runKey, questions) {
  if (!runKey) return;
  try {
    const { questions: key } = getQuestionnaireStorageKeys(form, runKey);
    localStorage.setItem(
      key,
      JSON.stringify({ questions, timestamp: Date.now() })
    );
  } catch (_) {
    /* ignore */
  }
}

export function saveQuestionnaireAnswers(form, runKey, answers) {
  if (!runKey) return;
  try {
    const { answers: key } = getQuestionnaireStorageKeys(form, runKey);
    localStorage.setItem(
      key,
      JSON.stringify({ answers, timestamp: Date.now() })
    );
    localStorage.setItem("questionnaireAnswers", JSON.stringify(answers));
  } catch (_) {
    /* ignore */
  }
}

export function clearQuestionnaireCache(form, runKey) {
  if (!runKey) return;
  try {
    const { questions, answers } = getQuestionnaireStorageKeys(form, runKey);
    localStorage.removeItem(questions);
    localStorage.removeItem(answers);
  } catch (_) {
    /* ignore */
  }
}

/** Load questionnaire answers for the current product run (hashed key, then legacy fallback). */
export function loadQuestionnaireAnswers(form, runKey = null) {
  if (runKey) {
    try {
      const { answers: key } = getQuestionnaireStorageKeys(form, runKey);
      const parsed = readTimestampedEntry(localStorage.getItem(key), null);
      if (parsed?.answers && typeof parsed.answers === "object") {
        return parsed.answers;
      }
    } catch (_) {
      /* ignore */
    }
  }

  const hash = hashParamsKey(getQuestionnaireParamsKey(form));
  try {
    const cached = localStorage.getItem(`questionnaireAnswers_${hash}`);
    const parsed = readTimestampedEntry(cached, null);
    if (parsed?.answers && typeof parsed.answers === "object") {
      return parsed.answers;
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

/** Load cached market-analysis sections derived from product breakdown. */
export function loadMarketAnalysisSections(paramsKey) {
  const hash = hashParamsKey(paramsKey);
  const key = `marketAnalysisParsed_v4_${hash}`;
  try {
    const parsed = readTimestampedEntry(localStorage.getItem(key), null);
    if (parsed?.sections && typeof parsed.sections === "object") {
      return parsed.sections;
    }
  } catch (_) {
    /* ignore */
  }
  return null;
}

export function saveMarketAnalysisSections(paramsKey, sections) {
  const hash = hashParamsKey(paramsKey);
  const key = `marketAnalysisParsed_v4_${hash}`;
  try {
    localStorage.setItem(
      key,
      JSON.stringify({ sections, timestamp: Date.now() })
    );
  } catch (_) {
    /* ignore */
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
