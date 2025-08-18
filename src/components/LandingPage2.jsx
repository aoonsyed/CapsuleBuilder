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
                            className="px-8 py-3 text-[17px] font-[Garamond] text-white bg-black hover:bg-[#1C1C1C] rounded-3xl shadow transition duration-200"
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
                            className="w-full h-full object-cover rounded-2xl"
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
                                    <div className="flex flex-col gap-4 flex-1 justify-center">
                                        <div className="grid grid-cols-2 gap-4 w-full">
                                            <div className="flex items-center justify-center bg-white text-black rounded-3xl font-[Garamond] font-semibold text-[14pt] h-[60px] transition border">
                                                Jacket
                                            </div>
                                            <div className="flex items-center justify-center bg-white text-black rounded-3xl font-[Garamond] font-semibold text-[14pt] h-[60px] transition border">
                                                Top
                                            </div>
                                            <div className="col-span-2 flex items-center justify-center bg-white text-black rounded-3xl font-[Garamond] font-semibold text-[14pt] h-[60px] transition border">
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
            <div className="w-full bg-[#EDEDED] py-14 px-4 text-center">
                <h1 className="font-[Aboreto] text-[24pt] sm:text-[28pt] md:text-[30pt] text-black mb-6">WHO IT’S FOR</h1>
                <p className="text-[#000000] text-[10px] md:text-[15px]  font-[ebgaramond] leading-snug max-w-4xl mx-auto">
                    Capsule Builder Is Designed For Founders, Creators, And Brands Ready To Refine An Idea Without Needing Technical Expertise.
                    <br />
                    Gain Clarity On Design, Fabrication, Color, And Cost So You Can Move Forward With Purpose, Whether Into Production Or Deeper Development.
                </p>
            </div>

            <div className="w-full bg-white py-20 px-4">
                {/* Your content goes here */}
            </div>
        </div>
    );
}
