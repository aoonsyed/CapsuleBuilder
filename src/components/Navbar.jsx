import React, { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-[#E8E8E8] text-[#cccccc] font-ebgaramond font-normal text-[20px] leading-[24px] capitalize align-middle px-4 md:px-6 py-4 md:py-6">
            <div className="max-w-7xl mx-auto h-auto md:h-[100px]">
                {/* Top row */}
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center">
                        <img
                            src="/assets/11.png"
                            alt="Form Department Logo"
                            className="px-4 md:px-14 h-16 md:h-20 w-auto rounded-2xl transform translate-x-0 md:translate-x-[-70px]"
                        />
                    </div>

                    {/* Desktop nav */}
                    <div className="hidden md:flex gap-8 text-black font-garamond font-normal text-[20px] leading-[24px] capitalize align-middle md:mr-8 md:translate-x-[-40px]">
                        <button className="hover:opacity-80 transition">All The Details</button>
                        <button className="hover:opacity-80 transition">Blogs</button>
                        <button className="hover:opacity-80 transition">Updates</button>
                    </div>

                    {/* Mobile toggle button */}
                    <button
                        className="md:hidden inline-flex items-center justify-center p-2 text-black"
                        aria-label="Toggle menu"
                        onClick={() => setIsOpen((v) => !v)}
                    >
                        {isOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
                    </button>
                </div>

                {/* Mobile menu */}
                <div className={`${isOpen ? "block" : "hidden"} md:hidden w-full overflow-x-hidden`}>
                    <div className="pt-4 pb-2 px-2">
                        <div className="flex flex-col gap-1 rounded-xl border border-[#E0E0E0] bg-white/70 backdrop-blur p-2">
                            <button className="w-full text-left px-3 py-2 rounded-lg text-black hover:bg-black/5">
                                All The Details
                            </button>
                            <button className="w-full text-left px-3 py-2 rounded-lg text-black hover:bg-black/5">
                                Blogs
                            </button>
                            <button className="w-full text-left px-3 py-2 rounded-lg text-black hover:bg-black/5">
                                Updates
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
