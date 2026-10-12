import { useEffect, useState } from "react";
import {
    Package,
    Layers,
    Users,
    ShoppingBag,
    RefreshCw,
    AlertCircle,
    ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

export default function AdminDashboard() {
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        total_products: 0,
        total_categories: 0,
        total_customers: 0,
        total_orders: 0,
    });

    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("admin_access");

            if (!token) {
                setError("Admin authentication required.");
                return;
            }

            const response = await fetch(`${API_URL}/api/users/admin/dashboard/`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    setError("Your admin session has expired. Please login again.");
                } else if (response.status === 403) {
                    setError("You do not have permission to access this dashboard.");
                } else {
                    setError("Failed to load dashboard data.");
                }
                return;
            }

            const data = await response.json();

            setStats({
                total_products: data.total_products ?? 0,
                total_categories: data.total_categories ?? 0,
                total_customers: data.total_customers ?? 0,
                total_orders: data.total_orders ?? 0,
            });

            // Fetch recent orders
            const ordersRes = await fetch(`${API_URL}/api/orders/admin/orders/`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (ordersRes.ok) {
                const ordersData = await ordersRes.json();
                const orders = ordersData.results || ordersData;
                setRecentOrders(Array.isArray(orders) ? orders.slice(0, 5) : []);
            }
        } catch (err) {
            console.error("Dashboard error:", err);
            setError("Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void fetchDashboard();
        }, 0);
        return () => window.clearTimeout(timer);
    }, []);

    // ──── Helper ────────────────────────────────────────────────────
    const adminUser = (() => {
        try {
            return JSON.parse(localStorage.getItem("admin_user")) || {};
        } catch {
            return {};
        }
    })();

    const greeting = (() => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 17) return "Good afternoon";
        return "Good evening";
    })();

    const adminName =
        adminUser.first_name
            ? `${adminUser.first_name} ${adminUser.last_name || ""}`.trim()
            : adminUser.username || "Admin";

    const formatDate = (date) => {
        if (!date) return "—";
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getOrderStatus = (order) =>
        (order.status || order.order_status || "pending").toLowerCase();

    const getStatusStyle = (status) => {
        switch (status) {
            case "pending":     return { bg: "#fef9ee", text: "#b45309" };
            case "confirmed":   return { bg: "#eff6ff", text: "#1d4ed8" };
            case "processing":  return { bg: "#f5f3ff", text: "#6d28d9" };
            case "shipped":     return { bg: "#eef2ff", text: "#4338ca" };
            case "delivered":
            case "completed":   return { bg: "#f0fdf4", text: "#166534" };
            case "cancelled":
            case "canceled":    return { bg: "#fef2f2", text: "#dc2626" };
            default:            return { bg: "#f3f4f6", text: "#6b7280" };
        }
    };

    const getCustomerName = (order) => {
        if (order.customer_name) return order.customer_name;
        if (order.user?.first_name || order.user?.last_name)
            return `${order.user?.first_name || ""} ${order.user?.last_name || ""}`.trim();
        if (order.user?.username) return order.user.username;
        return "Customer";
    };

    const getOrderTotal = (order) =>
        order.total_amount ?? order.total ?? order.grand_total ?? 0;

    // ──── Stat Cards ──────────────────────────────────────────────
    const statCards = [
        {
            title: "Total Products",
            value: stats.total_products,
            icon: Package,
            description: "In your catalogue",
            link: "/admin/products",
        },
        {
            title: "Categories",
            value: stats.total_categories,
            icon: Layers,
            description: "Active categories",
            link: "/admin/categories",
        },
        {
            title: "Customers",
            value: stats.total_customers,
            icon: Users,
            description: "Registered users",
            link: "/admin/customers",
        },
        {
            title: "Total Orders",
            value: stats.total_orders,
            icon: ShoppingBag,
            description: "All time orders",
            link: "/admin/orders",
        },
    ];

    return (
        <div>
            {/* ── Page Header ── */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "#a48755", letterSpacing: "0.18em" }}>
                        Overview
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold" style={{ color: "#1b4332" }}>
                        {greeting}, {adminName} 👋
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: "#493d38" }}>
                        Here's what's happening with your store today.
                    </p>
                </div>

                <button
                    onClick={fetchDashboard}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ borderColor: "#d4c5b0", color: "#1b4332", background: "transparent" }}
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* ── Error ── */}
            {error && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {/* ── Stat Cards ── */}
            <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.title}
                            className="cursor-pointer rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md"
                            style={{ borderColor: "#e8e0d5" }}
                            onClick={() => navigate(card.link)}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#a48755", letterSpacing: "0.12em" }}>
                                        {card.title}
                                    </p>
                                    <h2 className="mt-2 text-4xl font-bold" style={{ color: "#1b4332" }}>
                                        {loading ? "—" : card.value}
                                    </h2>
                                    <p className="mt-2 text-xs" style={{ color: "#493d38" }}>
                                        {card.description}
                                    </p>
                                </div>

                                <div
                                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                                    style={{ background: "#f8f4ec" }}
                                >
                                    <Icon size={22} style={{ color: "#1b4332" }} />
                                </div>
                            </div>

                            <div className="mt-4 flex items-center gap-1" style={{ color: "#a48755" }}>
                                <ArrowUpRight size={13} />
                                <span className="text-xs font-medium">View all</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Bottom Grid ── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Recent Orders */}
                <div
                    className="rounded-2xl border bg-white shadow-sm lg:col-span-2"
                    style={{ borderColor: "#e8e0d5" }}
                >
                    <div
                        className="flex items-center justify-between border-b px-6 py-5"
                        style={{ borderColor: "#e8e0d5" }}
                    >
                        <div>
                            <h2 className="font-semibold" style={{ color: "#1b4332" }}>
                                Recent Orders
                            </h2>
                            <p className="mt-0.5 text-xs" style={{ color: "#493d38" }}>
                                Latest orders from your customers
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/admin/orders")}
                            className="flex items-center gap-1 text-xs font-medium transition hover:underline"
                            style={{ color: "#a48755" }}
                        >
                            View all <ArrowUpRight size={13} />
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16 text-sm" style={{ color: "#a48755" }}>
                            <RefreshCw size={18} className="mr-2 animate-spin" />
                            Loading orders...
                        </div>
                    ) : recentOrders.length === 0 ? (
                        <div className="py-16 text-center">
                            <ShoppingBag size={36} className="mx-auto" style={{ color: "#d4c5b0" }} />
                            <p className="mt-3 text-sm" style={{ color: "#493d38" }}>
                                No orders yet.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr style={{ background: "#faf9f6" }}>
                                        <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#a48755" }}>
                                            Order
                                        </th>
                                        <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#a48755" }}>
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#a48755" }}>
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#a48755" }}>
                                            Total
                                        </th>
                                        <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#a48755" }}>
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => {
                                        const status = getOrderStatus(order);
                                        const style = getStatusStyle(status);
                                        return (
                                            <tr
                                                key={order.id}
                                                className="border-t transition hover:bg-gray-50"
                                                style={{ borderColor: "#f0e8dc" }}
                                            >
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-semibold" style={{ color: "#1b4332" }}>
                                                        #{order.order_number || order.id}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm" style={{ color: "#493d38" }}>
                                                        {getCustomerName(order)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm" style={{ color: "#493d38" }}>
                                                        {formatDate(order.created_at || order.created)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-semibold" style={{ color: "#1b4332" }}>
                                                        ₹{Number(getOrderTotal(order)).toLocaleString("en-IN")}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize"
                                                        style={{ background: style.bg, color: style.text }}
                                                    >
                                                        {status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Quick Stats Panel */}
                <div
                    className="rounded-2xl border bg-white shadow-sm"
                    style={{ borderColor: "#e8e0d5" }}
                >
                    <div
                        className="border-b px-6 py-5"
                        style={{ borderColor: "#e8e0d5" }}
                    >
                        <h2 className="font-semibold" style={{ color: "#1b4332" }}>
                            Store Summary
                        </h2>
                        <p className="mt-0.5 text-xs" style={{ color: "#493d38" }}>
                            At a glance
                        </p>
                    </div>

                    <div className="p-6 space-y-0">
                        {[
                            { label: "Products in Catalogue", value: stats.total_products, icon: Package },
                            { label: "Product Categories", value: stats.total_categories, icon: Layers },
                            { label: "Registered Customers", value: stats.total_customers, icon: Users },
                            { label: "Total Orders Placed", value: stats.total_orders, icon: ShoppingBag },
                        ].map((item, i, arr) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.label}>
                                    <div className="flex items-center justify-between py-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="flex h-8 w-8 items-center justify-center rounded-lg"
                                                style={{ background: "#f8f4ec" }}
                                            >
                                                <Icon size={16} style={{ color: "#1b4332" }} />
                                            </div>
                                            <span className="text-sm" style={{ color: "#493d38" }}>
                                                {item.label}
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold" style={{ color: "#1b4332" }}>
                                            {loading ? "—" : item.value}
                                        </span>
                                    </div>
                                    {i < arr.length - 1 && (
                                        <div className="h-px" style={{ background: "#f0e8dc" }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Quick actions */}
                    <div
                        className="border-t p-4 space-y-2"
                        style={{ borderColor: "#e8e0d5" }}
                    >
                        <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "#a48755" }}>
                            Quick Actions
                        </p>
                        <button
                            onClick={() => navigate("/admin/products/add")}
                            className="w-full rounded-xl py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                            style={{ background: "#1b4332" }}
                        >
                            + Add New Product
                        </button>
                        <button
                            onClick={() => navigate("/admin/categories")}
                            className="w-full rounded-xl border py-2.5 text-sm font-medium transition hover:bg-gray-50"
                            style={{ borderColor: "#d4c5b0", color: "#1b4332" }}
                        >
                            Manage Categories
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
