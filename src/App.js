import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import AdminDashboard from "./components/AdminDashboard";

import Step1Vision from "./components/Step1Vision";
import Step2Inspiration from "./components/Step2Inspiration";
import Step3ProductFocus from "./components/Step3ProductFocus";
import Step4Suggestions from "./components/Step4Suggestions";
import Step6Complete from "./components/Step6Complete";

function CapsuleBuilderFlow() {
  const [step, setStep] = React.useState(1);
  const email = "demo@example.com";

  return (
    <div className="min-h-screen relative font-sans text-white">
      {/* Background image */}
      <div className="absolute inset-0 bg-cover bg-center" />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10">
        <Navbar /> {/* ✅ Navbar visible only on this route */}
        <div className="flex items-center justify-center min-h-screen px-4">
          {step === 1 && <Step1Vision email={email} onNext={() => setStep(2)} />}
          {step === 2 && <Step2Inspiration email={email} onNext={() => setStep(3)} />}
          {step === 3 && <Step3ProductFocus email={email} onNext={() => setStep(4)} />}
          {step === 4 && <Step4Suggestions email={email} onNext={() => setStep(6)} />}
          {step === 6 && <Step6Complete email={email} />}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/capsule-builder" element={<CapsuleBuilderFlow />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route
          path="*"
          element={<div className="text-white p-10">404 - Page Not Found</div>}
        />
      </Routes>
    </Router>
  );
}

export default App;
