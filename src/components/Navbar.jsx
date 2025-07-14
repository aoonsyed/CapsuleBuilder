import React from "react";
import { FaSearch, FaUser, FaShoppingBag } from "react-icons/fa";

export default function Navbar() {
    return (
        <nav className="bg-[#F9F5F0] text-black font-serif px-6 py-4 shadow-md">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Left: Logo Image */}
                <div className="flex items-center">
                   {/*  <img
                        src="/logo.png"
                        alt="Form Logo"
                        className="h-8 w-auto"
                    />
                    */}
                     <h1 className="text-[#333333] text-[20pt] font-serif leading-tight">
                        Form Department
          </h1>
                </div>

                {/* Center: Links */}
                <div className="space-x-10 text-lg font-inter md:flex mr-8">
                    <div className="group relative cursor-pointer">
                        <span>All the details</span>
                    </div>
                    <div className="group relative cursor-pointer">
                        <span>Blogs</span>
                    </div>
                    <div className="group relative cursor-pointer">
                        <span>Updates</span>
                      {/* <span className="ml-1">▾</span>*/}
                    </div>
                </div>

                {/* Right: Icons */}
               {/*  <div className="flex items-center space-x-6 text-xl">
                    <FaSearch className="cursor-pointer" />
                    <FaUser className="cursor-pointer" />
                    <div className="relative cursor-pointer">
                        <FaShoppingBag />

                    </div>
                </div>
                */}
            </div>
        </nav>
    );
}
