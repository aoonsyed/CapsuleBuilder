import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Toaster, toast } from 'sonner';

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

  const handleAnswerChange = (question, value) => {
    setAnswers((prev) => ({
      ...prev,
      [question]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("questionnaireAnswers", JSON.stringify(answers));
    onNext();
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      const prompt = `
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
        "options": ["Option 1", "Option 2"] // Only if type is multiple-choice
      }
    ]
  },
  {
    "title": "Fabric & Performance",
    "questions": [...]
  },
  {
    "title": "Adjustability & Comfort",
    "questions": [...]
  }
]

User’s product input:
- Product Type: ${productType}
- Key Features: ${keyFeatures}
- Target Price: ${targetPrice}
- Idea: ${idea}
- Material Preference: ${materialPreference}

Only return the JSON. No markdown. No explanation.
`;


      try {
        const apikey = process.env.REACT_APP_API_KEY;
        const res = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-4",
            messages: [
              { role: "system", content: "You are a helpful fashion designer assistant." },
              { role: "user", content: prompt },
            ],
            max_tokens: 1000,
          },
          {
            headers: {
              Authorization: `Bearer ${apikey}`,
              "Content-Type": "application/json",
            },
          }
        );

        const content = res.data.choices[0].message.content;
        const parsed = JSON.parse(content);
        console.log(parsed)
        setQuestionsData(parsed);
        setLoading(false);
        toast.success("Loaded clarifying questions");
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch questions");
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-black/70 font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black/70 mr-3"></div>
        <p>Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8 border border-white bg-white/60 backdrop-blur-md rounded-lg shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-8 text-white font-sans">
        <div>
            
          <p className="ml-5 text-sm font-[Helvetica] text-black mb-2">
            Step 4 of 5
          </p>
          <h2 className="text-[26pt] font-[Garamond] font-bold text-black mb-2">
            Clarifying Questions
          </h2>
         
        </div>

        {questionsData.map((category, i) => (
          <div key={i} className="">
            <h3 className="text-[20pt] font-[Garamond] font-bold text-black mb-2">{category.title}</h3>
            {category.questions.map((q, index) => (
              <div key={index} className="mb-4">
                <label className="block text-base font-[Helvetica] mb-1 text-black">
                  {q.question}
                </label>
                {q.type === "multiple-choice" ? (
            <div className="space-y-2">
                {q.options.map((opt, i) => (
                <label key={i} className="flex items-center space-x-2 text-black ">
                    <input
                    type="radio"
                    name={q.question} 
                    value={opt}
                    checked={answers[q.question] === opt}
                    onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                    className="accent-[#3A3A3D]"
                    required
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
            className="px-6 py-2 text-lg font-bold text-white bg-[#3A3A3D] hover:bg-black active:bg-[#1C1C1C] rounded-md shadow transition duration-200"
          >
            ← Back
          </button>

          <button
            type="submit"
            className="px-6 py-2 text-lg font-bold text-white bg-[#3A3A3D] hover:bg-black active:bg-[#1C1C1C] rounded-md shadow transition duration-200"
          >
            Next →
          </button>
        </div>
      </form>
    </div>
  );
}
