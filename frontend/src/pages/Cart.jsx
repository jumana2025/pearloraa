import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Minus,
    Plus,
    Trash2,
    ShoppingBag,
    ArrowRight,
    Loader2,
} from "lucide-react";
import { API_ORIGIN } from "../api/axios";

const API_URL = API_ORIGIN;

function getAccessToken() {
    return (
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token")
    );
}

export default function Cart() {
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingItem, setUpdatingItem] = useState(null);
    const [removingItem, setRemovingItem] = useState(null);
    const [error, setError] = useState("");

    // ---------------------------------------------------------
    // LOGOUT
    // ---------------------------------------------------------
    const handleLogout = useCallback(() => {
        localStorage.removeItem("access_token");
        sessionStorage.removeItem("access_token");

        // Remove old frontend cart data if it exists
        localStorage.removeItem("pearloraa_cart");

        setCartItems([]);

        window.dispatchEvent(new Event("authChanged"));

        navigate("/login");
    }, [navigate]);

    // ---------------------------------------------------------
    // FETCH CART FROM DJANGO
    // ---------------------------------------------------------
    const fetchCart = useCallback(async () => {
        const token = getAccessToken();

        if (!token) {
            setCartItems([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_URL}/api/cart/`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.status === 401) {
                handleLogout();
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to fetch cart.");
            }

            const data = await response.json();

            console.log("CART API RESPONSE:", data);

            /*
              Expected backend response:
      
              {
                "id": 1,
                "user": 2,
                "items": [
                  {
                    "id": 5,
                    "product": {...},
                    "quantity": 2
                  }
                ]
              }
      
              If backend returns no items,
              cartItems becomes [].
            */

            const items = Array.isArray(data.items) ? data.items : [];

            setCartItems(items);
        } catch (err) {
            console.error("Fetch cart error:", err);
            setError("Unable to load your cart.");
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    }, [handleLogout]);

    // ---------------------------------------------------------
    // LOAD CART
    // ---------------------------------------------------------
    useEffect(() => {
        Promise.resolve().then(fetchCart);
    }, [fetchCart]);

    // ---------------------------------------------------------
    // LISTEN FOR LOGIN / LOGOUT
    // ---------------------------------------------------------
    useEffect(() => {
        const handleAuthChange = () => {
            fetchCart();
        };

        window.addEventListener("authChanged", handleAuthChange);

        return () => {
            window.removeEventListener("authChanged", handleAuthChange);
        };
    }, [fetchCart]);

    // ---------------------------------------------------------
    // CART ITEM COUNT
    // IMPORTANT:
    // SUM QUANTITY, NOT cartItems.length
    // ---------------------------------------------------------
    const cartCount = useMemo(() => {
        return cartItems.reduce((total, item) => {
            return total + Number(item.quantity || 0);
        }, 0);
    }, [cartItems]);

    // ---------------------------------------------------------
    // TOTAL PRICE
    // ---------------------------------------------------------
    const cartTotal = useMemo(() => {
        return cartItems.reduce((total, item) => {
            const product = item.product || {};

            const price =
                Number(
                    item.price ??
                    item.final_price ??
                    product.final_price ??
                    product.price ??
                    0
                ) || 0;

            const quantity = Number(item.quantity || 0);

            return total + price * quantity;
        }, 0);
    }, [cartItems]);

    // ---------------------------------------------------------
    // GET PRODUCT DATA
    // ---------------------------------------------------------
    const getProduct = (item) => {
        return item.product || item;
    };

    // ---------------------------------------------------------
    // GET PRODUCT IMAGE
    // ---------------------------------------------------------
    const getProductImage = (item) => {
        const product = getProduct(item);

        const image =
            product.image ||
            product.image_url ||
            product.product_image ||
            product.thumbnail ||
            "";

        if (!image) {
            return null;
        }

        if (image.startsWith("http")) {
            return image;
        }

        return `${API_URL}${image.startsWith("/") ? "" : "/"}${image}`;
    };

    // ---------------------------------------------------------
    // GET PRODUCT PRICE
    // ---------------------------------------------------------
    const getProductPrice = (item) => {
        const product = getProduct(item);

        return Number(
            item.price ??
            item.final_price ??
            product.final_price ??
            product.price ??
            0
        );
    };

    // ---------------------------------------------------------
    // UPDATE QUANTITY
    // ---------------------------------------------------------
    const updateQuantity = async (item, newQuantity) => {
        if (newQuantity < 1) {
            return;
        }

        const token = getAccessToken();

        if (!token) {
            navigate("/login");
            return;
        }

        const itemId = item.id;

        try {
            setUpdatingItem(itemId);
            setError("");

            const response = await fetch(
                `${API_URL}/api/cart/items/${itemId}/`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        quantity: newQuantity,
                    }),
                }
            );

            if (response.status === 401) {
                handleLogout();
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error || "Unable to update cart."
                );
            }

            // Fetch fresh backend data
            await fetchCart();
        } catch (err) {
            console.error("Update cart error:", err);
            setError(err.message || "Unable to update cart.");
        } finally {
            setUpdatingItem(null);
        }
    };

    // ---------------------------------------------------------
    // REMOVE ITEM
    // ---------------------------------------------------------
    const removeItem = async (itemId) => {
        const token = getAccessToken();

        if (!token) {
            navigate("/login");
            return;
        }

        try {
            setRemovingItem(itemId);
            setError("");

            const response = await fetch(
                `${API_URL}/api/cart/items/${itemId}/remove/`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 401) {
                handleLogout();
                return;
            }

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data?.error || "Unable to remove item."
                );
            }

            // Fetch fresh backend cart
            await fetchCart();
        } catch (err) {
            console.error("Remove cart item error:", err);
            setError(err.message || "Unable to remove item.");
        } finally {
            setRemovingItem(null);
        }
    };

    // ---------------------------------------------------------
    // CHECKOUT
    // ---------------------------------------------------------
    const handleCheckout = () => {
        if (cartItems.length === 0) {
            return;
        }

        navigate("/checkout");
    };

    // ---------------------------------------------------------
    // LOADING
    // ---------------------------------------------------------
    if (loading) {
        return (
            <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
                <div className="flex items-center gap-3 text-[#493d38]">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm tracking-wide">
                        Loading your cart...
                    </span>
                </div>
            </div>
        );
    }

    // ---------------------------------------------------------
    // EMPTY CART
    // ---------------------------------------------------------
    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-[#faf8f5] text-[#493d38]">

                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-8">

                    {/* TOP */}
                    <div className="flex items-center justify-between mb-12">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-sm text-[#6f625b] hover:text-[#493d38] transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Continue Shopping
                        </Link>

                        <div className="flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-[#493d38]" />

                            <span className="text-xs uppercase tracking-[0.15em] text-[#493d38]">
                                0 items
                            </span>
                        </div>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="mb-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* EMPTY */}
                    <div className="min-h-[55vh] flex flex-col items-center justify-center text-center">

                        <div className="w-20 h-20 rounded-full bg-white border border-[#e8e0da] flex items-center justify-center mb-7">
                            <ShoppingBag className="w-8 h-8 text-[#9a8c83]" />
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-serif text-[#493d38] mb-4">
                            Your cart is empty
                        </h1>

                        <p className="text-[#7c7069] max-w-md leading-relaxed mb-8">
                            Looks like you haven't added anything to your cart yet.
                            Explore our collection and find something you love.
                        </p>

                        <Link
                            to="/"
                            className="inline-flex items-center gap-3 bg-[#493d38] text-white px-7 py-3.5 rounded-full text-sm hover:bg-[#5a4c46] transition"
                        >
                            Explore Collection
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ---------------------------------------------------------
    // CART PAGE
    // ---------------------------------------------------------
    return (
        <div className="min-h-screen bg-[#faf8f5] text-[#493d38]">

            <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-8">

                {/* -------------------------------------------------
            HEADER
        ------------------------------------------------- */}
                <div className="flex items-center justify-between mb-10">

                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm text-[#6f625b] hover:text-[#493d38] transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Continue Shopping
                    </Link>

                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-[#493d38]" />

                        <span className="text-xs uppercase tracking-[0.15em] text-[#493d38]">
                            {cartCount}{" "}
                            {cartCount === 1 ? "item" : "items"}
                        </span>
                    </div>
                </div>

                {/* -------------------------------------------------
            TITLE
        ------------------------------------------------- */}
                <div className="mb-10">
                    <h1 className="text-4xl sm:text-5xl font-serif text-[#493d38]">
                        Your Cart
                    </h1>

                    <p className="mt-3 text-[#7c7069]">
                        Review your selected pieces before checkout.
                    </p>
                </div>

                {/* -------------------------------------------------
            ERROR
        ------------------------------------------------- */}
                {error && (
                    <div className="mb-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* -------------------------------------------------
            CONTENT
        ------------------------------------------------- */}
                <div className="grid lg:grid-cols-[1fr_380px] gap-10">

                    {/* -------------------------------------------------
              CART ITEMS
          ------------------------------------------------- */}
                    <div className="space-y-5">

                        {cartItems.map((item) => {
                            const product = getProduct(item);
                            const image = getProductImage(item);
                            const price = getProductPrice(item);
                            const quantity = Number(item.quantity || 1);

                            const itemSubtotal = price * quantity;

                            return (
                                <div
                                    key={item.id}
                                    className="bg-white border border-[#ebe3dd] rounded-2xl p-4 sm:p-5"
                                >

                                    <div className="flex gap-5">

                                        {/* PRODUCT IMAGE */}
                                        <Link
                                            to={`/product/${product.id}`}
                                            className="w-28 h-32 sm:w-36 sm:h-40 shrink-0 rounded-xl overflow-hidden bg-[#f4f0ec]"
                                        >
                                            {image ? (
                                                <img
                                                    src={image}
                                                    alt={product.name || "Product"}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ShoppingBag className="w-7 h-7 text-[#b5a9a1]" />
                                                </div>
                                            )}
                                        </Link>

                                        {/* PRODUCT INFO */}
                                        <div className="flex-1 min-w-0 flex flex-col">

                                            <div className="flex justify-between gap-4">

                                                <div>
                                                    <Link
                                                        to={`/product/${product.id}`}
                                                        className="text-lg sm:text-xl font-serif text-[#493d38] hover:text-[#7a665b] transition"
                                                    >
                                                        {product.name || "Product"}
                                                    </Link>

                                                    {product.category && (
                                                        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#9a8c83]">
                                                            {typeof product.category === "object"
                                                                ? product.category.name
                                                                : product.category}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* REMOVE */}
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    disabled={removingItem === item.id}
                                                    className="w-9 h-9 rounded-full flex items-center justify-center text-[#9a8c83] hover:text-red-500 hover:bg-red-50 transition shrink-0"
                                                    aria-label="Remove item"
                                                >
                                                    {removingItem === item.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>

                                            {/* PRICE */}
                                            <div className="mt-3 text-sm text-[#6f625b]">
                                                ₹{price.toLocaleString("en-IN")}
                                            </div>

                                            {/* BOTTOM */}
                                            <div className="mt-auto pt-5 flex items-end justify-between gap-4">

                                                {/* QUANTITY */}
                                                <div className="flex items-center border border-[#ddd3cc] rounded-full overflow-hidden">

                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item,
                                                                quantity - 1
                                                            )
                                                        }
                                                        disabled={
                                                            quantity <= 1 ||
                                                            updatingItem === item.id
                                                        }
                                                        className="w-9 h-9 flex items-center justify-center text-[#6f625b] hover:bg-[#f6f2ef] disabled:opacity-40 disabled:cursor-not-allowed transition"
                                                    >
                                                        <Minus className="w-3.5 h-3.5" />
                                                    </button>

                                                    <span className="w-9 text-center text-sm">
                                                        {updatingItem === item.id ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" />
                                                        ) : (
                                                            quantity
                                                        )}
                                                    </span>

                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item,
                                                                quantity + 1
                                                            )
                                                        }
                                                        disabled={
                                                            updatingItem === item.id
                                                        }
                                                        className="w-9 h-9 flex items-center justify-center text-[#6f625b] hover:bg-[#f6f2ef] disabled:opacity-40 disabled:cursor-not-allowed transition"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </button>

                                                </div>

                                                {/* SUBTOTAL */}
                                                <div className="text-right">
                                                    <p className="text-xs text-[#9a8c83] uppercase tracking-[0.1em]">
                                                        Subtotal
                                                    </p>

                                                    <p className="mt-1 text-lg font-medium text-[#493d38]">
                                                        ₹{itemSubtotal.toLocaleString("en-IN")}
                                                    </p>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* -------------------------------------------------
              ORDER SUMMARY
          ------------------------------------------------- */}
                    <div className="lg:sticky lg:top-8 h-fit">

                        <div className="bg-white border border-[#ebe3dd] rounded-2xl p-6 sm:p-7">

                            <h2 className="text-2xl font-serif text-[#493d38] mb-7">
                                Order Summary
                            </h2>

                            {/* ITEMS */}
                            <div className="flex items-center justify-between text-sm text-[#6f625b] mb-4">
                                <span>
                                    Items ({cartCount})
                                </span>

                                <span>
                                    ₹{cartTotal.toLocaleString("en-IN")}
                                </span>
                            </div>

                            {/* SHIPPING */}
                            <div className="flex items-center justify-between text-sm text-[#6f625b] mb-5">
                                <span>Shipping</span>

                                <span className="text-[#493d38]">
                                    Free
                                </span>
                            </div>

                            <div className="border-t border-[#ebe3dd] pt-5">

                                <div className="flex items-center justify-between">

                                    <span className="text-lg font-serif text-[#493d38]">
                                        Total
                                    </span>

                                    <span className="text-xl font-medium text-[#493d38]">
                                        ₹{cartTotal.toLocaleString("en-IN")}
                                    </span>

                                </div>

                            </div>

                            {/* CHECKOUT */}
                            <button
                                onClick={handleCheckout}
                                className="w-full mt-7 bg-[#493d38] text-white rounded-full py-4 flex items-center justify-center gap-3 text-sm hover:bg-[#5a4c46] transition"
                            >
                                Proceed to Checkout
                                <ArrowRight className="w-4 h-4" />
                            </button>

                            <p className="mt-4 text-center text-xs text-[#9a8c83] leading-relaxed">
                                You can review your order details before placing
                                your order.
                            </p>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
