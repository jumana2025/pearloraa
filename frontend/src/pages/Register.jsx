import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        phone: "",
        password: "",
        confirm_password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [terms, setTerms] = useState(false);
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const API_URL = "http://127.0.0.1:8000";

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

        // Required field validation
        if (
            !formData.first_name ||
            !formData.last_name ||
            !formData.username ||
            !formData.email ||
            !formData.phone ||
            !formData.password ||
            !formData.confirm_password
        ) {
            setError("Please fill in all fields.");
            return;
        }

        // Password validation
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (formData.password !== formData.confirm_password) {
            setError("Passwords do not match.");
            return;
        }

        // Terms validation
        if (!terms) {
            setError("Please accept the Terms & Conditions.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/api/users/register/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        username: formData.username,
                        email: formData.email,
                        phone: formData.phone,
                        password: formData.password,
                        confirm_password: formData.confirm_password,
                    }),
                }
            );

            const data = await response.json();

            console.log(
                "Register response:",
                JSON.stringify(data, null, 2)
            );

            if (!response.ok) {
                // Django validation errors
                if (data.email) {
                    setError(
                        Array.isArray(data.email)
                            ? data.email[0]
                            : data.email
                    );
                } else if (data.username) {
                    setError(
                        Array.isArray(data.username)
                            ? data.username[0]
                            : data.username
                    );
                } else if (data.confirm_password) {
                    setError(
                        Array.isArray(data.confirm_password)
                            ? data.confirm_password[0]
                            : data.confirm_password
                    );
                } else if (data.phone) {
                    setError(
                        Array.isArray(data.phone)
                            ? data.phone[0]
                            : data.phone
                    );
                } else if (data.password) {
                    setError(
                        Array.isArray(data.password)
                            ? data.password[0]
                            : data.password
                    );
                } else if (data.detail) {
                    setError(data.detail);
                } else {
                    setError("Registration failed.");
                }

                return;
            }

            // Registration successful
            setSuccess(
                data.message || "Registration successful!"
            );

            // Clear form
            setFormData({
                first_name: "",
                last_name: "",
                username: "",
                email: "",
                phone: "",
                password: "",
                confirm_password: "",
            });

            setTerms(false);

            // Redirect to login
            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (error) {
            console.error("Registration error:", error);

            setError(
                "Unable to connect to the server. Please make sure Django is running."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">

            <div className="w-full max-w-lg">

                {/* Header */}
                <div className="text-center mb-8">

                    <h1 className="text-3xl font-bold text-gray-900">
                        Create Account
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Create your Pearloraa account
                    </p>

                </div>

                {/* Register Card */}
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

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        {/* First Name + Last Name */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                            <div>
                                <label
                                    htmlFor="first_name"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    First Name
                                </label>

                                <input
                                    id="first_name"
                                    name="first_name"
                                    type="text"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="First name"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="last_name"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Last Name
                                </label>

                                <input
                                    id="last_name"
                                    name="last_name"
                                    type="text"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="Last name"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black"
                                />
                            </div>

                        </div>

                        {/* Username */}
                        <div>

                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Username
                            </label>

                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Choose a username"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black"
                            />

                        </div>

                        {/* Email */}
                        <div>

                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black"
                            />

                        </div>

                        {/* Phone */}
                        <div>

                            <label
                                htmlFor="phone"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Phone Number
                            </label>

                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter your phone number"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black"
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
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a password"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 outline-none focus:border-black focus:ring-1 focus:ring-black"
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

                        {/* Confirm Password */}
                        <div>

                            <label
                                htmlFor="confirm_password"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Confirm Password
                            </label>

                            <div className="relative">

                                <input
                                    id="confirm_password"
                                    name="confirm_password"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 outline-none focus:border-black focus:ring-1 focus:ring-black"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </button>

                            </div>

                        </div>

                        {/* Terms */}
                        <div className="flex items-start gap-2">

                            <input
                                id="terms"
                                type="checkbox"
                                checked={terms}
                                onChange={(e) =>
                                    setTerms(e.target.checked)
                                }
                                className="mt-1 h-4 w-4 rounded"
                            />

                            <label
                                htmlFor="terms"
                                className="text-sm text-gray-600"
                            >
                                I agree to the{" "}
                                <span className="font-medium text-black">
                                    Terms & Conditions
                                </span>{" "}
                                and Privacy Policy.
                            </label>

                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-3.5 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                "Creating Account..."
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>

                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center text-sm text-gray-600">

                        Already have an account?{" "}

                        <Link
                            to="/login"
                            className="font-semibold text-black hover:underline"
                        >
                            Login
                        </Link>

                    </div>

                </div>
            </div>
        </div>
    );
}
