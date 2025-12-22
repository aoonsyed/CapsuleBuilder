import React, { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const DropdownArrow = () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className="inline ml-1"
        >
            <path
                d="M9.75 4.5L6 8.25L2.25 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );

    return (
        <nav className="bg-[#E8E8E8] font-aboreto sticky text-black leading-[24px] px-4 md:px-6 py-4 md:py-6 text-[14px]">
            <div className="max-w-7xl mx-auto h-auto md:h-[100px]">
                {/* Top Row */}
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center">
                        <img
                            src="/assets/11.png"
                            alt="Form Department Logo"
                            className="px-4 md:px-14 h-16 md:h-[50px] w-auto rounded-2xl transform translate-x-0 md:-translate-x-[70px]"
                        />
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex flex-col items-start gap-y-1 md:mr-12 md:-translate-x-[40px]">
                        <div className="flex gap-8 font-normal capitalize">
                            {[
                                "WHAT WE OFFER",
                                "WHO WE SUPPORT",
                                "SOLUTIONS FOR YOUR BRAND",
                                "START FOR FREE",
                                "FD NEWS",
                            ].map((text, idx) => (
                                <button
                                    key={idx}
                                    className="group relative transition hover:text-black"
                                >
                                    {text}{" "}
                                    {idx < 3 && <DropdownArrow />}
                                    <span className="absolute left-0 -bottom-[2px] h-[1px] w-0 bg-black transition-all duration-300 group-hover:w-full"></span>
                                </button>
                            ))}
                        </div>
                        <div>
                            <button className="group relative transition hover:text-black">
                                CONTACT
                                <span className="absolute left-0 -bottom-[2px] h-[1px] w-0 bg-black transition-all duration-300 group-hover:w-full"></span>
                            </button>
                        </div>
                    </div>

                    {/* Right-side icons */}
                    <div className="hidden md:flex items-center gap-5 mr-4">
                        {/* Search Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 cursor-pointer" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M10.875 18.75C15.2242 18.75 18.75 15.2242 18.75 10.875C18.75 6.52576 15.2242 3 10.875 3C6.52576 3 3 6.52576 3 10.875C3 15.2242 6.52576 18.75 10.875 18.75Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M16.4434 16.4453L20.9997 21.0016"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>

                        {/* User Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 cursor-pointer" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M12 15C15.3137 15 18 12.3137 18 9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9C6 12.3137 8.68629 15 12 15Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M2.90625 20.2508C3.82775 18.6544 5.15328 17.3287 6.74958 16.407C8.34588 15.4853 10.1567 15 12 15C13.8433 15 15.6541 15.4853 17.2504 16.407C18.8467 17.3287 20.1722 18.6544 21.0938 20.2508"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>

                        {/* Bag Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 cursor-pointer" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M19.575 6.75H4.425C4.24045 6.5087 4.06254 6.81891 3.92451 6.94141C3.78648 7.06391 3.69778 7.23249 3.675 7.41562L2.34375 19.4156C2.33191 19.5202 2.34221 19.6261 2.37396 19.7264C2.40572 19.8267 2.45823 19.9192 2.52808 19.9979C2.59794 20.0766 2.68357 20.1397 2.77941 20.1831C2.87525 20.2266 2.97916 20.2494 3.08438 20.2494H20.9156C21.0209 20.2494 21.1248 20.2266 21.2206 20.1831C21.3164 20.1397 21.4021 20.0766 21.4719 19.9979C21.5418 19.9192 21.5943 19.8267 21.6261 19.7264C21.6579 19.6261 21.6682 19.5202 21.6563 19.4156L20.325 7.41562C20.3022 7.23249 20.2135 7.06391 20.0755 6.94141C19.9375 6.81891 19.7596 6.7507 19.575 6.75Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M8.25 6.75C8.25 5.75544 8.64591 4.80161 9.34835 4.09835C10.0516 3.39509 11.0054 3 12 3C12.9946 3 13.9484 3.39509 14.6517 4.09835C15.3541 4.80161 15.75 5.75544 15.75 6.75"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden inline-flex items-center justify-center p-2 text-black"
                        aria-label="Toggle menu"
                        onClick={() => setIsOpen((v) => !v)}
                    >
                        {isOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <div className={`${isOpen ? "block" : "hidden"} md:hidden w-full`}>
                    <div className="pt-4 pb-2 px-2">
                        <div className="flex flex-col gap-1 text-sm rounded-xl border border-[#E0E0E0] bg-white/70 backdrop-blur p-2">
                            {[
                                "WHAT WE OFFER",
                                "WHO WE SUPPORT",
                                "SOLUTIONS FOR YOUR BRAND",
                                "START FOR FREE",
                                "FD NEWS",
                                "CONTACT",
                            ].map((text, idx) => (
                                <button
                                    key={idx}
                                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-black/5"
                                >
                                    {text} {idx < 3 && <DropdownArrow />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
