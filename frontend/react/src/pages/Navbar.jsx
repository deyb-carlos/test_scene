import React from "react";

function Navbar({ toggleMenu, isMenuOpen, handleSignIn, handleGetStarted }) {
  const scrollToId = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    // Close menu on mobile
    if (isMenuOpen) toggleMenu();
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-[#fffff0] z-50 transition-all duration-300 shadow-md">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <img src="/sw-logo.png" alt="Logo" className="h-10 md:h-12" />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <button onClick={() => scrollToId("homepage")} className="text-[#343434] px-3 hover:bg-gray-300 py-2 rounded">
            Home
          </button>
          <button onClick={() => scrollToId("features")} className="text-[#343434] px-3 hover:bg-gray-300 py-2 rounded">
            Features
          </button>
          <button onClick={() => scrollToId("collection")} className="text-[#343434] px-3 hover:bg-gray-300 py-2 rounded">
            Collection
          </button>
          <button onClick={() => scrollToId("contact")} className="text-[#343434] px-3 hover:bg-gray-300 py-2 rounded">
            Contact
          </button>
          <span className="text-[#343434]">|</span>
          <button onClick={handleSignIn} className="text-[#343434] px-3 py-2 font-bold hover:bg-gray-300 rounded">
            Sign in
          </button>
          <button onClick={handleGetStarted} className="bg-[#1f1f1f] text-white px-4 py-2 rounded-full font-bold hover:bg-gray-900">
            Get Started
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-[#343434] focus:outline-none" onClick={toggleMenu}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#fffff0] py-2 px-4">
          <button onClick={() => scrollToId("homepage")} className="block text-[#343434] py-2 hover:bg-gray-300 rounded">
            Home
          </button>
          <button onClick={() => scrollToId("features")} className="block text-[#343434] py-2 hover:bg-gray-300 rounded">
            Features
          </button>
          <button onClick={() => scrollToId("collection")} className="block text-[#343434] py-2 hover:bg-gray-300 rounded">
            Collection
          </button>
          <button onClick={() => scrollToId("contact")} className="block text-[#343434] py-2 hover:bg-gray-300 rounded">
            Contact
          </button>
          <div className="flex space-x-4 mt-2">
            <button onClick={handleSignIn} className="text-[#343434] px-3 py-2 font-bold hover:bg-gray-300 rounded">
              Sign in
            </button>
            <button onClick={handleGetStarted} className="bg-[#1f1f1f] text-white px-4 py-2 rounded-full font-bold hover:bg-gray-900">
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
