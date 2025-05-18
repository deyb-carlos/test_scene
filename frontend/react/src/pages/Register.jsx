import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    policy: "",
    general: "",
  });
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      policy: "",
      general: "",
    };

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!formData.username.trim()) {
      newErrors.username = "Username is required.";
      isValid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters long.";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
      isValid = false;
    } else if (!emailPattern.test(formData.email)) {
      newErrors.email = "Invalid email format.";
      isValid = false;
    }

    const allowedSpecialChars = /[!@#$%^&*()_+\-{}\[\]\\|:,.<>?~]/;

    if (!formData.password) {
      newErrors.password = "Password is required.";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
      isValid = false;
    } else if (/\s/.test(formData.password)) {
      newErrors.password = "Password cannot contain spaces.";
      isValid = false;
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter.";
      isValid = false;
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one lowercase letter.";
      isValid = false;
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number.";
      isValid = false;
    } else if (!allowedSpecialChars.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one of these special characters: !@#$%^&*()_+-{}[]\\|:,.<>?~";
      isValid = false;
    } else if (/[<>'"`;=]/.test(formData.password)) {
      newErrors.password = "Password contains invalid special characters.";
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required.";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
      isValid = false;
    }

    if (!isChecked) {
      newErrors.policy = "Privacy policy is unchecked.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ ...errors, general: "" });

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch(import.meta.env.VITE_API_BASE_URL+ "/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        if (response.status === 400) {
          if (responseData.detail === "Username already registered") {
            setErrors((prev) => ({
              ...prev,
              username: "Username is already taken. Please choose another.",
            }));
          } else if (responseData.detail === "Email already exists") {
            setErrors((prev) => ({
              ...prev,
              email: "Email is already registered. Please use another email.",
            }));
          } else if (Array.isArray(responseData.detail)) {
            setErrors((prev) => ({
              ...prev,
              general: responseData.detail.join(", "),
            }));
          } else {
            setErrors((prev) => ({
              ...prev,
              general: responseData.detail || "Registration failed",
            }));
          }
        } else {
          setErrors((prev) => ({
            ...prev,
            general: "Registration failed. Please try again later.",
          }));
        }
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: "Network error. Please check your connection and try again.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-black flex flex-col min-h-screen items-center justify-center text-white">
      <title>Register</title>
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
            Create your account
          </h2>
        </div>
        {success && (
          <div className="w-full bg-green-500/20 text-green-300 p-3 mb-4 rounded-md">
            {success}
          </div>
        )}

        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="relative w-full">
            <div className="relative">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                autoComplete="off"
                placeholder=" "
                className={`peer w-full bg-transparent border ${
                  errors.username ? "border-red-400" : "border-gray-500"
                } text-white placeholder-transparent rounded-md px-3 pt-3 pb-2 focus:outline-none focus:border-white transition-colors`}
              />
              <label
                htmlFor="username"
                className="absolute left-3 top-0 -translate-y-1/2 px-1 text-sm bg-black text-gray-500 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-gray-500 peer-focus:top-0 peer-focus:text-sm peer-focus:text-white peer-focus:bg-black"
              >
                Username
              </label>
            </div>
            {errors.username && (
              <div className="mt-1 text-red-400 text-sm">{errors.username}</div>
            )}
          </div>

          <div className="relative w-full">
            <div className="relative">
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="off"
                placeholder=" "
                className={`peer w-full bg-transparent border ${
                  errors.email ? "border-red-400" : "border-gray-500"
                } text-white placeholder-transparent rounded-md px-3 pt-3 pb-2 focus:outline-none focus:border-white transition-colors`}
              />
              <label
                htmlFor="email"
                className="absolute left-3 top-0 -translate-y-1/2 px-1 text-sm bg-black text-gray-500 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-gray-500 peer-focus:top-0 peer-focus:text-sm peer-focus:text-white peer-focus:bg-black"
              >
                Email
              </label>
            </div>
            {errors.email && (
              <div className="mt-1 text-red-400 text-sm">{errors.email}</div>
            )}
          </div>

          <div className="relative w-full">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="off"
                placeholder=" "
                className={`peer w-full bg-transparent border ${
                  errors.password ? "border-red-400" : "border-gray-500"
                } text-white placeholder-transparent rounded-md px-3 pt-3 pb-2 focus:outline-none focus:border-white transition-colors`}
              />
              <label
                htmlFor="password"
                className="absolute left-3 top-0 -translate-y-1/2 px-1 text-sm bg-black text-gray-500 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-gray-500 peer-focus:top-0 peer-focus:text-sm peer-focus:text-white peer-focus:bg-black"
              >
                Password
              </label>
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
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
                    className="h-5 w-5"
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
            {errors.password && (
              <div className="mt-1 text-red-400 text-sm">{errors.password}</div>
            )}
          </div>

          <div className="relative w-full">
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="off"
                placeholder=" "
                className={`peer w-full bg-transparent border ${
                  errors.confirmPassword ? "border-red-400" : "border-gray-500"
                } text-white placeholder-transparent rounded-md px-3 pt-4 pb-2 focus:outline-none focus:border-white transition-colors`}
              />
              <label
                htmlFor="confirmPassword"
                className="absolute left-3 top-0 -translate-y-1/2 px-1 text-sm bg-black text-gray-500 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-gray-500 peer-focus:top-0 peer-focus:text-sm peer-focus:text-white peer-focus:bg-black"
              >
                Confirm Password
              </label>
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
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
                    className="h-5 w-5"
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
            {errors.confirmPassword && (
              <div className="mt-1 text-red-400 text-sm">
                {errors.confirmPassword}
              </div>
            )}
          </div>

          <div className="relative w-full ml-3">
            <input
              type="checkbox"
              onChange={(e) => setIsChecked(e.target.checked)}
              id="terms"
              className="mr-2"
            />
            <label htmlFor="terms" className="text-sm text-gray-400">
              By signing up, you agree to our{" "}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowPrivacyPolicy(true);
                }}
                className="underline hover:text-white"
              >
                Privacy policy
              </button>
            </label>
            {errors.policy && (
              <div className="mt-1 text-red-400 text-sm">{errors.policy}</div>
            )}
          </div>
          {errors.general && (
            <div className="mt-1 text-red-400 text-sm">{errors.general}</div>
          )}
          <div className="w-full flex flex-col items-center ">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-white text-black border-2 border-black py-2 rounded-md font-semibold hover:bg-gray-300 transition-colors ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Processing..." : "Sign Up"}
            </button>

            <p className="mt-4 text-white text-sm">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-redOrange underline hover:text-redOrange-dark"
              >
                <b>Login</b>
              </a>
            </p>
          </div>
        </form>

        {/* Privacy Policy Popup */}
        {showPrivacyPolicy && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-black/90 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={() => setShowPrivacyPolicy(false)}
                className="absolute top-2 left-2 text-white hover:text-gray-300 text-2xl p-2"
              >
                &times;
              </button>
              <div className="p-6 pt-12">
                <h2 className="text-2xl font-bold mb-4">Privacy Policy</h2>
                <div className="text-gray-300 space-y-4">
                  <p>
                    This Privacy Policy describes how your personal information
                    is collected, used, and shared when you register for an
                    account on our platform.
                  </p>

                  <h3 className="text-xl font-semibold mt-4">
                    Information We Collect
                  </h3>
                  <p>
                    When you register, we collect the following information:
                  </p>
                  <ul className="list-disc pl-6">
                    <li>Username</li>
                    <li>Email address</li>
                    <li>Password (hashed and encrypted)</li>
                  </ul>

                  <h3 className="text-xl font-semibold mt-4">
                    How We Use Your Information
                  </h3>
                  <p>We use the information we collect to:</p>
                  <ul className="list-disc pl-6">
                    <li>Create and manage your account</li>
                    <li>Provide and improve our services</li>
                    <li>Communicate with you</li>
                  </ul>

                  <h3 className="text-xl font-semibold mt-4">Data Security</h3>
                  <p>
                    We implement appropriate security measures to protect your
                    personal information from unauthorized access, alteration,
                    or disclosure.
                  </p>

                  <h3 className="text-xl font-semibold mt-4">
                    Changes to This Policy
                  </h3>
                  <p>
                    We may update this Privacy Policy from time to time. We will
                    notify you of any changes by posting the new policy on this
                    page.
                  </p>

                  <p className="mt-6">
                    Last updated: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Register;
