import React from "react";
import { FaSearch, FaUser, FaShoppingBag } from "react-icons/fa";

export default function Navbar() {
    return (
        <nav className="bg-white text-black font-serif px-6 py-4 shadow-md">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Left: Logo Image */}
                <div className="flex items-center">
                    <img
                        src="/logo.png"
                        alt="Form Logo"
                        className="h-8 w-auto"
                    />
                </div>

                {/* Center: Links */}
                <div className="space-x-6 text-sm font-medium hidden md:flex">
                    <div className="group relative cursor-pointer">
                        <span>WHAT WE OFFER</span>
                        <span className="ml-1">▾</span>
                    </div>
                    <div className="group relative cursor-pointer">
                        <span>WHO WE SUPPORT</span>
                        <span className="ml-1">▾</span>
                    </div>
                    <div className="group relative cursor-pointer">
                        <span>SOLUTIONS FOR YOUR BRAND</span>
                        <span className="ml-1">▾</span>
                    </div>
                    <span className="cursor-pointer">START FOR FREE</span>
                </div>

                {/* Right: Icons */}
                <div className="flex items-center space-x-6 text-xl">
                    <FaSearch className="cursor-pointer" />
                    <FaUser className="cursor-pointer" />
                    <div className="relative cursor-pointer">
                        <FaShoppingBag />

                    </div>
                </div>
            </div>
        </nav>
    );
}
