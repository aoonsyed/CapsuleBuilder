import React, { useState, useEffect } from "react";
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
  const [isValidating, setIsValidating] = useState(true);
  const [isValidated, setIsValidated] = useState(false);

  // Track if the user began via the 3-form grid on Landing
  const [startedWithGrid, setStartedWithGrid] = useState(false);

  // Control whether Landing should immediately open in the 3-form grid view
  const [startLandingInGrid, setStartLandingInGrid] = useState(false);

  // Backend validation - runs automatically when component mounts
  useEffect(() => {
    const validateCustomer = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const cid = params.get("customer_id");
        
        // Check if customer_id exists
        if (!cid) {
          console.error("No customer ID provided. Access denied.");
          window.location.href = "https://formdepartment.com/account/login";
          return;
        }
        
        // Check valid numeric 13 digits
        const isValid = /^\d{13}$/.test(cid);

        if (!isValid) {
          console.error("Invalid customer ID format. Access denied.");
          window.location.href = "https://formdepartment.com/account/login";
          return;
        }

        // Call backend to validate customer and check subscription
        const response = await fetch(
          `https://backend-capsule-builder.onrender.com/proxy/tool?logged_in_customer_id=${cid}`
        );
        
        if (!response.ok) {
          throw new Error(`Backend validation failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.ok) {
          console.log("User validated:", data);
          setIsValidated(true);
          setIsValidating(false);
        } else {
          // Redirect to subscription or login page based on backend response
          window.location.href = data.redirect || "https://formdepartment.com/account/login";
        }
      } catch (err) {
        console.error("Validation error:", err);
        // On network/backend error, redirect to login for security
        window.location.href = "https://formdepartment.com/account/login";
      }
    };

    validateCustomer();
  }, []);

  // Show loading state while validating
  if (isValidating) {
    return (
      <div className="bg-[#E8E8E8] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black font-[Garamond] text-lg">Validating access...</p>
        </div>
      </div>
    );
  }

  // Only render app content after validation passes
  if (!isValidated) {
    return null;
  }

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
