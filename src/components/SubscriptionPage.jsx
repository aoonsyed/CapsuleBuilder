import React from 'react';

export default function SubscriptionPage({ onBack }) {
  return (
    <div>
      {/* Back Button */}
       <div className="flex justify-start">
  <button
    onClick={onBack}
    className="text-sm text-black hover:underline text-start"
  >
    ← Back
  </button>
</div>
    <div className="flex justify-center gap-4 p-8">
        
      {/* Card 1 */}
      <div className="flex items-center">
        <div className="bg-white/80 rounded-2xl shadow-lg border border-[#E4E4E4] w-[300px] h-[400px] overflow-hidden flex flex-col transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl">
          
          <h2 className="text-[20pt] font-semibold text-black m-4 border-b border-gray-200 text-center text-[20pt]">
            Tier 1
          </h2>

          
          <div className="flex-grow  ">
           
            <span className="text-gray-500"><ul className="text-black text-m space-y-3 x-3 ml-5">
              <li><strong className='text-lg'>$29–$49/month</strong> <ul className="list-disc list-inside ml-4 mt-1 text-lg">
      <li>Access to templates</li>
      <li>Basic AI sketching</li>
      <li>Early-stage idea mapping</li>
    </ul></li>
             
              
            </ul></span>
          </div>
        </div>
      </div>
     {/*Card2 */}
     <div className="flex items-center">
        <div className="bg-white/80 rounded-2xl shadow-lg border border-[#E4E4E4]  w-[300px] h-[400px] overflow-hidden flex flex-col transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl">
          <h2 className="text-[20pt] text-center font-semibold text-black p-4 border-b border-gray-200">
            Tier 2
          </h2>
          <div className="flex-grow">
            <span className="text-gray-500"><ul className="text-black text-m space-y-3 x-3 ml-5">
           <li><strong className="text-black">$99–$299/month</strong><ul className="list-disc list-inside ml-4 mt-1 text-black text-lg">
      <li>Include custom spec generation</li>
      <li>AI costing tool</li>
      <li>supplier database</li>
    </ul></li> 
    </ul></span>
          </div>
        </div>
      </div>
{/*Card 3 */}
      <div className="flex items-center">
        <div className="bg-white/80 rounded-2xl shadow-lg border border-[#E4E4E4] w-[300px] h-[400px] overflow-hidden flex flex-col transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl">
          <h2 className="text-[20pt] font-semibold text-black p-4 border-b border-gray-200 text-center">
            Pro Tier
          </h2>
          <div className="flex-grow">
            <span className="text-gray-500"><ul className="text-black text-m space-y-3 x-3 ml-5">
           <li><strong className="text-black">$199–$299/month</strong><ul className="list-disc list-inside ml-4 mt-1 text-black text-lg">
      <li>Access to templates</li>
      <li>Basic AI sketching</li>
      <li>Early-stage idea mapping</li>
    </ul></li>
    </ul></span>
          </div>
        </div>
      </div>
      {/* Card 2 */}
      <div className="flex items-center">
        <div className="bg-white/80 rounded-2xl shadow-lg border border-[#E4E4E4] w-[300px] h-[400px] overflow-hidden flex flex-col transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl">
          <h2 className="text-[18pt] text-center font-semibold text-black p-4 border-b border-gray-200">
            One Time Package Pricing
          </h2>
          <div className="flex-grow">
            <ul className=" text-lg space-y-3 list-disc list-inside text-black ml-6">
  <li>
    “Idea to Tech Pack” Bundle – <strong>$300–$600</strong>
  </li>
  <li>
    “Ready for Production” Full Suite – <strong>$1,000+</strong>
  </li>
</ul>
          </div>
        </div>
      </div>

      
        </div>
      </div>

  );
}
