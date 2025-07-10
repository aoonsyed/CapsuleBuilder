import React, { useState } from "react";
import Navbar from "./Navbar";
import Step1Vision from "./Step1Vision";
import Step2Inspiration from "./Step2Inspiration";
import Step3ProductFocus from "./Step3ProductFocus";
import Step4Suggestions from "./Step4Suggestions";
import Step6Complete from "./Step6Complete"; // Skipping Step5
import LandingPage from "./LandingPage";

export default function CapsuleBuilderFlow() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState();

  return (
 <div
  className="min-h-screen bg-cover bg-center font-sans text-white relative"
  style={{ backgroundImage: `url('/assets/1.png')` }}
>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 z-0" />

      {/* Navbar at the top */}
      <div className="relative z-10">
        <Navbar />
      </div>

      {/* Step content */}
      <div className={`relative z-10 px-4 pt-16 ${step === 1 ? "bg-[#F9F5F0]" : ""}`}>

        <div
          className={`${
            step === 1
              ? "max-w-7xl mx-auto flex flex-col md:flex-row items-start"
              : "w-full max-w-xl mx-auto p-10"
          }`}
        >
          {step === 1 && <LandingPage onNext={() => setStep(2)} />}
          {step === 2 && <Step1Vision onNext={() => setStep(3)} setEmail={setEmail} />}
          {step === 3 && <Step2Inspiration email={email} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
          {step === 4 && <Step3ProductFocus email={email} onNext={() => setStep(5)} onBack={() => setStep(3)} />}
          {step === 5 && <Step4Suggestions email={email} onNext={() => setStep(7)} onBack={() => setStep(4)} />}
          {step === 7 && <Step6Complete email={email} onBack={() => setStep(5)} />}
        </div>
      </div>
    </div>
  );
}
