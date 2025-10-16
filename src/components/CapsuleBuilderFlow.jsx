import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./Navbar";
import LandingPage2 from "./LandingPage2";
import Step1Vision from "./Step1Vision";
import Step2Inspiration from "./Step2Inspiration";
import Step3ProductFocus from "./Step3ProductFocus";
import Step4Suggestions from "./Step4Suggestions";
import Step4bMarketFinancials from "./Step4bMarketFinancials";
import Questionaire from "./Questionnaire";

export default function CapsuleBuilderFlow() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState();
  const [brand, setBrand] = useState("");

  // Track if the user began via the 3-form grid on Landing
  const [startedWithGrid, setStartedWithGrid] = useState(false);

  // Control whether Landing should immediately open in the 3-form grid view
  const [startLandingInGrid, setStartLandingInGrid] = useState(false);

  return (
    <div className="bg-[#E8E8E8] min-h-screen bg-cover bg-center font-sans text-white relative">
      <div className="absolute inset-0 bg-[#E8E8E8] z-0" />
      <div className="relative z-10">
        <Navbar />
      </div>

      <div className={`relative z-10 pt-16 ${step === 1 ? "bg-[#E8E8E8]" : ""}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className={
              step === 1
                ? "mx-auto flex flex-col md:flex-row items-start"
                : step === 6 || step === 7
                ? "w-full"
                : "w-full max-w-xl mx-auto p-10"
            }
          >
            {/* Step 1 — Landing */}
            {step === 1 && (
              <LandingPage2
                startInGrid={startLandingInGrid} // tells Landing to open directly in 3-form grid (when coming back)
                onContinue={() => {
                  // User used the 3-form grid "Continue"
                  setStartedWithGrid(true);
                  setStartLandingInGrid(false); // reset hint after leaving landing
                  setStep(5); // jump straight to Questionnaire
                }}
                onNext={() => {
                  // Fallback: treat like continue to questionnaire
                  setStartedWithGrid(false);
                  setStartLandingInGrid(false);
                  setStep(5);
                }}
              />
            )}

            {/* Linear steps (if not coming from the landing grid) */}
            {step === 2 && (
              <Step1Vision
                onNext={() => setStep(3)}
                setEmail={setEmail}
                setBrand={setBrand}
              />
            )}
            {step === 3 && (
              <Step2Inspiration
                email={email}
                onNext={() => setStep(4)}
                onBack={() => setStep(2)}
              />
            )}
            {step === 4 && (
              <Step3ProductFocus
                email={email}
                onNext={() => setStep(5)}
                onBack={() => setStep(3)}
              />
            )}

            {/* Step 5 — Questionnaire */}
            {step === 5 && (
              <Questionaire
                onNext={() => setStep(6)}
                onBack={() => {
                  if (startedWithGrid) {
                    // Return to Landing and auto-open the 3-form grid
                    setStartLandingInGrid(true);
                    setStep(1);
                  } else {
                    setStep(4);
                  }
                }}
              />
            )}

            {/* Step 6 — Product Suggestions */}
            {step === 6 && (
              <Step4Suggestions
                email={email}
                brand={brand}
                onNext={() => setStep(7)}
                onBack={() => setStep(5)}
              />
            )}

            {/* Step 7 — Market & Financial Analysis */}
            {step === 7 && (
              <Step4bMarketFinancials
                email={email}
                brand={brand}
                onNext={() => setStep(7)}
                onBack={() => setStep(6)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
