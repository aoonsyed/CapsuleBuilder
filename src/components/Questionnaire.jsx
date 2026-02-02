import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

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
      questions: `questionnaireQuestions_${hash}`,
      answers: `questionnaireAnswers_${hash}`,
    };
  }, [paramsKey, hashParamsKey]);

  // Load cached questions from localStorage
  const loadCachedQuestions = useCallback(() => {
    try {
      const { questions: questionsKey } = getStorageKeys();
      const cached = localStorage.getItem(questionsKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Validate structure
        if (Array.isArray(parsed) && parsed.length > 0) {
          const isValid = parsed.every(
            (cat) =>
              cat &&
              typeof cat === "object" &&
              cat.title &&
              Array.isArray(cat.questions)
          );
          if (isValid) {
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn("Failed to load cached questions:", err);
    }
    return null;
  }, [getStorageKeys]);

  // Load cached answers from localStorage
  const loadCachedAnswers = useCallback(() => {
    try {
      const { answers: answersKey } = getStorageKeys();
      const cached = localStorage.getItem(answersKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (typeof parsed === "object" && parsed !== null) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Failed to load cached answers:", err);
    }
    return null;
  }, [getStorageKeys]);

  // Match cached answers to current questions by question text
  const matchAnswersToQuestions = useCallback((cachedAnswers, questions) => {
    if (!cachedAnswers || !questions) return {};
    
    const matched = {};
    // Flatten all questions
    const allQuestions = questions.flatMap((cat) =>
      cat.questions.map((q) => q.question)
    );
    
    // Match answers by exact question text
    Object.keys(cachedAnswers).forEach((questionText) => {
      if (allQuestions.includes(questionText)) {
        matched[questionText] = cachedAnswers[questionText];
      }
    });
    
    return matched;
  }, []);

  // Save answers to localStorage (debounced)
  const saveAnswersToStorage = useCallback(
    (answersToSave) => {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Set new timeout for debounced save
      saveTimeoutRef.current = setTimeout(() => {
        try {
          const { answers: answersKey } = getStorageKeys();
          localStorage.setItem(answersKey, JSON.stringify(answersToSave));
        } catch (err) {
          console.warn("Failed to save answers to localStorage:", err);
        }
      }, 400); // 400ms debounce
    },
    [getStorageKeys]
  );

  // Save answers immediately (no debounce) - used on submit
  const saveAnswersImmediately = useCallback(
    (answersToSave) => {
      // Clear any pending debounced save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      
      try {
        const { answers: answersKey } = getStorageKeys();
        localStorage.setItem(answersKey, JSON.stringify(answersToSave));
      } catch (err) {
        console.warn("Failed to save answers to localStorage:", err);
      }
    },
    [getStorageKeys]
  );

  const handleAnswerChange = (question, value) => {
    setAnswers((prev) => {
      const updated = { ...prev, [question]: value };
      // Save to localStorage with debouncing
      saveAnswersToStorage(updated);
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save immediately (no debounce) before navigating
    saveAnswersImmediately(answers);
    // Also save to legacy key for backward compatibility
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
    const first = Math.min(...[s.indexOf("["), s.indexOf("{")].filter((x) => x >= 0));
    const last = Math.max(s.lastIndexOf("]"), s.lastIndexOf("}"));
    if (first >= 0 && last > first) s = s.slice(first, last + 1);
    const parsed = JSON.parse(s);
    if (!Array.isArray(parsed)) throw new Error("Parsed JSON is not an array");
    return parsed;
  };

  // Load cached answers when component mounts or paramsKey changes
  useEffect(() => {
    const cachedAnswers = loadCachedAnswers();
    if (cachedAnswers && Object.keys(cachedAnswers).length > 0) {
      // If we have questions already, match answers to them
      if (questionsData.length > 0) {
        const matched = matchAnswersToQuestions(cachedAnswers, questionsData);
        if (Object.keys(matched).length > 0) {
          setAnswers(matched);
        }
      } else {
        // Store for later matching when questions load
        setAnswers(cachedAnswers);
      }
    }
  }, [loadCachedAnswers, matchAnswersToQuestions, questionsData]);

  // Fetch questions (check cache first)
  useEffect(() => {
    // If reloadTick is incremented, force refresh by clearing cache
    const shouldForceRefresh = reloadTick > 0;
    
    if (lastKeyRef.current === paramsKey && questionsData.length > 0 && !shouldForceRefresh) {
      setLoading(false);
      // Match cached answers to loaded questions
      const cachedAnswers = loadCachedAnswers();
      if (cachedAnswers) {
        const matched = matchAnswersToQuestions(cachedAnswers, questionsData);
        if (Object.keys(matched).length > 0) {
          setAnswers(matched);
        }
      }
      return;
    }
    
    // Check if paramsKey changed - will use new cache for new paramsKey
    if (lastKeyRef.current !== null && lastKeyRef.current !== paramsKey) {
      // Params changed, will load new cache for new paramsKey
      // Clear answers when params change
      setAnswers({});
    }
    lastKeyRef.current = paramsKey;

    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      
      // First, try to load from cache (unless forcing refresh)
      if (!shouldForceRefresh) {
        const cachedQuestions = loadCachedQuestions();
        if (cachedQuestions) {
          console.log("Loading questions from cache");
          setQuestionsData(cachedQuestions);
          setLoading(false);
          
          // Load and match cached answers
          const cachedAnswers = loadCachedAnswers();
          if (cachedAnswers) {
            const matched = matchAnswersToQuestions(cachedAnswers, cachedQuestions);
            if (Object.keys(matched).length > 0) {
              setAnswers(matched);
            }
          }
          return;
        }
      } else {
        // Force refresh - clear cache for this paramsKey
        try {
          const { questions: questionsKey } = getStorageKeys();
          localStorage.removeItem(questionsKey);
        } catch (err) {
          console.warn("Failed to clear cache:", err);
        }
      }

      // Cache miss - fetch from API
      try {
        const res = await axios.post("/api/openai", { prompt });

        // ✅ Check for API error
        if (res?.data?.error) {
          throw new Error(`OpenAI API error: ${res.data.error}`);
        }

        // ✅ Support both chat + text completions (defensive)
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
            parsed = Array.isArray(maybe) ? maybe : sanitizeAndParseJSON(maybe);
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

        // Save to cache
        try {
          const { questions: questionsKey } = getStorageKeys();
          localStorage.setItem(questionsKey, JSON.stringify(cleaned));
        } catch (err) {
          console.warn("Failed to cache questions:", err);
        }

        setQuestionsData(cleaned);
        
        // Load and match cached answers to new questions
        const cachedAnswers = loadCachedAnswers();
        if (cachedAnswers) {
          const matched = matchAnswersToQuestions(cachedAnswers, cleaned);
          if (Object.keys(matched).length > 0) {
            setAnswers(matched);
          }
        }
      } catch (err) {
        console.error("❌ FetchQuestions error:", err);
        setQuestionsData([]);
        setError("Failed to load clarifying questions from AI.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [paramsKey, prompt, reloadTick, loadCachedQuestions, loadCachedAnswers, matchAnswersToQuestions, getStorageKeys, questionsData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-black/70 font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black/70 mr-3" />
        <p>Loading questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow text-black">
        <p className="mb-4">{error}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setReloadTick((t) => t + 1)}
            className="px-5 py-2 bg-black hover:bg-[#3A3A3D] text-white rounded-md"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2 ml-56 bg-black hover:bg-[#3A3A3D] text-white rounded-md"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8 border border-white bg-white/60 backdrop-blur-md rounded-lg shadow-lg font-sans">
      <form onSubmit={handleSubmit} className="space-y-8 text-black">
        <div className="mb-8">
          <p className="ml-5 text-sm font-sans text-[14px] font-medium leading-[1.2] mb-2">Step 4 of 5</p>
          <h2 className="text-[32px] font-heading font-semibold leading-[1.2] mb-2">Clarifying Questions</h2>
        </div>

        {questionsData.map((category, ci) => (
          <div key={ci} className="mb-6">
            <h3 className="text-[24px] font-heading font-semibold leading-[1.2] mb-4">{category.title}</h3>

            {category.questions.map((q, qi) => (
              <div key={qi} className="mb-6">
                <label className="block text-[14px] font-sans font-medium leading-[1.2] mb-2 text-black">{q.question}</label>

                {q.type === "multiple-choice" && Array.isArray(q.options) ? (
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <label key={oi} className="flex items-center space-x-2 text-black">
                        <input
                          type="radio"
                          name={`q-${ci}-${qi}`}
                          value={opt}
                          checked={answers[q.question] === opt}
                          onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                          className="accent-[#3A3A3D]"
                          required={oi === 0 && !answers[q.question]}
                        />
                        <span className="text-[14px] font-sans font-medium leading-[1.2]">{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    className="w-full border border-black bg-transparent px-5 py-3 text-[16px] font-sans font-normal leading-[1.2] text-black focus:outline-none rounded-md"
                    placeholder="Your answer"
                    value={answers[q.question] || ""}
                    onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                    required
                  />
                )}
              </div>
            ))}
          </div>
        ))}

        <div className="flex items-center justify-between gap-4 mt-8">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 text-[14px] font-sans font-medium leading-[1.2] text-white bg-black hover:bg-[#3A3A3D] active:bg-[#1C1C1C] rounded-md shadow transition duration-200"
          >
            ← Back
          </button>

          <button
            type="submit"
            className="px-6 py-3 text-[14px] font-sans font-medium leading-[1.2] text-white bg-black hover:bg-[#3A3A3D] active:bg-[#1C1C1C] rounded-md shadow transition duration-200"
          >
            Next →
          </button>
        </div>
      </form>
    </div>
  );
}
