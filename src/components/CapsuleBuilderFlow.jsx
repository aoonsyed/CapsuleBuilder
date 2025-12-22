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
  const [isTrial, setIsTrial] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Track if the user began via the 3-form grid on Landing
  const [startedWithGrid, setStartedWithGrid] = useState(false);

  // Control whether Landing should immediately open in the 3-form grid view
  const [startLandingInGrid, setStartLandingInGrid] = useState(false);

  // Backend validation - runs automatically when component mounts
  // Note: Shopify already ensures only logged-in users can access the tool
  useEffect(() => {
    const validateCustomer = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const cid = params.get("customer_id");
        
        // Frontend validation: Check if customer_id exists and has correct format (13 digits)
        // This prevents manual URL access with wrong IDs
        if (!cid) {
          console.error("No customer ID provided. Access denied.");
          window.location.href = "https://formdepartment.com/account/login";
          return;
        }
        
        // Validate format: must be exactly 13 numeric digits
        const isValid = /^\d{13}$/.test(cid);

        if (!isValid) {
          console.error("Invalid customer ID format. Access denied.");
          window.location.href = "https://formdepartment.com/account/login";
          return;
        }

        // Call backend to get user status (always allows access, returns trial_used status)
        console.log("Calling backend to get user status for customer_id:", cid);
        const response = await fetch(
          `https://backend-capsule-builder.onrender.com/proxy/tool?logged_in_customer_id=${cid}`
        );
        
        console.log("Backend response status:", response.status, response.statusText);
        
        // Parse response (backend returns JSON whether ok or not)
        let data;
        try {
          const responseText = await response.text();
          console.log("Backend response text:", responseText);
          data = JSON.parse(responseText);
          console.log("Backend response data (parsed):", data);
        } catch (e) {
          console.error("Failed to parse backend response as JSON:", e);
          // If can't parse response, allow access (Shopify already validated login)
          setIsValidated(true);
          setIsValidating(false);
          return;
        }
        
        // Handle backend response - backend now always allows access
        console.log("Backend response data:", data);
        
        // Backend always returns ok=true now, but provides trial_used and admin status
        if (data.ok === true) {
          // Admin flag is the single source of truth for admin visibility
          setIsAdmin(Boolean(data.is_admin));

          // Show trial banner if trial hasn't been used yet
          if (data.show_trial_banner || !data.trial_used) {
            console.log("User is on free trial. Trial used:", data.trial_used);
            setIsTrial(true);
          } else {
            console.log("User has already used trial. Has subscription:", data.has_subscription, "Plan:", data.plan);
            setIsTrial(false);
          }
          setIsValidated(true);
          setIsValidating(false);
          return; // Important: return to prevent any further execution
        }
        
        // If ok is false, there was an error (shouldn't happen for tool access now)
        if (data.ok === false) {
          console.error("Backend error:", data.reason, data.message);
          // Still allow access but log the error
          setIsValidated(true);
          setIsValidating(false);
          return;
        }
      } catch (err) {
        console.error("Validation error:", err);
        // Check if it's a CORS or network error
        const isCorsError = err.message && (
          err.message.includes('CORS') || 
          err.message.includes('Failed to fetch') || 
          err.message.includes('NetworkError') ||
          err.name === 'TypeError'
        );
        
        if (isCorsError) {
          console.error("CORS or network error detected. Backend needs to allow requests from:", window.location.origin);
          console.error("Backend URL should allow CORS from:", "https://capsule-builder-qhzx.vercel.app");
          // Don't allow access on CORS errors - backend must be configured correctly
          // Redirect to subscription page as fallback
          window.location.href = "https://formdepartment.com/pages/about?view=subscription-plans";
          return;
        }
        // For other errors, don't allow access without validation
        console.error("Backend validation failed:", err);
        window.location.href = "https://formdepartment.com/pages/about?view=subscription-plans";
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
          <p className="text-black font-aboreto text-[16px] font-normal leading-[150%]">Validating access...</p>
        </div>
      </div>
    );
  }

  // Only render app content after validation passes
  if (!isValidated) {
    return null;
  }

  return (
    <div className="bg-[#E8E8E8] min-h-screen bg-cover bg-center font-aboreto text-white relative">
      <div className="absolute inset-0 bg-[#E8E8E8] z-0" />
      {/* Free Trial Banner */}
      {isTrial && (
        <div className="relative z-20 bg-black text-white text-center py-2 px-4 font-semibold">
          You are currently using a FREE TRIAL. Upgrade to unlock full features!
        </div>
      )}
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
                isAdmin={isAdmin}
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
