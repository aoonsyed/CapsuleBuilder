import React, { useState } from 'react';

export default function LandingPage({ onNext }) {
    const colors = {
        black: "#000000",
        white: "#F8F8F8",
        darkGray: "#7B6240",
        charcoal: "#F4EBDC",
    };

    const categories = ['Outerwear', 'Tops', 'Pants', 'Dresses'];
    const categoryMap = {
        Outerwear: ['Jacket', 'Pants', 'Outerwear'],
        Tops: ['Jacket', 'Pants', 'Outerwear'],
        Pants: ['Jacket', 'Pants', 'Outerwear'],
        Dresses: ['Jacket', 'Pants', 'Outerwear']
    };

    const name = ['Jacket', 'Tops', 'Pants', 'Outerwear'];

    const [selectedCategory, setSelectedCategory] = useState('Outerwear');
    const categoryImages = {
        Outerwear: '/assets/7.png',
        Tops: '/assets/8.png',
        Pants: '/assets/9.png',
        Dresses: '/assets/10.png',
    };

    const [currentStep, setCurrentStep] = useState(1);

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setCurrentStep((currentStep % 4) + 1);
    };

    return (
        <div className="min-h-screen font-[Helvetica] overflow-x-hidden w-full" style={{ backgroundColor: '#E8E8E8' }}>
            {/* HERO SECTION */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 px-4 pt-0 pb-16 sm:px-6 lg:px-12 xl:px-20 2xl:px-32 items-center">
                <div>
                    <h2 className="font-[Aboreto] font-extralight text-[30px] sm:text-[42px] md:text-[56px] text-black leading-tight text-center lg:text-left">
                        START YOUR<br />
                        <span className="whitespace-normal">CAPSULE COLLECTION</span>
                    </h2>
                    <p className="text-black font-ebgaramond text-[16px] sm:text-[18px] md:text-[20px] leading-relaxed mt-4 text-center lg:text-left">
                        Tell us your vision, and we’ll help you shape it into a<br />
                        <span>sellable, production-ready line.</span>
                    </p>
                    <div className="mt-6 flex justify-center lg:justify-start">
                        <button
                            className="text-white bg-black hover:bg-gray-500 shadow transition duration-200 capitalize"
                            style={{
                                width: "178px",
                                height: "61px",
                                borderRadius: "20px",
                                fontFamily: "'EB Garamond', serif",
                                fontWeight: 600,
                                fontSize: "20px",
                                lineHeight: "24px",
                                letterSpacing: "-0.16px",
                                verticalAlign: "middle",
                                opacity: 1,
                            }}
                            onClick={onNext}
                        >
                            Get Started
                        </button>
                    </div>

                </div>

                <div className="flex justify-center lg:justify-end">
                    <div className="rounded-2xl border border-[#EDEDED] w-full max-w-[370px] aspect-[4/5] overflow-hidden flex items-center justify-center">
                        <img
                            src="/assets/7.png"
                            alt="Capsule Preview"
                            className="w-full h-full p-2 object-cover rounded-2xl"
                        />
                    </div>
                </div>
            </div>

            {/* CURATED CAPSULE SECTION */}
            <div className="w-full bg-white px-4 sm:px-6 py-10 md:py-14 overflow-x-hidden">
                <div className="mx-auto max-w-7xl">
                    {/* Step Indicator */}
                    <div className="mb-2">
                        <h1 className="text-black text-xl font-[Garamond]">
                            Step <span className="font-[Aboreto]">{currentStep}</span> Of <span className="font-[Aboreto]">4</span>
                        </h1>
                    </div>

                    {/* Title */}
                    <h1 className="text-black text-[22pt] sm:text-[26pt] md:text-[28pt] font-[Aboreto] mb-6">
                        WHAT CATEGORY ARE YOU DESIGNING?
                    </h1>

                    {/* Category Buttons */}
                    <div className="flex justify-start gap-3 sm:gap-4 flex-wrap mb-10">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => handleCategorySelect(category)}
                                className={`px-5 sm:px-6 py-2 rounded-full font-[Garamond] font-[500] text-[13pt] sm:text-[14pt] transition-all flex items-center gap-3
            ${selectedCategory === category ? 'bg-black text-white' : 'bg-transparent text-black'}
          `}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedCategory === category}
                                    onChange={() => handleCategorySelect(category)}
                                    className={`w-4 h-4 rounded-full border-2 appearance-none relative transition-all
              ${selectedCategory === category
                                            ? 'border-white bg-white checked:after:content-["✔"] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:transform checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:text-black checked:after:text-[10px] checked:after:font-bold'
                                            : 'border-black/80 bg-transparent'
                                        }`}
                                />
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Curated Capsule + Sestedd Sugt */}
                    <div className="flex justify-between items-center mt-20 mb-6">
                        <h2 className="text-black text-xl sm:text-2xl mt-15 mb-10 md:text-[22pt] font-[Garamond] ">
                            YOUR CURATED CAPSULE
                        </h2>

                    </div>

                    {/* Main Content */}
                    <div className="flex flex-wrap gap-8 justify-start items-start">
                        {/* Image Preview */}
                        <div className="bg-[#E8E8E8] ml-0 rounded-2xl shadow-lg border border-[#E4E4E4] w-full max-w-full sm:max-w-[600px] h-[360px] sm:h-[440px] md:h-[513px] flex flex-col">

                            <div className="flex-1 overflow-hidden ">
                                <img
                                    src={categoryImages[selectedCategory]}
                                    alt="Bomber Jacket"
                                    className="w-full h-full object-contain mb-2"
                                />
                            </div>
                            <div className="p-4">
                                <h2 className='text-black font-[Garamond] text-[16pt] ml-6 font-semibold'>Bomber {name[categories.indexOf(selectedCategory)]}</h2>
                                <p className="text-[#000000] font-[Garamond] text-[12pt] ml-6">Suggested Fabrics: Nylon, Cotton Blend</p>
                            </div>
                        </div>

                        {/* Suggested Products & Colors */}
                        <div className="flex flex-col gap-6 sm:gap-8 md:gap-10 px-4 sm:px-6 md:px-8">
                            {/* Suggested Products */}
                            <div className="bg-[#E8E8E8] rounded-2xl shadow-md border border-[#E4E4E4] p-5 w-full max-w-[533px] mx-auto">
                                <h2 className="text-black text-xl font-[Garamond] font-semibold ml-3 mt-3 mb-5 tracking-tight">
                                    Suggested Product
                                </h2>
                                <div className="flex flex-row items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                                    {/* Image */}
                                    <div className="w-[130px] h-[130px] bg-white rounded-2xl overflow-hidden flex-shrink-0">
                                        <img
                                            alt="Product Mini"
                                            src="/assets/7.png"
                                            className="w-full h-full object-contain p-4"
                                        />
                                    </div>

                                    {/* Product Buttons */}
                                    {/* Product Buttons */}
                                    <div className="flex flex-col gap-4 flex-1 justify-center">
                                        <div className="grid grid-cols-1 gap-4 w-full sm:grid-cols-2">
                                            <div className="flex items-center justify-center bg-white text-black rounded-2xl font-[Garamond] font-semibold text-[13pt] h-[50px] w-[100px] transition border">
                                                Tops
                                            </div>
                                            <div className="flex items-center justify-center bg-white text-black rounded-2xl font-[Garamond] font-semibold text-[13pt] h-[50px] w-[100px] transition border">
                                                Pants
                                            </div>
                                            <div className="col-span-1 sm:col-span-2 flex items-center justify-center bg-white text-black rounded-2xl font-[Garamond] font-semibold text-[13pt] h-[60px] w-[100px] transition border">
                                                Outerwear
                                            </div>
                                        </div>
                                    </div>



                                </div>
                            </div>

                            {/* Suggested Color Palette */}
                            <div className="bg-[#E8E8E8] rounded-2xl shadow-md border border-[#E4E4E4] p-5 w-full max-w-[560px] mx-auto">
                                <h2 className="text-black text-xl font-[Garamond] font-semibold mb-6 mt-5 tracking-tight">
                                    Suggested Color Palette
                                </h2>
                                <div className="flex gap-6 px-3 py-5 flex-wrap">
                                    {Object.entries(colors).map(([name, hex]) => (
                                        <div
                                            key={name}
                                            title={name}
                                            className="w-14 h-16 rounded-2xl"
                                            style={{ backgroundColor: hex }}
                                        ></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* WHAT YOU'LL RECEIVE SECTION */}
            <div className="w-full bg-[#333333] text-white py-12 px-4 text-center">
                <h1 className="font-[Aboreto] text-[24pt] sm:text-[28pt] md:text-[30pt] mb-8">WHAT YOU'LL RECEIVE</h1>
                <div className="text-[12pt] font-[Garamond] space-y-5 max-w-4xl mx-auto">
                    <div>
                        <h2 className="font-semibold">Curated Materials</h2>
                        <p>Thoughtfully Selected Fabrics Tailored to your Aesthetic, Function And Brand Goals.</p>
                    </div>
                    <div>
                        <h2 className="font-semibold">Color Direction</h2>
                        <p>A Color Palette Shaped By Your Feedback And Market Position.</p>
                    </div>
                    <div>
                        <h2 className="font-semibold">Design Framework</h2>
                        <p>A Strategic Breakdown Of Categories And Silhouettes Aligned With Your Vision.</p>
                    </div>
                    <div>
                        <h2 className="font-semibold">Cost Transparency</h2>
                        <p>Real-Time Production Estimates to Guide Planning And Investment.</p>
                    </div>
                </div>
            </div>

            {/* WHO IT’S FOR SECTION */}
            <div className="w-full background-color:rgb(var(--color-background)) py-14 px-4 text-center">
                <h1 className="font-[Aboreto] text-[24pt] sm:text-[28pt] md:text-[30pt] text-black mb-6">WHO IT’S FOR</h1>
                <p className="text-[#000000] text-[10px] md:text-[15px]  font-[ebgaramond] leading-snug max-w-4xl mx-auto">
                    Capsule Builder Is Designed For Founders, Creators, And Brands Ready To Refine An Idea Without Needing Technical Expertise.
                    <br />
                    Gain Clarity On Design, Fabrication, Color, And Cost So You Can Move Forward With Purpose, Whether Into Production Or Deeper Development.
                </p>
            </div>


            {/* UPDATED FOOTER SECTION */}
            <footer className="w-full background-color:rgb(var(--color-background)) font-ebgaramond py-16 px-12 text-[#22211C]  text-[17px]">

                {/* TOP SECTION */}
                <div className="footer__top-wrapper flex flex-col md:flex-row justify-between gap-8 md:gap-14 px-4 md:px-10">
                    {/* Contact Info */}
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

                <br></br>
                <br></br>

                {/* BOTTOM SECTION */}
                <div className="footer__bottom page-width mt-10 px-4 md:px-10 text-[#22211C] font-[EB Garamond] text-[17px] flex flex-col gap-6">

                    {/* ICONS */}
                    <div className="flex gap-4">
                        <a href="https://www.facebook.com/formdepartment" aria-label="Facebook" className="text-black hover:opacity-70 transition">
                            <i className="fab fa-facebook-f text-lg"></i>
                        </a>
                        <a href="https://www.instagram.com/formdepartment/" aria-label="Instagram" className="text-black hover:opacity-70 transition">
                            <i className="fab fa-instagram text-lg"></i>
                        </a>
                    </div>

                    {/* LINKS + COPYRIGHT ROW */}
                    <div className="footer__bottom-row flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-4 w-full">

                        {/* COPYRIGHT - LEFT ON DESKTOP, BOTTOM ON MOBILE */}
                        <p className="whitespace-nowrap text-left w-full md:w-auto">
                            © 2025 <a href="/" >Form Department</a>
                        </p>

                        {/* NAV LINKS - RIGHT ON DESKTOP, ABOVE COPYRIGHT ON MOBILE */}
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

                    {/* Hover underline animation */}
                    <style jsx>{`
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
`}</style>

                </div>
            </footer>






        </div>
    );
}
