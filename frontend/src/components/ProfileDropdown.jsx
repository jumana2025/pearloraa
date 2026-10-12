import { useEffect, useRef, useState } from "react";
import { User, LogOut, ShoppingBag, ChevronDown, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProfileDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Read user from localStorage
    const getUserData = () => {
        try {
            const stored = localStorage.getItem("user") || sessionStorage.getItem("user");
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    };
    const user = getUserData();

    const displayName = user
        ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || "My Account"
        : "My Account";

    const initials = displayName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const go = (path) => {
        setIsOpen(false);
        navigate(path);
    };

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");
        sessionStorage.removeItem("user");
        setIsOpen(false);
        navigate("/");
        window.location.reload();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
                aria-label="Profile menu"
            >
                {/* Avatar circle */}
                <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: "#1b4332" }}
                >
                    {initials || <User size={16} />}
                </div>
                <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    style={{ color: "#493d38" }}
                />
            </button>

            {/* Dropdown panel */}
            {isOpen && (
                <>
                    {/* Overlay */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

                    <div
                        className="absolute right-0 top-full z-50 mt-3 w-60 overflow-hidden rounded-2xl border bg-white shadow-xl"
                        style={{ borderColor: "#e8e0d5" }}
                    >
                        {/* User info header */}
                        <div
                            className="flex items-center gap-3 border-b px-4 py-4"
                            style={{ borderColor: "#e8e0d5", background: "#faf9f6" }}
                        >
                            <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                                style={{ background: "#1b4332" }}
                            >
                                {initials || <User size={18} />}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold" style={{ color: "#1b4332" }}>
                                    {displayName}
                                </p>
                                {user?.email && (
                                    <p className="truncate text-xs" style={{ color: "#a48755" }}>
                                        {user.email}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Menu items */}
                        <div className="py-1">
                            <button
                                onClick={() => go("/profile")}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium transition hover:bg-[#faf9f6]"
                                style={{ color: "#1b4332" }}
                            >
                                <User size={16} style={{ color: "#a48755" }} />
                                My Profile
                            </button>

                            <button
                                onClick={() => go("/orders")}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium transition hover:bg-[#faf9f6]"
                                style={{ color: "#1b4332" }}
                            >
                                <ShoppingBag size={16} style={{ color: "#a48755" }} />
                                My Orders
                            </button>

                            <button
                                onClick={() => go("/wishlist")}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium transition hover:bg-[#faf9f6]"
                                style={{ color: "#1b4332" }}
                            >
                                <Heart size={16} style={{ color: "#a48755" }} />
                                Wishlist
                            </button>
                        </div>

                        {/* Logout */}
                        <div className="border-t" style={{ borderColor: "#e8e0d5" }}>
                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-500 transition hover:bg-red-50"
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
