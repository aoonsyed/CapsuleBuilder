import React from 'react';
export default function Curated_Capsule({onBack}) {
  return (
    <div className="bg-[#F9F5F0] min-h-screen ">
       <div className="max-w-7xl w-full flex flex-col lg:flex-row items-center lg:items-start">
        {/* Left Content */}
        <div className="max-w-7xl  px-6">
             <button
           type = "button"
                    onClick={onBack}
                   className=" pb-1 text-xl font-extrabold text-[#a98a67] ">

               ←
           </button>
          <h1 className="text-[#333333] text-[36pt] font-serif leading-tight">
            Your Curated Capsule
          </h1>
         
          
        </div>

</div>

      </div>
   
  );
}
