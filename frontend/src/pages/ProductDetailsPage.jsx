import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    loadWishlistItems,
    toggleWishlistProduct,
} from "../utils/wishlist";

/* =========================================
   API
========================================= */

const API_URL = "http://127.0.0.1:8000/api/products/";

/* =========================================
   CATEGORIES
========================================= */

const categories = [
    "All Jewellery",
    "Rings",
    "Earrings",
    "Necklaces",
];

/* =========================================
   SHOP PAGE
========================================= */

export default function Shop() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [activeCategory, setActiveCategory] = useState("All Jewellery");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("featured");
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [wishlistError, setWishlistError] = useState("");

    /* =========================================
       FETCH PRODUCTS FROM DJANGO
    ========================================= */

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(API_URL);

                if (!response.ok) {
                    throw new Error("Failed to fetch products.");
                }

                const data = await response.json();

                /*
                  Supports both:

                  [
                    {...},
                    {...}
                  ]

                  and Django pagination:

                  {
                    "count": 12,
                    "results": [...]
                  }
                */

                const productList = Array.isArray(data)
                    ? data
                    : data.results || [];

                setProducts(productList);
            } catch (err) {
                console.error("Product fetch error:", err);
                setError(
                    "Unable to load jewellery at the moment. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    /* =========================================
       LOAD WISHLIST
    ========================================= */

    useEffect(() => {
        let requestId = 0;
        const syncWishlist = async () => {
            const currentRequest = ++requestId;
            setWishlist([]);
            try {
                const items = await loadWishlistItems();
                if (currentRequest === requestId) {
                    setWishlist(items.map((item) => Number(item.product.id)));
                    setWishlistError("");
                }
            } catch (loadError) {
                if (currentRequest === requestId) {
                    setWishlistError(
                        loadError.message || "Unable to sync your wishlist."
                    );
                }
            }
        };

        void syncWishlist();
        window.addEventListener("authChanged", syncWishlist);
        window.addEventListener("storage", syncWishlist);
        return () => {
            requestId += 1;
            window.removeEventListener("authChanged", syncWishlist);
            window.removeEventListener("storage", syncWishlist);
        };
    }, []);

    /* =========================================
       FILTER + SEARCH + SORT
    ========================================= */

    const filteredProducts = useMemo(() => {
        let result = [...products];

        /* CATEGORY */

        if (activeCategory !== "All Jewellery") {
            result = result.filter(
                (product) =>
                    String(product.category || "").toLowerCase() ===
                    activeCategory.toLowerCase()
            );
        }

        /* SEARCH */

        if (search.trim()) {
            const query = search.toLowerCase().trim();

            result = result.filter((product) => {
                const productName = String(product.name || "").toLowerCase();
                const productCategory = String(
                    product.category || ""
                ).toLowerCase();

                return (
                    productName.includes(query) ||
                    productCategory.includes(query)
                );
            });
        }

        /* SORT */

        if (sortBy === "price-low") {
            result.sort(
                (a, b) => Number(a.price || 0) - Number(b.price || 0)
            );
        }

        if (sortBy === "price-high") {
            result.sort(
                (a, b) => Number(b.price || 0) - Number(a.price || 0)
            );
        }

        if (sortBy === "name") {
            result.sort((a, b) =>
                String(a.name || "").localeCompare(String(b.name || ""))
            );
        }

        return result;
    }, [products, activeCategory, search, sortBy]);

    /* =========================================
       WISHLIST
    ========================================= */

    const toggleWishlist = async (id) => {
        const productId = Number(id);
        const shouldSave = !wishlist.includes(productId);

        if (
            !localStorage.getItem("access_token") &&
            !sessionStorage.getItem("access_token")
        ) {
            navigate("/login");
            return;
        }

        try {
            const items = await toggleWishlistProduct(productId, shouldSave);
            setWishlist(items.map((item) => Number(item.product.id)));
            setWishlistError("");
        } catch (toggleError) {
            setWishlistError(
                toggleError.message || "Unable to update your wishlist."
            );
        }
    };

    /* =========================================
       PRICE FORMAT
    ========================================= */

    const formatPrice = (price) => {
        return `₹${Number(price || 0).toLocaleString("en-IN")}`;
    };

    return (
        <main className="min-h-screen bg-[#f8f4ec] text-[#302522]">

            {/* =====================================
                SHOP INTRO
            ===================================== */}

            <section className="border-b border-[#1b4332]/10 bg-[#f8f4ec] px-5 pb-10 pt-[130px] sm:px-8 sm:pb-12 sm:pt-[145px] lg:px-12">

                <div className="mx-auto max-w-[1300px] text-center">

                    <p className="text-[8px] font-medium uppercase tracking-[0.35em] text-[#a48755]">
                        The Pearloraa Edit
                    </p>

                    <h1 className="mt-3 font-serif text-4xl text-[#1b4332] sm:text-5xl lg:text-[52px]">
                        Shop Jewellery
                    </h1>

                    <p className="mx-auto mt-4 max-w-xl text-xs leading-6 text-[#6b5e57] sm:text-sm">
                        Discover timeless pieces designed to become part of your
                        everyday story.
                    </p>

                </div>

            </section>

            {/* =====================================
                CATEGORY NAVIGATION
            ===================================== */}

            <section className="sticky top-[70px] z-30 border-b border-[#1b4332]/10 bg-[#f8f4ec]/95 backdrop-blur-sm">

                <div className="mx-auto flex max-w-[1300px] items-center justify-between px-5 py-3 sm:px-8 lg:px-12">

                    {/* DESKTOP CATEGORIES */}

                    <div className="hidden items-center gap-7 sm:flex">

                        {categories.map((category) => (
                            <button
                                key={category}
                                type="button"
                                onClick={() =>
                                    setActiveCategory(category)
                                }
                                className={`relative py-2 text-[9px] uppercase tracking-[0.18em] transition-colors duration-300 ${activeCategory === category
                                    ? "text-[#1b4332]"
                                    : "text-[#766963] hover:text-[#1b4332]"
                                    }`}
                            >
                                {category}

                                {activeCategory === category && (
                                    <span className="absolute bottom-0 left-0 h-px w-full bg-[#a48755]" />
                                )}
                            </button>
                        ))}

                    </div>

                    {/* MOBILE FILTER */}

                    <button
                        type="button"
                        onClick={() =>
                            setMobileFilterOpen(!mobileFilterOpen)
                        }
                        className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-[#1b4332] sm:hidden"
                    >
                        Filter

                        <span className="text-[#a48755]">
                            {mobileFilterOpen ? "−" : "+"}
                        </span>
                    </button>

                    {/* PRODUCT COUNT */}

                    <p className="text-[8px] uppercase tracking-[0.15em] text-[#766963]">
                        {loading ? "Loading..." : `${filteredProducts.length} Pieces`}
                    </p>

                </div>

                {/* MOBILE CATEGORY MENU */}

                <div
                    className={`overflow-hidden transition-all duration-300 sm:hidden ${mobileFilterOpen
                        ? "max-h-60 border-t border-[#1b4332]/10"
                        : "max-h-0"
                        }`}
                >
                    <div className="grid grid-cols-2 gap-px bg-[#1b4332]/10">

                        {categories.map((category) => (
                            <button
                                key={category}
                                type="button"
                                onClick={() => {
                                    setActiveCategory(category);
                                    setMobileFilterOpen(false);
                                }}
                                className={`bg-[#f8f4ec] px-4 py-3 text-[8px] uppercase tracking-[0.15em] ${activeCategory === category
                                    ? "text-[#1b4332]"
                                    : "text-[#766963]"
                                    }`}
                            >
                                {category}
                            </button>
                        ))}

                    </div>
                </div>

            </section>

            {/* =====================================
                SEARCH + SORT
            ===================================== */}

            <section className="px-5 pt-8 sm:px-8 sm:pt-10 lg:px-12">

                <div className="mx-auto flex max-w-[1300px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    {/* SEARCH */}

                    <div className="flex max-w-sm items-center border-b border-[#1b4332]/20">

                        <SearchIcon />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search jewellery"
                            className="w-full bg-transparent px-3 py-2.5 text-xs text-[#1b4332] outline-none placeholder:text-[#9b8d84]"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="px-1 text-sm text-[#a48755]"
                            >
                                ×
                            </button>
                        )}

                    </div>

                    {/* SORT */}

                    <div className="flex items-center gap-3">

                        <span className="text-[8px] uppercase tracking-[0.16em] text-[#766963]">
                            Sort
                        </span>

                        <div className="relative">

                            <select
                                value={sortBy}
                                onChange={(e) =>
                                    setSortBy(e.target.value)
                                }
                                className="appearance-none bg-transparent py-2 pr-7 text-[9px] uppercase tracking-[0.12em] text-[#1b4332] outline-none"
                            >
                                <option value="featured">
                                    Featured
                                </option>

                                <option value="price-low">
                                    Price: Low to High
                                </option>

                                <option value="price-high">
                                    Price: High to Low
                                </option>

                                <option value="name">
                                    Name
                                </option>
                            </select>

                            <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[#a48755]">
                                ↓
                            </span>

                        </div>

                    </div>

                </div>

            </section>

            {/* =====================================
                PRODUCT GRID
            ===================================== */}

            <section className="px-5 pb-20 pt-8 sm:px-8 sm:pb-24 sm:pt-10 lg:px-12">

                <div className="mx-auto max-w-[1300px]">

                    {/* LOADING */}

                    {loading && (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">

                            {[1, 2, 3, 4, 5, 6, 7, 8].map(
                                (item) => (
                                    <div key={item}>
                                        <div className="aspect-square animate-pulse bg-[#eee6db]" />
                                        <div className="mt-3 h-2 w-16 animate-pulse bg-[#e5dbce]" />
                                        <div className="mt-2 h-4 w-28 animate-pulse bg-[#e5dbce]" />
                                    </div>
                                )
                            )}

                        </div>
                    )}

                    {/* ERROR */}

                    {!loading && error && (
                        <div className="py-24 text-center">

                            <p className="text-[8px] uppercase tracking-[0.3em] text-[#a48755]">
                                Something went wrong
                            </p>

                            <h2 className="mt-3 font-serif text-3xl text-[#1b4332]">
                                Unable to load our pieces.
                            </h2>

                            <p className="mx-auto mt-3 max-w-md text-xs leading-6 text-[#6b5e57]">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    window.location.reload()
                                }
                                className="mt-6 border-b border-[#a48755] pb-1 text-[9px] uppercase tracking-[0.18em] text-[#1b4332]"
                            >
                                Try again
                            </button>

                        </div>
                    )}

                    {/* PRODUCTS */}

                    {wishlistError && (
                        <p role="alert" className="mb-5 text-sm text-red-700">
                            {wishlistError}
                        </p>
                    )}

                    {!loading &&
                        !error &&
                        filteredProducts.length > 0 && (
                            <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 sm:gap-y-12 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">

                                {filteredProducts.map((product) => (
                                    <ShopProductCard
                                        key={product.id}
                                        product={product}
                                        isWishlisted={wishlist.includes(
                                            Number(product.id)
                                        )}
                                        onWishlist={() =>
                                            toggleWishlist(product.id)
                                        }
                                        formatPrice={formatPrice}
                                    />
                                ))}

                            </div>
                        )}

                    {/* EMPTY */}

                    {!loading &&
                        !error &&
                        filteredProducts.length === 0 && (
                            <div className="py-24 text-center">

                                <p className="text-[8px] uppercase tracking-[0.3em] text-[#a48755]">
                                    Nothing found
                                </p>

                                <h2 className="mt-3 font-serif text-3xl text-[#1b4332]">
                                    No pieces match your search.
                                </h2>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch("");
                                        setActiveCategory(
                                            "All Jewellery"
                                        );
                                    }}
                                    className="mt-5 border-b border-[#a48755] pb-1 text-[9px] uppercase tracking-[0.18em] text-[#1b4332]"
                                >
                                    View all jewellery
                                </button>

                            </div>
                        )}

                </div>

            </section>

            {/* =====================================
                BOTTOM EDITORIAL
            ===================================== */}

            <section className="bg-[#1b4332] px-6 py-16 sm:px-10 sm:py-20">

                <div className="mx-auto max-w-2xl text-center">

                    <span className="text-xl text-[#c6a66b]">
                        ✦
                    </span>

                    <p className="mt-4 text-[8px] uppercase tracking-[0.32em] text-[#c6a66b]">
                        Pearloraa
                    </p>

                    <h2 className="mt-3 font-serif text-3xl text-[#f8f4ec] sm:text-4xl">
                        Made for your moments.
                    </h2>

                    <p className="mx-auto mt-4 max-w-md text-xs leading-6 text-[#eadfd5]/65 sm:text-sm">
                        Discover pieces that are designed to be worn today
                        and remembered for years to come.
                    </p>

                </div>

            </section>

        </main>
    );
}

/* =========================================
   PRODUCT CARD
========================================= */

function ShopProductCard({
    product,
    isWishlisted,
    onWishlist,
    formatPrice,
}) {
    return (
        <article className="group">

            {/* IMAGE */}

            <div className="relative overflow-hidden bg-[#eee6db]">

                <Link to={`/product/${product.id}`}>
                    <img
                        src={product.main_image}
                        alt={product.name}
                        loading="lazy"
                        className="aspect-square w-full object-cover transition-transform duration-[1000ms] group-hover:scale-[1.035] sm:aspect-[4/4.5]"
                    />
                </Link>

                {/* BADGE */}

                {product.badge && (
                    <span className="absolute left-2.5 top-2.5 bg-[#f8f4ec]/90 px-2.5 py-1 text-[7px] uppercase tracking-[0.15em] text-[#1b4332]">
                        {product.badge}
                    </span>
                )}

                {/* WISHLIST */}

                <button
                    type="button"
                    onClick={onWishlist}
                    aria-label={
                        isWishlisted
                            ? `Remove ${product.name} from wishlist`
                            : `Add ${product.name} to wishlist`
                    }
                    className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${isWishlisted
                        ? "bg-[#1b4332] text-[#f8f4ec]"
                        : "bg-[#f8f4ec]/90 text-[#1b4332] hover:bg-[#1b4332] hover:text-[#f8f4ec]"
                        }`}
                >
                    <HeartIcon filled={isWishlisted} />
                </button>

                {/* VIEW PIECE */}

                <Link
                    to={`/product/${product.id}`}
                    className="absolute bottom-3 left-3 right-3 translate-y-3 bg-[#f8f4ec]/95 py-2.5 text-center text-[8px] uppercase tracking-[0.18em] text-[#1b4332] opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100"
                >
                    View piece
                </Link>

            </div>

            {/* DETAILS */}

            <div className="pt-3">

                <p className="text-[7px] uppercase tracking-[0.18em] text-[#a48755]">
                    {product.category?.name || "Jewellery"}
                </p>

                <div className="mt-1 flex items-start justify-between gap-2">

                    <Link to={`/product/${product.id}`}>

                        <h2 className="font-serif text-sm leading-tight text-[#1b4332] sm:text-base">
                            {product.name}
                        </h2>

                    </Link>

                    <p className="whitespace-nowrap text-[9px] text-[#1b4332] sm:text-[10px]">
                        {formatPrice(product.price)}
                    </p>

                </div>

            </div>

        </article>
    );
}

/* =========================================
   SEARCH ICON
========================================= */

function SearchIcon() {
    return (
        <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#1b4332]"
            aria-hidden="true"
        >
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 5 5" />
        </svg>
    );
}

/* =========================================
   HEART ICON
========================================= */

function HeartIcon({ filled = false }) {
    return (
        <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M20.8 8.8c0 5.5-8.8 10.2-8.8 10.2S3.2 14.3 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" />
        </svg>
    );
}
