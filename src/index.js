import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CapsuleBuilderFlow from "./components/CapsuleBuilderFlow";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<CapsuleBuilderFlow />} />
      <Route path="/capsule-builder" element={<CapsuleBuilderFlow />} />
    </Routes>
  </BrowserRouter>
);
