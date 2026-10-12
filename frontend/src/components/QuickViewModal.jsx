import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function QuickViewModal({ product, isOpen, onClose }) {
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [addError, setAddError] = useState("");

    if (!isOpen || !product) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const formatPrice = (price) => {
        return `₹${Number(price || 0).toLocaleString("en-IN")}`;
    };
    
    const finalPrice = product.final_price ?? product.discount_price ?? product.price ?? 0;

    const getImageUrl = (image) => {
        if (!image) return "";
        if (image.startsWith("http://") || image.startsWith("https://")) {
            return image;
        }
        if (image.startsWith("/")) {
            return `http://127.0.0.1:8000${image}`;
        }
        return `http://127.0.0.1:8000/${image}`;
    };

    const imageUrl = getImageUrl(product.main_image);

    const handleAddToCart = async () => {
        const userToken =
            localStorage.getItem("access_token") ||
            sessionStorage.getItem("access_token");
        if (!userToken) {
            navigate("/login");
            return false;
        }

        try {
            setIsAdding(true);
            setAddError("");
            const response = await fetch(
                "http://127.0.0.1:8000/api/cart/add/",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        product_id: product.id,
                        quantity,
                    }),
                }
            );
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || "Unable to add this item to cart.");
            }

            window.dispatchEvent(new Event("cartUpdated"));
            onClose();
            return true;
        } catch (error) {
            setAddError(error.message || "Unable to add this item to cart.");
            return false;
        } finally {
            setIsAdding(false);
        }
    };

    const handleBuyNow = async () => {
        if (await handleAddToCart()) {
            navigate("/cart");
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="relative flex w-full max-w-4xl flex-col bg-[#f8f4ec] shadow-2xl md:flex-row h-auto max-h-[90vh] overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/50 text-[#1b4332] hover:bg-white transition-colors"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                {/* Product Image */}
                <div className="w-full md:w-1/2 bg-[#eee6db] h-64 md:h-auto overflow-hidden flex items-center justify-center">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="text-sm text-[#8d7a6b]">No image</div>
                    )}
                </div>

                {/* Product Details */}
                <div className="flex w-full flex-col p-8 md:w-1/2 overflow-y-auto">
                    <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[#9b8778]">
                        {product.category?.name || "Jewellery"}
                    </p>

                    <h2 className="font-serif text-3xl leading-tight text-[#321019] mb-4">
                        {product.name}
                    </h2>

                    <p className="text-2xl text-[#1b4332] mb-6">
                        {formatPrice(finalPrice)}
                    </p>
                    
                    {product.description && (
                        <p className="text-sm leading-6 text-[#75645b] mb-8">
                            {product.description}
                        </p>
                    )}

                    {/* Quantity Selector */}
                    <div className="mb-8">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-[#765f53] mb-3">
                            Quantity
                        </p>
                        <div className="flex w-32 items-center border border-[#1b4332]/20 bg-transparent">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="flex h-10 flex-1 items-center justify-center transition hover:bg-[#1b4332]/5"
                            >
                                -
                            </button>
                            <span className="flex h-10 flex-1 items-center justify-center text-sm">
                                {quantity}
                            </span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="flex h-10 flex-1 items-center justify-center transition hover:bg-[#1b4332]/5"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {addError && (
                        <p role="alert" className="mb-2 text-sm text-red-700">
                            {addError}
                        </p>
                    )}
                    <div className="mt-auto flex flex-col gap-3">
                        <button
                            onClick={handleAddToCart}
                            disabled={isAdding}
                            className="w-full border border-[#1b4332] py-4 text-[10px] uppercase tracking-[0.2em] text-[#1b4332] transition hover:bg-[#1b4332]/5"
                        >
                            {isAdding ? "Adding..." : "Add to Cart"}
                        </button>
                        <button
                            onClick={handleBuyNow}
                            disabled={isAdding}
                            className="w-full bg-[#1b4332] py-4 text-[10px] uppercase tracking-[0.2em] text-white transition hover:bg-[#321019]"
                        >
                            Buy Now
                        </button>
                    </div>
                    
                    <div className="mt-6 text-center">
                        <Link to={`/product/${product.id}`} className="text-[10px] uppercase tracking-[0.1em] text-[#a48755] hover:underline" onClick={onClose}>
                            View Full Details
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
