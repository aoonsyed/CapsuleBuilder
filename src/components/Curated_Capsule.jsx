import React from 'react';

export default function Curated_Capsule({ onBack }) {
  const colors = {
    lightBeige: "#E9DFD1",
    warmSand: "#D4C2A3",
    taupe: "#B59B7A",
    oliveBrown: "#7C6848",
    deepBrown: "#5B4032",
  };

  return (
    <div className="bg-[#F9F5F0] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <button
          type="button"
          onClick={onBack}
          className="pb-1 text-xl font-extrabold text-[#a98a67]"
        >
          ←
        </button>

        <h1 className="text-[#333333] text-[36pt] font-serif leading-tight mb-6">
          Your Curated Capsule
        </h1>

      
        <div className="flex flex-col items-center justify-center gap-6 p-6">
          
          {/* Row 1 */}
          <div className="flex gap-4">
            {/* Left Image Box */}
            <div className="ml-20 bg-white/40 rounded-2xl shadow-lg border border-[#E4E4E4] w-[450px] h-[400px] overflow-hidden flex">
              <img
                src="/assets/3.png"
                alt="Capsule Preview"
                className="w-full h-full object-fill rounded-2xl"
              />
            </div>

            {/* Right Box Container */}
            <div className="flex flex-col gap-6">
            
              <div className="bg-[#F9F5F0] rounded-2xl shadow-lg border border-[#E4E4E4] w-[450px] h-[220px] overflow-hidden p-4">
                <h1 className="text-black text-xl font-normal mb-4">Suggested Product</h1>

                <div className="flex gap-4">
                  
                  <div className="w-[140px] h-[140px]">
                    <img
                      src="/assets/4.png"
                      alt="Capsule Preview"
                      className="w-full h-full rounded-2xl object-cover mb-5"
                    />
                  </div>

                  
                  <div className="flex flex-wrap gap-3 flex-1">
                    <div className="w-[80px] h-[60px] bg-[#EDE7DF] rounded-2xl p-4 shadow text-black">Tops</div>
                    <div className="w-[100px] h-[60px] bg-[#EDE7DF] rounded-2xl p-4 shadow text-black">Pants</div>
                    <div className="w-[180px] h-[60px] bg-[#EDE7DF] rounded-2xl p-4 mb-2 shadow text-black">Outwear Dresses</div>
                  </div>
                </div>
              </div>

              
              <div className="bg-[#F9F5F0] rounded-2xl shadow-lg border border-[#E4E4E4] w-[450px] h-[150px] overflow-hidden p-4">
                <h1 className="text-black text-xl font-normal mt-2 mb-2">Suggested Color Palette</h1>
                <div className="flex gap-4 p-4">
                  {Object.entries(colors).map(([name, hex]) => (
                    <div
                      key={name}
                      title={name}
                      className="w-10 h-10 rounded-full border border-gray-300"
                      style={{ backgroundColor: hex }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className=" ml-10 flex gap-6">
           
            <div className=" bg-[#F9F5F0] rounded-2xl shadow-lg border border-[#E4E4E4] w-[450px] h-[150px] overflow-hidden p-4">
              <h1 className="text-black text-xl font-normal mt-2 mb-2">Suggested Color Palette</h1>
              <div className="flex gap-4 p-4">
                {Object.entries(colors).map(([name, hex]) => (
                  <div
                    key={name}
                    title={name}
                    className="w-10 h-10 rounded-full border border-gray-300"
                    style={{ backgroundColor: hex }}
                  ></div>
                ))}
              </div>
            </div>

            
            <div className="bg-[#F9F5F0] rounded-2xl shadow-lg border border-[#E4E4E4] w-[400px] h-[200px] overflow-hidden p-4">
              <h1 className="text-black text-xl font-normal mt-2 mb-2">Construction Notes</h1>
              <div className="text-black text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

