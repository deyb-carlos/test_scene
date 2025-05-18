import React from "react";

const ImageGrid = ({
  isTextAreaCollapsed,
  sidebarOpen,
  loading,
  error,
  storyboardImages,
  currentIndex,
  onImageClick,
  onExpandPanel,
}) => {
  // Determine the number of images to show based on screen size
  const imagesToShow =
    window.innerWidth < 640
      ? storyboardImages
      : storyboardImages.slice(currentIndex, currentIndex + 6);

  return (
    <div
      className={`overflow-y-auto p-4 md:p-8 relative bg-[radial-gradient(circle_at_center,#e5e7eb_1px,transparent_1px)] bg-[length:20px_20px] ${
        isTextAreaCollapsed ? "w-full md:w-[90%] mx-auto" : "w-full md:w-[70%]"
      } scrollbar-hide`}
    >
      {isTextAreaCollapsed && (
        <button
          onClick={onExpandPanel}
          className={` fixed top-16 mt-5 z-[1001] transition-all duration-300 ${
            sidebarOpen
              ? "left-[270px] md:left-[270px] hidden md:flex "
              : "left-5"
          } flex items-center justify-center h-10 w-10 bg-gray-100 rounded-md shadow-sm border-2 border-black hover:bg-gray-300`}
          title="Expand panel"
        >
          <img
            src="https://sceneweaver.s3.ap-southeast-2.amazonaws.com/assets/comment.png"
            alt="Expand panel"
            className="h-6 w-6 object-contain "
          />
        </button>
      )}

      {loading ? (
        <div className="text-center">Loading images...</div>
      ) : storyboardImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-center max-w-md">
            <h2 className="text-xl md:text-2xl font-bold text-gray-700 mb-4">
              No Storyboard Images Yet
            </h2>
            <p className="text-gray-500 mb-6">
              Enter your story in the left panel and click "Generate" to create
              your first storyboard images.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 relative z-0">
          {imagesToShow.map((image, i) => (
            <div key={i} className="flex flex-col">
              <div
                className="aspect-square overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onImageClick(image)}
              >
                <img
                  src={image.image_path}
                  alt={`Storyboard image ${i + 1}`}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="mt-2 p-2 text-gray-800 font-semibold text-sm bg-white rounded-lg border border-gray-100 min-h-[60px] max-h-[100px] overflow-y-auto">
                <p className="text-xs mb-1">
                  Caption{" "}
                  {window.innerWidth < 640 ? i + 1 : currentIndex + i + 1}:
                </p>
                <p className="font-normal text-sm break-words whitespace-normal overflow-hidden">
                  {image.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGrid;
