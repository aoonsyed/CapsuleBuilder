import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./Navbar";
import LandingPage2 from "./LandingPage2";
import Step1Vision from "./Step1Vision";
import Step2Inspiration from "./Step2Inspiration";
import Step3ProductFocus from "./Step3ProductFocus";
import Step4Suggestions from "./Step4Suggestions";
import Step6Complete from "./Step6Complete";
import SubscriptionPage from "./SubscriptionPage";
import ImageGeneration from "./ImageGeneration";
import Curated_Capsule from "./Curated_Capsule";
import Questionaire from "./Questionnaire";
export default function CapsuleBuilderFlow() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState();
  const [brand, setBrand] = useState("");

  return (
    <div className="bg-[#E8E8E8] min-h-screen bg-cover bg-center font-sans text-white relative">
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#E8E8E8] z-0" />

      {/* Navbar at the top */}
      <div className="relative z-10">
        <Navbar />
      </div>

      {/* Step content */}
      <div className={`relative z-10 pt-16 ${step === 1 || step === 9 ? "bg-[#E8E8E8]" : ""}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className={`${step === 1 || step === 6
              ? "mx-auto flex flex-col md:flex-row items-start"
              : "w-full max-w-xl mx-auto p-10"
              }`}
          >
            {step === 1 && <LandingPage2 onNext={() => setStep(2)} />}
            {step === 2 && <Step1Vision onNext={() => setStep(3)} setEmail={setEmail} setBrand={setBrand} />}
            {step === 3 && <Step2Inspiration email={email} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
            {step === 4 && <Step3ProductFocus email={email} onNext={() => setStep(5)} onBack={() => setStep(3)} />}
            {step === 5 && <Questionaire onNext={() => setStep(6)} onBack={() => setStep(4)} />}
            {step === 6 && <Step4Suggestions email={email} brand={brand} onNext={() => setStep(6)} onBack={() => setStep(5)} />}
            {/**
            {step == 6 && <ImageGeneration onBack={()=>setStep(5)}/>}
            {step === 7 && <Step6Complete email={email} onNext={() => setStep(8)} onBack={() => setStep(5)} onContinue={() => setStep(9)} />}
            {step === 8 && <SubscriptionPage onBack={() => setStep(7)} />}
            {step === 9 && <Curated_Capsule onBack={() => setStep(7)} />}
             */}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

