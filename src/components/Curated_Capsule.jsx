import React from 'react';
import { useState } from 'react';
export default function Curated_Capsule() {
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
} 
const name = ['Jacket','Tops','Pants','Outerwear'];
  const [selectedCategory, setSelectedCategory] = useState('Outerwear');
  const categoryImages = {
    Outerwear: '/assets/7.png',
    Tops: '/assets/8.png',
    Pants: '/assets/9.png',
    Dresses: '/assets/10.png',
  };
  const [currentStep,setCurrentStep] = useState(1)
const handleCategorySelect = (category) => {
  // Buttons are now static - no longer clickable
  // setSelectedCategory(category);
  // setCurrentStep((currentStep % 4) + 1)
};
  return (
    <div className="w-screen relative left-1/2 -ml-[50vw] bg-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-12 transform md:-translate-x-5 overflow-x-hidden">
       <div className="w-full mb-4 md:transform md:translate-x-5">
  <h1 className="text-black text-xl font-[Garamond]">
    Step <span className="font-[Albereto Regular]">{currentStep}</span> Of <span className="font-[Albereto Regular]">4</span>
  </h1>
</div>

        <h1 className="text-black text-[20pt] sm:text-[24pt] md:text-[26pt] font-[Albereto Regular] mb-3 md:transform md:translate-x-5">
          WHAT CATEGORY ARE YOU DESIGNING?
        </h1>
         <div className="flex justify-start gap-3 sm:gap-4 flex-wrap mb-10 md:mb-16 md:transform md:translate-x-5">
        {categories.map((category) => (
          <button
  key={category}
  onClick={() => {}} // Disabled click handler
  className={`px-5 sm:px-6 py-2 rounded-full font-[Garamond] font-[500] text-[13pt] sm:text-[14pt] transition-all border flex items-center gap-3 cursor-not-allowed opacity-50
    ${
      selectedCategory === category
        ? 'bg-black text-white'
        : 'bg-transparent text-black border-none'
    }
  `}
>
  <input
    type="checkbox"
    checked={selectedCategory === category}
    onChange={() => {}} // Disabled change handler
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
        {/* Heading */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-5">
  <h1 className="text-black text-[18pt] sm:text-[20pt] font-[Albereto Regular] md:transform md:translate-x-5 mb-1 sm:mb-2">
    YOUR CURATED CAPSULE
  </h1>
  <h1 className="text-black text-[12pt] sm:text-[14pt] font-[Albereto Regular] font-normal md:transform md:-translate-x-[30px]">
  SESTEDD SUGT
</h1>
</div>

        {/* Row 1 */}
        <div className="flex flex-wrap gap-6 sm:gap-10 md:gap-16 justify-center items-center ">
          {/* Left - Jacket Image */}
          <div className="bg-[#E8E8E8] rounded-2xl shadow-lg border border-[#E4E4E4] w-full max-w-full sm:max-w-[600px] h-[360px] sm:h-[440px] md:h-[513px]  flex flex-col">
           <div className="flex-1 overflow-hidden">
    <img
      src={categoryImages[selectedCategory]}
      alt="Bomber Jacket"
      className="w-full h-full object-contain mb-2"
    />
  </div>
  <div className="p-4">
    <h2 className='text-black font-[Garamond] text-[16pt] ml-6 font-semibold'>Bomber {name[categories.indexOf(selectedCategory)]}</h2>
    <p className="text-[#000000] font-[Garamond] text-[12pt] ml-6"> Suggested Fabrics:Nylon,Cotton Blend</p>
 </div>
           
           
  
          </div>

          {/* Right - Product Suggestion */}
          <div className="flex flex-col gap-6 sm:gap-10 md:gap-12 ">
           {/* Suggested Product (Hor izontal) */}
<div className="bg-[#E8E8E8] rounded-2xl shadow-md border border-[#E4E4E4] p-5 gap-6 w-full max-w-[560px] h-[230px]">
   <h2 className="text-black text-xl font-[Garamond] font-[580] ml-3 mt-3 mb-5 tracking-tight">
                Suggested Product
              </h2>
              <div className = "flex items-center gap-6">
  
  {/* Image Left */}
  <div className="w-[130px] h-[130px] bg-white rounded-2xl overflow-hidden flex-shrink-0 ml-2">
  <img
    src={categoryImages[selectedCategory]}
    alt="Product Mini"
    className="w-full h-full object-contain p-4"
  />
</div>
<div className="flex flex-col items-center justify-center">
  <div className="grid grid-cols-2 gap-4">
    {categoryMap[selectedCategory].map((subcategory, index) => (
      <div
        key={index}
       className="w-[140px] h-[60px] flex items-center justify-center bg-white text-black rounded-3xl font-[Garamond] font-[550] text-[14pt] text-center transition border"
>
        {subcategory.trim()}
      </div>
    ))}
  </div>
</div>
  </div>
</div>


            {/* Color Palette */}
            <div className="bg-[#E8E8E8] rounded-2xl shadow-md border border-[#E4E4E4] p-5 w-full max-w-[560px] h-[230px] justify center items-center">
               <h2 className="text-black text-xl font-[Garamond] font-[580] mb-6 mt-5 tracking-tight">
                Suggested Color Palette
              </h2>
              <div className="flex gap-6 px-3 py-5">
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
  );
}
