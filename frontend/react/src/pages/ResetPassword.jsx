import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!token) {
      setError("Missing or invalid reset token.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const formDetails = new URLSearchParams();
      formDetails.append("token", token);
      formDetails.append("new_password", password);

      const response = await fetch(
        import.meta.env.VITE_API_BASE_URL + "/api/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formDetails,
        }
      );

      const data = await response.json

      if (!response.ok) {
        setError(data.detail || "Failed to reset password.");
      } else {
        setSuccess("Password reset successfully! Redirecting...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-black flex flex-col min-h-screen items-center justify-center text-white">
      <title>Reset Password</title>
      <div className="bg-black/90 w-full max-w-md flex flex-col items-center justify-center p-6 md:p-8 rounded-[10px]">
        <div className="w-full flex flex-col items-center justify-center pb-8">
          <h1 className="pb-3">
            <img
              src="/sw-logo.png"
              alt="Sceneweaver Logo"
              className="w-32 md:w-40"
              draggable="false"
            />
          </h1>
          <h2
            className="text-2xl md:text-3xl font-bold text-white mt-2 text-center"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
          >
            Reset your password
          </h2>
          <p className="text-sm text-gray-400 mt-2 text-center max-w-sm">
            Enter your new password below.
          </p>
        </div>

        <form
          className="w-full flex flex-col gap-6"
          onSubmit={handleResetPassword}
        >
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder=" "
              className="peer w-full bg-transparent border border-gray-500 text-white placeholder-transparent rounded-md px-3 pt-4 pb-2 focus:outline-none focus:border-white transition-colors"
            />
            <label
              htmlFor="password"
              className="absolute left-3 top-0 -translate-y-1/2 px-1 text-sm bg-black text-gray-500 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-gray-500 peer-focus:top-0 peer-focus:text-sm peer-focus:text-white peer-focus:bg-black"
            >
              New Password
            </label>
          </div>

          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder=" "
              className="peer w-full bg-transparent border border-gray-500 text-white placeholder-transparent rounded-md px-3 pt-4 pb-2 focus:outline-none focus:border-white transition-colors"
            />
            <label
              htmlFor="confirmPassword"
              className="absolute left-3 top-0 -translate-y-1/2 px-1 text-sm bg-black text-gray-500 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-gray-500 peer-focus:top-0 peer-focus:text-sm peer-focus:text-white peer-focus:bg-black"
            >
              Confirm Password
            </label>
          </div>

          <div className="text-sm text-gray-400">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="rounded border-gray-500 text-white focus:ring-white bg-transparent"
              />
              Show Password
            </label>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}
          {success && (
            <div className="text-green-400 text-sm text-center">{success}</div>
          )}

          <div className="w-full flex flex-col items-center">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-white text-black border-2 border-black py-2 rounded-md font-semibold hover:bg-gray-100 transition-colors ${
                isLoading ? "opacity-50" : ""
              }`}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>

            <p className="mt-4 text-white text-sm">
              Remember your password?{" "}
              <a
                to="/login"
                className="text-redOrange underline hover:text-redOrange-dark"
              >
                <b>Login</b>
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
