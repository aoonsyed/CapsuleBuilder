import React, { useEffect, useState } from "react";
import Step1Vision from "./Step1Vision";
import Step2Inspiration from "./Step2Inspiration";
import Step3ProductFocus from "./Step3ProductFocus";


export default function LandingPage2({ onNext, onContinue, startInGrid = false }) {
    const colors = { black: "#000000", white: "#F8F8F8", darkGray: "#7B6240", charcoal: "#F4EBDC" };
    const categories = ["Outerwear", "Tee Shirt", "Pants", "Dresses"];
    const name = ["Jacket", "Tee Shirt", "Pants", "Outerwear"];

    const [selectedCategory, setSelectedCategory] = useState("Outerwear");
    const [showAllForms, setShowAllForms] = useState(startInGrid);
    const [validating, setValidating] = useState(false);

    const categoryImages = {
        Outerwear: "/assets/7.png",
        "Tee Shirt": "/assets/8.png",
        Pants: "/assets/13.png",
        Dresses: "/assets/12.png",
    };

    const categoryMap = {
        Outerwear: ['Jacket', 'Pants', 'Outerwear'],
        "Tee Shirt": ['Jacket', 'Pants', 'Outerwear'],
        Pants:  ['Jacket', 'Pants', 'Outerwear'],
        Dresses: ['Jacket', 'Pants', 'Outerwear']
    };

    useEffect(() => {
        if (startInGrid) setShowAllForms(true);
    }, [startInGrid]);

    const handleCategorySelect = (category) => {
        // Only change the selected category; keep the step indicator static
        setSelectedCategory(category);
    };
    // Customer validation is now handled at the CapsuleBuilderFlow level
    // No need to validate here anymore

    const handleGetStarted = () => setShowAllForms(true);

    const handleContinue = async () => {
        // Get customer_id from URL
        const params = new URLSearchParams(window.location.search);
        const customerId = params.get("customer_id");
        
        if (!customerId) {
            alert("Customer ID not found. Please try again.");
            return;
        }

        // Validate subscription before proceeding
        try {
            setValidating(true);
            const response = await fetch(
                `https://backend-capsule-builder.onrender.com/proxy/validate-submission?logged_in_customer_id=${customerId}`
            );
            
            const data = await response.json();
            
            if (!data.ok) {
                // User is not subscribed - redirect smoothly to subscription page
                if (data.redirect) {
                    // Smooth redirect to subscription page
                    window.location.href = data.redirect;
                    return;
                } else {
                    alert(data.message || "Unable to validate. Please try again.");
                    setValidating(false);
                    return;
                }
            }
            
            // Validation passed - proceed to next step
            if (typeof onContinue === "function") {
                onContinue();
            } else if (onNext) {
                onNext();
            }
        } catch (err) {
            console.error("Validation error:", err);
            alert("We encountered an error. Please try again.");
        } finally {
            setValidating(false);
        }
    };

    /* ================= FULL-PAGE: THREE FORMS ONLY ================= */
    /* ================= FULL-PAGE: THREE FORMS ONLY ================= */
    if (showAllForms) {
        return (
            <div className="min-h-[10px] font-inter w-full" style={{ backgroundColor: "#E8E8E8" }}>
                <section className="w-full px-4 sm:px-6">
                    <div
                        className="
            mx-auto max-w-7xl
            grid gap-8
            grid-cols-1 lg:grid-cols-3
            justify-items-center
          "
                    >
                        {/* 380x570 wrappers; inner card can scroll */}
                        <div className="w-full h-auto lg:w-[380px] lg:h-[570px] [&>*]:h-full [&>*]:w-full [&>*]:max-w-none [&>*]:overflow-auto">
                            <Step1Vision embedded />
                        </div>

                        <div className="w-full h-auto lg:w-[380px] lg:h-[570px] [&>*]:h-full [&>*]:w-full [&>*]:max-w-none [&>*]:overflow-auto">
                            <Step2Inspiration embedded />
                        </div>

                        <div className="w-full h-auto lg:w-[380px] lg:h-[570px]">
                            {/* scrolls but HIDDEN scrollbar */}
                            <div className="h-full w-full overflow-auto no-scrollbar [&>*]:w-full [&>*]:max-w-none">
                                <Step3ProductFocus embedded />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 mx-auto max-w-7xl flex justify-end">
                        <button
                            type="button"
                            onClick={handleContinue}
                            disabled={validating}
                            className={`px-6 py-3 text-[14px] font-inter font-medium leading-[140%] text-white rounded-md shadow transition duration-200 ${
                                validating 
                                    ? "bg-gray-400 cursor-not-allowed" 
                                    : "bg-black hover:bg-[#3A3A3D] active:bg-[#2A2A2A]"
                            }`}
                        >
                            {validating ? "Validating..." : "Continue →"}
                        </button>
                    </div>
                </section>

                {/* Make .no-scrollbar available in this view */}
                <style>{`
        .no-scrollbar {
          -ms-overflow-style: none; /* IE & Edge */
          scrollbar-width: none;    /* Firefox */
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;            /* Chrome, Safari, Opera */
        }
      `}</style>
            </div>
        );
    }


    /* ================= DEFAULT LANDING ================= */
    return (
        <div className="min-h-screen font-inter overflow-x-hidden w-full" style={{ backgroundColor: "#E8E8E8" }}>
            {/* HERO */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 px-4 pt-0 pb-16 sm:px-6 lg:px-12 xl:px-20 2xl:px-32 items-center">
                <div>
                    <h2 className="font-sf-pro font-semibold text-[32px] sm:text-[32px] md:text-[32px] text-black leading-[120%] tracking-[-0.2%] text-center lg:text-left">
                        START YOUR
                        <br />
                        <span className="whitespace-normal">CAPSULE COLLECTION</span>
                    </h2>
                    <p className="text-black font-inter text-[16px] font-normal leading-[150%] mt-6 text-center lg:text-left">
                        Tell us your vision, and we'll help you shape it into a
                        <br />
                        <span>sellable, production-ready line.</span>
                    </p>
                    <div className="mt-8 flex justify-center lg:justify-start">
                        <button
                            onClick={handleGetStarted}
                            className="
                inline-flex items-center justify-center
                px-6 py-3
                rounded-[20px]
                bg-black text-white
                hover:bg-[#3A3A3D]
                font-inter font-medium
                text-[14px] leading-[140%]
                shadow transition duration-200
                focus:outline-none focus:ring-2 focus:ring-black/30 active:scale-[0.99]
              "
                        >
                            Get Started
                        </button>
                    </div>
                </div>

                <div className="flex justify-center lg:justify-end">
                    <div
                        className="
              w-[370px] h-[442px] min-w-[370px] min-h-[442px] max-w-[370px] max-h-[442px]
              rounded-2xl border border-[#EDEDED]
              overflow-hidden flex items-center justify-center
            "
                    >
                        {/* Image exactly 15px smaller each side: 355x427 */}
                        <img src="/assets/7.png" alt="Capsule Preview" className="w-[355px] h-[427px] object-cover rounded-2xl" />
                    </div>
                </div>
            </div>

            {/* CURATED CAPSULE */}
            <div className="w-full bg-white px-4 sm:px-6 py-10 md:py-14 overflow-x-hidden">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-4">
                        <h1 className="text-black text-[14px] font-inter font-medium leading-[140%]">
                            Step <span className="font-inter font-medium">1</span> Of <span className="font-inter font-medium">4</span>
                        </h1>
                    </div>

                    <h1 className="text-black text-[32px] font-sf-pro font-semibold leading-[120%] tracking-[-0.2%] mb-8">
                        WHAT CATEGORY ARE YOU DESIGNING?
                    </h1>

                    <div className="flex justify-start gap-3 sm:gap-4 flex-wrap mb-10">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => handleCategorySelect(category)}
                                className={`px-5 sm:px-6 py-3 rounded-full font-inter font-medium text-[14px] leading-[140%] transition-all flex items-center gap-3 ${selectedCategory === category ? "bg-black text-white hover:bg-[#3A3A3D]" : "bg-black text-white hover:bg-[#3A3A3D]"
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedCategory === category}
                                    onChange={() => handleCategorySelect(category)}
                                    className={`w-4 h-4 rounded-full border-2 appearance-none relative transition-all ${selectedCategory === category
                                        ? 'border-white bg-white checked:after:content-["✔"] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:text-black checked:after:text-[10px] checked:after:font-bold'
                                        : "border-white bg-transparent"
                                        }`}
                                />
                                {category}
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-between items-center mt-12 mb-6">
                        <h2 className="text-black text-[24px] font-sf-pro font-semibold leading-[120%] tracking-[-0.2%]">YOUR CURATED CAPSULE</h2>
                    </div>

                    <div className="flex flex-wrap gap-8 justify-start items-start">
                        {/* Large Preview */}
                        <div className="bg-[#E8E8E8] ml-0 w-[593px] h-[518px] rounded-2xl shadow-lg border border-[#E4E4E4] flex flex-col">
                            <div className="flex-1 overflow-hidden">
                                <img src={categoryImages[selectedCategory]} alt="Bomber Jacket" className="w-full h-full object-contain mb-2" />
                            </div>
                            <div className="p-4">
                                <h2 className="text-black font-inter text-[14px] ml-6 font-medium leading-[140%]">
                                    Bomber {name[categories.indexOf(selectedCategory)]}
                                </h2>
                                <p className="text-[#000000] font-inter text-[16px] ml-6 font-normal leading-[150%]">Suggested Fabrics: Nylon, Cotton Blend</p>
                            </div>
                        </div>

                        {/* Suggested Products & Colors */}
                        <div className="flex flex-col sm:h-[518px] sm:w-[535px] w-full h-auto justify-between">
                            {/* Suggested Product */}
                            <div className="bg-[#E8E8E8] rounded-2xl shadow-md border border-[#E4E4E4] p-4 sm:p-5 w-full sm:w-[535px] h-auto sm:h-[233px]">
                                <h2 className="text-black text-[14px] font-inter font-medium leading-[140%] ml-1 sm:ml-3 mt-1 sm:mt-3 mb-4 sm:mb-5">
                                    Suggested Product
                                </h2>

                                {/* MOBILE: centered; DESKTOP: spaced row */}
                                <div className="w-full flex flex-row items-center sm:items-center justify-center sm:justify-between gap-5 sm:gap-6">
                                    <div className="w-[136px] h-[100px] sm:w-[163px] sm:h-[120px] bg-white rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                                        <img
                                            alt="Product Mini"
                                            src={categoryImages[selectedCategory]}
                                            className="object-contain w-[calc(100%-10px)] h-[calc(100%-10px)]"
                                        />
                                    </div>

                                    <div
  className="
    w-[132px] sm:w-auto
    flex flex-col items-center space-y-2.5
    sm:flex-1 sm:space-y-0
    sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-6 sm:justify-items-center
  "
>
  {categoryMap[selectedCategory]?.map((item, index) => (
    <div key={index} className="flex items-center justify-center bg-white text-black rounded-2xl font-inter font-medium text-[14px] leading-[140%] w-[105px] h-[42px] sm:w-[120px] sm:h-[49px] border cursor-pointer">
      {item}
    </div>
  ))}
  {categoryMap[selectedCategory]?.length === 1 && <div className="hidden sm:block" />}
  {categoryMap[selectedCategory]?.length === 1 && <div className="hidden sm:block" />}
</div>

                                </div>
                            </div>

                            {/* Suggested Color Palette */}
                            <div className="bg-[#E8E8E8] rounded-2xl shadow-md border border-[#E4E4E4] p-4 sm:p-5 w-full sm:w-[535px] h-auto sm:h-[233px] mt-4 sm:mt-0">
                                <h2 className="text-black text-[14px] font-inter font-medium leading-[140%] mb-4 sm:mb-6 mt-1 sm:mt-3">
                                    Suggested Color Palette
                                </h2>
                                <div className="flex gap-4 sm:gap-6 px-2 sm:px-3 py-3 flex-wrap">
                                    {Object.entries(colors).map(([n, hex]) => (
                                        <div key={n} title={n} className="w-10 h-12 sm:w-14 sm:h-16 rounded-2xl" style={{ backgroundColor: hex }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* WHAT YOU'LL RECEIVE */}
            <div className="w-full bg-[#333333] text-white py-12 px-4 text-center">
                <h1 className="font-sf-pro font-semibold text-[32px] leading-[120%] tracking-[-0.2%] mb-8">WHAT YOU'LL RECEIVE</h1>
                <div className="text-[16px] font-inter font-normal leading-[150%] space-y-6 max-w-4xl mx-auto">
                    <div>
                        <h2 className="font-semibold">Curated Materials</h2>
                        <p>Thoughtfully selected fabrics tailored to your aesthetic, function and brand goals.</p>
                    </div>
                    <div>
                        <h2 className="font-semibold">Color Direction</h2>
                        <p>A color palette shaped by your feedback and market position.</p>
                    </div>
                    <div>
                        <h2 className="font-semibold">Design Framework</h2>
                        <p>A strategic breakdown of categories and silhouettes aligned with your vision.</p>
                    </div>
                    <div>
                        <h2 className="font-semibold">Cost Transparency</h2>
                        <p>Real-time production estimates to guide planning and investment.</p>
                    </div>
                </div>
            </div>

            {/* WHO IT'S FOR */}
            <div className="w-full background-color:rgb(var(--color-background)) py-14 px-4 text-center">
                <h1 className="font-sf-pro font-semibold text-[32px] leading-[120%] tracking-[-0.2%] text-black mb-6">WHO IT'S FOR</h1>
                <p className="text-[#000000] text-[16px] font-inter font-normal leading-[150%] max-w-4xl mx-auto">
                    Capsule Builder is designed for founders, creators, and brands ready to refine an idea without needing technical expertise.
                    <br />
                    Gain clarity on design, fabrication, color, and cost so you can move forward with purpose, whether into production or deeper development.
                </p>
            </div>

            {/* FOOTER */}
            <footer className="w-full background-color:rgb(var(--color-background)) font-ebgaramond py-16 px-12 text-[#22211C]  text-[17px]">
                <div className="footer__top-wrapper flex flex-col md:flex-row justify-between gap-8 md:gap-14 px-4 md:px-10">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <svg width="20" height="20" fill="none" stroke="currentColor">
                                <path d="M2.5 4.375H17.5V15C17.5 15.1658 17.4342 15.3247 17.3169 15.4419C17.1997 15.5592 17.0408 15.625 16.875 15.625H3.125C2.95924 15.625 2.80027 15.5592 2.68306 15.4419C2.56585 15.3247 2.5 15.1658 2.5 15V4.375Z" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M17.5 4.375L10 11.25L2.5 4.375" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>info@formdepartment.com</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg width="20" height="20" fill="none" stroke="currentColor">
                                <path d="M15 16.875L15 3.125C15 2.464 14.4404 1.875 13.75 1.875H6.25C5.55964 1.875 5 2.464 5 3.125L5 16.875C5 17.5654 5.55964 18.125 6.25 18.125H13.75C14.4404 18.125 15 17.5654 15 16.875Z" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M10 5.625C10.5178 5.625 10.9375 5.20527 10.9375 4.6875C10.9375 4.16973 10.5178 3.75 10 3.75C9.48223 3.75 9.0625 4.16973 9.0625 4.6875C9.0625 5.20527 9.48223 5.625 10 5.625Z" fill="currentColor" />
                            </svg>
                            <span>+1 213 265 7977</span>
                        </div>
                    </div>
                </div>

                <br />
                <br />

                <div className="footer__bottom page-width mt-10 px-4 md:px-10 text-[#22211C] font-[EB Garamond] text-[17px] flex flex-col gap-6">
                    <div className="flex gap-4">
                        <a href="https://www.facebook.com/formdepartment" aria-label="Facebook" className="text-black hover:opacity-70 transition">
                            <i className="fab fa-facebook-f text-lg"></i>
                        </a>
                        <a href="https://www.instagram.com/formdepartment/" aria-label="Instagram" className="text-black hover:opacity-70 transition">
                            <i className="fab fa-instagram text-lg"></i>
                        </a>
                    </div>

                    <div className="footer__bottom-row flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-4 w-full">
                        <p className="whitespace-nowrap text-left w-full md:w-auto">© 2025 <a href="/">Form Department</a></p>

                        <div className="flex flex-wrap gap-x-6 gap-y-3 text-[17px] w-full md:justify-end md:w-auto">
                            {[
                                { label: "Policies", href: "/pages/policies" },
                                { label: "Client Form", href: "/pages/client-form" },
                                { label: "Item Form", href: "/pages/item-form-1" },
                                { label: "Adjustment Form", href: "/pages/adjustment-form-1" },
                                { label: "Labels & Packaging", href: "/pages/labels-packaging-1" },
                                { label: "Printing & Embroidery", href: "/pages/printing-embroidery-1" },
                                { label: "FAQ", href: "/pages/faq" },
                            ].map(({ label, href }, idx) => (
                                <a key={idx} href={href} className="relative group transition inline-block">
                                    <span className="pb-1 hover-line">{label}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    <style>{`
            .hover-line {
              position: relative;
              display: inline-block;
            }
            .hover-line::after {
              content: "";
              position: absolute;
              left: 0;
              bottom: -2px;
              width: 100%;
              height: 1px;
              background-color: black;
              transform: scaleX(0);
              transform-origin: left;
              transition: transform 0.3s ease;
            }
            .hover-line:hover::after {
              transform: scaleX(1);
              transform-origin: left;
            }
            .no-scrollbar { 
                -ms-overflow-style: none;  /* IE & Edge */
                scrollbar-width: none;     /* Firefox */
            }
            .no-scrollbar::-webkit-scrollbar { 
                display: none;             /* Chrome, Safari, Opera */
  }
          `}</style>
                </div>
            </footer>
        </div>
    );
}
