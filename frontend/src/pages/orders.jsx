import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            const token =
                localStorage.getItem("access_token") ||
                sessionStorage.getItem("access_token");

            try {
                const response = await fetch(`${API_URL}/api/orders/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json().catch(() => []);

                if (!response.ok) {
                    throw new Error(
                        data.error ||
                            (response.status === 401
                                ? "Please sign in again to view your orders."
                                : "Unable to load your orders.")
                    );
                }

                setOrders(Array.isArray(data) ? data : []);
            } catch (fetchError) {
                setError(fetchError.message || "Unable to load your orders.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const formatPrice = (price) =>
        `₹${Number(price || 0).toLocaleString("en-IN")}`;
    const formatDate = (date) =>
        date
            ? new Date(date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
              })
            : "—";
    const formatStatus = (status) =>
        String(status || "pending")
            .replaceAll("_", " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase());

    return (
        <main className="min-h-screen bg-[#f8f4ec] text-[#1b4332]">
            <section className="px-5 pb-12 pt-36 sm:px-8 lg:px-12 lg:pb-16 lg:pt-44">
                <div className="mx-auto max-w-[1400px]">
                    <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#a48755]">
                        Your History
                    </p>
                    <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <h1 className="font-serif text-[42px] leading-none sm:text-[52px]">
                            Order Details
                            <span className="text-[#a48755]">.</span>
                        </h1>
                        <span className="text-xs uppercase tracking-[0.15em] text-[#493d38]">
                            {orders.length} {orders.length === 1 ? "order" : "orders"}
                        </span>
                    </div>
                </div>
            </section>

            <section className="px-5 pb-24 sm:px-8 lg:px-12">
                <div className="mx-auto max-w-[1400px]">
                    {loading ? (
                        <p className="py-20 text-center text-sm text-[#493d38]">
                            Loading your orders...
                        </p>
                    ) : error ? (
                        <div
                            role="alert"
                            className="border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
                        >
                            {error}
                        </div>
                    ) : orders.length > 0 ? (
                        <div className="grid gap-10 lg:grid-cols-2">
                            {orders.map((order) => (
                                <article
                                    key={order.id}
                                    className="border border-[#1b4332]/10 bg-[#efe7da] p-6 sm:p-8"
                                >
                                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#1b4332]/10 pb-6">
                                        <div>
                                            <p className="text-[9px] uppercase tracking-[0.2em] text-[#a48755]">
                                                Order Number
                                            </p>
                                            <h2 className="mt-1 font-serif text-xl text-[#1b4332]">
                                                {order.order_number}
                                            </h2>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] uppercase tracking-[0.2em] text-[#493d38]">
                                                {formatDate(order.created_at)}
                                            </p>
                                            <span className="mt-2 inline-block bg-[#a48755]/20 px-3 py-1 text-[9px] uppercase tracking-[0.15em] text-[#755b2d]">
                                                {formatStatus(order.status)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#1b4332]">
                                            Items
                                        </p>
                                        {(order.items || []).map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between gap-4 text-sm text-[#493d38]"
                                            >
                                                <span>
                                                    {item.quantity} × {item.product_name}
                                                </span>
                                                <span>{formatPrice(item.subtotal)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {order.notes && (
                                        <p className="mt-5 whitespace-pre-line border-t border-[#1b4332]/10 pt-4 text-xs text-[#493d38]">
                                            <span className="font-medium">Customization: </span>
                                            {order.notes}
                                        </p>
                                    )}

                                    <div className="mt-8 flex items-center justify-between border-t border-[#1b4332]/10 pt-6">
                                        <span className="text-xs font-medium uppercase tracking-[0.15em] text-[#493d38]">
                                            Total
                                        </span>
                                        <span className="font-serif text-2xl text-[#1b4332]">
                                            {formatPrice(order.total_amount)}
                                        </span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="border-y border-[#1b4332]/10 py-20 text-center sm:py-28">
                            <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#a48755]">
                                No orders yet
                            </p>
                            <h2 className="mt-3 font-serif text-[34px] sm:text-[42px]">
                                You haven&apos;t placed any orders.
                            </h2>
                            <Link
                                to="/shop"
                                className="mt-8 inline-flex bg-[#1b4332] px-7 py-3.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[#f8f4ec] transition-colors duration-300 hover:bg-[#321019]"
                            >
                                Start Shopping
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
