import { useCallback, useEffect, useState } from "react";
import {
    User, Mail, Phone, AtSign, LogOut,
    ShoppingBag, ShoppingCart, Heart, ArrowLeft, RefreshCw,
    Package, ChevronRight, ShieldCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_ORIGIN } from "../api/axios";

const API_URL = API_ORIGIN;

export default function Profile() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [activeTab, setActiveTab] = useState("overview"); // overview | orders | cart | wishlist

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const handleLogout = useCallback(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");
        sessionStorage.removeItem("user");
        localStorage.removeItem("pearloraa_cart");

        window.dispatchEvent(new Event("authChanged"));
        navigate("/");
    }, [navigate]);

    const getToken = () =>
        localStorage.getItem("access_token") || sessionStorage.getItem("access_token");

    const getUserFromStorage = () => {
        try {
            const s = localStorage.getItem("user") || sessionStorage.getItem("user");
            return s ? JSON.parse(s) : null;
        } catch {
            return null;
        }
    };

    // ============================================================
    // FETCH PROFILE
    // ============================================================
    const fetchProfile = useCallback(async (token) => {
        try {
            const res = await fetch(`${API_URL}/api/users/profile/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 401) {
                handleLogout();
                return null;
            }
            if (!res.ok) throw new Error();
            const data = await res.json();
            setProfile(data);
            return data;
        } catch {
            setError("Unable to load profile.");
            return null;
        }
    }, [handleLogout]);

    // ============================================================
    // FETCH ORDERS
    // ============================================================
    const fetchOrders = async (token) => {
        try {
            const res = await fetch(`${API_URL}/api/orders/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                const list = Array.isArray(data) ? data : (data.results || []);
                setOrders(list);
            }
        } catch (err) {
            console.error("Orders fetch error:", err);
        }
    };

    // ============================================================
    // FETCH CART
    // ============================================================
    const fetchCart = async (token) => {
        try {
            const res = await fetch(`${API_URL}/api/cart/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                const items = Array.isArray(data.items) ? data.items : [];
                setCartItems(items);
            }
        } catch (err) {
            console.error("Cart fetch error:", err);
        }
    };

    // ============================================================
    // FETCH WISHLIST
    // ============================================================
    const fetchWishlist = async (token) => {
        try {
            // Try backend API first
            let items = [];
            try {
                const res = await fetch(`${API_URL}/api/wishlist/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data.items) && data.items.length > 0) {
                        items = data.items.map((it) => ({
                            id: it.product?.id || it.id,
                            name: it.product?.name || "Jewellery Item",
                            price: it.product?.final_price ?? it.product?.price ?? 0,
                            category: it.product?.category?.name || "Jewellery",
                            image: it.product?.main_image || "",
                        }));
                    }
                }
            } catch {
                // Ignore API error and fallback to product list lookup
            }

            setWishlistItems(items);
        } catch (err) {
            console.error("Wishlist fetch error:", err);
        }
    };

    // ============================================================
    // INITIAL LOAD
    // ============================================================
    useEffect(() => {
        const token = getToken();
        if (!token) {
            navigate("/login");
            return;
        }

        const loadAll = async () => {
            setLoading(true);
            await Promise.all([
                fetchProfile(token),
                fetchOrders(token),
                fetchCart(token),
                fetchWishlist(token),
            ]);
            setLoading(false);
        };

        loadAll();
    }, [fetchProfile, navigate]);

    const getStatusStyle = (status) => {
        switch ((status || "").toLowerCase()) {
            case "delivered":
            case "completed":
                return { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" };
            case "shipped":
                return { bg: "#eef2ff", text: "#4338ca", border: "#c7d2fe" };
            case "processing":
                return { bg: "#f5f3ff", text: "#6d28d9", border: "#ddd6fe" };
            case "confirmed":
                return { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" };
            case "cancelled":
                return { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" };
            default:
                return { bg: "#fef9ee", text: "#b45309", border: "#fde68a" };
        }
    };

    const storedUser = getUserFromStorage();
    const displayName = profile
        ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || profile.username
        : storedUser
        ? `${storedUser.first_name || ""} ${storedUser.last_name || ""}`.trim() || storedUser.username
        : "User";

    const username = profile?.username || storedUser?.username || "—";
    const email = profile?.email || storedUser?.email || "—";
    const phone = profile?.profile?.phone || profile?.phone || storedUser?.phone || "Not added";

    const initials = displayName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const totalCartCount = cartItems.reduce(
        (acc, it) => acc + Number(it.quantity || 1),
        0
    );

    const totalCartAmount = cartItems.reduce((acc, it) => {
        const p = it.product;
        const price = Number(p?.final_price ?? p?.price ?? 0);
        return acc + price * Number(it.quantity || 1);
    }, 0);

    const formatImageUrl = (url) => {
        if (!url) return "";
        if (url.startsWith("http://") || url.startsWith("https://")) return url;
        return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center" style={{ background: "#faf9f6" }}>
                <div className="flex flex-col items-center gap-3">
                    <RefreshCw size={32} className="animate-spin" style={{ color: "#a48755" }} />
                    <p className="text-sm font-medium tracking-wide" style={{ color: "#1b4332" }}>
                        Loading your profile...
                    </p>
                </div>
            </div>
        );
    }

    if (error && !profile && !storedUser) {
        return (
            <div className="flex min-h-screen items-center justify-center p-6" style={{ background: "#faf9f6" }}>
                <div className="max-w-md rounded-2xl border bg-white p-8 text-center shadow-lg" style={{ borderColor: "#e8e0d5" }}>
                    <p className="mb-4 text-sm font-medium text-red-500">{error}</p>
                    <button
                        onClick={() => navigate("/")}
                        className="rounded-xl px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                        style={{ background: "#1b4332" }}
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-16 pt-24" style={{ background: "#faf9f6" }}>
            {/* Top Navigation Bar */}
            <div className="border-b bg-white/80 backdrop-blur-sm" style={{ borderColor: "#e8e0d5" }}>
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm font-medium transition hover:opacity-75"
                        style={{ color: "#1b4332" }}
                    >
                        <ArrowLeft size={18} />
                        <span>Back</span>
                    </button>
                    <div className="text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#a48755" }}>
                            Pearloraa Member
                        </p>
                        <h2 className="text-base font-serif font-bold text-[#1b4332]">
                            My Account Profile
                        </h2>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-red-600 transition hover:bg-red-50"
                        style={{ borderColor: "#fecaca" }}
                    >
                        <LogOut size={15} />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </div>

            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
                {/* ── Main Profile Banner Card ── */}
                <div
                    className="mb-8 overflow-hidden rounded-3xl border bg-white shadow-sm"
                    style={{ borderColor: "#e8e0d5" }}
                >
                    {/* Gradient Header Banner */}
                    <div
                        className="relative h-28 sm:h-36"
                        style={{ background: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 60%, #a48755 100%)" }}
                    >
                        <div className="absolute right-6 top-4 flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium tracking-wider text-white backdrop-blur-md">
                            <ShieldCheck size={14} className="text-[#e2ca9c]" />
                            <span>Verified Customer</span>
                        </div>
                    </div>

                    {/* Profile Information & Actions */}
                    <div className="px-6 pb-8 sm:px-10">
                        <div className="-mt-14 mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                            {/* Avatar */}
                            <div className="flex items-end gap-4">
                                <div
                                    className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-white text-2xl font-serif font-bold text-white shadow-lg sm:h-28 sm:w-28"
                                    style={{ background: "#1b4332" }}
                                >
                                    {profile?.profile?.profile_image ? (
                                        <img
                                            src={formatImageUrl(profile.profile.profile_image)}
                                            alt="Profile"
                                            className="h-full w-full rounded-2xl object-cover"
                                        />
                                    ) : (
                                        initials
                                    )}
                                </div>
                                <div className="mb-1">
                                    <h1 className="font-serif text-2xl font-bold sm:text-3xl" style={{ color: "#1b4332" }}>
                                        {displayName}
                                    </h1>
                                    <p className="flex items-center gap-1 text-sm font-medium" style={{ color: "#a48755" }}>
                                        <AtSign size={14} />
                                        <span>{username}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Quick Navigation Buttons */}
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => navigate("/cart")}
                                    className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition hover:bg-[#faf9f6]"
                                    style={{ borderColor: "#d4c5b0", color: "#1b4332" }}
                                >
                                    <ShoppingCart size={15} style={{ color: "#a48755" }} />
                                    <span>Cart ({totalCartCount})</span>
                                </button>
                                <button
                                    onClick={() => navigate("/wishlist")}
                                    className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition hover:bg-[#faf9f6]"
                                    style={{ borderColor: "#d4c5b0", color: "#1b4332" }}
                                >
                                    <Heart size={15} style={{ color: "#a48755" }} />
                                    <span>Wishlist ({wishlistItems.length})</span>
                                </button>
                                <button
                                    onClick={() => navigate("/orders")}
                                    className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition hover:bg-[#faf9f6]"
                                    style={{ borderColor: "#d4c5b0", color: "#1b4332" }}
                                >
                                    <ShoppingBag size={15} style={{ color: "#a48755" }} />
                                    <span>Orders ({orders.length})</span>
                                </button>
                            </div>
                        </div>

                        {/* ── 3 Core Stats Cards (Total Orders, Cart Items, Wishlist) ── */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {/* 1. Total Orders */}
                            <div
                                onClick={() => setActiveTab("orders")}
                                className={`group cursor-pointer rounded-2xl border p-5 transition-all duration-300 ${
                                    activeTab === "orders"
                                        ? "border-[#1b4332] bg-[#1b4332] text-white shadow-md"
                                        : "border-[#e8e0d5] bg-[#faf9f6] hover:border-[#1b4332]/30 hover:shadow-sm"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div
                                        className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                                            activeTab === "orders"
                                                ? "bg-white/20 text-white"
                                                : "bg-[#efe7da] text-[#1b4332]"
                                        }`}
                                    >
                                        <ShoppingBag size={20} />
                                    </div>
                                    <span
                                        className={`text-2xl font-bold font-serif ${
                                            activeTab === "orders" ? "text-white" : "text-[#1b4332]"
                                        }`}
                                    >
                                        {orders.length}
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <p
                                        className={`text-xs font-semibold uppercase tracking-wider ${
                                            activeTab === "orders" ? "text-[#e2ca9c]" : "text-[#a48755]"
                                        }`}
                                    >
                                        Total Orders
                                    </p>
                                    <p
                                        className={`text-xs mt-0.5 ${
                                            activeTab === "orders" ? "text-white/80" : "text-[#6b5e59]"
                                        }`}
                                    >
                                        {orders.length === 1 ? "1 order placed" : `${orders.length} orders placed`}
                                    </p>
                                </div>
                            </div>

                            {/* 2. Cart Items */}
                            <div
                                onClick={() => setActiveTab("cart")}
                                className={`group cursor-pointer rounded-2xl border p-5 transition-all duration-300 ${
                                    activeTab === "cart"
                                        ? "border-[#1b4332] bg-[#1b4332] text-white shadow-md"
                                        : "border-[#e8e0d5] bg-[#faf9f6] hover:border-[#1b4332]/30 hover:shadow-sm"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div
                                        className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                                            activeTab === "cart"
                                                ? "bg-white/20 text-white"
                                                : "bg-[#efe7da] text-[#1b4332]"
                                        }`}
                                    >
                                        <ShoppingCart size={20} />
                                    </div>
                                    <span
                                        className={`text-2xl font-bold font-serif ${
                                            activeTab === "cart" ? "text-white" : "text-[#1b4332]"
                                        }`}
                                    >
                                        {totalCartCount}
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <p
                                        className={`text-xs font-semibold uppercase tracking-wider ${
                                            activeTab === "cart" ? "text-[#e2ca9c]" : "text-[#a48755]"
                                        }`}
                                    >
                                        Cart Items
                                    </p>
                                    <p
                                        className={`text-xs mt-0.5 ${
                                            activeTab === "cart" ? "text-white/80" : "text-[#6b5e59]"
                                        }`}
                                    >
                                        ₹{totalCartAmount.toLocaleString("en-IN")} in bag
                                    </p>
                                </div>
                            </div>

                            {/* 3. Wishlist */}
                            <div
                                onClick={() => setActiveTab("wishlist")}
                                className={`group cursor-pointer rounded-2xl border p-5 transition-all duration-300 ${
                                    activeTab === "wishlist"
                                        ? "border-[#1b4332] bg-[#1b4332] text-white shadow-md"
                                        : "border-[#e8e0d5] bg-[#faf9f6] hover:border-[#1b4332]/30 hover:shadow-sm"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div
                                        className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                                            activeTab === "wishlist"
                                                ? "bg-white/20 text-white"
                                                : "bg-[#efe7da] text-[#1b4332]"
                                        }`}
                                    >
                                        <Heart size={20} />
                                    </div>
                                    <span
                                        className={`text-2xl font-bold font-serif ${
                                            activeTab === "wishlist" ? "text-white" : "text-[#1b4332]"
                                        }`}
                                    >
                                        {wishlistItems.length}
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <p
                                        className={`text-xs font-semibold uppercase tracking-wider ${
                                            activeTab === "wishlist" ? "text-[#e2ca9c]" : "text-[#a48755]"
                                        }`}
                                    >
                                        Wishlist
                                    </p>
                                    <p
                                        className={`text-xs mt-0.5 ${
                                            activeTab === "wishlist" ? "text-white/80" : "text-[#6b5e59]"
                                        }`}
                                    >
                                        {wishlistItems.length === 1 ? "1 saved item" : `${wishlistItems.length} saved items`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── User Information Cards Grid ── */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-serif text-lg font-bold text-[#1b4332]">
                            Account Details
                        </h2>
                        <span className="text-xs text-[#a48755]">Personal details</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* 1. Username */}
                        <div
                            className="flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm"
                            style={{ borderColor: "#e8e0d5" }}
                        >
                            <div
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                                style={{ background: "#f8f4ec" }}
                            >
                                <AtSign size={20} style={{ color: "#a48755" }} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#a48755" }}>
                                    Username
                                </p>
                                <p className="truncate text-sm font-semibold mt-0.5" style={{ color: "#1b4332" }}>
                                    {username}
                                </p>
                            </div>
                        </div>

                        {/* 2. Email Address */}
                        <div
                            className="flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm"
                            style={{ borderColor: "#e8e0d5" }}
                        >
                            <div
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                                style={{ background: "#f8f4ec" }}
                            >
                                <Mail size={20} style={{ color: "#a48755" }} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#a48755" }}>
                                    Email Address
                                </p>
                                <p className="truncate text-sm font-semibold mt-0.5" style={{ color: "#1b4332" }} title={email}>
                                    {email}
                                </p>
                            </div>
                        </div>

                        {/* 3. Phone Number */}
                        <div
                            className="flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm"
                            style={{ borderColor: "#e8e0d5" }}
                        >
                            <div
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                                style={{ background: "#f8f4ec" }}
                            >
                                <Phone size={20} style={{ color: "#a48755" }} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#a48755" }}>
                                    Phone Number
                                </p>
                                <p className="truncate text-sm font-semibold mt-0.5" style={{ color: "#1b4332" }}>
                                    {phone}
                                </p>
                            </div>
                        </div>

                        {/* 4. Full Name */}
                        <div
                            className="flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm"
                            style={{ borderColor: "#e8e0d5" }}
                        >
                            <div
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                                style={{ background: "#f8f4ec" }}
                            >
                                <User size={20} style={{ color: "#a48755" }} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#a48755" }}>
                                    Full Name
                                </p>
                                <p className="truncate text-sm font-semibold mt-0.5" style={{ color: "#1b4332" }}>
                                    {displayName}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Tabs Navigation ── */}
                <div className="mb-6 flex border-b border-[#e8e0d5]">
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={`border-b-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider transition ${
                            activeTab === "overview"
                                ? "border-[#1b4332] text-[#1b4332]"
                                : "border-transparent text-[#776c66] hover:text-[#1b4332]"
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`border-b-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider transition ${
                            activeTab === "orders"
                                ? "border-[#1b4332] text-[#1b4332]"
                                : "border-transparent text-[#776c66] hover:text-[#1b4332]"
                        }`}
                    >
                        Orders ({orders.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("cart")}
                        className={`border-b-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider transition ${
                            activeTab === "cart"
                                ? "border-[#1b4332] text-[#1b4332]"
                                : "border-transparent text-[#776c66] hover:text-[#1b4332]"
                        }`}
                    >
                        Cart ({totalCartCount})
                    </button>
                    <button
                        onClick={() => setActiveTab("wishlist")}
                        className={`border-b-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider transition ${
                            activeTab === "wishlist"
                                ? "border-[#1b4332] text-[#1b4332]"
                                : "border-transparent text-[#776c66] hover:text-[#1b4332]"
                        }`}
                    >
                        Wishlist ({wishlistItems.length})
                    </button>
                </div>

                {/* ── TAB CONTENT: OVERVIEW ── */}
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        {/* Recent Orders Preview */}
                        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm" style={{ borderColor: "#e8e0d5" }}>
                            <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "#e8e0d5" }}>
                                <div>
                                    <h3 className="font-serif font-bold text-[#1b4332]">Recent Orders</h3>
                                    <p className="text-xs text-[#6b5e59]">Your latest purchases and status</p>
                                </div>
                                <button
                                    onClick={() => setActiveTab("orders")}
                                    className="text-xs font-semibold uppercase tracking-wider text-[#a48755] hover:underline"
                                >
                                    View All ({orders.length}) →
                                </button>
                            </div>

                            {orders.length === 0 ? (
                                <div className="flex flex-col items-center py-10 text-center">
                                    <Package size={32} className="mb-2 text-[#a48755]" />
                                    <p className="text-sm font-semibold text-[#1b4332]">No orders placed yet</p>
                                    <p className="text-xs text-[#6b5e59] mt-1">Browse our collection and find your perfect jewellery.</p>
                                    <button
                                        onClick={() => navigate("/shop")}
                                        className="mt-4 rounded-xl px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white"
                                        style={{ background: "#1b4332" }}
                                    >
                                        Explore Shop
                                    </button>
                                </div>
                            ) : (
                                <div className="divide-y divide-[#f0e8dc]">
                                    {orders.slice(0, 3).map((order) => {
                                        const statusStyle = getStatusStyle(order.status);
                                        const total = order.total_amount ?? order.total ?? 0;
                                        const items = order.items || order.order_items || [];
                                        return (
                                            <div key={order.id} className="flex items-center justify-between gap-4 px-6 py-4">
                                                <div className="min-w-0">
                                                    <p className="font-medium text-sm text-[#1b4332]">
                                                        Order #{order.order_number || order.id}
                                                    </p>
                                                    <p className="text-xs text-[#6b5e59] mt-0.5">
                                                        {items.length} item{items.length !== 1 ? "s" : ""} · ₹{Number(total).toLocaleString("en-IN")}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
                                                        style={{
                                                            background: statusStyle.bg,
                                                            color: statusStyle.text,
                                                            border: `1px solid ${statusStyle.border}`,
                                                        }}
                                                    >
                                                        {order.status || "pending"}
                                                    </span>
                                                    <button
                                                        onClick={() => navigate(`/orders/${order.order_number || order.id}`)}
                                                        className="text-xs font-medium text-[#a48755] hover:underline"
                                                    >
                                                        Details
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Cart & Wishlist Preview Grid */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Cart Preview */}
                            <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: "#e8e0d5" }}>
                                <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "#e8e0d5" }}>
                                    <div className="flex items-center gap-2">
                                        <ShoppingCart size={18} style={{ color: "#a48755" }} />
                                        <h3 className="font-serif font-bold text-[#1b4332]">Shopping Bag</h3>
                                    </div>
                                    <button
                                        onClick={() => navigate("/cart")}
                                        className="text-xs font-semibold uppercase tracking-wider text-[#a48755] hover:underline"
                                    >
                                        Go to Cart →
                                    </button>
                                </div>
                                <div className="pt-4">
                                    {cartItems.length === 0 ? (
                                        <p className="py-6 text-center text-xs text-[#6b5e59]">Your bag is currently empty.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {cartItems.slice(0, 3).map((item) => {
                                                const product = item.product || {};
                                                return (
                                                    <div key={item.id} className="flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#efe7da]">
                                                                {product.main_image ? (
                                                                    <img
                                                                        src={formatImageUrl(product.main_image)}
                                                                        alt={product.name}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full w-full items-center justify-center text-xs text-[#a48755]">
                                                                        Pearl
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="truncate text-xs font-semibold text-[#1b4332]">
                                                                    {product.name || "Jewellery"}
                                                                </p>
                                                                <p className="text-[11px] text-[#6b5e59]">
                                                                    Qty: {item.quantity} · ₹{Number(product.final_price ?? product.price ?? 0).toLocaleString("en-IN")}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Wishlist Preview */}
                            <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: "#e8e0d5" }}>
                                <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "#e8e0d5" }}>
                                    <div className="flex items-center gap-2">
                                        <Heart size={18} style={{ color: "#a48755" }} />
                                        <h3 className="font-serif font-bold text-[#1b4332]">Saved Wishlist</h3>
                                    </div>
                                    <button
                                        onClick={() => navigate("/wishlist")}
                                        className="text-xs font-semibold uppercase tracking-wider text-[#a48755] hover:underline"
                                    >
                                        Go to Wishlist →
                                    </button>
                                </div>
                                <div className="pt-4">
                                    {wishlistItems.length === 0 ? (
                                        <p className="py-6 text-center text-xs text-[#6b5e59]">No saved items in wishlist.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {wishlistItems.slice(0, 3).map((item) => (
                                                <div key={item.id} className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#efe7da]">
                                                            {item.image ? (
                                                                <img
                                                                    src={formatImageUrl(item.image)}
                                                                    alt={item.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center text-xs text-[#a48755]">
                                                                    Item
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="truncate text-xs font-semibold text-[#1b4332]">
                                                                {item.name}
                                                            </p>
                                                            <p className="text-[11px] text-[#a48755]">
                                                                ₹{Number(item.price || 0).toLocaleString("en-IN")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB CONTENT: ORDERS ── */}
                {activeTab === "orders" && (
                    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm" style={{ borderColor: "#e8e0d5" }}>
                        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "#e8e0d5" }}>
                            <div>
                                <h3 className="font-serif font-bold text-[#1b4332]">Total Orders ({orders.length})</h3>
                                <p className="text-xs text-[#6b5e59]">Complete history of all your orders</p>
                            </div>
                            <button
                                onClick={() => navigate("/shop")}
                                className="rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white"
                                style={{ background: "#1b4332" }}
                            >
                                Shop More
                            </button>
                        </div>

                        {orders.length === 0 ? (
                            <div className="flex flex-col items-center py-16 text-center">
                                <Package size={40} className="mb-3 text-[#a48755]" />
                                <h4 className="font-serif text-lg font-bold text-[#1b4332]">No Orders Yet</h4>
                                <p className="text-xs text-[#6b5e59] mt-1 max-w-sm">
                                    You have not placed any orders yet. Discover timeless pearls and jewels in our shop.
                                </p>
                                <button
                                    onClick={() => navigate("/shop")}
                                    className="mt-5 rounded-xl px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm"
                                    style={{ background: "#1b4332" }}
                                >
                                    Browse Shop
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-[#f0e8dc]">
                                {orders.map((order) => {
                                    const statusStyle = getStatusStyle(order.status);
                                    const total = order.total_amount ?? order.total ?? 0;
                                    const items = order.items || order.order_items || [];
                                    const orderDate = order.created_at
                                        ? new Date(order.created_at).toLocaleDateString("en-IN", {
                                              year: "numeric",
                                              month: "short",
                                              day: "numeric",
                                          })
                                        : "Recent";

                                    return (
                                        <div key={order.id} className="p-6 transition hover:bg-[#faf9f6]">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-serif text-base font-bold text-[#1b4332]">
                                                            Order #{order.order_number || order.id}
                                                        </span>
                                                        <span
                                                            className="rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-wider"
                                                            style={{
                                                                background: statusStyle.bg,
                                                                color: statusStyle.text,
                                                                border: `1px solid ${statusStyle.border}`,
                                                            }}
                                                        >
                                                            {order.status || "pending"}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-[#6b5e59] mt-1">
                                                        Placed on {orderDate} · {items.length} item{items.length !== 1 ? "s" : ""}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end gap-4">
                                                    <div className="text-right">
                                                        <p className="text-xs text-[#a48755] uppercase tracking-wider">Total</p>
                                                        <p className="text-base font-bold text-[#1b4332]">
                                                            ₹{Number(total).toLocaleString("en-IN")}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => navigate(`/orders/${order.order_number || order.id}`)}
                                                        className="flex items-center gap-1 rounded-xl border border-[#d4c5b0] px-3.5 py-2 text-xs font-semibold text-[#1b4332] hover:bg-white"
                                                    >
                                                        <span>View</span>
                                                        <ChevronRight size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ── TAB CONTENT: CART ── */}
                {activeTab === "cart" && (
                    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm" style={{ borderColor: "#e8e0d5" }}>
                        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "#e8e0d5" }}>
                            <div>
                                <h3 className="font-serif font-bold text-[#1b4332]">
                                    Cart Items ({totalCartCount})
                                </h3>
                                <p className="text-xs text-[#6b5e59]">Items ready for checkout</p>
                            </div>
                            {cartItems.length > 0 && (
                                <button
                                    onClick={() => navigate("/checkout")}
                                    className="rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white"
                                    style={{ background: "#1b4332" }}
                                >
                                    Proceed to Checkout
                                </button>
                            )}
                        </div>

                        {cartItems.length === 0 ? (
                            <div className="flex flex-col items-center py-16 text-center">
                                <ShoppingCart size={40} className="mb-3 text-[#a48755]" />
                                <h4 className="font-serif text-lg font-bold text-[#1b4332]">Your Cart is Empty</h4>
                                <p className="text-xs text-[#6b5e59] mt-1 max-w-sm">
                                    Add your favorite jewellery to your bag and they will appear here.
                                </p>
                                <button
                                    onClick={() => navigate("/shop")}
                                    className="mt-5 rounded-xl px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white"
                                    style={{ background: "#1b4332" }}
                                >
                                    Explore Jewellery
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-[#f0e8dc]">
                                {cartItems.map((item) => {
                                    const product = item.product || {};
                                    const price = Number(product.final_price ?? product.price ?? 0);
                                    const itemSubtotal = price * Number(item.quantity || 1);

                                    return (
                                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#efe7da]">
                                                    {product.main_image ? (
                                                        <img
                                                            src={formatImageUrl(product.main_image)}
                                                            alt={product.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-xs text-[#a48755]">
                                                            Jewellery
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-serif font-bold text-[#1b4332]">
                                                        {product.name || "Product"}
                                                    </h4>
                                                    <p className="text-xs text-[#a48755] mt-0.5">
                                                        ₹{price.toLocaleString("en-IN")} each
                                                    </p>
                                                    <p className="text-xs text-[#6b5e59] mt-0.5">
                                                        Quantity: <span className="font-semibold text-[#1b4332]">{item.quantity}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                                                <div className="text-right">
                                                    <p className="text-xs text-[#a48755] uppercase tracking-wider">Subtotal</p>
                                                    <p className="font-bold text-[#1b4332] text-base">
                                                        ₹{itemSubtotal.toLocaleString("en-IN")}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => navigate("/cart")}
                                                    className="rounded-xl border border-[#d4c5b0] px-3.5 py-2 text-xs font-semibold text-[#1b4332] hover:bg-[#faf9f6]"
                                                >
                                                    Modify in Cart
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}

                                <div className="flex items-center justify-between bg-[#faf9f6] p-6">
                                    <div>
                                        <p className="text-xs text-[#a48755] uppercase tracking-wider">Total Cart Value</p>
                                        <p className="font-serif text-xl font-bold text-[#1b4332]">
                                            ₹{totalCartAmount.toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate("/cart")}
                                        className="rounded-xl px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm"
                                        style={{ background: "#1b4332" }}
                                    >
                                        Open Cart Page
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── TAB CONTENT: WISHLIST ── */}
                {activeTab === "wishlist" && (
                    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm" style={{ borderColor: "#e8e0d5" }}>
                        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "#e8e0d5" }}>
                            <div>
                                <h3 className="font-serif font-bold text-[#1b4332]">
                                    Wishlist ({wishlistItems.length})
                                </h3>
                                <p className="text-xs text-[#6b5e59]">Your saved items to purchase later</p>
                            </div>
                            <button
                                onClick={() => navigate("/wishlist")}
                                className="rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white"
                                style={{ background: "#1b4332" }}
                            >
                                Full Wishlist Page
                            </button>
                        </div>

                        {wishlistItems.length === 0 ? (
                            <div className="flex flex-col items-center py-16 text-center">
                                <Heart size={40} className="mb-3 text-[#a48755]" />
                                <h4 className="font-serif text-lg font-bold text-[#1b4332]">Your Wishlist is Empty</h4>
                                <p className="text-xs text-[#6b5e59] mt-1 max-w-sm">
                                    Click the heart icon on any jewellery piece to save it to your wishlist.
                                </p>
                                <button
                                    onClick={() => navigate("/shop")}
                                    className="mt-5 rounded-xl px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white"
                                    style={{ background: "#1b4332" }}
                                >
                                    Browse Jewels
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                                {wishlistItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e8e0d5] bg-[#faf9f6] p-4 transition hover:shadow-md"
                                    >
                                        <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-xl bg-white">
                                            {item.image ? (
                                                <img
                                                    src={formatImageUrl(item.image)}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-sm text-[#a48755]">
                                                    Pearloraa
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#a48755]">
                                                {item.category}
                                            </p>
                                            <h4 className="font-serif text-sm font-bold text-[#1b4332] truncate">
                                                {item.name}
                                            </h4>
                                            <p className="mt-1 text-sm font-semibold text-[#1b4332]">
                                                ₹{Number(item.price).toLocaleString("en-IN")}
                                            </p>
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() => navigate(`/product/${item.id}`)}
                                                className="flex-1 rounded-xl border border-[#1b4332] py-2 text-center text-xs font-semibold uppercase tracking-wider text-[#1b4332] transition hover:bg-[#1b4332] hover:text-white"
                                            >
                                                View Product
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Sign Out Footer Banner ── */}
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-[#e8e0d5] bg-white p-6 shadow-sm">
                    <div>
                        <h4 className="font-serif font-bold text-[#1b4332]">Need to switch accounts?</h4>
                        <p className="text-xs text-[#6b5e59]">Sign out from this device safely at any time.</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/50 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-red-600 transition hover:bg-red-100"
                    >
                        <LogOut size={16} />
                        <span>Sign Out of Account</span>
                    </button>
                </div>
            </main>
        </div>
    );
}
