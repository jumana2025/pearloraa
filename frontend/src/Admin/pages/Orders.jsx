import { useEffect, useState } from "react";
import {
    Search,
    RefreshCw,
    ShoppingBag,
    Eye,
    X,
    User,
    Mail,
    Phone,
    MapPin,
    Package,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError("");
            const token = localStorage.getItem("admin_access");
            if (!token) { setError("Admin authentication required."); return; }

            const res = await fetch(`${API_URL}/api/orders/admin/orders/`, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });

            if (!res.ok) {
                if (res.status === 401) setError("Session expired. Please login again.");
                else if (res.status === 403) setError("Permission denied.");
                else setError("Failed to load orders.");
                return;
            }

            const data = await res.json();
            setOrders(data.results || data);
        } catch {
            setError("Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void fetchOrders();
        }, 0);
        return () => window.clearTimeout(timer);
    }, []);

    // ─────────────────── helpers ───────────────────────────────────
    const formatDate = (date) => {
        if (!date) return "—";
        return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    };

    const formatDateTime = (date) => {
        if (!date) return "—";
        return new Date(date).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    const getCustomerName = (order) => {
        if (order.customer_name) return order.customer_name;
        if (order.user?.first_name || order.user?.last_name)
            return `${order.user?.first_name || ""} ${order.user?.last_name || ""}`.trim();
        if (order.user?.username) return order.user.username;
        if (order.customer?.username) return order.customer.username;
        return "Guest Customer";
    };

    const getCustomerEmail = (order) =>
        order.customer_email || order.user_email || order.user?.email || order.customer?.email || "—";

    const getCustomerPhone = (order) =>
        order.phone || order.customer_phone || order.user?.profile?.phone || "—";

    const getOrderTotal = (order) =>
        order.total_amount ?? order.total ?? order.grand_total ?? order.amount ?? 0;

    const getOrderStatus = (order) =>
        (order.status || order.order_status || "pending").toLowerCase();

    const getOrderItems = (order) =>
        order.items || order.order_items || order.products || [];

    const getItemName = (item) =>
        item.product_name || item.name || item.product?.name || "Product";

    const getItemQuantity = (item) => item.quantity ?? 1;

    const getItemPrice = (item) =>
        item.price ?? item.product_price ?? item.product?.price ?? 0;

    const STATUS_OPTIONS = ["pending", "confirmed", "processing", "shipped", "delivered", "completed", "cancelled"];

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

    // ─── update order status ───────────────────────────────────────
    const handleStatusChange = async (orderId, newStatus) => {
        try {
            setUpdatingStatus(true);
            const token = localStorage.getItem("admin_access");
            const res = await fetch(`${API_URL}/api/orders/admin/orders/${orderId}/`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                setOrders((prev) =>
                    prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
                );
                if (selectedOrder?.id === orderId) {
                    setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
                }
            }
        } catch {
            // silent
        } finally {
            setUpdatingStatus(false);
        }
    };

    // ─── filter ────────────────────────────────────────────────────
    const filteredOrders = orders.filter((order) => {
        const q = search.toLowerCase();
        const matches =
            String(order.id || "").includes(q) ||
            String(order.order_number || "").includes(q) ||
            getCustomerName(order).toLowerCase().includes(q) ||
            getCustomerEmail(order).toLowerCase().includes(q);
        const statusMatch = statusFilter === "all" || getOrderStatus(order) === statusFilter;
        return matches && statusMatch;
    });

    return (
        <div>
            {/* Header */}
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "#a48755", letterSpacing: "0.18em" }}>
                        Sales
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold" style={{ color: "#1b4332" }}>
                        Orders
                    </h1>
                    <p className="mt-0.5 text-sm" style={{ color: "#493d38" }}>
                        View and manage customer orders
                    </p>
                </div>

                <button
                    onClick={fetchOrders}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:bg-white disabled:opacity-50"
                    style={{ borderColor: "#d4c5b0", color: "#1b4332" }}
                >
                    <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="mb-6 flex flex-col gap-3 lg:flex-row">
                <div className="relative flex-1 max-w-sm">
                    <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#a48755" }} />
                    <input
                        type="text"
                        placeholder="Search by order ID, customer, email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm transition"
                        style={{ borderColor: "#d4c5b0", background: "#fff", color: "#1b4332" }}
                        onFocus={(e) => (e.target.style.borderColor = "#1b4332")}
                        onBlur={(e) => (e.target.style.borderColor = "#d4c5b0")}
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-xl border px-4 py-2.5 text-sm transition"
                    style={{ borderColor: "#d4c5b0", background: "#fff", color: "#1b4332" }}
                >
                    <option value="all">All Status</option>
                    {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s} className="capitalize">
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm" style={{ borderColor: "#e8e0d5" }}>
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-sm" style={{ color: "#a48755" }}>
                        <RefreshCw size={18} className="mr-2 animate-spin" />
                        Loading orders...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead style={{ background: "#faf9f6" }}>
                                <tr>
                                    {["Order", "Customer", "Date", "Items", "Total", "Status", "Action"].map((h, i) => (
                                        <th
                                            key={h}
                                            className={`px-5 py-4 text-xs font-semibold uppercase tracking-wider ${i === 6 ? "text-right" : "text-left"}`}
                                            style={{ color: "#a48755", letterSpacing: "0.1em" }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-5 py-20 text-center">
                                            <ShoppingBag size={36} className="mx-auto mb-3" style={{ color: "#d4c5b0" }} />
                                            <p className="text-sm" style={{ color: "#493d38" }}>No orders found.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => {
                                        const status = getOrderStatus(order);
                                        const style = getStatusStyle(status);
                                        const items = getOrderItems(order);
                                        return (
                                            <tr
                                                key={order.id}
                                                className="border-t transition hover:bg-[#fdfaf7]"
                                                style={{ borderColor: "#f0e8dc" }}
                                            >
                                                {/* Order */}
                                                <td className="px-5 py-4">
                                                    <p className="text-sm font-semibold" style={{ color: "#1b4332" }}>
                                                        #{order.order_number || order.id}
                                                    </p>
                                                    <p className="text-xs" style={{ color: "#a48755" }}>
                                                        ID: {order.id}
                                                    </p>
                                                </td>

                                                {/* Customer */}
                                                <td className="px-5 py-4">
                                                    <p className="text-sm font-medium" style={{ color: "#1b4332" }}>
                                                        {getCustomerName(order)}
                                                    </p>
                                                    <p className="text-xs" style={{ color: "#493d38" }}>
                                                        {getCustomerEmail(order)}
                                                    </p>
                                                </td>

                                                {/* Date */}
                                                <td className="px-5 py-4">
                                                    <span className="text-sm" style={{ color: "#493d38" }}>
                                                        {formatDate(order.created_at || order.created || order.date)}
                                                    </span>
                                                </td>

                                                {/* Items */}
                                                <td className="px-5 py-4">
                                                    <span className="text-sm" style={{ color: "#493d38" }}>
                                                        {items.length || order.item_count || 0} item{(items.length || order.item_count || 0) !== 1 ? "s" : ""}
                                                    </span>
                                                </td>

                                                {/* Total */}
                                                <td className="px-5 py-4">
                                                    <span className="text-sm font-semibold" style={{ color: "#1b4332" }}>
                                                        ₹{Number(getOrderTotal(order)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-5 py-4">
                                                    <span
                                                        className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize"
                                                        style={{ background: style.bg, color: style.text }}
                                                    >
                                                        {status}
                                                    </span>
                                                </td>

                                                {/* Action */}
                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end">
                                                        <button
                                                            onClick={() => setSelectedOrder(order)}
                                                            className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition hover:bg-gray-50"
                                                            style={{ borderColor: "#d4c5b0", color: "#1b4332" }}
                                                        >
                                                            <Eye size={13} />
                                                            View
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && (
                    <div className="border-t px-5 py-4" style={{ borderColor: "#e8e0d5" }}>
                        <p className="text-xs" style={{ color: "#a48755" }}>
                            Showing {filteredOrders.length} of {orders.length} order{orders.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div
                        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
                    >
                        {/* Modal Header */}
                        <div
                            className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-5"
                            style={{ borderColor: "#e8e0d5" }}
                        >
                            <div>
                                <h2 className="text-lg font-semibold" style={{ color: "#1b4332" }}>
                                    Order #{selectedOrder.order_number || selectedOrder.id}
                                </h2>
                                <p className="mt-0.5 text-xs" style={{ color: "#a48755" }}>
                                    {formatDateTime(selectedOrder.created_at || selectedOrder.created)}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-gray-100"
                                style={{ color: "#493d38" }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Customer Info */}
                            <div>
                                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: "#a48755", letterSpacing: "0.12em" }}>
                                    Customer Information
                                </h3>
                                <div
                                    className="grid gap-4 rounded-2xl border p-4 sm:grid-cols-2"
                                    style={{ borderColor: "#e8e0d5", background: "#faf9f6" }}
                                >
                                    <div className="flex gap-3">
                                        <User size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#a48755" }} />
                                        <div>
                                            <p className="text-xs" style={{ color: "#a48755" }}>Name</p>
                                            <p className="text-sm" style={{ color: "#1b4332" }}>
                                                {getCustomerName(selectedOrder)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Mail size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#a48755" }} />
                                        <div>
                                            <p className="text-xs" style={{ color: "#a48755" }}>Email</p>
                                            <p className="break-all text-sm" style={{ color: "#1b4332" }}>
                                                {getCustomerEmail(selectedOrder)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Phone size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#a48755" }} />
                                        <div>
                                            <p className="text-xs" style={{ color: "#a48755" }}>Phone</p>
                                            <p className="text-sm" style={{ color: "#1b4332" }}>
                                                {getCustomerPhone(selectedOrder)}
                                            </p>
                                        </div>
                                    </div>
                                    {(selectedOrder.address || selectedOrder.shipping_address) && (
                                        <div className="flex gap-3">
                                            <MapPin size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#a48755" }} />
                                            <div>
                                                <p className="text-xs" style={{ color: "#a48755" }}>Address</p>
                                                <p className="text-sm" style={{ color: "#1b4332" }}>
                                                    {selectedOrder.address || selectedOrder.shipping_address}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: "#a48755", letterSpacing: "0.12em" }}>
                                    Order Items
                                </h3>
                                <div className="overflow-hidden rounded-2xl border" style={{ borderColor: "#e8e0d5" }}>
                                    {getOrderItems(selectedOrder).length > 0 ? (
                                        getOrderItems(selectedOrder).map((item, index) => (
                                            <div
                                                key={item.id || index}
                                                className="flex items-center justify-between gap-4 p-4 border-b last:border-b-0"
                                                style={{ borderColor: "#f0e8dc" }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
                                                        style={{ background: "#f8f4ec" }}
                                                    >
                                                        <Package size={18} style={{ color: "#a48755" }} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium" style={{ color: "#1b4332" }}>
                                                            {getItemName(item)}
                                                        </p>
                                                        <p className="text-xs" style={{ color: "#a48755" }}>
                                                            Qty: {getItemQuantity(item)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-semibold" style={{ color: "#1b4332" }}>
                                                    ₹{Number(getItemPrice(item)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="p-6 text-center text-sm" style={{ color: "#493d38" }}>
                                            No item details available.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Summary + Status */}
                            <div
                                className="rounded-2xl border p-5"
                                style={{ borderColor: "#e8e0d5", background: "#faf9f6" }}
                            >
                                {/* Status update */}
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="text-sm font-medium" style={{ color: "#493d38" }}>
                                        Order Status
                                    </span>
                                    <select
                                        value={getOrderStatus(selectedOrder)}
                                        onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                                        disabled={updatingStatus}
                                        className="rounded-xl border px-3 py-1.5 text-xs font-medium capitalize transition disabled:opacity-50"
                                        style={{ borderColor: "#d4c5b0", color: "#1b4332", background: "#fff" }}
                                    >
                                        {STATUS_OPTIONS.map((s) => (
                                            <option key={s} value={s} className="capitalize">
                                                {s.charAt(0).toUpperCase() + s.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div
                                    className="flex items-center justify-between border-t pt-4"
                                    style={{ borderColor: "#e8e0d5" }}
                                >
                                    <span className="font-semibold" style={{ color: "#1b4332" }}>
                                        Order Total
                                    </span>
                                    <span className="text-xl font-bold" style={{ color: "#1b4332" }}>
                                        ₹{Number(getOrderTotal(selectedOrder)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t px-6 py-4" style={{ borderColor: "#e8e0d5" }}>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="w-full rounded-xl py-3 text-sm font-medium text-white transition hover:opacity-90"
                                style={{ background: "#1b4332" }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
