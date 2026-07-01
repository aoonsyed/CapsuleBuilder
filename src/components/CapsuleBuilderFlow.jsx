import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LandingPage2 from "./LandingPage2";
import Step1Vision from "./Step1Vision";
import Step2Inspiration from "./Step2Inspiration";
import Step3ProductFocus from "./Step3ProductFocus";
import Step4Suggestions from "./Step4Suggestions";
import Step4bMarketFinancials from "./Step4bMarketFinancials";
import Questionaire from "./Questionnaire";
import FdAuthBannerLinks from "./FdAuthBannerLinks";
import FdTrialBanner from "./FdTrialBanner";
import {
  buildLoginUrl,
  getCustomerIdFromSearch,
  isSignedIn,
  openFreshCapsuleRun,
} from "../utils/fdAuth";

export default function CapsuleBuilderFlow() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState();
  const [brand, setBrand] = useState("");
  const [isValidating, setIsValidating] = useState(true);
  const [isValidated, setIsValidated] = useState(false);
  const [isTrial, setIsTrial] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userPlan, setUserPlan] = useState(null); // 'tier1', 'tier2', 'admin', or null

  const [outputSessionKey, setOutputSessionKey] = useState(null);
  const outputSessionKeyRef = useRef(null);
  const [outputUnlocked, setOutputUnlocked] = useState(false);

  const runKey = outputSessionKeyRef.current || outputSessionKey;

  const handleBuildNewItem = () => {
    if (!openFreshCapsuleRun()) {
      alert("Please allow pop-ups to start a new item in a new tab.");
    }
  };

  const ensureRunKey = () => {
    if (!outputSessionKeyRef.current) {
      const key = `run_${Date.now()}`;
      outputSessionKeyRef.current = key;
      setOutputSessionKey(key);
    }
    return outputSessionKeyRef.current;
  };

  const goToOutputStep = (nextStep) => {
    ensureRunKey();
    setOutputUnlocked(true);
    setStep(nextStep);
  };

  // Control whether Landing should immediately open in the 3-form grid view
  const [startLandingInGrid, setStartLandingInGrid] = useState(false);

  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const isLocalhost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0";

  // Backend validation - runs automatically when component mounts
  // Note: Shopify already ensures only logged-in users can access the tool
  useEffect(() => {
    const validateCustomer = async () => {
      if (isLocalhost) {
        // Local dev: emulate a free-trial state so the same UI banner renders.
        setIsTrial(true);
        setIsValidated(true);
        setIsValidating(false);
        return;
      }

      try {
        const params = new URLSearchParams(window.location.search);
        const cid = (
          params.get("customer_id") ||
          params.get("logged_in_customer_id") ||
          ""
        ).trim();

        if (!cid || !/^\d{13}$/.test(cid)) {
          console.error("No customer ID provided. Access denied.");
          window.location.href = buildLoginUrl();
          return;
        }

        // Logged-in user: land on the capsule builder homepage with customer_id in the URL
        if (
          !params.get("customer_id") ||
          (window.location.pathname !== "/" &&
            window.location.pathname !== "/capsule-builder")
        ) {
          window.location.replace(
            `/?customer_id=${encodeURIComponent(cid)}`
          );
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
          setIsTrial(true); // keep trial stripe visible when plan status unknown
          setIsValidating(false);
          return;
        }
        
        // Handle backend response - backend now always allows access
        console.log("Backend response data:", data);
        
        // Backend always returns ok=true now, but provides trial_used and admin status
        if (data.ok === true) {
          // Admin flag is the single source of truth for admin visibility
          setIsAdmin(Boolean(data.is_admin));
          
          // Store user's plan/tier for access control
          setUserPlan(data.plan || null);

          // Top trial stripe: show for anyone who is not a confirmed Tier 2 subscriber
          const plan = String(data.plan || "").toLowerCase();
          const subscribedTier2 =
            plan === "tier2" && data.has_subscription === true;
          setIsTrial(!subscribedTier2);
          console.log(
            "Trial banner:",
            !subscribedTier2 ? "visible" : "hidden",
            "plan:",
            data.plan,
            "has_subscription:",
            data.has_subscription
          );
          setIsValidated(true);
          setIsValidating(false);
          return; // Important: return to prevent any further execution
        }
        
        // If ok is false, there was an error (shouldn't happen for tool access now)
        if (data.ok === false) {
          console.error("Backend error:", data.reason, data.message);
          // Still allow access but log the error
          setIsValidated(true);
          setIsTrial(true);
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
  }, [isLocalhost]);

  // Show loading state while validating
  if (isValidating) {
    return (
      <div className="bg-[#E8E8E8] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black font-sans text-[16px] font-normal leading-[1.2]">Validating access...</p>
        </div>
      </div>
    );
  }

  // Market Analysis (step 7) runs its own access check in Step4b—no redirect here.

  // Only render app content after validation passes
  if (!isValidated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-transparent font-sans text-white relative">
      {isTrial ? (
        <div className="sticky top-0 z-[100]">
          <FdTrialBanner upgradePhrase="to design more capsules" />
        </div>
      ) : !isSignedIn(getCustomerIdFromSearch()) ? (
        <div className="sticky top-0 z-[100] flex justify-end bg-[#25221D] py-2 px-4 sm:px-6 border-b border-black/40">
          <FdAuthBannerLinks />
        </div>
      ) : null}
      <div className="relative z-10 w-full">
        {step <= 5 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full overflow-visible"
            >
              {/* Step 1 — Landing */}
              {step === 1 && (
                <LandingPage2
                  isAdmin={isAdmin}
                  startInGrid={startLandingInGrid}
                  onContinue={() => {
                    setStartLandingInGrid(false);
                    outputSessionKeyRef.current = null;
                    setOutputSessionKey(null);
                    setOutputUnlocked(false);
                    ensureRunKey();
                    setStep(5);
                  }}
                  onNext={() => {
                    setStartLandingInGrid(false);
                    ensureRunKey();
                    setStep(5);
                  }}
                />
              )}

              {step === 2 && (
                <Step1Vision
                  onNext={() => setStep(3)}
                  onBack={() => setStep(1)}
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
                  onNext={() => {
                    ensureRunKey();
                    setStep(5);
                  }}
                  onBack={() => setStep(3)}
                />
              )}

              {step === 5 && (
                <Questionaire
                  runKey={runKey}
                  onNext={() => goToOutputStep(6)}
                  onBack={() => setStep(4)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        ) : null}

        {outputUnlocked ? (
          <>
            <div className={step === 6 ? "block" : "hidden"} aria-hidden={step !== 6}>
              <Step4Suggestions
                email={email}
                brand={brand}
                userPlan={userPlan}
                runKey={runKey}
                outputSessionKey={runKey}
                onNext={() => setStep(7)}
              />
            </div>
            <div className={step === 7 ? "block" : "hidden"} aria-hidden={step !== 7}>
              <Step4bMarketFinancials
                email={email}
                brand={brand}
                runKey={runKey}
                outputSessionKey={runKey}
                onRestart={handleBuildNewItem}
                onBack={() => setStep(6)}
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
