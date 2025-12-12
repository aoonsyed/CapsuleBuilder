import React, { useState } from 'react';
import Curated_Capsule from './Curated_Capsule';
import CapsuleOverview from './Capsule_overview';

export default function LandingPage({ onNext }) {
  const [selected, setSelected] = useState([]);
  const categories = ['Outerwear', 'Tee Shirt', 'Pants', 'Dresses'];

  const toggleSelection = (category) => {
    setSelected((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="bg-[#e5e5e5] font-serif text-black min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4">
        <h1 className="text-4xl font-bold tracking-wide">FORM</h1>
        <nav className="space-x-4 text-sm">
          <a href="#" className="hover:underline">All The Details</a>
          <a href="#" className="hover:underline">Blogs</a>
          <a href="#" className="hover:underline">Updates</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center px-6 md:px-16 py-12 space-y-8 md:space-y-0 md:space-x-16">
        <div className="md:w-1/2 space-y-4">
          <h2 className="text-3xl md:text-5xl font-light leading-tight">
            START YOUR <br /> CAPSULE COLLECTION
          </h2>
          <p className="text-sm">
            Tell us your vision, and we’ll help you shape it into a sellable, production-ready line.
          </p>
          <button className="bg-black text-white px-6 py-2 rounded hover:opacity-80">Get Started</button>
        </div>
        <img
          src="/mnt/data/Outwear.png"
          alt="Bomber Jacket"
          className="w-64 md:w-80 object-contain"
        />
      </section>

      {/* Step Section */}
      <section className="bg-white py-10 px-6 md:px-16">
        <p className="text-sm text-gray-600">Step 4 Of 4</p>
        <h3 className="text-xl md:text-2xl font-light mt-2 mb-6">WHAT CATEGORY ARE YOU DESIGNING?</h3>

        {/* Category Buttons */}
        <div className="flex flex-wrap gap-4 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => toggleSelection(category)}
              className={`px-4 py-2 border rounded-full text-sm ${selected.includes(category)
                  ? 'bg-black text-white'
                  : 'bg-white text-black border-black'
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Curated Capsule */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Product Image */}
          <div className="col-span-1 flex flex-col items-center">
            <img
              src="/mnt/data/Outwear.png"
              alt="Curated Capsule"
              className="w-full max-w-xs"
            />
            <h4 className="text-lg font-semibold mt-4">Bomber Outerwear</h4>
            <p className="text-xs text-gray-500">Suggested Fabrics: Nylon, Cotton Blend</p>
          </div>

          {/* Product Tags */}
          <div className="col-span-1 space-y-4">
            <p className="font-semibold text-sm">Suggested Product</p>
            <div className="flex items-center gap-4">
              <img src="/mnt/data/Outwear.png" alt="Jacket Thumb" className="w-16 h-16 object-cover" />
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 border rounded-full">Jacket</span>
                <span className="px-3 py-1 border rounded-full">Top</span>
                <span className="px-3 py-1 border rounded-full">Outerwear</span>
              </div>
            </div>
          </div>

          {/* Color Palette */}
          <div className="col-span-1 space-y-4">
            <p className="font-semibold text-sm">Suggested Color Palette</p>
            <div className="flex gap-3">
              {['#000000', '#ffffff', '#b0a895', '#6f6046', '#ede8de'].map((color, i) => (
                <div key={i} className="w-8 h-8 rounded-full border" style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Receive */}
      <section className="bg-[#2b2b2b] text-white text-center py-12 px-6 md:px-16">
        <h3 className="text-xl mb-6">WHAT YOU’LL RECEIVE</h3>
        <div className="text-xs space-y-4">
          <p><strong>Curated Materials</strong><br />Thoughtfully Selected Fabrics Tailored To Your Aesthetic, Function, And Brand Goals.</p>
          <p><strong>Color Direction</strong><br />A Cohesive Palette Shaped By Your Feedback And Market Position.</p>
          <p><strong>Design Framework</strong><br />A Strategic Breakdown Of Categories And Silhouettes Aligned With Your Vision.</p>
          <p><strong>Cost Transparency</strong><br />Real-Time Production Estimates To Guide Planning And Investment.</p>
        </div>
      </section>

      {/* Who It's For */}
      <section className="bg-[#e5e5e5] text-center py-12 px-6 md:px-16 text-sm">
        <h3 className="text-xl mb-4 tracking-wide">WHO IT’S FOR</h3>
        <p className="max-w-3xl mx-auto">
          Capsule Builder Is Designed For Founders, Creators, And Brands Ready To Refine An Idea Without Needing Technical Expertise. <br />
          Gain Clarity On Design, Fabrication, Color, And Cost—So You Can Move Forward With Purpose, Whether Into Production Or Deeper Development.
        </p>
      </section>
    </div>
  );
}
