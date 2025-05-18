import React from "react";

const TextInputPanel = ({
  isCollapsed,
  onToggle,
  userInput,
  setUserInput,
  resolution,
  setResolution,
  isGenerating,
  onSubmit,
  isStory,
  setIsStory,
}) => {
  return (
    <div
      className={`fixed md:relative bottom-0 left-0 right-0 md:left-auto md:right-auto ${
        isCollapsed
          ? "translate-y-full md:translate-y-0 md:w-0 md:opacity-0 md:overflow-hidden"
          : "translate-y-0 w-full md:w-[30%]"
      } border-t md:border-r border-gray-200 p-4 flex flex-col transition-all duration-300 ease-in-out bg-white md:bg-transparent z-10 shadow-lg md:shadow-none`}
    >
      {/* Desktop collapse button (hidden on mobile) */}
      <button
        onClick={onToggle}
        className="hidden md:block self-end mb-2 p-1 text-gray-500 hover:text-gray-700 transition-transform hover:scale-110 duration-200"
        title="Collapse panel"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="black"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <form onSubmit={onSubmit} className="flex flex-col h-full">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter your story to generate storyboard..."
          rows={6}
          className={`flex-grow resize-none p-3 bg-white border-2 border-black rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-800 md:rows-10 transition-opacity duration-300 ${
            isCollapsed ? "opacity-0" : "opacity-100"
          }`}
        />

        <div className="mt-4 mb-2 md:mb-7 flex flex-col md:flex-row items-center gap-4">
          {/* Mobile layout - single row */}
          <div className="w-full flex items-center gap-4 md:hidden">
            {/* Mobile toggle button (leftmost) */}
            <button
              onClick={onToggle}
              className="p-2 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105"
              title="Collapse panel"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Mobile aspect ratio buttons (middle) */}
            <div className="flex gap-3">
              <ResolutionOption
                value="1:1"
                currentValue={resolution}
                onChange={setResolution}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-5 h-5"
                  >
                    <rect x="5" y="5" width="15" height="15" />
                  </svg>
                }
              />
              <ResolutionOption
                value="16:9"
                currentValue={resolution}
                onChange={setResolution}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-5 h-3.5"
                  >
                    <rect x="0" y="4" width="25" height="16" />
                  </svg>
                }
              />
              <ResolutionOption
                value="9:16"
                currentValue={resolution}
                onChange={setResolution}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-3.5 h-5"
                  >
                    <rect x="4" y="0" width="16" height="25" />
                  </svg>
                }
              />
            </div>

            {/* Generate button (right) */}
            <button
              type="submit"
              disabled={isGenerating}
              className={`flex-grow px-4 py-2 rounded-lg transition-transform duration-200 ${
                isGenerating
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-500 hover:text-gray-700 hover:scale-[1.02] cursor-pointer"
              }`}
            >
              {isGenerating ? "Generating..." : "Generate"}
            </button>
          </div>

          {/* Desktop layout */}
          <div className="hidden md:flex w-full justify-between items-center">
            <div className="flex gap-3 items-center">
              <ResolutionOption
                value="1:1"
                currentValue={resolution}
                onChange={setResolution}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-5 h-5"
                  >
                    <rect x="5" y="5" width="15" height="15" />
                  </svg>
                }
              />
              <ResolutionOption
                value="16:9"
                currentValue={resolution}
                onChange={setResolution}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-5 h-3.5"
                  >
                    <rect x="0" y="4" width="25" height="16" />
                  </svg>
                }
              />
              <ResolutionOption
                value="9:16"
                currentValue={resolution}
                onChange={setResolution}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-3.5 h-5"
                  >
                    <rect x="4" y="0" width="16" height="25" />
                  </svg>
                }
              />
              
              {/* Story/Script toggle buttons */}
              <div className="flex ml-4 border border-gray-300 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsStory(true)}
                  className={`px-3 py-1 text-sm transition-colors ${
                    isStory 
                      ? "bg-black text-white" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Story
                </button>
                <button
                  type="button"
                  onClick={() => setIsStory(false)}
                  className={`px-3 py-1 text-sm transition-colors ${
                    !isStory 
                      ? "bg-black text-white" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Script
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className={`px-4 py-2 rounded-lg text-white transition-transform duration-200 ${
                isGenerating
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-500 hover:text-gray-700 hover:scale-[1.02] cursor-pointer"
              }`}
            >
              {isGenerating ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

const ResolutionOption = ({ value, currentValue, onChange, icon }) => {
  return (
    <label className="relative group">
      <input
        type="radio"
        name="resolution"
        value={value}
        checked={currentValue === value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute opacity-0 w-0 h-0"
      />
      <div
        className={`w-8 h-8 md:w-10 md:h-10 rounded-lg cursor-pointer flex items-center justify-center transition-all duration-300 ${
          currentValue === value
            ? "bg-gray-300 scale-105 border-2 border-black"
            : "bg-gray-100 hover:bg-gray-200 hover:scale-105"
        }`}
      >
        {React.cloneElement(icon, {
          className: `${icon.props.className} ${
            currentValue === value ? "text-black" : "text-gray-600"
          }`,
        })}
        <span className="absolute -bottom-8 scale-0 rounded bg-gray-800 p-1 text-xs text-white group-hover:scale-100 transition-transform duration-200">
          {value}
        </span>
      </div>
    </label>
  );
};

export default TextInputPanel;