import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { imagesAPI } from "../api";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import TextInputPanel from "../components/TextInputPanel";
import ImageGrid from "../components/ImageGrid";
import ImageModal from "../components/ImageModal";
import NavigationButtons from "../components/NavigationButtons";

const Storyboard = () => {
  const navigate = useNavigate();
  const { id, name } = useParams();
  const [userInput, setUserInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resolution, setResolution] = useState("1:1");
  const [storyboardImages, setStoryboardImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isTextAreaCollapsed, setIsTextAreaCollapsed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionEditText, setCaptionEditText] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [feedbackSelection, setFeedbackSelection] = useState(null);
  const [isStory, setIsStory] = useState(true);
  const [generationStatus, setGenerationStatus] = useState({
    isGenerating: false,
    current: 0,
    total: 0,
    progress: 0,
  });
  const [showGenerationIndicator, setShowGenerationIndicator] = useState(false);

  // Queue system
  const [generationQueue, setGenerationQueue] = useState([]);
  const [currentGeneration, setCurrentGeneration] = useState(null);

  const initialImageCountRef = useRef(0);
  const pollingIntervalRef = useRef(null);

  const toggleTextArea = () => {
    setIsTextAreaCollapsed(!isTextAreaCollapsed);
  };

  const sortImagesById = (images) => {
    return [...images].sort((a, b) => a.id - b.id);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, storyboardImages.length]);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await imagesAPI.getImages(id);
        if (response.data && Array.isArray(response.data)) {
          const sortedImages = sortImagesById(response.data);
          setStoryboardImages(sortedImages);
          initialImageCountRef.current = sortedImages.length;
        } else {
          setError("No images found.");
        }
      } catch (err) {
        setError("Failed to fetch images");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchImages();
  }, [id]);

  // Queue processing effect
  useEffect(() => {
    const processQueue = async () => {
      // If currently processing or queue is empty, do nothing
      if (currentGeneration || generationQueue.length === 0) return;

      // Get the next item from the queue
      const nextItem = generationQueue[0];

      // Immediately update the queue state
      setGenerationQueue((prev) => prev.slice(1));
      setCurrentGeneration(nextItem);
      setIsGenerating(true); // Ensure this is set before any async operations

      try {
        initialImageCountRef.current = storyboardImages.length;

        setGenerationStatus({
          isGenerating: true,
          current: 0,
          total: 0, // Will be updated from backend response
          progress: 0,
        });
        setShowGenerationIndicator(true);

        const formData = new FormData();
        formData.append("story", nextItem.input);
        formData.append("resolution", nextItem.resolution);
        formData.append("isStory", nextItem.isStory);

        const response = await imagesAPI.generateImages(id, formData);

        // Update total from backend response
        if (response.data?.count) {
          setGenerationStatus((prev) => ({
            ...prev,
            total: response.data.count,
          }));
        }
      } catch (error) {
        console.error("Error generating images:", error);
        completeGeneration(true);
      }
    };

    processQueue();
  }, [generationQueue, currentGeneration, id, storyboardImages.length]);

  useEffect(() => {
    const pollForImages = async () => {
      try {
        const response = await imagesAPI.getImages(id);
        if (response.data && Array.isArray(response.data)) {
          const newImages = sortImagesById(response.data);
          const currentTotalImages = newImages.length;
          const newImagesCount =
            currentTotalImages - initialImageCountRef.current;

          if (newImagesCount > 0) {
            setGenerationStatus((prev) => {
              // If total isn't set yet (0), use the new count as total
              const effectiveTotal =
                prev.total > 0 ? prev.total : newImagesCount;
              const newProgress = Math.min(
                Math.round((newImagesCount / effectiveTotal) * 100),
                100
              );

              return {
                ...prev,
                current: newImagesCount,
                total: effectiveTotal,
                progress: newProgress,
              };
            });

            setStoryboardImages(newImages);
          }

          // Check if generation is complete
          if (
            generationStatus.total > 0 &&
            newImagesCount >= generationStatus.total
          ) {
            if (newImagesCount >= generationStatus.total) {
              completeGeneration(generationQueue.length === 0);
            }
          }
        }
      } catch (err) {
        console.error("Error polling for images:", err);
      }
    };

    if (generationStatus.isGenerating) {
      // Clear any existing interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      // Start new polling interval
      pollingIntervalRef.current = setInterval(pollForImages, 3000);
      // Immediate first poll
      pollForImages();
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [generationStatus.isGenerating, id, generationStatus.total]);

  const completeGeneration = (force = false) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    setCurrentGeneration(null);

    setGenerationQueue((currentQueue) => {
      if (currentQueue.length === 0 || force) {
        setIsGenerating(false);
        setShowGenerationIndicator(false);
        setGenerationStatus({
          isGenerating: false,
          current: 0,
          total: 0,
          progress: 0,
        });
      }
      return currentQueue;
    });

    initialImageCountRef.current = storyboardImages.length;
  };

  const handleGenerateImages = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    // Create generation item
    const generationItem = {
      input: userInput,
      resolution: resolution,
      isStory: isStory,
    };

    // If already generating, add to queue
    if (isGenerating) {
      setGenerationQueue([...generationQueue, generationItem]);
    } else {
      // Start generating immediately
      setIsGenerating(true);
      setGenerationQueue([generationItem]);
    }
  };

  const handleRegenerateImage = async (
    imageId,
    caption,
    seed,
    resolution,
    isOpenPose,
    pose_img
  ) => {
    try {
      await imagesAPI.regenerateImage(
        imageId,
        caption,
        seed,
        resolution,
        isOpenPose,
        pose_img
      );
      const response = await imagesAPI.getImages(id);
      if (response.data) {
        setStoryboardImages(sortImagesById(response.data));
        const regeneratedImage = response.data.find(
          (img) => img.id === imageId
        );
        if (regeneratedImage) {
          setSelectedImage(regeneratedImage);
        }
      }
      return true;
    } catch (error) {
      console.error("Error regenerating image:", error);
      throw new Error(
        error.response?.data?.detail || "Failed to regenerate image"
      );
    }
  };

  const handleUpdateCaption = async (imageId, newCaption) => {
    try {
      await imagesAPI.updateImageCaption(imageId, newCaption);
      const response = await imagesAPI.getImages(id);
      if (response.data && Array.isArray(response.data)) {
        setStoryboardImages(sortImagesById(response.data));
        const updatedImage = response.data.find((img) => img.id === imageId);
        if (updatedImage) {
          setSelectedImage(updatedImage);
        }
      }
      return true;
    } catch (error) {
      console.error("Error updating caption:", error);
      throw new Error(
        error.response?.data?.detail || "Failed to update caption"
      );
    }
  };

  const handleNext = (e) => {
    if (e) e.preventDefault();
    if (currentIndex + 6 < storyboardImages.length) {
      setCurrentIndex(currentIndex + 6);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = (e) => {
    if (e) e.preventDefault();
    if (currentIndex === 0) {
      setCurrentIndex(
        storyboardImages.length - (storyboardImages.length % 6 || 6)
      );
    } else {
      setCurrentIndex(currentIndex - 6);
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-white font-sans relative">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      <Header
        isSidebarOpen={sidebarOpen}
        storyboardName={name}
        onNavigateHome={() => navigate("/home")}
        onToggleSidebar={toggleSidebar}
      />

      <div
        className={`flex h-screen pt-16 transition-all duration-300 ${
          sidebarOpen ? "pl-[250px]" : "pl-0"
        }`}
      >
        <TextInputPanel
          isCollapsed={isTextAreaCollapsed}
          onToggle={toggleTextArea}
          userInput={userInput}
          setUserInput={setUserInput}
          generationQueue={generationQueue}
          resolution={resolution}
          setResolution={setResolution}
          isGenerating={isGenerating}
          onSubmit={handleGenerateImages}
          isStory={isStory}
          setIsStory={setIsStory}
        />

        <ImageGrid
          isTextAreaCollapsed={isTextAreaCollapsed}
          sidebarOpen={sidebarOpen}
          loading={loading}
          error={error}
          storyboardImages={storyboardImages}
          currentIndex={currentIndex}
          onImageClick={setSelectedImage}
          onExpandPanel={() => setIsTextAreaCollapsed(false)}
        />

        {selectedImage && (
          <ImageModal
            image={selectedImage}
            onClose={() => setSelectedImage(null)}
            onDelete={async () => {
              try {
                setIsDeleting(true);
                await imagesAPI.deleteImage(selectedImage.id);

                setStoryboardImages((prev) =>
                  prev.filter((img) => img.id !== selectedImage.id)
                );

                setSelectedImage(null);
              } catch (error) {
                console.error("Error deleting image:", error);
                alert("Failed to delete image");
              } finally {
                setIsDeleting(false);
              }
            }}
            feedbackSelection={feedbackSelection}
            setFeedbackSelection={setFeedbackSelection}
            isRegenerating={isRegenerating}
            setIsRegenerating={setIsRegenerating}
            onRegenerateImage={handleRegenerateImage}
            isDeleting={isDeleting}
            onCaptionUpdate={handleUpdateCaption}
            isEditingCaption={isEditingCaption}
            captionEditText={captionEditText}
            onCaptionEditChange={setCaptionEditText}
            onSaveCaption={async () => {
              try {
                await imagesAPI.updateImageCaption(
                  selectedImage.id,
                  captionEditText
                );
                setStoryboardImages((prev) =>
                  sortImagesById(
                    prev.map((img) =>
                      img.id === selectedImage.id
                        ? { ...img, caption: captionEditText }
                        : img
                    )
                  )
                );

                setIsEditingCaption(false);
              } catch (error) {
                console.error("Error updating caption:", error);
                alert("Failed to update caption");
              }
            }}
            onCancelEdit={() => setIsEditingCaption(false)}
            onStartEdit={() => {
              setCaptionEditText(selectedImage.caption);
              setIsEditingCaption(true);
            }}
          />
        )}
      </div>

      {storyboardImages.length > 6 && (
        <NavigationButtons
          isTextAreaCollapsed={isTextAreaCollapsed}
          sidebarOpen={sidebarOpen}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
      {showGenerationIndicator && (
        <div
          className={`fixed ${
            window.innerWidth < 768
              ? "top-20 right-2 w-64 p-2"
              : "bottom-4 right-4 w-80 p-4"
          } bg-white rounded-lg shadow-xl border-2 border-black z-50`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <h3
                className={`font-medium text-gray-800 ${
                  window.innerWidth < 768 ? "text-sm" : ""
                }`}
              >
                {generationStatus.total > 0
                  ? `Generating ${generationStatus.current}/${generationStatus.total}`
                  : "Preparing..."}
              </h3>
              {generationStatus.total > 0 && (
                <svg
                  className={`animate-spin ml-2 ${
                    window.innerWidth < 768 ? "h-3 w-3" : "h-4 w-4"
                  } text-black`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
            </div>
            {generationStatus.total > 0 && (
              <div className="flex items-center">
                <span
                  className={`${
                    window.innerWidth < 768 ? "text-xs" : "text-sm"
                  } text-gray-500 mr-1`}
                >
                  {generationStatus.progress}%
                </span>
                {generationQueue.length > 0 && (
                  <span className="text-xs text-gray-700 bg-gray-300 px-1.5 py-0.5 rounded">
                    {generationQueue.length} in queue
                  </span>
                )}
              </div>
            )}
          </div>

          {generationStatus.total > 0 ? (
            <div
              className={`w-full bg-gray-200 rounded-full ${
                window.innerWidth < 768 ? "h-1.5" : "h-2.5"
              }`}
            >
              <div
                className="bg-black rounded-full transition-all duration-300"
                style={{
                  width: `${generationStatus.progress}%`,
                  height: window.innerWidth < 768 ? "0.375rem" : "0.625rem",
                }}
              ></div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-1">
              <svg
                className={`animate-spin ${
                  window.innerWidth < 768
                    ? "-ml-0.5 mr-1 h-3 w-3"
                    : "-ml-1 mr-2 h-5 w-5"
                } text-black`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span
                className={`${
                  window.innerWidth < 768 ? "text-xs" : "text-sm"
                } text-gray-600`}
              >
                Initializing...
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Storyboard;
