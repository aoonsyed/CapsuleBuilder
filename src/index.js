import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import CapsuleBuilderFlow from "./components/CapsuleBuilderFlow";
import LandingPage2 from "./components/LandingPage2";
import store from "./store";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store = {store}>
  <BrowserRouter>
    <Routes>
      
     <Route path="/" element={<CapsuleBuilderFlow />} />  
     <Route path="/landing" element={<LandingPage2 />} />
      <Route path="/capsule-builder" element={<CapsuleBuilderFlow />} />
    </Routes>
  </BrowserRouter>
  </Provider>
);
