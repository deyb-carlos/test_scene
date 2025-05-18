import React from "react";

function Homepage({ handleGetStarted }) {
  return (
    <section
      id="homepage"
      className="relative min-h-screen text-white flex flex-col items-center justify-center bg-[#343434] pt-16 md:pt-0 overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://sceneweaver.s3.ap-southeast-2.amazonaws.com/assets/cc3112fdb4fb4e342d2791ac23c75012.png"
          alt="Background"
          className="w-full h-full object-cover opacity-20"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-7xl">
        <h1 className="text-white text-shadow text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[9rem] 2xl:text-[11rem] mb-6 font-mont leading-tight">
          Create endless <br /> storyboards
        </h1>
        <p className="mb-6 text-lg sm:text-2xl md:text-4xl lg:text-5xl">
          Visualize your stories, start simple.
        </p>
        <button
          onClick={handleGetStarted}
          className="bg-[#1f1f1f] text-white px-6 py-2 md:px-8 md:py-3 rounded-full font-bold hover:bg-gray-900"
        >
          Get Started
        </button>
      </div>
    </section>
  );
}

export default Homepage;
