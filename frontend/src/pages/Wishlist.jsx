import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    loadWishlistItems,
    toggleWishlistProduct,
} from "../utils/wishlist";

export default function Wishlist() {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    React.useEffect(() => {
        const fetchWishlistProducts = async () => {
            try {
                const items = await loadWishlistItems();
                setWishlist(
                    items.map(({ product }) => ({
                        id: product.id,
                        name: product.name,
                        category: product.category?.name || "Jewellery",
                        price:
                            product.final_price ??
                            product.discount_price ??
                            product.price ??
                            0,
                        image: product.main_image || "",
                    }))
                );
            } catch (fetchError) {
                setError(
                    fetchError.message || "Unable to load your wishlist."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchWishlistProducts();
    }, []);

    const removeFromWishlist = async (id) => {
        try {
            await toggleWishlistProduct(id, false);
            setWishlist((items) => items.filter((item) => item.id !== id));
            setError("");
        } catch (removeError) {
            setError(removeError.message || "Unable to remove this item.");
        }
    };

    const formatPrice = (price) => {
        return `₹${price.toLocaleString("en-IN")}`;
    };

    return (
        <main className="min-h-screen bg-[#f8f4ec] text-[#1b4332]">

            {/* HEADER */}
            <section className="px-5 pb-12 pt-36 sm:px-8 lg:px-12 lg:pb-16 lg:pt-44">
                <div className="mx-auto max-w-[1400px]">

                    <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#a48755]">
                        Your Favourites
                    </p>

                    <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <h1 className="font-serif text-[42px] leading-none sm:text-[52px]">
                            Wishlist
                            <span className="text-[#a48755]">.</span>
                        </h1>

                        <span className="text-xs uppercase tracking-[0.15em] text-[#493d38]">
                            {wishlist.length}{" "}
                            {wishlist.length === 1 ? "piece" : "pieces"}
                        </span>
                    </div>

                </div>
            </section>


            {/* WISHLIST */}
            {error && (
                <div
                    role="alert"
                    className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {error}
                </div>
            )}
            {loading ? (
                <p className="py-20 text-center text-sm text-[#493d38]">
                    Loading your wishlist...
                </p>
            ) : wishlist.length > 0 ? (
                <section className="px-5 pb-24 sm:px-8 lg:px-12">
                    <div className="mx-auto max-w-[1400px]">

                        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-7 lg:gap-y-14">

                            {wishlist.map((item) => (
                                <WishlistCard
                                    key={item.id}
                                    item={item}
                                    removeFromWishlist={removeFromWishlist}
                                    formatPrice={formatPrice}
                                />
                            ))}

                        </div>

                    </div>
                </section>
            ) : (
                <EmptyWishlist />
            )}


            {/* EDITORIAL CTA */}
            <section className="border-t border-[#1b4332]/10 bg-[#efe7da] px-5 py-20 text-center sm:px-8 lg:py-28">

                <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#a48755]">
                    Keep exploring
                </p>

                <h2 className="mx-auto mt-4 max-w-2xl font-serif text-[34px] leading-tight sm:text-[44px]">
                    There is always another
                    <span className="italic"> beautiful piece.</span>
                </h2>

                <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-[#493d38]">
                    Discover more timeless jewellery designed to become part of your
                    everyday story.
                </p>

                <Link
                    to="/shop"
                    className="mt-8 inline-flex bg-[#1b4332] px-7 py-3.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[#f8f4ec] transition-colors duration-300 hover:bg-[#321019]"
                >
                    Explore Jewellery
                </Link>

            </section>

        </main>
    );
}


/* =========================
   WISHLIST CARD
========================= */

function WishlistCard({
    item,
    removeFromWishlist,
    formatPrice,
}) {
    return (
        <article className="group">

            {/* IMAGE */}
            <div className="relative aspect-[4/5] overflow-hidden bg-[#efe7da]">

                <Link
                    to={`/product/${item.id}`}
                    className="block h-full w-full"
                >
                    <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                </Link>

                {/* REMOVE */}
                <button
                    type="button"
                    onClick={() => removeFromWishlist(item.id)}
                    aria-label={`Remove ${item.name} from wishlist`}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#f8f4ec]/90 text-[#1b4332] backdrop-blur-sm transition-colors duration-300 hover:bg-[#1b4332] hover:text-[#f8f4ec]"
                >
                    <CloseIcon />
                </button>

                {/* VIEW PRODUCT */}
                <Link
                    to={`/product/${item.id}`}
                    className="absolute bottom-3 left-3 right-3 translate-y-2 bg-[#f8f4ec]/95 py-3 text-center text-[9px] font-medium uppercase tracking-[0.18em] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                >
                    View Piece
                </Link>

            </div>


            {/* DETAILS */}
            <div className="pt-4">

                <p className="text-[8px] font-medium uppercase tracking-[0.2em] text-[#a48755]">
                    {item.category}
                </p>

                <Link
                    to={`/product/${item.id}`}
                    className="mt-1 block font-serif text-lg leading-tight text-[#1b4332] hover:underline"
                >
                    {item.name}
                </Link>

                <p className="mt-2 text-sm text-[#493d38]">
                    {formatPrice(item.price)}
                </p>

                <Link
                    to={`/product/${item.id}`}
                    className="mt-4 inline-flex border-b border-[#1b4332] pb-1 text-[9px] font-medium uppercase tracking-[0.18em]"
                >
                    View Details
                </Link>

            </div>

        </article>
    );
}


/* =========================
   EMPTY WISHLIST
========================= */

function EmptyWishlist() {
    return (
        <section className="px-5 pb-24 sm:px-8 lg:px-12">

            <div className="mx-auto max-w-[800px] border-y border-[#1b4332]/10 py-20 text-center sm:py-28">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#a48755]/40 text-[#a48755]">
                    <HeartIcon />
                </div>

                <p className="mt-7 text-[10px] font-medium uppercase tracking-[0.25em] text-[#a48755]">
                    Your collection
                </p>

                <h2 className="mt-3 font-serif text-[34px] sm:text-[42px]">
                    Your wishlist is empty.
                </h2>

                <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#493d38]">
                    Save the pieces you love and come back to them whenever you're
                    ready.
                </p>

                <Link
                    to="/shop"
                    className="mt-8 inline-flex bg-[#1b4332] px-7 py-3.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[#f8f4ec] transition-colors duration-300 hover:bg-[#321019]"
                >
                    Discover Jewellery
                </Link>

            </div>

        </section>
    );
}


/* =========================
   ICONS
========================= */

function CloseIcon() {
    return (
        <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden="true"
        >
            <path d="M6 6l12 12" />
            <path d="M18 6 6 18" />
        </svg>
    );
}

function HeartIcon() {
    return (
        <svg
            width="25"
            height="25"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M20.8 8.8c0 5.5-8.8 10.2-8.8 10.2S3.2 14.3 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" />
        </svg>
    );
}
