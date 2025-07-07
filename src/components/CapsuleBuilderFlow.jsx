import React, { useState } from "react";
import Navbar from "./Navbar";

import Step1Vision from "./Step1Vision";
import Step2Inspiration from "./Step2Inspiration";
import Step3ProductFocus from "./Step3ProductFocus";
import Step4Suggestions from "./Step4Suggestions";
import Step6Complete from "./Step6Complete"; // Skipping Step5

export default function CapsuleBuilderFlow() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("demo@example.com");

    return (
        <div
            className="min-h-screen bg-cover bg-center font-sans text-white relative"
            style={{ backgroundImage: `url('/background.png')` }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 z-0" />

            {/* Navbar at the top */}
            <div className="relative z-10">
                <Navbar />
            </div>

            {/* Step content */}
            <div className="relative z-10 flex items-center justify-center min-h-screen px-4 pt-24">
                <div className="w-full max-w-xl p-10">
                    {step === 1 && <Step1Vision onNext={() => setStep(2)} setEmail={setEmail} />}
                    {step === 2 && <Step2Inspiration email={email} onNext={() => setStep(3)} onBack ={()=>setStep(1)} />}
                    {step === 3 && <Step3ProductFocus email={email} onNext={() => setStep(4)} onBack={()=> setStep(2)} />}
                    {step === 4 && <Step4Suggestions email={email} onNext={() => setStep(6)} onBack={()=>setStep(3)} />}
                    {step === 6 && <Step6Complete email={email} />}
                </div>
            </div>
        </div>
    );
}
