'use client';

import React from 'react';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="border-b border-gray-500 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="text-2xl font-bold text-white"
          >
            Near Intents<span className="text-3xl font-bold text-[#FF7A4D]">*</span>
          </Link>
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link
              href="/explore"
              className="text-white hover:text-zinc-400 transition"
            >
              Explore
            </Link>
          </div>
          <div className="flex items-center w-8" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
