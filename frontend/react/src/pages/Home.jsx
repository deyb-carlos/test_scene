import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { storyboardAPI, authAPI, tokenService } from "../api";

const Home = () => {
  const navigate = useNavigate();
  const MAX_NAME_LENGTH = 70;

  const [storyboards, setStoryboards] = useState([]);
  const [sortMode, setSortMode] = useState("date");
  const [showModal, setShowModal] = useState(false);
  const [newStoryboardName, setNewStoryboardName] = useState("");
  const [editingStoryboard, setEditingStoryboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    show: false,
    storyboardId: null,
    storyboardName: "",
    isDeleting: false,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const sortedStoryboards = sortStoryboards(storyboards, sortMode);
  function sortStoryboards(list, mode) {
    if (mode === "az") {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else if (mode === "date") {
      return [...list].sort(
        (a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0)
      );
    }
    return list;
  }
  useEffect(() => {
    if (storyboards.length > 0) {
      const sorted = sortStoryboards(storyboards, sortMode);
      setStoryboards(sorted);
    }
  }, [sortMode]);

  useEffect(() => {
    const fetchStoryboards = async () => {
      try {
        setIsLoading(true);
        const response = await storyboardAPI.getAll();
        setStoryboards(response.data || []);
      } catch (error) {
        console.error("Failed to fetch storyboards:", error);
        setStoryboards([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoryboards();
  }, []);

  useEffect(() => {
    const refreshInterval = 24 * 60 * 60 * 1000;
    tokenService.refreshToken();

    const intervalId = setInterval(() => {
      tokenService.refreshToken();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await authAPI.get_current_user();
        setUsername(response.data.username);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  const openCreateModal = () => {
    setEditingStoryboard(null);
    setNewStoryboardName("");
    setShowModal(true);
  };

  const openRenameModal = (storyboard) => {
    setEditingStoryboard(storyboard);
    setNewStoryboardName(storyboard.name);
    setShowModal(true);
  };

  const navigateToStoryboard = (id, name) => {
    navigate(`/storyboard/${id}/${encodeURIComponent(name)}`);
  };

  const handleSaveStoryboard = async () => {
    if (!newStoryboardName.trim() || isProcessing) return;
    if (newStoryboardName.length > MAX_NAME_LENGTH) {
      setError(`Name must be ${MAX_NAME_LENGTH} characters or less`);
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Check for duplicate names
      const nameExists = storyboards.some(
        (sb) =>
          sb.name === newStoryboardName.trim() &&
          (!editingStoryboard || sb.id !== editingStoryboard.id)
      );

      if (nameExists) {
        setError("A storyboard with this name already exists");
        return;
      }

      if (editingStoryboard) {
        const response = await storyboardAPI.rename(
          editingStoryboard.id,
          newStoryboardName
        );

        setStoryboards((prev) =>
          prev.map((sb) =>
            sb.id === editingStoryboard.id
              ? {
                  ...sb,
                  name: newStoryboardName,
                  updated_at: new Date().toISOString(),
                }
              : sb
          )
        );
      } else {
        const response = await storyboardAPI.create(newStoryboardName);
        setStoryboards((prev) => [response.data, ...prev]);
      }

      setShowModal(false);
    } catch (error) {
      console.error("Operation failed:", error);
      setError("Operation failed");
    } finally {
      setIsProcessing(false);
    }
  };
  const handleDeleteClick = (id, name) => {
    setDeleteConfirmation({
      show: true,
      storyboardId: id,
      storyboardName: name,
    });
  };

  const deleteStoryboard = async () => {
    try {
      setDeleteConfirmation((prev) => ({
        ...prev,
        isDeleting: true,
      }));

      const storyboardElement = document.getElementById(
        `storyboard-${deleteConfirmation.storyboardId}`
      );

      if (storyboardElement) {
        storyboardElement.classList.add("implode-animation");
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      await storyboardAPI.delete(deleteConfirmation.storyboardId);

      setStoryboards((prev) =>
        prev.filter((sb) => sb.id !== deleteConfirmation.storyboardId)
      );
    } catch (error) {
      console.error("Delete failed:", error);
      setError("Failed to delete storyboard");
    } finally {
      setDeleteConfirmation({
        show: false,
        storyboardId: null,
        storyboardName: "",
        isDeleting: false,
      });
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center">
        <img
          src="/sw-logo.png"
          alt="Logo"
          className="h-16 mb-8" // Adjust size as needed
        />

        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading storyboards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <title>Home</title>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
        <div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img src="/sw-logo.png" alt="Logo" className="h-8" />
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1 rounded-md transition-colors flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8 pb-8 flex-1 w-full">
        {/* Header Section - Modified for mobile */}
        <div className="mb-8 pt-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          {username && (
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900">
              {username}'s Storyboards
            </h1>
          )}

          {/* Sort Buttons - Now below on mobile */}
          <div className="flex space-x-2 sm:self-center relative">
            {/* A-Z Sort Button */}
            <div className="relative group">
              <button
                onClick={() => {
                  setSortMode("az");
                  setStoryboards(sortStoryboards(storyboards, "az"));
                }}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                  />
                </svg>
              </button>
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Sort A-Z
              </span>
            </div>

            {/* Date Sort Button */}
            <div className="relative group">
              <button
                onClick={() => {
                  setSortMode("date");
                  setStoryboards(sortStoryboards(storyboards, "date"));
                }}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Sort by Date
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Create Storyboard Button */}
          <div className="flex flex-col">
            <button
              onClick={openCreateModal}
              className="aspect-video w-full rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-gray-400"
            >
              <div className="flex flex-col items-center justify-center h-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-400 group-hover:text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span className="mt-2 text-gray-400 font-medium">
                  New Storyboard
                </span>
              </div>
            </button>
          </div>

          {/* Storyboard Thumbnails */}
          {sortedStoryboards.map((storyboard) => (
            <div
              id={`storyboard-${storyboard.id}`}
              key={storyboard.id}
              className="flex flex-col group transition-all duration-200 origin-center"
            >
              <div
                onClick={() =>
                  navigateToStoryboard(storyboard.id, storyboard.name)
                }
                className="aspect-video w-full rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer relative bg-white"
              >
                <img
                  src={
                    storyboard.thumbnail ||
                    "https://sceneweaver.s3.ap-southeast-2.amazonaws.com/assets/tumblr_f62bc01ba9fb6acf8b5d438d6d2ae71a_c5a496d1_1280.jpg"
                  }
                  alt={storyboard.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-4">
                  <span className="text-white font-medium text-lg drop-shadow-md">
                    {storyboard.name}
                  </span>
                </div>
              </div>
              <div className="mt-2 px-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-800 font-medium truncate flex-1 min-w-0">
                    {storyboard.name}
                  </span>
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openRenameModal(storyboard);
                      }}
                      className="text-gray-500 hover:text-blue-600 p-1 rounded hover:bg-gray-100 transition-colors"
                      title="Rename"
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(storyboard.id, storyboard.name);
                      }}
                      className="text-gray-500 hover:text-red-600 p-1 rounded hover:bg-gray-100 transition-colors"
                      title="Delete"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Last updated:{" "}
                  {new Date(
                    storyboard.updated_at || Date.now()
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {deleteConfirmation.show && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-black mb-4">
              Confirm Deletion
            </h2>
            <p className="mb-6 text-black">
              Are you sure you want to delete "
              <span className="font-medium break-all line-clamp-3">
                <b>{deleteConfirmation.storyboardName}</b>
              </span>
              "? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() =>
                  setDeleteConfirmation({
                    show: false,
                    storyboardId: null,
                    storyboardName: "",
                  })
                }
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteStoryboard}
                disabled={deleteConfirmation.isDeleting}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  deleteConfirmation.isDeleting
                    ? "bg-red-300 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                {deleteConfirmation.isDeleting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
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
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Create/Rename Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-black mb-4">
              {editingStoryboard
                ? "Rename Storyboard"
                : "Create New Storyboard"}
            </h2>

            <div className="relative">
              <input
                type="text"
                value={newStoryboardName}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_NAME_LENGTH) {
                    setNewStoryboardName(e.target.value);
                    setError(null);
                  }
                }}
                placeholder="Enter storyboard name"
                className={`w-full px-4 py-2 border ${
                  error ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-0 focus:ring-offset-0 focus:border-gray-400 text-black placeholder-gray-400`}
                autoFocus
                maxLength={MAX_NAME_LENGTH}
                onKeyDown={(e) => e.key === "Enter" && handleSaveStoryboard()}
              />
              <div className="absolute right-2 top-2 text-xs text-gray-400">
                {newStoryboardName.length}/{MAX_NAME_LENGTH}
              </div>
            </div>
            {/* Error message display */}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setError(null); // Clear error when closing
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStoryboard}
                disabled={!newStoryboardName.trim() || isProcessing}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center ${
                  newStoryboardName.trim()
                    ? "bg-black hover:bg-gray-800 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    {editingStoryboard ? "Saving..." : "Creating..."}
                  </>
                ) : editingStoryboard ? (
                  "Save"
                ) : (
                  "Create"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
