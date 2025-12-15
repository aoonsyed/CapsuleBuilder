import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import "./index.css";
import CapsuleBuilderFlow from "./components/CapsuleBuilderFlow";
import LandingPage2 from "./components/LandingPage2";
import AdminDashboard from "./components/AdminDashboard";
import store from "./store";

// Small wrapper so /landing can navigate into the flow when "Continue →" is pressed
function LandingStandalone() {
  const navigate = useNavigate();
  return <LandingPage2 onNext={() => navigate("/capsule-builder")} />;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <BrowserRouter>
      {/* Global toaster once for the entire app */}
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        {/* Primary entry – the whole multi-step flow */}
        <Route path="/" element={<CapsuleBuilderFlow />} />
        <Route path="/capsule-builder" element={<CapsuleBuilderFlow />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Optional standalone landing page that can jump into the flow */}
        <Route path="/landing" element={<LandingStandalone />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </Provider>
);
