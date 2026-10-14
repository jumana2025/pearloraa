import React, { useEffect, useState } from "react";
import {
    Search,
    RefreshCw,
    Users,
    Eye,
    X,
    Mail,
    Phone,
    CalendarDays,
    ShieldCheck,
    ShieldOff,
} from "lucide-react";
import { API_ORIGIN } from "../../api/axios";

const API_URL = API_ORIGIN;

export default function Customers() {
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerActivity, setCustomerActivity] = useState(null);
    const [activityLoading, setActivityLoading] = useState(false);
    const [activityError, setActivityError] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            setError("");
            const token = localStorage.getItem("admin_access");
            if (!token) { setError("Admin authentication required."); return; }

            const res = await fetch(`${API_URL}/api/users/admin/customers/`, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });

            if (!res.ok) {
                if (res.status === 401) setError("Session expired. Please login again.");
                else if (res.status === 403) setError("You do not have permission.");
                else setError("Failed to load customers.");
                return;
            }

            const data = await res.json();
            setCustomers(data.results || data);
        } catch {
            setError("Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        Promise.resolve().then(fetchCustomers);
    }, []);

    const viewCustomer = async (customer) => {
        setSelectedCustomer(customer);
        setCustomerActivity(null);
        setActivityError("");
        setActivityLoading(true);

        try {
            const token = localStorage.getItem("admin_access");
            const response = await fetch(
                `${API_URL}/api/users/admin/customers/${customer.id}/activity/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || "Unable to load customer activity.");
            }

            setCustomerActivity(data);
        } catch (activityFetchError) {
            setActivityError(
                activityFetchError.message || "Unable to load customer activity."
            );
        } finally {
            setActivityLoading(false);
        }
    };

    const filtered = customers.filter((c) => {
        const q = search.toLowerCase();
        const fullName = `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase();
        return (
            fullName.includes(q) ||
            (c.username || "").toLowerCase().includes(q) ||
            (c.email || "").toLowerCase().includes(q) ||
            (c.phone || "").toLowerCase().includes(q)
        );
    });

    const formatDate = (date) => {
        if (!date) return "—";
        return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    };

    const getCustomerName = (c) => {
        const full = `${c.first_name || ""} ${c.last_name || ""}`.trim();
        return full || c.username || "Unnamed Customer";
    };

    const getInitials = (c) => {
        const name = getCustomerName(c);
        return name.charAt(0).toUpperCase();
    };

    const formatPrice = (price) =>
        `₹${Number(price || 0).toLocaleString("en-IN")}`;

    return (
        <div>
            {/* Header */}
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "#a48755", letterSpacing: "0.18em" }}>
                        Users
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold" style={{ color: "#1b4332" }}>
                        Customers
                    </h1>
                    <p className="mt-0.5 text-sm" style={{ color: "#493d38" }}>
                        View and manage registered customers
                    </p>
                </div>

                <button
                    onClick={fetchCustomers}
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

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-sm">
                    <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#a48755" }} />
                    <input
                        type="text"
                        placeholder="Search by name, email, username or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm transition"
                        style={{ borderColor: "#d4c5b0", background: "#fff", color: "#1b4332" }}
                        onFocus={(e) => (e.target.style.borderColor = "#1b4332")}
                        onBlur={(e) => (e.target.style.borderColor = "#d4c5b0")}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm" style={{ borderColor: "#e8e0d5" }}>
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-sm" style={{ color: "#a48755" }}>
                        <RefreshCw size={18} className="mr-2 animate-spin" />
                        Loading customers...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead style={{ background: "#faf9f6" }}>
                                <tr>
                                    {["Customer", "Email", "Phone", "Joined", "Status", "Action"].map((h, i) => (
                                        <th
                                            key={h}
                                            className={`px-5 py-4 text-xs font-semibold uppercase tracking-wider ${i === 5 ? "text-right" : "text-left"}`}
                                            style={{ color: "#a48755", letterSpacing: "0.1em" }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-5 py-20 text-center">
                                            <Users size={36} className="mx-auto mb-3" style={{ color: "#d4c5b0" }} />
                                            <p className="text-sm" style={{ color: "#493d38" }}>No customers found.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((customer) => (
                                        <tr
                                            key={customer.id}
                                            className="border-t transition hover:bg-[#fdfaf7]"
                                            style={{ borderColor: "#f0e8dc" }}
                                        >
                                            {/* Customer */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full"
                                                        style={{ background: "#f8f4ec" }}
                                                    >
                                                        {customer.profile_image ? (
                                                            <img
                                                                src={customer.profile_image}
                                                                alt={getCustomerName(customer)}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-sm font-bold" style={{ color: "#1b4332" }}>
                                                                {getInitials(customer)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold" style={{ color: "#1b4332" }}>
                                                            {getCustomerName(customer)}
                                                        </p>
                                                        <p className="text-xs" style={{ color: "#a48755" }}>
                                                            @{customer.username || "—"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Email */}
                                            <td className="px-5 py-4">
                                                <span className="text-sm" style={{ color: "#493d38" }}>
                                                    {customer.email || "—"}
                                                </span>
                                            </td>

                                            {/* Phone */}
                                            <td className="px-5 py-4">
                                                <span className="text-sm" style={{ color: "#493d38" }}>
                                                    {customer.phone || "—"}
                                                </span>
                                            </td>

                                            {/* Joined */}
                                            <td className="px-5 py-4">
                                                <span className="text-sm" style={{ color: "#493d38" }}>
                                                    {formatDate(customer.date_joined)}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4">
                                                <span
                                                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                                                    style={
                                                        customer.is_active
                                                            ? { background: "#f0fdf4", color: "#166534" }
                                                            : { background: "#fef2f2", color: "#dc2626" }
                                                    }
                                                >
                                                    {customer.is_active ? (
                                                        <ShieldCheck size={12} />
                                                    ) : (
                                                        <ShieldOff size={12} />
                                                    )}
                                                    {customer.is_active ? "Active" : "Inactive"}
                                                </span>
                                            </td>

                                            {/* Action */}
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={() => viewCustomer(customer)}
                                                        className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition hover:bg-gray-50"
                                                        style={{ borderColor: "#d4c5b0", color: "#1b4332" }}
                                                    >
                                                        <Eye size={13} />
                                                        View
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && filtered.length > 0 && (
                    <div className="border-t px-5 py-4" style={{ borderColor: "#e8e0d5" }}>
                        <p className="text-xs" style={{ color: "#a48755" }}>
                            Showing {filtered.length} of {customers.length} customer{customers.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                )}
            </div>

            {/* Customer Detail Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                        {/* Modal Header */}
                        <div
                            className="flex items-center justify-between border-b px-6 py-5"
                            style={{ borderColor: "#e8e0d5" }}
                        >
                            <h2 className="text-lg font-semibold" style={{ color: "#1b4332" }}>
                                Customer Profile
                            </h2>
                            <button
                                onClick={() => {
                                    setSelectedCustomer(null);
                                    setCustomerActivity(null);
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-gray-100"
                                style={{ color: "#493d38" }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Profile */}
                        <div className="overflow-y-auto p-6">
                            {/* Avatar */}
                            <div className="mb-6 flex flex-col items-center">
                                <div
                                    className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4"
                                    style={{ background: "#f8f4ec", borderColor: "#e8e0d5" }}
                                >
                                    {selectedCustomer.profile_image ? (
                                        <img
                                            src={selectedCustomer.profile_image}
                                            alt={getCustomerName(selectedCustomer)}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-2xl font-bold" style={{ color: "#1b4332" }}>
                                            {getInitials(selectedCustomer)}
                                        </span>
                                    )}
                                </div>
                                <h3 className="mt-3 text-lg font-semibold" style={{ color: "#1b4332" }}>
                                    {getCustomerName(selectedCustomer)}
                                </h3>
                                <p className="text-sm" style={{ color: "#a48755" }}>
                                    @{selectedCustomer.username || "—"}
                                </p>
                                <span
                                    className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                                    style={
                                        selectedCustomer.is_active
                                            ? { background: "#f0fdf4", color: "#166534" }
                                            : { background: "#fef2f2", color: "#dc2626" }
                                    }
                                >
                                    {selectedCustomer.is_active ? <ShieldCheck size={12} /> : <ShieldOff size={12} />}
                                    {selectedCustomer.is_active ? "Active Account" : "Inactive Account"}
                                </span>
                            </div>

                            {/* Details */}
                            <div
                                className="space-y-3 rounded-2xl border p-4"
                                style={{ borderColor: "#e8e0d5", background: "#faf9f6" }}
                            >
                                <div className="flex items-start gap-3">
                                    <Mail size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#a48755" }} />
                                    <div>
                                        <p className="text-xs" style={{ color: "#a48755" }}>Email</p>
                                        <p className="text-sm" style={{ color: "#1b4332" }}>
                                            {selectedCustomer.email || "Not provided"}
                                        </p>
                                    </div>
                                </div>

                                <div className="h-px" style={{ background: "#e8e0d5" }} />

                                <div className="flex items-start gap-3">
                                    <Phone size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#a48755" }} />
                                    <div>
                                        <p className="text-xs" style={{ color: "#a48755" }}>Phone</p>
                                        <p className="text-sm" style={{ color: "#1b4332" }}>
                                            {selectedCustomer.phone || "Not provided"}
                                        </p>
                                    </div>
                                </div>

                                <div className="h-px" style={{ background: "#e8e0d5" }} />

                                <div className="flex items-start gap-3">
                                    <CalendarDays size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#a48755" }} />
                                    <div>
                                        <p className="text-xs" style={{ color: "#a48755" }}>Joined</p>
                                        <p className="text-sm" style={{ color: "#1b4332" }}>
                                            {formatDate(selectedCustomer.date_joined)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: "#1b4332" }}>
                                        Customer Activity
                                    </h3>
                                    {activityLoading ? (
                                        <p className="rounded-xl bg-[#faf9f6] p-5 text-sm" style={{ color: "#493d38" }}>
                                            Loading cart, wishlist, and orders...
                                        </p>
                                    ) : activityError ? (
                                        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                            {activityError}
                                        </p>
                                    ) : customerActivity ? (
                                        <div className="grid gap-4 lg:grid-cols-3">
                                            <ActivityPanel
                                                title={`Cart (${customerActivity.cart?.items?.length || 0})`}
                                                empty="Cart is empty."
                                            >
                                                {(customerActivity.cart?.items || []).map((item) => (
                                                    <div key={item.id} className="flex justify-between gap-3 text-xs">
                                                        <span>
                                                            {item.product?.name || "Product"} × {item.quantity}
                                                        </span>
                                                        <span>{formatPrice(item.subtotal)}</span>
                                                    </div>
                                                ))}
                                                {(customerActivity.cart?.items || []).length > 0 && (
                                                    <p className="border-t border-[#e8e0d5] pt-2 text-xs font-semibold">
                                                        Total: {formatPrice(customerActivity.cart.total)}
                                                    </p>
                                                )}
                                            </ActivityPanel>

                                            <ActivityPanel
                                                title={`Wishlist (${customerActivity.wishlist?.items?.length || 0})`}
                                                empty="Wishlist is empty."
                                            >
                                                {(customerActivity.wishlist?.items || []).map((item) => (
                                                    <div key={item.id} className="flex justify-between gap-3 text-xs">
                                                        <span>{item.product?.name || "Product"}</span>
                                                        <span>
                                                            {formatPrice(
                                                                item.product?.final_price ??
                                                                item.product?.price
                                                            )}
                                                        </span>
                                                    </div>
                                                ))}
                                            </ActivityPanel>

                                            <ActivityPanel
                                                title={`Orders (${customerActivity.orders?.length || 0})`}
                                                empty="No orders yet."
                                            >
                                                {(customerActivity.orders || []).map((order) => (
                                                    <div key={order.id} className="border-b border-[#e8e0d5] pb-2 text-xs last:border-0">
                                                        <div className="flex justify-between gap-2 font-medium">
                                                            <span>{order.order_number}</span>
                                                            <span className="capitalize">{order.status?.replaceAll("_", " ")}</span>
                                                        </div>
                                                        <p className="mt-1">
                                                            {(order.items || []).map((item) =>
                                                                `${item.product_name} × ${item.quantity}`
                                                            ).join(", ")}
                                                        </p>
                                                        <p className="mt-1 font-semibold">
                                                            {formatPrice(order.total_amount)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </ActivityPanel>
                                        </div>
                                    ) : (
                                        <p className="rounded-xl bg-[#faf9f6] p-5 text-sm" style={{ color: "#493d38" }}>
                                            Customer activity is not available.
                                        </p>
                                    )}
                                </div>
                            </div>

                        {/* Close */}
                        <div className="border-t px-6 py-4" style={{ borderColor: "#e8e0d5" }}>
                            <button
                                onClick={() => {
                                    setSelectedCustomer(null);
                                    setCustomerActivity(null);
                                }}
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

function ActivityPanel({ title, empty, children }) {
    const items = React.Children.toArray(children);

    return (
        <section className="min-h-32 rounded-xl border p-4" style={{ borderColor: "#e8e0d5", background: "#faf9f6", color: "#493d38" }}>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#a48755" }}>
                {title}
            </h4>
            {items.length > 0 ? (
                <div className="space-y-3">{items}</div>
            ) : (
                <p className="text-xs">{empty}</p>
            )}
        </section>
    );
}
