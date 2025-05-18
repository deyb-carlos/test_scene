import React from "react";

const NavigationButtons = ({
  isTextAreaCollapsed,
  sidebarOpen,
  onPrev,
  onNext,
  prevTextAreaState,
}) => {
  return (
    <>
      <button
        onClick={onPrev}
        className={`hidden md:block fixed top-1/2 transform -translate-y-1/2 bg-gray-700 hover:bg-gray-500 text-xl w-8 h-8 md:w-10 md:h-10 rounded-full shadow z-10 transition-all duration-300 ${
          isTextAreaCollapsed
            ? "left-2 md:left-4 opacity-100"
            : sidebarOpen
            ? "left-[calc(30%+190px+20px)] opacity-100"
            : "left-[calc(30%+20px)] opacity-100"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 md:h-5 md:w-5 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={onNext}
        className={`hidden md:block fixed top-1/2 transform -translate-y-1/2 bg-gray-700 hover:bg-gray-500 text-xl w-8 h-8 md:w-10 md:h-10 rounded-full shadow z-10 transition-all duration-300 ${
          sidebarOpen ? "right-2 md:right-4" : "right-2 md:right-4"
        }`}
        style={{
          transition: "opacity 300ms ease",
          animation: `${
            isTextAreaCollapsed !== prevTextAreaState
              ? "fadeIn 300ms ease forwards"
              : ""
          }`,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 md:h-5 md:w-5 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </>
  );
};

export default NavigationButtons;