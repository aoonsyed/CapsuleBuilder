import FdStepDesktopLayout from "./FdStepDesktopLayout";
import { fdStepFieldLabelClass, fdStepInputClass } from "./fdTypography";
import { FD_STEP1_SPACING } from "./fdLayout";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION_MS = 5 * 60 * 1000;

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
      <FdStepDesktopLayout
        step={4}
        total={5}
        title="Clarifying Questions"
        intro="We are preparing a short set of questions on fit, fabric, and comfort from what you shared."
        formPanelClassName="lg:max-h-[min(85vh,960px)] lg:overflow-y-auto"
      >
        <div className="flex flex-col items-center justify-center py-10 text-[#2B2A25]">
          <div className="mb-6 h-10 w-10 animate-spin rounded-full border-2 border-[#7B6B55] border-t-transparent" />
          <p className="text-center font-sans text-[14px] leading-[1.45] text-[#8C7152]">
            Generating your clarifying questions…
          </p>
        </div>
      </FdStepDesktopLayout>
    );
  }

  if (error) {
    return (
      <FdStepDesktopLayout
        step={4}
        total={5}
        title="Clarifying Questions"
        intro="We could not load your questions this time."
        formPanelClassName="lg:max-h-[min(85vh,960px)] lg:overflow-y-auto"
      >
        <form className="text-[#2B2A25]" onSubmit={(e) => e.preventDefault()}>
          <p className="font-sans text-[14px] leading-[1.45] text-[#8C7152]">{error}</p>
          <div
            className="flex w-full flex-row flex-nowrap items-center justify-between gap-3"
            style={{
              marginTop: FD_STEP1_SPACING.navTopGap,
              minHeight: FD_STEP1_SPACING.navHeight,
            }}
          >
            <button
              type="button"
              onClick={onBack}
              className="flex min-w-0 shrink-0 items-center gap-2 hover:opacity-90"
              aria-label="Back"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2B2A25] text-[16px] leading-none">
                ←
              </span>
              <span className="text-[12px] tracking-[0.2em] uppercase font-sans font-medium">BACK</span>
            </button>
            <button
              type="button"
              onClick={() => setReloadTick((t) => t + 1)}
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[#2B2A25] px-5 text-white hover:bg-[#1f1d1a]"
            >
              <span className="font-sans text-[10px] tracking-[0.16em] uppercase">TRY AGAIN</span>
              <span className="text-[15px]" aria-hidden>
                →
              </span>
            </button>
          </div>
        </form>
      </FdStepDesktopLayout>
    );
  }

  const questionIntro =
    "Answer each section below. Your selections help us refine recommendations before the next step.";

  return (
    <FdStepDesktopLayout
      step={4}
      total={5}
      title="Clarifying Questions"
      intro={questionIntro}
      formPanelClassName="lg:max-h-[min(85vh,960px)] lg:overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="text-[#2B2A25]">
        <div className="space-y-8">
          {questionsData.map((category, ci) => (
            <div key={ci} className="space-y-4">
              <h2 className="font-heading text-[22px] leading-[1.1] text-[#2B2A25] sm:text-[26px]">{category.title}</h2>
              <div className="space-y-6 rounded-[16px] border border-[#DFDDD6] bg-[#F5F5F5] px-4 py-5 sm:px-5 sm:py-6">
                {category.questions.map((q, qi) => (
                  <div key={qi}>
                    {q.type === "multiple-choice" && Array.isArray(q.options) ? (
                      <p className={`${fdStepFieldLabelClass} mb-3`}>{q.question}</p>
                    ) : (
                      <label htmlFor={`q-${ci}-${qi}-text`} className={`${fdStepFieldLabelClass} mb-3 block`}>
                        {q.question}
                      </label>
                    )}

                    {q.type === "multiple-choice" && Array.isArray(q.options) ? (
                      <div className="space-y-2">
                        {q.options.map((opt, oi) => (
                          <label key={oi} className="flex items-center gap-3 text-[#2B2A25]">
                            <input
                              type="radio"
                              name={`q-${ci}-${qi}`}
                              value={opt}
                              checked={answers[q.question] === opt}
                              onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                              className="h-[18px] w-[18px] shrink-0 accent-[#3A3A3D]"
                              required={oi === 0 && !answers[q.question]}
                            />
                            <span className="text-[14px] font-sans leading-[1.2]">{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        id={`q-${ci}-${qi}-text`}
                        type="text"
                        className={fdStepInputClass}
                        placeholder="Your answer"
                        value={answers[q.question] || ""}
                        onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                        required
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          className="flex w-full flex-row flex-nowrap items-center justify-between gap-3"
          style={{
            marginTop: FD_STEP1_SPACING.navTopGap,
            minHeight: FD_STEP1_SPACING.navHeight,
          }}
        >
          <button
            type="button"
            onClick={onBack}
            className="flex min-w-0 shrink-0 items-center gap-2 hover:opacity-90"
            aria-label="Back"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2B2A25] text-[16px] leading-none">
              ←
            </span>
            <span className="text-[12px] tracking-[0.2em] uppercase font-sans font-medium">BACK</span>
          </button>

          <button
            type="submit"
            className="flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[#2B2A25] px-5 text-white hover:bg-[#1f1d1a]"
          >
            <span className="font-sans text-[10px] tracking-[0.16em] uppercase">CONTINUE</span>
            <span className="text-[15px]" aria-hidden>
              →
            </span>
          </button>
        </div>
      </form>
    </FdStepDesktopLayout>
  );
}
