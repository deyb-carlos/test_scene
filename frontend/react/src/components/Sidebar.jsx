import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { storyboardAPI } from "../api";

const Sidebar = ({ isOpen, onToggle }) => {
  const [storyboards, setStoryboards] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStoryboards = async () => {
      try {
        setLoading(true);
        const response = await storyboardAPI.getAll();
        setStoryboards(response.data || []);
      } catch (error) {
        console.error("Failed to fetch storyboards:", error);
        setStoryboards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStoryboards();
  }, []);

  const handleStoryboardClick = (id, name) => {
    navigate(`/storyboard/${id}/${encodeURIComponent(name)}`);
    onToggle();
  };

  return (
    <>
      {/* Blurred overlay - now properly positioned behind sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-[1000] md:hidden">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={onToggle}
          />
        </div>
      )}
      
      {/* Sidebar content */}
      <div
        className={`w-[250px] h-full bg-neutral-900 transition-all duration-300 z-[1001] ${
          isOpen ? "fixed left-0" : "fixed -left-[250px] md:-left-[250px]"
        }`}
      >
        <div className="flex justify-center items-center py-6 px-4">
          <img src="/sw-logo.png" alt="SceneWeaver Logo" className="h-16 w-auto" />
        </div>

        <div className="px-6 pt-2 text-gray-300">
          <h2 className="text-lg font-semibold">Storyboards</h2>
        </div>

        <nav className="flex flex-col gap-2 p-4 text-white max-h-[calc(100vh-180px)] overflow-y-auto">
          {loading ? (
            <div className="p-2 text-center text-gray-400">Loading...</div>
          ) : storyboards.length === 0 ? (
            <div className="p-2 text-center text-gray-400">No storyboards found</div>
          ) : (
            storyboards.map((storyboard) => (
              <div
                key={storyboard.id}
                className="p-2 hover:bg-gray-700 rounded cursor-pointer truncate transition-colors duration-200"
                onClick={() => handleStoryboardClick(storyboard.id, storyboard.name)}
                title={storyboard.name}
              >
                {storyboard.name}
              </div>
            ))
          )}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;