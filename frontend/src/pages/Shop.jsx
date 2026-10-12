import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import QuickViewModal from "../components/QuickViewModal";
import {
    loadWishlistItems,
    toggleWishlistProduct,
} from "../utils/wishlist";

const API_URL = "http://127.0.0.1:8000/api/products/";
const CATEGORIES_URL = "http://127.0.0.1:8000/api/products/categories/";

// --------------------------------------------------
// Icons
// --------------------------------------------------

function SearchIcon({ size = 18 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
        </svg>
    );
}

function HeartIcon({ size = 19, filled = false }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
        </svg>
    );
}

function ChevronDownIcon({ size = 16 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}

function SlidersIcon({ size = 18 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="4" y1="6" x2="20" y2="6" />
            <circle cx="9" cy="6" r="2" />

            <line x1="4" y1="12" x2="20" y2="12" />
            <circle cx="15" cy="12" r="2" />

            <line x1="4" y1="18" x2="20" y2="18" />
            <circle cx="11" cy="18" r="2" />
        </svg>
    );
}

// --------------------------------------------------
// Image URL Helper
// --------------------------------------------------

function getImageUrl(image) {
    if (!image) {
        return "";
    }

    // Django is already returning a complete URL:
    // http://127.0.0.1:8000/products/image.jpg

    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {
        return image;
    }

    // If Django ever returns a relative URL
    if (image.startsWith("/")) {
        return `http://127.0.0.1:8000${image}`;
    }

    return `http://127.0.0.1:8000/${image}`;
}

// --------------------------------------------------
// Product Card
// --------------------------------------------------

function ShopProductCard({
    product,
    isWishlisted,
    onToggleWishlist,
    onQuickView,
}) {
    const finalPrice = Number(
        product.final_price ??
        product.discount_price ??
        product.price ??
        0
    );

    const originalPrice = Number(
        product.price ?? 0
    );

    const formattedPrice =
        finalPrice.toLocaleString("en-IN");

    const categoryName =
        product.category?.name ||
        "Jewellery";

    const imageUrl =
        getImageUrl(product.main_image);

    const hasDiscount =
        product.discount_price !== null &&
        product.discount_price !== undefined &&
        Number(product.discount_price) <
        Number(product.price);

    return (
        <article className="group">
            {/* Product Image */}

            <div className="relative overflow-hidden bg-[#f1ebe2]">

                <div
                    onClick={() => onQuickView(product)}
                    className="block cursor-pointer"
                >
                    <div className="aspect-[4/5] overflow-hidden">

                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={
                                    product.name ||
                                    "Pearloraa jewellery"
                                }
                                className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
                                loading="lazy"
                                onError={(event) => {
                                    event.currentTarget.style.display =
                                        "none";
                                }}
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#eee7dc] text-sm text-[#8d7a6b]">
                                No image
                            </div>
                        )}

                    </div>
                </div>

                {/* Sale Badge */}

                {hasDiscount && (
                    <div className="absolute left-4 top-4 bg-[#1b4332] px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white">
                        Sale
                    </div>
                )}

                {/* Wishlist */}

                <button
                    type="button"
                    onClick={() =>
                        onToggleWishlist(product.id)
                    }
                    aria-label={
                        isWishlisted
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                    }
                    className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center bg-white/90 text-[#1b4332] transition hover:bg-white"
                >
                    <HeartIcon
                        filled={isWishlisted}
                    />
                </button>
            </div>

            {/* Product Information */}

            <div className="pt-5">

                <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[#9b8778]">
                    {categoryName}
                </p>

                <div
                    onClick={() => onQuickView(product)}
                    className="cursor-pointer"
                >
                    <h3 className="font-serif text-[20px] leading-tight text-[#321019] transition-colors group-hover:text-[#6c2a38]">
                        {product.name}
                    </h3>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4">

                    <div className="flex items-center gap-3">

                        <p className="text-[14px] tracking-[0.04em] text-[#1b4332]">
                            ₹{formattedPrice}
                        </p>

                        {hasDiscount && (
                            <p className="text-[12px] text-[#a18e82] line-through">
                                ₹
                                {originalPrice.toLocaleString(
                                    "en-IN"
                                )}
                            </p>
                        )}

                    </div>

                    <button
                        type="button"
                        onClick={() => onQuickView(product)}
                        className="text-[10px] uppercase tracking-[0.18em] text-[#765f53] transition hover:text-[#1b4332]"
                    >
                        View Piece
                    </button>

                </div>
            </div>
        </article>
    );
}

// --------------------------------------------------
// Shop Page
// --------------------------------------------------

export default function Shop() {

    const [quickViewProduct, setQuickViewProduct] = useState(null);

    const [products, setProducts] =
        useState([]);

    const [categoryList, setCategoryList] =
        useState([]);

    const [activeCategory, setActiveCategory] =
        useState("All Jewellery");

    const [search, setSearch] =
        useState("");

    const [sortBy, setSortBy] =
        useState("featured");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [wishlistError, setWishlistError] =
        useState("");

    const [mobileFilterOpen, setMobileFilterOpen] =
        useState(false);

    const [wishlist, setWishlist] = useState([]);

    // --------------------------------------------------
    // Fetch Products
    // --------------------------------------------------

    useEffect(() => {

        const fetchProducts = async () => {

            try {
                setLoading(true);
                setError("");

                const response =
                    await fetch(API_URL);

                if (!response.ok) {
                    throw new Error(
                        `Server returned ${response.status}`
                    );
                }

                const data =
                    await response.json();

                console.log(
                    "Products from Django:",
                    data
                );

                let productList = [];

                if (Array.isArray(data)) {
                    productList = data;
                } else if (
                    Array.isArray(data.results)
                ) {
                    productList = data.results;
                }

                setProducts(productList);

            } catch (err) {

                console.error(
                    "Product fetch error:",
                    err
                );

                setError(
                    "Unable to load jewellery at the moment. Please try again."
                );

            } finally {
                setLoading(false);
            }
        };

        fetchProducts();

    }, []);

    useEffect(() => {

        const fetchCategories = async () => {

            try {
                const response =
                    await fetch(CATEGORIES_URL);

                if (!response.ok) {
                    throw new Error(
                        `Server returned ${response.status}`
                    );
                }

                const data = await response.json();

                setCategoryList(
                    Array.isArray(data)
                        ? data
                        : data.results || []
                );
            } catch (err) {
                console.error(
                    "Category fetch error:",
                    err
                );
            }
        };

        fetchCategories();

    }, []);

    // --------------------------------------------------
    // Wishlist
    // --------------------------------------------------

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

    const toggleWishlist = async (productId) => {
        const numericId = Number(productId);
        const shouldSave = !wishlist.includes(numericId);

        if (
            !localStorage.getItem("access_token") &&
            !sessionStorage.getItem("access_token")
        ) {
            window.location.href = "/login";
            return;
        }

        try {
            const items = await toggleWishlistProduct(numericId, shouldSave);
            setWishlist(items.map((item) => Number(item.product.id)));
            setWishlistError("");
        } catch (toggleError) {
            setWishlistError(
                toggleError.message || "Unable to update your wishlist."
            );
        }
    };

    // --------------------------------------------------
    // Categories
    // --------------------------------------------------

    const categories = [
        "All Jewellery",
        ...categoryList.map(
            (category) => category.name
        ),
    ];

    // --------------------------------------------------
    // Filtering + Searching + Sorting
    // --------------------------------------------------

    const filteredProducts = useMemo(() => {

        let result = [...products];

        // Category

        if (
            activeCategory !==
            "All Jewellery"
        ) {
            result = result.filter(
                (product) => {

                    const category =
                        product.category?.name ||
                        "";

                    return (
                        category.toLowerCase() ===
                        activeCategory.toLowerCase()
                    );
                }
            );
        }

        // Search

        if (search.trim()) {

            const query =
                search.trim().toLowerCase();

            result = result.filter(
                (product) => {

                    const name =
                        String(
                            product.name || ""
                        ).toLowerCase();

                    const category =
                        String(
                            product.category?.name ||
                            ""
                        ).toLowerCase();

                    const description =
                        String(
                            product.description ||
                            ""
                        ).toLowerCase();

                    return (
                        name.includes(query) ||
                        category.includes(query) ||
                        description.includes(query)
                    );
                }
            );
        }

        // Price Low → High

        if (
            sortBy === "price-low"
        ) {
            result.sort(
                (a, b) =>
                    Number(
                        a.final_price ??
                        a.discount_price ??
                        a.price ??
                        0
                    ) -
                    Number(
                        b.final_price ??
                        b.discount_price ??
                        b.price ??
                        0
                    )
            );
        }

        // Price High → Low

        if (
            sortBy === "price-high"
        ) {
            result.sort(
                (a, b) =>
                    Number(
                        b.final_price ??
                        b.discount_price ??
                        b.price ??
                        0
                    ) -
                    Number(
                        a.final_price ??
                        a.discount_price ??
                        a.price ??
                        0
                    )
            );
        }

        // Name

        if (sortBy === "name") {

            result.sort((a, b) =>
                String(
                    a.name || ""
                ).localeCompare(
                    String(
                        b.name || ""
                    )
                )
            );
        }

        // Featured

        if (
            sortBy === "featured"
        ) {
            result.sort(
                (a, b) =>
                    Number(
                        b.is_featured
                    ) -
                    Number(
                        a.is_featured
                    )
            );
        }

        return result;

    }, [
        products,
        activeCategory,
        search,
        sortBy,
    ]);

    // --------------------------------------------------
    // Retry
    // --------------------------------------------------

    const handleRetry = () => {
        window.location.reload();
    };

    // --------------------------------------------------
    // Loading
    // --------------------------------------------------

    if (loading) {

        return (
            <main className="min-h-screen bg-[#f8f4ec] pt-32">

                <div className="mx-auto max-w-[1400px] px-6 py-24 text-center md:px-10">

                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border border-[#1b4332] border-t-transparent" />

                    <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-[#8d796d]">
                        Loading our collection
                    </p>

                </div>

            </main>
        );
    }

    // --------------------------------------------------
    // Error
    // --------------------------------------------------

    if (error) {

        return (
            <main className="min-h-screen bg-[#f8f4ec] pt-32">

                <div className="mx-auto max-w-[700px] px-6 py-24 text-center">

                    <p className="text-[11px] uppercase tracking-[0.25em] text-[#9b8778]">
                        Something went wrong
                    </p>

                    <h1 className="mt-5 font-serif text-4xl text-[#321019] md:text-5xl">
                        Unable to load our pieces.
                    </h1>

                    <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-[#75645b]">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={handleRetry}
                        className="mt-8 border border-[#1b4332] px-7 py-3 text-[10px] uppercase tracking-[0.2em] text-[#1b4332] transition hover:bg-[#1b4332] hover:text-white"
                    >
                        Try Again
                    </button>

                </div>

            </main>
        );
    }

    // --------------------------------------------------
    // Page
    // --------------------------------------------------

    return (
        <main className="min-h-screen bg-[#f8f4ec] text-[#321019]">

            {/* Intro */}

            <section className="border-b border-[#ded5c9] pt-32 md:pt-40">

                <div className="mx-auto max-w-[1400px] px-6 pb-16 md:px-10 md:pb-20">

                    <div className="max-w-3xl">

                        <p className="text-[10px] uppercase tracking-[0.3em] text-[#9a8576]">
                            The Pearloraa Collection
                        </p>

                        <h1 className="mt-5 font-serif text-5xl leading-[0.95] tracking-[-0.025em] text-[#321019] sm:text-6xl md:text-7xl">
                            Jewellery made
                            <br />
                            to be remembered.
                        </h1>

                        <p className="mt-7 max-w-xl text-sm leading-7 text-[#75645b] md:text-[15px]">
                            Discover refined pieces designed to
                            become part of your everyday rituals,
                            celebrations and most meaningful moments.
                        </p>

                    </div>

                </div>

            </section>

            {/* Category Navigation */}

            <section className="sticky top-0 z-20 border-b border-[#ded5c9] bg-[#f8f4ec]/95 backdrop-blur-sm">

                <div className="mx-auto max-w-[1400px] px-6 md:px-10">

                    <div className="flex items-center justify-between gap-6 py-5">

                        {/* Desktop Categories */}

                        <div className="hidden items-center gap-8 md:flex">

                            {categories.map(
                                (category) => (

                                    <button
                                        key={category}
                                        type="button"
                                        onClick={() =>
                                            setActiveCategory(
                                                category
                                            )
                                        }
                                        className={`relative pb-1 text-[10px] uppercase tracking-[0.18em] transition ${activeCategory ===
                                            category
                                            ? "text-[#1b4332]"
                                            : "text-[#8a7569] hover:text-[#1b4332]"
                                            }`}
                                    >

                                        {category}

                                        {activeCategory ===
                                            category && (
                                                <span className="absolute bottom-[-21px] left-0 h-px w-full bg-[#1b4332]" />
                                            )}

                                    </button>

                                )
                            )}

                        </div>

                        {/* Mobile Filter */}

                        <button
                            type="button"
                            onClick={() =>
                                setMobileFilterOpen(
                                    (value) =>
                                        !value
                                )
                            }
                            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#1b4332] md:hidden"
                        >
                            <SlidersIcon />
                            Filter
                        </button>

                        {/* Count */}

                        <p className="ml-auto text-[10px] uppercase tracking-[0.18em] text-[#9a8576]">
                            {filteredProducts.length}{" "}
                            Pieces
                        </p>

                    </div>

                    {/* Mobile Category Menu */}

                    {mobileFilterOpen && (

                        <div className="border-t border-[#ded5c9] py-5 md:hidden">

                            <div className="grid grid-cols-2 gap-3">

                                {categories.map(
                                    (category) => (

                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() => {
                                                setActiveCategory(
                                                    category
                                                );
                                                setMobileFilterOpen(
                                                    false
                                                );
                                            }}
                                            className={`border px-4 py-3 text-left text-[10px] uppercase tracking-[0.16em] ${activeCategory ===
                                                category
                                                ? "border-[#1b4332] bg-[#1b4332] text-white"
                                                : "border-[#d8cec1] text-[#6e5b50]"
                                                }`}
                                        >
                                            {category}
                                        </button>

                                    )
                                )}

                            </div>

                        </div>

                    )}

                </div>

            </section>

            {/* Search + Sort */}

            <section className="border-b border-[#ded5c9]">

                <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between md:px-10">

                    {/* Search */}

                    <div className="relative w-full sm:max-w-xs">

                        <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-[#8f7b70]">
                            <SearchIcon size={16} />
                        </div>

                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search jewellery"
                            className="w-full border-b border-[#cfc3b6] bg-transparent py-2 pl-7 pr-2 text-sm text-[#321019] outline-none placeholder:text-[#a18e82] focus:border-[#1b4332]"
                        />

                    </div>

                    {/* Sort */}

                    <div className="relative flex items-center gap-3">

                        <span className="text-[10px] uppercase tracking-[0.18em] text-[#9a8576]">
                            Sort
                        </span>

                        <div className="relative">

                            <select
                                value={sortBy}
                                onChange={(event) =>
                                    setSortBy(
                                        event.target.value
                                    )
                                }
                                className="appearance-none bg-transparent py-2 pr-7 text-[11px] uppercase tracking-[0.12em] text-[#1b4332] outline-none"
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

                            <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[#1b4332]">
                                <ChevronDownIcon />
                            </div>

                        </div>

                    </div>

                </div>

            </section>

            {/* Products */}

            <section className="mx-auto max-w-[1400px] px-6 py-12 md:px-10 md:py-16">
                {wishlistError && (
                    <p role="alert" className="mb-5 text-sm text-red-700">
                        {wishlistError}
                    </p>
                )}

                {filteredProducts.length > 0 ? (

                    <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                        {filteredProducts.map(
                            (product) => (

                                <ShopProductCard
                                    key={product.id}
                                    product={product}
                                    isWishlisted={wishlist.includes(
                                        product.id
                                    )}
                                    onToggleWishlist={
                                        toggleWishlist
                                    }
                                    onQuickView={setQuickViewProduct}
                                />

                            )
                        )}

                    </div>

                ) : (

                    <div className="py-24 text-center">

                        <p className="text-[10px] uppercase tracking-[0.25em] text-[#9a8576]">
                            No pieces found
                        </p>

                        <h2 className="mt-4 font-serif text-3xl text-[#321019]">
                            Nothing matches your search.
                        </h2>

                        <button
                            type="button"
                            onClick={() => {
                                setSearch("");
                                setActiveCategory(
                                    "All Jewellery"
                                );
                            }}
                            className="mt-7 border border-[#1b4332] px-7 py-3 text-[10px] uppercase tracking-[0.18em] text-[#1b4332] transition hover:bg-[#1b4332] hover:text-white"
                        >
                            View all pieces
                        </button>

                    </div>

                )}

            </section>

            {/* Editorial Bottom Section */}

            <section className="border-t border-[#ded5c9] bg-[#efe7da]">

                <div className="mx-auto grid max-w-[1400px] grid-cols-1 md:grid-cols-2">

                    <div className="flex min-h-[420px] flex-col justify-center px-6 py-16 md:px-12 lg:px-20">

                        <p className="text-[10px] uppercase tracking-[0.25em] text-[#9a8576]">
                            The Pearloraa Philosophy
                        </p>

                        <h2 className="mt-5 max-w-lg font-serif text-4xl leading-tight text-[#321019] md:text-5xl">
                            Quiet luxury,
                            <br />
                            meaningful detail.
                        </h2>

                        <p className="mt-6 max-w-lg text-sm leading-7 text-[#75645b]">
                            Every piece is chosen with intention —
                            timeless forms, considered details and
                            jewellery designed to live beautifully
                            with you.
                        </p>

                        <Link
                            to="/about"
                            className="mt-8 inline-flex w-fit border-b border-[#1b4332] pb-2 text-[10px] uppercase tracking-[0.2em] text-[#1b4332]"
                        >
                            Discover our story
                        </Link>

                    </div>

                    <div className="min-h-[420px] overflow-hidden bg-[#e6ddd0]">

                        <img
                            src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=85"
                            alt="Pearloraa jewellery"
                            className="h-full w-full object-cover"
                            loading="lazy"
                        />

                    </div>

                </div>

            </section>

            {/* Quick View Modal */}
            <QuickViewModal
                product={quickViewProduct}
                isOpen={!!quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
            />

        </main>
    );
}
