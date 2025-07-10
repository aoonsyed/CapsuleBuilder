import React from 'react';
export default function LandingPage({ onNext}) {
    const handleSubmit = (e) => {
        e.preventDefault();
        // ✅ No backend call — just move to the next step
        onNext();
    };
  return (
    <div className="bg-[#F9F5F0] min-h-screen ">
      
        {/* Left Content */}
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h1 className="text-[#333333] text-[36pt] font-serif leading-tight">
            Start Your<br />
            Capsule Collection
          </h1>
          <p className="text-[#333333] text-[16pt] mt-4 leading-[1.5]">
            Tell us your vision, and we’ll help you shape<br />
            it into a sellable, production-ready line.
          </p>
          <button className=" mt-6 px-6 py-2 text-l font-bold text-white bg-[#b89d7b] hover:bg-[#a98a67] active:bg-[#8c7152] rounded shadow transition duration-200 rounded-md"
          onClick = {onNext}
          >
            Get Started
          </button>
        </div>

        {/* Right Illustration */}
        <div className="flex-1 flex items-center justify-center lg:justify-end ">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-[#E4E4E4]">
            <img
              src="/wrap-dress.svg" // Replace with actual path to illustration
              alt="Wrap Dress"
              className="h-64 w-auto"
            />
          </div>
        </div>
      </div>
   
  );
}

