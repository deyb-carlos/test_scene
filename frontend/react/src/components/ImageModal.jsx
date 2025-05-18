import { useState, useEffect } from "react";

const ImageModal = ({
  image: initialImage,
  onClose,
  onDelete,
  isDeleting,
  onCaptionUpdate,
  onRegenerateImage,
  isRegenerating,
  setIsRegenerating,
  feedbackSelection,
  setFeedbackSelection,
}) => {
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionEditText, setCaptionEditText] = useState(initialImage.caption);
  const [isSaving, setIsSaving] = useState(false);
  const [seed, setSeed] = useState("");
  const [regenerationPrompt, setRegenerationPrompt] = useState(
    initialImage.caption
  );

  const [isOpenPose, setIsOpenPose] = useState(false);
  const [regenerationError, setRegenerationError] = useState(null);
  const [currentImage, setCurrentImage] = useState(initialImage);
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [resolution, setResolution] = useState("1:1");
  const [openPoseFile, setOpenPoseFile] = useState(null);
  const [openPosePreview, setOpenPosePreview] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    setCurrentImage(initialImage);
    setCaptionEditText(initialImage.caption);
    setRegenerationPrompt(initialImage.caption);
  }, [initialImage]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match("image.*")) {
        setRegenerationError("Please upload an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setRegenerationError("File size must be less than 5MB");
        return;
      }

      setOpenPoseFile(file);
      setRegenerationError(null);

      const reader = new FileReader();
      reader.onload = (event) => {
        setOpenPosePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      setRegenerationError(null);

      const seedValue = seed.trim() === "" ? null : seed;

      if (!regenerationPrompt.trim()) {
        throw new Error("Prompt cannot be empty");
      }

      const regeneratedImage = await onRegenerateImage(
        currentImage.id,
        regenerationPrompt.trim(),
        seedValue,
        resolution,
        isOpenPose,
        openPoseFile
      );

      setCurrentImage(regeneratedImage);
    } catch (error) {
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          setRegenerationError(
            error.response.data.detail.map((d) => d.msg).join(", ")
          );
        } else {
          setRegenerationError(error.response.data.detail);
        }
      } else {
        setRegenerationError(error.message || "Failed to regenerate image");
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSeedChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setSeed(value);
    }
  };

  const ResolutionOption = ({
    value,
    currentValue,
    onChange,
    icon,
    disabled,
  }) => {
    return (
      <button
        type="button"
        onClick={() => !disabled && onChange(value)}
        className={`p-2 border rounded relative group ${
          currentValue === value
            ? "bg-gray-700 border-white"
            : "border-gray-500"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-label={value}
        disabled={disabled}
      >
        {icon}
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {value}
        </span>
      </button>
    );
  };

  const handleFeedbackSelection = (selection) => {
    if (feedbackSelection === selection) {
      setFeedbackSelection(null);
    } else {
      setFeedbackSelection(selection);
    }
  };

  const showRegenerationPanel = feedbackSelection === "thumbsDown";

  const determineAspectRatio = (width, height) => {
    if (width === height) return "1:1";
    if (width > height && width / height === 16 / 9) return "16:9";
    if (width < height && height / width === 16 / 9) return "9:16";
    return "1:1";
  };
  const handleDownload = (imageUrl) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = imageUrl.split("/").pop() || "download.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  useEffect(() => {
    if (currentImage?.image_path) {
      const img = new Image();
      img.onload = () => {
        const ratio = determineAspectRatio(img.width, img.height);
        setAspectRatio(ratio);
      };
      img.src = currentImage.image_path;
    }
  }, [currentImage]);

  return (
    <div className="fixed inset-0 overflow-x-hidden bg-black bg-opacity-75 z-[2000] flex items-center justify-center p-4 overflow-y-auto">
      {/* Close and Delete Buttons */}
      <div className="absolute top-0 left-0 z-10 flex gap-2 p-2">
        <button className="text-gray-500 hover:text-gray-300" onClick={onClose}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`${isMobile ? "h-6 w-6" : "h-8 w-8"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <button
          className="text-gray-500 hover:text-red-400"
          onClick={onDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`${isMobile ? "h-6 w-6" : "h-8 w-8"} animate-spin`}
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
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`${isMobile ? "h-6 w-6" : "h-8 w-8"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          )}
        </button>
        <button
          className="text-gray-500 hover:text-blue-400"
          onClick={() => handleDownload(currentImage.image_path)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`${isMobile ? "h-6 w-6" : "h-8 w-8"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </button>
      </div>

      <div
        className={`relative w-full mx-auto ${
          isMobile ? "max-w-full" : "max-w-8xl"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`${
            isMobile
              ? "flex flex-col"
              : "flex justify-center items-center gap-6"
          }`}
        >
          {/* Image Container */}
          <div
            className={`relative bg-white rounded-lg overflow-hidden shadow-xl transition-all duration-500 ease-in-out ${
              !isMobile && showRegenerationPanel
                ? `transform ${
                    aspectRatio === "16:9"
                      ? "-translate-x-96"
                      : aspectRatio === "9:16"
                      ? "-translate-x-68"
                      : "-translate-x-85"
                  }`
                : "transform translate-x-0"
            } ${isMobile ? "w-full" : ""}`}
          >
            <img
              src={currentImage.image_path || "/placeholder.svg"}
              alt="Enlarged storyboard image"
              className={`w-full h-auto ${
                isMobile ? "max-h-[50vh]" : "max-h-[70vh]"
              } object-contain`}
            />

            {/* Caption Section */}
            <div className="p-4 bg-white relative">
              <p className="font-semibold text-gray-500 mb-2">Caption:</p>
              {isEditingCaption ? (
                <>
                  <textarea
                    className="w-full p-2 border rounded mb-2 text-black resize-none"
                    value={captionEditText}
                    onChange={(e) => setCaptionEditText(e.target.value)}
                    rows={3}
                    style={{ height: "80px" }}
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      className="px-3 py-1 bg-gray-300 text-black rounded hover:bg-gray-400"
                      onClick={() => setIsEditingCaption(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-3 py-1 bg-black text-white rounded hover:bg-gray-800 flex items-center justify-center"
                      onClick={async () => {
                        try {
                          setIsSaving(true);
                          await onCaptionUpdate(
                            currentImage.id,
                            captionEditText
                          );
                          setCurrentImage((prev) => ({
                            ...prev,
                            caption: captionEditText,
                          }));
                          setIsEditingCaption(false);
                        } catch (error) {
                          console.error("Failed to update caption:", error);
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <svg
                          className="h-4 w-4 animate-spin mr-2"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                          />
                        </svg>
                      ) : null}
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-gray-700 break-words whitespace-normal pr-10">
                    {currentImage.caption}
                  </p>
                  <button
                    className="absolute right-4 bottom-4 text-gray-500 hover:text-black"
                    onClick={() => setIsEditingCaption(true)}
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200 bg-black">
              <div className="flex items-center justify-between">
                <p className="text-sm text-white p-1.5">
                  Are you satisfied with this output?
                </p>
                <div className="flex gap-3 p-1.5">
                  <button
                    className={`p-2 rounded-full transition-colors ${
                      feedbackSelection === "thumbsUp"
                        ? "bg-green-100"
                        : "hover:bg-gray-100"
                    }`}
                    aria-label="Thumbs up"
                    onClick={() => handleFeedbackSelection("thumbsUp")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={
                        feedbackSelection === "thumbsUp"
                          ? "currentColor"
                          : "none"
                      }
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-green-600"
                    >
                      <path d="M7 10v12"></path>
                      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                    </svg>
                  </button>
                  <button
                    className={`p-2 rounded-full transition-colors ${
                      feedbackSelection === "thumbsDown"
                        ? "bg-red-100"
                        : "hover:bg-gray-100"
                    }`}
                    aria-label="Thumbs down"
                    onClick={() => handleFeedbackSelection("thumbsDown")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={
                        feedbackSelection === "thumbsDown"
                          ? "currentColor"
                          : "none"
                      }
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-red-600"
                    >
                      <path d="M17 14V2"></path>
                      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Regeneration Panel - Mobile version appears below */}
          {isMobile ? (
            <div
              className={`w-full bg-black border border-gray-500 rounded-lg shadow-xl p-4 mt-4 transition-all duration-300 ease-out ${
                showRegenerationPanel ? "block" : "hidden"
              }`}
            >
              <h3 className="font-semibold text-white mb-3">
                Regenerate Image
              </h3>

              <div className="mb-4">
                <textarea
                  className="w-full p-2 border border-gray-500 rounded text-sm text-white resize-none"
                  value={regenerationPrompt}
                  onChange={(e) => setRegenerationPrompt(e.target.value)}
                  rows={3}
                  style={{ height: "80px" }}
                  placeholder="Enter prompt here..."
                />
              </div>

              <div className="mb-4">
                <div className="flex flex-col gap-4">
                  {/* Seed Input Section */}
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={seed}
                        onChange={handleSeedChange}
                        className="w-full p-2 border rounded text-sm"
                        placeholder="Seed"
                      />
                    </div>
                  </div>

                  {/* Aspect Ratio Section */}
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-2">
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
                              className="w-5 h-5 text-white"
                            >
                              <rect x="5" y="5" width="15" height="15" />
                            </svg>
                          }
                          disabled={isOpenPose}
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
                              className="w-5 h-3.5 text-white"
                            >
                              <rect x="0" y="4" width="25" height="16" />
                            </svg>
                          }
                          disabled={isOpenPose}
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
                              className="w-3.5 h-5 text-white"
                            >
                              <rect x="4" y="0" width="16" height="25" />
                            </svg>
                          }
                          disabled={isOpenPose}
                        />
                      </div>
                    </div>
                  </div>

                  {/* OpenPose Toggle and Upload */}
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setIsOpenPose(!isOpenPose)}
                      className={`px-3 py-2 border rounded text-sm ${
                        isOpenPose
                          ? "bg-gray-700 border-white text-white"
                          : "border-gray-500 text-gray-400"
                      }`}
                    >
                      OpenPose
                    </button>
                    <label
                      className={`relative ${
                        !isOpenPose && "opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={!isOpenPose}
                        onChange={handleFileChange}
                      />
                      <div
                        className={`flex items-center gap-2 px-2 py-1 border w-full rounded ${
                          isOpenPose
                            ? "bg-white text-black hover:bg-gray-200"
                            : "bg-gray-500 text-gray-300 border-gray-500"
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="w-4 h-4"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        {openPoseFile ? (
                          <span className="text-xs truncate">
                            {openPoseFile.name}
                          </span>
                        ) : (
                          <span className="text-xs">Upload OpenPose Image</span>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {isOpenPose && openPosePreview && (
                  <div className="mt-4">
                    <p className="text-sm text-white mb-2">OpenPose Preview:</p>
                    <div className="relative w-full h-48 border border-gray-500 rounded overflow-hidden">
                      <img
                        src={openPosePreview}
                        alt="OpenPose preview"
                        className="w-full h-full object-contain"
                      />
                      <button
                        className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75"
                        onClick={() => {
                          setOpenPoseFile(null);
                          setOpenPosePreview(null);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {regenerationError && (
                <p className="text-red-500 text-xs mb-2">{regenerationError}</p>
              )}

              <div className="flex justify-end">
                <button
                  className="px-3 py-2 bg-white text-black rounded hover:bg-gray-800 disabled:bg-gray-400"
                  onClick={handleRegenerate}
                  disabled={isRegenerating || (isOpenPose && !openPoseFile)}
                >
                  {isRegenerating ? "Regenerating..." : "Regenerate"}
                </button>
              </div>
            </div>
          ) : (
            /* Desktop version of regeneration panel */
            <div
              className={`w-150 mr-20 bg-black border border-gray-500 rounded-lg shadow-xl p-4 h-fit flex flex-col justify-center absolute right-0 transition-all duration-300 ease-out ${
                showRegenerationPanel
                  ? "opacity-100 translate-x-0 z-10"
                  : "opacity-0 translate-x-full -z-10"
              }`}
              style={{
                transform: showRegenerationPanel
                  ? "translateX(0)"
                  : "translateX(100%)",
                transitionProperty: "transform, opacity",
              }}
            >
              <h3 className="font-semibold text-white mb-3">
                Regenerate Image
              </h3>

              <div className="mb-4">
                <textarea
                  className="w-full p-2 border border-gray-500 rounded text-sm text-white resize-none"
                  value={regenerationPrompt}
                  onChange={(e) => setRegenerationPrompt(e.target.value)}
                  rows={3}
                  style={{ height: "80px" }}
                  placeholder="Enter prompt here..."
                />
              </div>

              <div className="mb-4">
                <div className="flex items-start gap-4">
                  {/* Seed Input Section */}
                  <div className="">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={seed}
                        onChange={handleSeedChange}
                        className="w-20 p-2 border rounded text-sm"
                        placeholder="Seed"
                      />
                    </div>
                  </div>

                  {/* Aspect Ratio Section */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-2">
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
                              className="w-5 h-5 text-white"
                            >
                              <rect x="5" y="5" width="15" height="15" />
                            </svg>
                          }
                          disabled={isOpenPose}
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
                              className="w-5 h-3.5 text-white"
                            >
                              <rect x="0" y="4" width="25" height="16" />
                            </svg>
                          }
                          disabled={isOpenPose}
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
                              className="w-3.5 h-5 text-white"
                            >
                              <rect x="4" y="0" width="16" height="25" />
                            </svg>
                          }
                          disabled={isOpenPose}
                        />
                      </div>

                      {/* OpenPose Toggle and Upload */}
                      <div className="flex items-center gap-2 ml-2 w-max">
                        <button
                          type="button"
                          onClick={() => setIsOpenPose(!isOpenPose)}
                          className={`px-3 py-2 border rounded text-sm ${
                            isOpenPose
                              ? "bg-gray-700 border-white text-white"
                              : "border-gray-500 text-gray-400"
                          }`}
                        >
                          OpenPose
                        </button>
                        <label
                          className={`relative ${
                            !isOpenPose && "opacity-50 cursor-not-allowed"
                          }`}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={!isOpenPose}
                            onChange={handleFileChange}
                          />
                          <div
                            className={`flex items-center gap-2 px-2 py-1 border max-w-[230px] rounded ${
                              isOpenPose
                                ? "bg-white text-black hover:bg-gray-200"
                                : "bg-gray-500 text-gray-300 border-gray-500"
                            }`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="w-4 h-4"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            {openPoseFile && (
                              <span className="text-xs truncate max-w-xs">
                                {openPoseFile.name}
                              </span>
                            )}
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                {isOpenPose && openPosePreview && (
                  <div className="mt-4">
                    <p className="text-sm text-white mb-2">OpenPose Preview:</p>
                    <div className="relative w-full h-100 border border-gray-500 rounded overflow-hidden">
                      <img
                        src={openPosePreview}
                        alt="OpenPose preview"
                        className="w-full h-full object-contain"
                      />
                      <button
                        className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75"
                        onClick={() => {
                          setOpenPoseFile(null);
                          setOpenPosePreview(null);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {regenerationError && (
                <p className="text-red-500 text-xs mb-2">{regenerationError}</p>
              )}

              <div className="flex justify-end">
                <button
                  className="px-3 py-2 bg-white text-black rounded hover:bg-gray-800 disabled:bg-gray-400"
                  onClick={handleRegenerate}
                  disabled={isRegenerating || (isOpenPose && !openPoseFile)}
                >
                  {isRegenerating ? "Regenerating..." : "Regenerate"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
