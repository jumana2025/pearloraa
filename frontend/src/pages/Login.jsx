import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import api from "../api/axios";
import BrandLogo from "../components/BrandLogo";

export default function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        login: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.login || !formData.password) {
            setError("Please enter your email/phone number and password.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("users/login/", {
                    login: formData.login,
                    password: formData.password,
            });
            const data = response.data;

            /*
             * JWT tokens
             *
             * data.access
             * data.refresh
             */

            if (rememberMe) {
                localStorage.setItem("access_token", data.access);
                localStorage.setItem("refresh_token", data.refresh);
            } else {
                sessionStorage.setItem("access_token", data.access);
                sessionStorage.setItem("refresh_token", data.refresh);
            }

            // Store logged-in user details
            if (data.user) {
                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );
            }

            setSuccess("Login successful!");

            // Notify navbar and other components about login
            window.dispatchEvent(new Event("authChanged"));

            // Redirect after login
            setTimeout(() => {
                navigate("/");
            }, 700);

        } catch (error) {
            console.error("Login error:", error);

            const data = error.response?.data;
            setError(
                data?.non_field_errors?.[0] ||
                data?.login?.[0] ||
                data?.detail ||
                (error.response
                    ? "Invalid email/phone number or password."
                    : "Unable to connect to the server. Check the VITE_API_URL deployment setting and make sure the Django API is online.")
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start px-4 pb-10 pt-24 sm:pt-28 md:justify-center md:pb-12">

            <div className="w-full max-w-md">

                {/* Header */}
                <div className="text-center mb-8">

                    <BrandLogo to="/" size="lg" className="mx-auto mb-5 justify-center" />

                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome Back
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Login to your account
                    </p>

                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8">

                    {/* Error */}
                    {error && (
                        <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="mb-5 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-600">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Email / Phone */}
                        <div>

                            <label
                                htmlFor="login"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Email or Phone Number
                            </label>

                            <input
                                id="login"
                                name="login"
                                type="text"
                                value={formData.login}
                                onChange={handleChange}
                                placeholder="Enter your email or phone number"
                                autoComplete="username"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                            />

                        </div>

                        {/* Password */}
                        <div>

                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Password
                            </label>

                            <div className="relative">

                                <input
                                    id="password"
                                    name="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
                                >
                                    {showPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </button>

                            </div>

                        </div>

                        {/* Remember + Forgot */}
                        <div className="flex items-center justify-between">

                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">

                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) =>
                                        setRememberMe(
                                            e.target.checked
                                        )
                                    }
                                    className="h-4 w-4 rounded"
                                />

                                Remember me

                            </label>

                            <button
                                type="button"
                                className="text-sm font-medium text-black hover:underline"
                            >
                                Forgot password?
                            </button>

                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-3.5 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                "Logging in..."
                            ) : (
                                <>
                                    Login
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>

                    </form>

                    {/* Register */}
                    <div className="mt-6 text-center text-sm text-gray-600">

                        Don't have an account?{" "}

                        <Link
                            to="/register"
                            className="font-semibold text-black hover:underline"
                        >
                            Create account
                        </Link>

                    </div>

                </div>
            </div>
        </div>
    );
}
