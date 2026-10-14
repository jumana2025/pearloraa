import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Gem } from "lucide-react";
import api from "../../api/axios";

export default function AdminLogin() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ username: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.username || !formData.password) {
            setError("Please enter username and password.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await api.post("users/admin-login/", formData);
            const data = response.data;

            localStorage.setItem("admin_access", data.access);
            localStorage.setItem("admin_refresh", data.refresh);
            localStorage.setItem("admin_user", JSON.stringify(data.user));

            navigate("/admin/dashboard");
        } catch (error) {
            setError(
                error.response?.data?.non_field_errors?.[0] ||
                error.response?.data?.detail ||
                error.response?.data?.message ||
                (error.response
                    ? "Invalid admin credentials."
                    : "Unable to connect to the server. Check the VITE_API_URL deployment setting and make sure the Django API is online.")
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="flex min-h-screen items-center justify-center px-4"
            style={{ background: "#1b4332" }}
        >
            {/* Decorative circles */}
            <div
                className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full opacity-10"
                style={{ background: "#a48755", transform: "translate(-40%, -40%)" }}
            />
            <div
                className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full opacity-10"
                style={{ background: "#a48755", transform: "translate(40%, 40%)" }}
            />

            <div className="relative w-full max-w-md">
                {/* Brand */}
                <div className="mb-8 text-center">
                    <div
                        className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
                        style={{ background: "#a48755" }}
                    >
                        <Gem size={32} className="text-white" />
                    </div>

                    <h1
                        className="text-3xl font-bold tracking-widest text-white"
                        style={{ letterSpacing: "0.14em" }}
                    >
                        PEARLORAA
                    </h1>

                    <p
                        className="mt-1 text-xs font-medium tracking-widest"
                        style={{ color: "#a48755", letterSpacing: "0.24em" }}
                    >
                        FINE JEWELLERY
                    </p>
                </div>

                {/* Card */}
                <div
                    className="rounded-2xl border p-6 shadow-2xl sm:p-8"
                    style={{
                        background: "#f8f4ec",
                        borderColor: "rgba(164,135,85,0.2)",
                    }}
                >
                    <div className="mb-6">
                        <h2
                            className="text-xl font-semibold"
                            style={{ color: "#1b4332" }}
                        >
                            Admin Sign In
                        </h2>

                        <p className="mt-1 text-sm" style={{ color: "#493d38" }}>
                            Access the management dashboard.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username */}
                        <div>
                            <label
                                className="mb-2 block text-sm font-medium"
                                style={{ color: "#1b4332" }}
                            >
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Enter admin username"
                                autoComplete="username"
                                className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition"
                                style={{
                                    borderColor: "#d4c5b0",
                                    background: "#fff",
                                    color: "#1b4332",
                                }}
                                onFocus={(e) => (e.target.style.borderColor = "#1b4332")}
                                onBlur={(e) => (e.target.style.borderColor = "#d4c5b0")}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                className="mb-2 block text-sm font-medium"
                                style={{ color: "#1b4332" }}
                            >
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter admin password"
                                    autoComplete="current-password"
                                    className="w-full rounded-xl border px-4 py-3 pr-12 text-sm outline-none transition"
                                    style={{
                                        borderColor: "#d4c5b0",
                                        background: "#fff",
                                        color: "#1b4332",
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = "#1b4332")}
                                    onBlur={(e) => (e.target.style.borderColor = "#d4c5b0")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                    style={{ color: "#a48755" }}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            style={{ background: "#1b4332" }}
                        >
                            {loading ? (
                                "Signing in..."
                            ) : (
                                <>
                                    Sign in to Dashboard
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Authorized administrators only · Pearloraa Admin
                </p>
            </div>
        </div>
    );
}
