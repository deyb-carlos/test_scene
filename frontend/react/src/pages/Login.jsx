import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    if (!username || !password) {
      setError("Please fill in all fields.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    const formDetails = new URLSearchParams();
    formDetails.append("username", username);
    formDetails.append("password", password);

    try {
      const response = await fetch(import.meta.env.VITE_API_BASE_URL+ "/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formDetails,
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        navigate("/home");
      } else {
        const errorData = await response.json();
        setError(
          errorData.detail || "Login failed. Please check your credentials."
        );
      }
    } catch (error) {
      setLoading(false);
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50 text-black px-4">
      <title>Login</title>
      <div className="bg-white border-2 border-black shadow-md w-full max-w-md p-6 rounded-lg mx-4">
        <div className="flex flex-col items-center pb-4">
          <img
            src="/sw-logo.png"
            alt="Sceneweaver Logo"
            className="w-24 mb-3" // Slightly smaller logo
          />
          <h2 className="text-xl font-bold text-center">Sign in</h2>
        </div>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          {/* Username Input */}
          <div className="relative w-full">
            <input
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              placeholder=" "
              className="peer w-full bg-white border border-gray-300 text-gray-800 placeholder-transparent rounded-md px-3 pt-3 pb-2 focus:outline-none focus:border-black transition-colors text-sm" // Added text-sm
            />
            <label
              htmlFor="username"
              className="absolute left-3 top-0 -translate-y-1/2 px-1 text-xs bg-white text-gray-500 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-gray-400 peer-focus:top-0 peer-focus:text-xs peer-focus:text-black peer-focus:bg-white" // Smaller text
            >
              Username
            </label>
          </div>

          {/* Password Input */}
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              placeholder=" "
              className="peer w-full bg-white border border-gray-300 text-gray-800 placeholder-transparent rounded-md px-3 pt-3 pb-2 focus:outline-none focus:border-black transition-colors text-sm" // Added text-sm
            />
            <label
              htmlFor="password"
              className="absolute left-3 top-0 -translate-y-1/2 px-1 text-xs bg-white text-gray-500 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-gray-400 peer-focus:top-0 peer-focus:text-xs peer-focus:text-black peer-focus:bg-white" // Smaller text
            >
              Password
            </label>
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4" // Smaller icon
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4" // Smaller icon
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              )}
            </button>
          </div>

          <div className="flex justify-between items-center text-xs">
            <a href="/forgot-password" className="text-black hover:underline">
              <u>
                <b>Forgot Password?</b>
              </u>
            </a>
          </div>

          {error && (
            <div className="text-red-600 text-xs p-0 rounded text-left">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white font-semibold py-2 rounded-md hover:bg-gray-800 transition-colors text-sm" // Smaller text
          >
            {loading ? "Logging in" : "Login"}
          </button>

          <p className="text-center text-xs">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-black font-medium hover:underline"
            >
              <u>
                <b>Sign Up</b>
              </u>
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
