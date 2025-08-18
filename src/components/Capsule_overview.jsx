import React from 'react';

export default function CapsuleOverview() {
  return (
    <div className="w-screen relative left-1/2 -ml-[50vw] bg-[#333333] font-[Helvetica] overflow-x-hidden">
      <div className="max-w-4xl mx-auto text-center py-10 md:py-12 px-4">
        <h1 className="text-white font-extralight text-[24pt] sm:text-[28pt] md:text-[30pt] font-[Aboreto] mb-8 md:mb-12">
          WHAT YOU'LL RECEIVE
        </h1>

        <h1 className="text-white text-[13pt] font-[Garamond] font-[600] leading-none mt-2">Curated Materials</h1>
        <p className="text-white/90 text-[12pt] font-[Garamond]  mb-5">
          Thoughtfully Selected Fabrics Tailored to your Aesthetic, Function And Brand Goals.
        </p>

        <h1 className="text-white text-[13pt] font-[Garamond] font-[600] leading-none mt-2">Color Direction</h1>
        <p className="text-white/90 text-[12pt] font-[Garamond] mb-5">
          A Color Palette Shaped By Your Feedback And Market Position.
        </p>

        <h1 className="text-white text-[13pt] font-[Garamond] font-[600] leading-none mt-2">Design Framework</h1>
        <p className="text-white/90 text-[12pt] font-[Garamond] mb-5">
          A Strategic Breakdown Of Categories And Silhouettes Aligned With Your Vision.
        </p>

        <h1 className="text-white text-[13pt] font-[Garamond] font-[600] leading-none mt-2">Cost Transparency</h1>
        <p className="text-white/90 text-[12pt] font-[Garamond] mb-5">
          Real-Time Production Estimates to Guide Planning And Investment.
        </p>
      </div>

      <div className="w-screen bg-[#EDEDED] pt-8 md:pt-10 pb-10 md:pb-12 overflow-x-hidden">
        <div className="text-center px-4">
          <h1 className="font-[Aboreto] text-[24pt] sm:text-[28pt] md:text-[30pt] text-black mb-4 md:mb-5">WHO IT’S FOR</h1>
          <p className="text-[#000000] text-[16px] md:text-[17px] font-[ebgaramond] leading-snug px-0 md:px-4 mb-1">
            Capsule Builder Is Designed For Founders, Creators, And Brands Ready To Refine An Idea Without Needing Technical Expertise.
            <br />
            Gain Clarity On Design, Fabrication, Color, And Cost—So You Can Move Forward With Purpose, Whether Into Production Or{' '}
            <span className="whitespace-nowrap">Deeper Development</span>.
          </p>
        </div>
      </div>
      <div className="w-screen bg-white py-20 md:py-32 px-4 md:px-6 overflow-x-hidden">
        <div className="max-w-5xl mx-auto text-center">
          {/*
            This section is ready for additional content such as case studies, testimonials, or further details about your capsule journey.
          */}
        </div>
      </div>
    </div>
  );
}
