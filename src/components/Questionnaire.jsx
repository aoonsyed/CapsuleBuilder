import { useEffect, useMemo, useRef, useState } from "react";
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

  const handleAnswerChange = (question, value) => {
    setAnswers((prev) => ({ ...prev, [question]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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

  useEffect(() => {
    if (lastKeyRef.current === paramsKey) {
      setLoading(false);
      return;
    }
    lastKeyRef.current = paramsKey;

    const fetchQuestions = async () => {
  setLoading(true);
  setError(null);
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

    setQuestionsData(cleaned);
  } catch (err) {
    console.error("❌ FetchQuestions error:", err);
    setQuestionsData([]);
    setError("Failed to load clarifying questions from AI.");
  } finally {
    setLoading(false);
  }
};


    fetchQuestions();
  }, [paramsKey, prompt, reloadTick]);

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
    <div className="max-w-2xl mx-auto p-8 border border-white bg-white/60 backdrop-blur-md rounded-lg shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-8 text-white font-sans">
        <div>
          <p className="ml-5 text-sm font-[Helvetica] text-black mb-2">Step 4 of 5</p>
          <h2 className="text-[26pt] font-[Garamond] font-bold text-black mb-2">Clarifying Questions</h2>
        </div>

        {questionsData.map((category, ci) => (
          <div key={ci}>
            <h3 className="text-[20pt] font-[Garamond] font-bold text-black mb-2">{category.title}</h3>

            {category.questions.map((q, qi) => (
              <div key={qi} className="mb-4">
                <label className="block text-base font-[Helvetica] mb-1 text-black">{q.question}</label>

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
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    className="w-full border border-black bg-transparent px-4 py-2 text-black focus:outline-none rounded-md"
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

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 text-lg font-bold text-white bg-black hover:bg-[#3A3A3D] active:bg-[#1C1C1C] rounded-md shadow transition duration-200"
          >
            ← Back
          </button>

          <button
            type="submit"
            className="px-6 py-2 text-lg font-bold text-white bg-black hover:bg-[#3A3A3D] active:bg-[#1C1C1C] rounded-md shadow transition duration-200"
          >
            Next →
          </button>
        </div>
      </form>
    </div>
  );
}
