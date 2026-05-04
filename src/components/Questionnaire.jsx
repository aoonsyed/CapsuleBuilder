import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION_MS = 5 * 60 * 1000;

const HERO_STYLE = {
  backgroundImage:
    'linear-gradient(180deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.65) 100%), url("/assets/ayo-ogunseinde-UqT55tGBqzI-unsplash_dark_clean.jpg")',
  backgroundSize: "cover",
  backgroundPosition: "center",
};

/** Same chrome as Step1Vision / Step2Inspiration / Step3ProductFocus (full-bleed hero) */
function StepFormShell({ children }) {
  return (
    <div className="w-full min-w-0 min-h-screen bg-white">
      <section
        className="relative w-full min-w-0 h-[350px] flex flex-col items-center justify-end pb-10 px-6 text-center"
        style={HERO_STYLE}
      >
        <div className="absolute top-8 left-0 right-0 flex items-center justify-center">
          <img
            src="/assets/form-logo-white-transparent.png"
            alt="Form Department logo"
            className="w-[210px] h-auto"
          />
        </div>
        <h2 className="mt-10 font-heading text-[34px] leading-[1.15] text-[#C7A15E]">
          Your Curated Capsule
        </h2>
      </section>
      <section className="relative -mt-[110px] w-full px-6 pb-10">{children}</section>
    </div>
  );
}

export default function Questionaire({ onNext, onBack }) {
  const {
    productType,
    keyFeatures,
    targetPrice,
    idea,
    materialPreference,
  } = useSelector((state) => state.form);

  const [questionsData, setQuestionsData] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadTick, setReloadTick] = useState(0);

  const paramsKey = useMemo(
    () =>
      JSON.stringify({
        productType,
        keyFeatures,
        targetPrice,
        idea,
        materialPreference,
      }),
    [productType, keyFeatures, targetPrice, idea, materialPreference]
  );

  const lastKeyRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  const hashParamsKey = useCallback((key) => {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }, []);

  const getStorageKeys = useCallback(() => {
    const hash = hashParamsKey(paramsKey);
    return {
      questions: `questionnaireQuestions_${hash}`,
      answers: `questionnaireAnswers_${hash}`,
    };
  }, [paramsKey, hashParamsKey]);

  const loadCachedQuestions = useCallback(() => {
    try {
      const { questions: questionsKey } = getStorageKeys();
      const cached = localStorage.getItem(questionsKey);
      if (cached) {
        const parsed = JSON.parse(cached);

        if (parsed.timestamp) {
          const age = Date.now() - parsed.timestamp;
          if (age > CACHE_EXPIRATION_MS) {
            localStorage.removeItem(questionsKey);
            return null;
          }
        } else {
          localStorage.removeItem(questionsKey);
          return null;
        }

        const questions = parsed.questions;
        if (Array.isArray(questions) && questions.length > 0) {
          const isValid = questions.every(
            (cat) =>
              cat &&
              typeof cat === "object" &&
              cat.title &&
              Array.isArray(cat.questions)
          );
          if (isValid) {
            return questions;
          }
        }
      }
    } catch (err) {
      console.warn("Failed to load cached questions:", err);
    }
    return null;
  }, [getStorageKeys]);

  const loadCachedAnswers = useCallback(() => {
    try {
      const { answers: answersKey } = getStorageKeys();
      const cached = localStorage.getItem(answersKey);
      if (cached) {
        const parsed = JSON.parse(cached);

        if (parsed.timestamp) {
          const age = Date.now() - parsed.timestamp;
          if (age > CACHE_EXPIRATION_MS) {
            localStorage.removeItem(answersKey);
            return null;
          }
        } else {
          localStorage.removeItem(answersKey);
          return null;
        }

        const ans = parsed.answers;
        if (typeof ans === "object" && ans !== null) {
          return ans;
        }
      }
    } catch (err) {
      console.warn("Failed to load cached answers:", err);
    }
    return null;
  }, [getStorageKeys]);

  const matchAnswersToQuestions = useCallback((cachedAnswers, questions) => {
    if (!cachedAnswers || !questions) return {};

    const matched = {};
    const allQuestions = questions.flatMap((cat) =>
      cat.questions.map((q) => q.question)
    );

    Object.keys(cachedAnswers).forEach((questionText) => {
      if (allQuestions.includes(questionText)) {
        matched[questionText] = cachedAnswers[questionText];
      }
    });

    return matched;
  }, []);

  const saveAnswersToStorage = useCallback(
    (answersToSave) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        try {
          const { answers: answersKey } = getStorageKeys();
          const dataToSave = {
            answers: answersToSave,
            timestamp: Date.now(),
          };
          localStorage.setItem(answersKey, JSON.stringify(dataToSave));
        } catch (err) {
          console.warn("Failed to save answers to localStorage:", err);
        }
      }, 400);
    },
    [getStorageKeys]
  );

  const saveAnswersImmediately = useCallback(
    (answersToSave) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      try {
        const { answers: answersKey } = getStorageKeys();
        const dataToSave = {
          answers: answersToSave,
          timestamp: Date.now(),
        };
        localStorage.setItem(answersKey, JSON.stringify(dataToSave));
      } catch (err) {
        console.warn("Failed to save answers to localStorage:", err);
      }
    },
    [getStorageKeys]
  );

  const handleAnswerChange = (question, value) => {
    setAnswers((prev) => {
      const updated = { ...prev, [question]: value };
      saveAnswersToStorage(updated);
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveAnswersImmediately(answers);
    localStorage.setItem("questionnaireAnswers", JSON.stringify(answers));
    if (onNext) onNext();
  };

  const prompt = useMemo(
    () =>
      `
You are generating a product questionnaire for a custom apparel item.

Return a JSON array with exactly 3 fixed categories:
1. "Fit & Support"
2. "Fabric & Performance"
3. "Adjustability & Comfort"

Each category must contain 2–4 related multiple-choice or text questions.

Use this format only:

[
  {
    "title": "Fit & Support",
    "questions": [
      {
        "question": "Write a relevant question?",
        "type": "multiple-choice" or "text",
        "options": ["Option 1", "Option 2"]
      }
    ]
  },
  { "title": "Fabric & Performance", "questions": [...] },
  { "title": "Adjustability & Comfort", "questions": [...] }
]

User’s product input:
- Product Type: ${productType || "-"}
- Key Features: ${keyFeatures || "-"}
- Target Price: ${targetPrice || "-"}
- Idea: ${idea || "-"}
- Material Preference: ${materialPreference || "-"}

Only return the JSON. No markdown. No explanation.
`.trim(),
    [productType, keyFeatures, targetPrice, idea, materialPreference]
  );

  const sanitizeAndParseJSON = (raw) => {
    if (!raw) throw new Error("Empty content");
    let s = raw.trim();
    if (s.startsWith("```")) {
      s = s.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    }
    const first = Math.min(
      ...[s.indexOf("["), s.indexOf("{")].filter((x) => x >= 0)
    );
    const last = Math.max(s.lastIndexOf("]"), s.lastIndexOf("}"));
    if (first >= 0 && last > first) s = s.slice(first, last + 1);
    const parsed = JSON.parse(s);
    if (!Array.isArray(parsed)) throw new Error("Parsed JSON is not an array");
    return parsed;
  };

  useEffect(() => {
    const cachedAnswers = loadCachedAnswers();
    if (cachedAnswers && Object.keys(cachedAnswers).length > 0) {
      if (questionsData.length > 0) {
        const matched = matchAnswersToQuestions(cachedAnswers, questionsData);
        if (Object.keys(matched).length > 0) {
          setAnswers(matched);
        }
      } else {
        setAnswers(cachedAnswers);
      }
    }
  }, [loadCachedAnswers, matchAnswersToQuestions, questionsData]);

  useEffect(() => {
    const shouldForceRefresh = reloadTick > 0;

    if (
      lastKeyRef.current === paramsKey &&
      questionsData.length > 0 &&
      !shouldForceRefresh
    ) {
      setLoading(false);
      const cachedAnswers = loadCachedAnswers();
      if (cachedAnswers) {
        const matched = matchAnswersToQuestions(cachedAnswers, questionsData);
        if (Object.keys(matched).length > 0) {
          setAnswers(matched);
        }
      }
      return;
    }

    if (lastKeyRef.current !== null && lastKeyRef.current !== paramsKey) {
      setAnswers({});
    }
    lastKeyRef.current = paramsKey;

    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);

      if (!shouldForceRefresh) {
        const cachedQuestions = loadCachedQuestions();
        if (cachedQuestions) {
          setQuestionsData(cachedQuestions);
          setLoading(false);

          const cachedAnswers = loadCachedAnswers();
          if (cachedAnswers) {
            const matched = matchAnswersToQuestions(
              cachedAnswers,
              cachedQuestions
            );
            if (Object.keys(matched).length > 0) {
              setAnswers(matched);
            }
          }
          return;
        }
      } else {
        try {
          const { questions: questionsKey } = getStorageKeys();
          localStorage.removeItem(questionsKey);
        } catch (err) {
          console.warn("Failed to clear cache:", err);
        }
      }

      try {
        const res = await axios.post("/api/openai", { prompt });

        if (res?.data?.error) {
          throw new Error(`OpenAI API error: ${res.data.error}`);
        }

        const content =
          res?.data?.choices?.[0]?.message?.content ??
          res?.data?.choices?.[0]?.text ??
          "";

        if (!content || content.trim() === "") {
          throw new Error("OpenAI returned empty content");
        }

        let parsed;
        try {
          parsed = sanitizeAndParseJSON(content);
        } catch (err) {
          try {
            const maybe = JSON.parse(content);
            parsed = Array.isArray(maybe)
              ? maybe
              : sanitizeAndParseJSON(maybe);
          } catch (innerErr) {
            console.error("Failed to parse OpenAI response:", content);
            throw innerErr;
          }
        }

        const cleaned = parsed.map((cat) => ({
          title: cat?.title || "Untitled",
          questions: (cat?.questions || []).map((q) => {
            const isMC =
              q?.type === "multiple-choice" &&
              Array.isArray(q?.options) &&
              q.options.length;
            return {
              question: q?.question || "Your input",
              type: isMC ? "multiple-choice" : "text",
              options: isMC ? q.options : undefined,
            };
          }),
        }));

        try {
          const { questions: questionsKey } = getStorageKeys();
          const dataToSave = {
            questions: cleaned,
            timestamp: Date.now(),
          };
          localStorage.setItem(questionsKey, JSON.stringify(dataToSave));
        } catch (err) {
          console.warn("Failed to cache questions:", err);
        }

        setQuestionsData(cleaned);

        const cachedAnswers = loadCachedAnswers();
        if (cachedAnswers) {
          const matched = matchAnswersToQuestions(cachedAnswers, cleaned);
          if (Object.keys(matched).length > 0) {
            setAnswers(matched);
          }
        }
      } catch (err) {
        console.error("FetchQuestions error:", err);
        setQuestionsData([]);
        setError("Failed to load clarifying questions from AI.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [
    paramsKey,
    prompt,
    reloadTick,
    loadCachedQuestions,
    loadCachedAnswers,
    matchAnswersToQuestions,
    getStorageKeys,
    questionsData,
  ]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <StepFormShell>
        <div className="mx-auto max-w-[560px] rounded-[34px] bg-[#F2EFEA] shadow-[0_20px_60px_rgba(0,0,0,0.10)] px-10 py-12 text-[#2B2A25]">
          <div className="pt-1">
            <p className="text-[12px] tracking-[0.32em] uppercase text-[#C7A15E] font-sans">
              Step 4 of 5
            </p>
            <div className="mt-5 h-px w-[190px] bg-[#7B6B55]" />
            <h1 className="mt-9 text-[46px] font-heading leading-[1.05]">
              Clarifying Questions
            </h1>
          </div>
          <div className="mt-10 flex flex-col items-center justify-center py-4">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#7B6B55] border-t-transparent mb-6" />
            <p className="font-sans text-[15px] leading-[1.4] text-[#8C7152] text-center">
              Generating your clarifying questions…
            </p>
          </div>
        </div>
      </StepFormShell>
    );
  }

  if (error) {
    return (
      <StepFormShell>
        <div className="mx-auto max-w-[560px] rounded-[34px] bg-[#F2EFEA] shadow-[0_20px_60px_rgba(0,0,0,0.10)] px-10 py-12">
          <form className="space-y-11 text-[#2B2A25]">
            <div className="pt-1">
              <p className="text-[12px] tracking-[0.32em] uppercase text-[#C7A15E] font-sans">
                Step 4 of 5
              </p>
              <div className="mt-5 h-px w-[190px] bg-[#7B6B55]" />
              <h1 className="mt-9 text-[46px] font-heading leading-[1.05]">
                Clarifying Questions
              </h1>
              <p className="mt-5 font-sans text-[15px] leading-[1.4] text-[#8C7152]">
                {error}
              </p>
            </div>
            <div className="mt-10 flex items-center justify-between">
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-3"
                aria-label="Back"
              >
                <span className="h-11 w-11 rounded-full border border-[#2B2A25] flex items-center justify-center text-[#2B2A25] text-[18px] leading-none">
                  ←
                </span>
                <span className="text-[12px] tracking-[0.2em] uppercase font-sans font-medium text-[#2B2A25]">
                  BACK
                </span>
              </button>
              <button
                type="button"
                onClick={() => setReloadTick((t) => t + 1)}
                className="relative h-[52px] w-[248px] rounded-full bg-[#2B2A25] text-white"
              >
                <span className="block w-full text-center font-sans text-[12px] tracking-[0.24em] uppercase">
                  TRY AGAIN
                </span>
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[16px] leading-none">
                  →
                </span>
              </button>
            </div>
          </form>
        </div>
      </StepFormShell>
    );
  }

  return (
    <div className="w-full min-w-0 bg-white">
      <section
        className="relative w-full min-w-0 h-[350px] flex flex-col items-center justify-end pb-10 px-6 text-center"
        style={HERO_STYLE}
      >
        <div className="absolute top-8 left-0 right-0 flex items-center justify-center">
          <img
            src="/assets/form-logo-white-transparent.png"
            alt="Form Department logo"
            className="w-[210px] h-auto"
          />
        </div>
        <h2 className="mt-10 font-heading text-[34px] leading-[1.15] text-[#C7A15E]">
          Your Curated Capsule
        </h2>
      </section>

      <section className="relative -mt-[110px] w-full px-6 pb-10">
        <div className="mx-auto w-full max-w-[560px] rounded-[34px] bg-[#F2EFEA] shadow-[0_20px_60px_rgba(0,0,0,0.10)] px-10 py-12">
          <form onSubmit={handleSubmit} className="space-y-11 text-[#2B2A25]">
            <div className="pt-1">
              <p className="text-[12px] tracking-[0.32em] uppercase text-[#C7A15E] font-sans">
                Step 4 of 5
              </p>
              <div className="mt-5 h-px w-[190px] bg-[#7B6B55]" />
              <h1 className="mt-9 text-[46px] font-heading leading-[1.05]">
                Clarifying Questions
              </h1>
            </div>

            {questionsData.map((category, ci) => (
              <div key={ci} className="space-y-8">
                <div className="pt-1">
                  <p className="block text-[12px] tracking-[0.22em] uppercase font-sans text-[#8C7152] font-semibold mb-4">
                    {category.title}
                  </p>
                </div>

                {category.questions.map((q, qi) => (
                  <div key={qi} className="pt-1">
                    {q.type === "multiple-choice" &&
                    Array.isArray(q.options) ? (
                      <p className="block text-[12px] tracking-[0.22em] uppercase font-sans text-[#8C7152] font-medium mb-4">
                        {q.question}
                      </p>
                    ) : (
                      <label
                        htmlFor={`q-${ci}-${qi}-text`}
                        className="block text-[12px] tracking-[0.22em] uppercase font-sans text-[#8C7152] font-medium mb-4"
                      >
                        {q.question}
                      </label>
                    )}

                    {q.type === "multiple-choice" &&
                    Array.isArray(q.options) ? (
                      <div className="space-y-2">
                        {q.options.map((opt, oi) => (
                          <label
                            key={oi}
                            className="flex items-center gap-3 text-[#2B2A25]"
                          >
                            <input
                              type="radio"
                              name={`q-${ci}-${qi}`}
                              value={opt}
                              checked={answers[q.question] === opt}
                              onChange={(e) =>
                                handleAnswerChange(q.question, e.target.value)
                              }
                              className="accent-[#3A3A3D] w-[18px] h-[18px] shrink-0"
                              required={oi === 0 && !answers[q.question]}
                            />
                            <span className="text-[14px] font-sans leading-[1.2]">
                              {opt}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        id={`q-${ci}-${qi}-text`}
                        type="text"
                        className="w-full border border-[#7C7C7C] bg-white px-5 py-3 text-[14px] font-sans font-normal leading-[1.2] text-[#2B2A25] placeholder-black/40 focus:outline-none rounded-md"
                        placeholder="Your answer"
                        value={answers[q.question] || ""}
                        onChange={(e) =>
                          handleAnswerChange(q.question, e.target.value)
                        }
                        required
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}

            <div className="mt-10 flex items-center justify-between">
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-3"
                aria-label="Back"
              >
                <span className="h-11 w-11 rounded-full border border-[#2B2A25] flex items-center justify-center text-[#2B2A25] text-[18px] leading-none">
                  ←
                </span>
                <span className="text-[12px] tracking-[0.2em] uppercase font-sans font-medium text-[#2B2A25]">
                  BACK
                </span>
              </button>

              <button
                type="submit"
                className="relative h-[52px] w-[248px] rounded-full bg-[#2B2A25] text-white"
              >
                <span className="block w-full text-center font-sans text-[13px] tracking-[0.04em] font-medium">
                  Continue
                </span>
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[16px] leading-none">
                  →
                </span>
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
