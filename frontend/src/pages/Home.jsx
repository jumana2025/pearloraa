import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    loadWishlistItems,
    toggleWishlistProduct,
} from "../utils/wishlist";
import { API_ORIGIN } from "../api/axios";

const API_URL = `${API_ORIGIN}/api/products/`;
const CATEGORIES_URL = `${API_ORIGIN}/api/products/categories/`;

function getImageUrl(image) {
    if (!image) return "";
    if (image.startsWith("http://") || image.startsWith("https://")) return image;
    return `${API_ORIGIN}${image.startsWith("/") ? "" : "/"}${image}`;
}

export default function Home() {
    const [products, setProducts] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [wishlistIds, setWishlistIds] = useState([]);
    const [wishlistError, setWishlistError] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(API_URL);
                if (response.ok) {
                    const data = await response.json();
                    setProducts(Array.isArray(data) ? data : data.results || []);
                }
            } catch (err) {
                console.error("Error fetching products", err);
            }
        };
        fetchProducts();

        const fetchCategories = async () => {
            try {
                const response = await fetch(CATEGORIES_URL);
                if (response.ok) {
                    const data = await response.json();
                    setCategoryList(Array.isArray(data) ? data : data.results || []);
                }
            } catch (err) {
                console.error("Error fetching categories", err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        let requestId = 0;
        const syncWishlist = async () => {
            const currentRequest = ++requestId;
            setWishlistIds([]);
            try {
                const items = await loadWishlistItems();
                if (currentRequest === requestId) {
                    setWishlistIds(
                        items.map((item) => Number(item.product.id))
                    );
                    setWishlistError("");
                }
            } catch (error) {
                if (currentRequest === requestId) {
                    setWishlistError(
                        error.message || "Unable to sync your wishlist."
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
        if (
            !localStorage.getItem("access_token") &&
            !sessionStorage.getItem("access_token")
        ) {
            window.location.href = "/login";
            return;
        }

        try {
            const items = await toggleWishlistProduct(
                productId,
                !wishlistIds.includes(Number(productId))
            );
            setWishlistIds(items.map((item) => Number(item.product.id)));
            setWishlistError("");
        } catch (error) {
            setWishlistError(
                error.message || "Unable to update your wishlist."
            );
        }
    };

    // Derived Data
    const bestsellers = products.slice(0, 4).map(p => ({
        id: p.id,
        name: p.name,
        category: p.category?.name || "Jewellery",
        price: `₹${Number(p.final_price ?? p.discount_price ?? p.price ?? 0).toLocaleString("en-IN")}`,
        image: getImageUrl(p.main_image),
        label: p.is_featured ? "Bestseller" : "New",
    }));

    const newCollection = products.slice(4, 7).map(p => ({
        id: p.id,
        name: p.name,
        price: `₹${Number(p.final_price ?? p.discount_price ?? p.price ?? 0).toLocaleString("en-IN")}`,
        image: getImageUrl(p.main_image),
    }));

    const dynamicCategories = categoryList.slice(0, 3).map(cat => {
        // Find first product in this category to get an image
        const productInCat = products.find(p => p.category?.name === cat.name);
        return {
            name: cat.name,
            image: productInCat ? getImageUrl(productInCat.main_image) : "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=85",
        };
    });
    return (
        <main className="overflow-hidden bg-[#f8f4ec] text-[#302522]">
            {wishlistError && (
                <p
                    role="alert"
                    className="fixed left-1/2 top-24 z-50 -translate-x-1/2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 shadow"
                >
                    {wishlistError}
                </p>
            )}

            {/* =====================================
          HERO
      ===================================== */}

            <section className="bg-[#1b4332] pt-[82px] sm:pt-[88px]">

                <div className="mx-auto grid max-w-[1400px] grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">

                    {/* HERO CONTENT */}
                    <div className="flex items-center px-6 py-14 sm:px-10 sm:py-16 lg:px-14 xl:px-20">

                        <div className="max-w-lg">

                            <p className="mb-5 text-[8px] font-medium uppercase tracking-[0.35em] text-[#c6a66b] sm:text-[9px]">
                                Pearloraa Fine Jewellery
                            </p>

                            <h1 className="font-serif text-[38px] leading-[1.04] tracking-[-0.01em] text-[#f8f4ec] sm:text-5xl lg:text-[56px] xl:text-[62px]">
                                Quiet pieces
                                <br />
                                for everyday
                                <br />
                                <span className="italic text-[#d8c39b]">
                                    moments.
                                </span>
                            </h1>

                            <p className="mt-5 max-w-sm text-xs leading-6 text-[#eadfd5]/75 sm:text-sm">
                                Timeless jewelry designed to become part of your everyday
                                story. Thoughtfully made, quietly beautiful and created to
                                stay with you.
                            </p>

                            <div className="mt-7 flex flex-wrap items-center gap-5">

                                <Link
                                    to="/shop"
                                    className="group inline-flex items-center gap-4 border border-[#c6a66b] bg-[#c6a66b] px-5 py-3.5 text-[9px] font-medium uppercase tracking-[0.18em] text-[#321019] transition-all duration-500 hover:bg-transparent hover:text-[#f8f4ec] sm:px-6"
                                >
                                    Shop Collection

                                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                                        →
                                    </span>
                                </Link>

                                <a
                                    href="#collection"
                                    className="group text-[9px] font-medium uppercase tracking-[0.18em] text-[#f8f4ec]"
                                >
                                    Explore More

                                    <span className="ml-2 inline-block text-[#c6a66b] transition-transform duration-300 group-hover:translate-y-1">
                                        ↓
                                    </span>
                                </a>

                            </div>

                        </div>

                    </div>

                    {/* HERO IMAGE */}
                    <div className="relative h-[400px] overflow-hidden sm:h-[480px] lg:h-[590px]">

                        <img
                            src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1600&q=90"
                            alt="Elegant gold jewelry"
                            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-[1800ms] hover:scale-[1.025]"
                        />

                        <div className="absolute inset-0 bg-[#321019]/10" />

                        <div className="absolute bottom-6 right-6 hidden text-right sm:block">

                            <p className="text-[8px] uppercase tracking-[0.28em] text-white/75">
                                The New Edit
                            </p>

                            <p className="mt-1 font-serif text-xl italic text-white">
                                2026
                            </p>

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================
          INTRO STRIP
      ===================================== */}

            <section className="border-b border-[#1b4332]/10 bg-[#f8f4ec]">

                <div className="mx-auto max-w-5xl px-6 py-12 text-center sm:py-16">

                    <p className="text-[8px] uppercase tracking-[0.32em] text-[#a48755]">
                        Designed with intention
                    </p>

                    <h2 className="mx-auto mt-3 max-w-2xl font-serif text-2xl leading-tight text-[#1b4332] sm:text-3xl lg:text-4xl">
                        Jewellery that whispers,
                        <span className="italic"> never shouts.</span>
                    </h2>

                </div>

            </section>


            {/* =====================================
          BESTSELLERS
      ===================================== */}

            <section className="bg-[#f8f4ec] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">

                <div className="mx-auto max-w-[1300px]">

                    <div className="mb-9 flex items-end justify-between sm:mb-11">

                        <div>

                            <p className="text-[8px] font-medium uppercase tracking-[0.32em] text-[#a48755]">
                                Most loved
                            </p>

                            <h2 className="mt-2 font-serif text-3xl text-[#1b4332] sm:text-4xl">
                                Bestsellers
                            </h2>

                        </div>

                        <Link
                            to="/shop"
                            className="hidden text-[9px] uppercase tracking-[0.18em] text-[#1b4332] sm:block"
                        >
                            View all →
                        </Link>

                    </div>


                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-4 md:gap-x-6">

                        {bestsellers.map((product) => (
                            <ProductCard
                                key={product.name}
                                product={product}
                                isWishlisted={wishlistIds.includes(Number(product.id))}
                                onToggleWishlist={toggleWishlist}
                            />
                        ))}

                    </div>

                </div>

            </section>


            {/* =====================================
          EDITORIAL SECTION
      ===================================== */}

            <section className="bg-[#1b4332]">

                <div className="mx-auto grid max-w-[1400px] grid-cols-1 lg:grid-cols-2">

                    {/* TEXT */}
                    <div className="flex items-center px-7 py-16 sm:px-12 sm:py-20 lg:px-16 xl:px-20">

                        <div className="max-w-md">

                            <p className="text-[8px] uppercase tracking-[0.32em] text-[#c6a66b]">
                                The Pearloraa philosophy
                            </p>

                            <h2 className="mt-5 font-serif text-4xl leading-[1.05] text-[#f8f4ec] sm:text-5xl lg:text-[52px]">
                                Jewelry for
                                <br />
                                every{" "}
                                <span className="italic text-[#d8c39b]">
                                    moment.
                                </span>
                            </h2>

                            <p className="mt-5 max-w-sm text-xs leading-6 text-[#eadfd5]/70 sm:text-sm">
                                We believe the most beautiful pieces are the ones that become
                                yours. Designed with quiet confidence and crafted to be worn,
                                loved and remembered.
                            </p>

                            <Link
                                to="/collections"
                                className="group mt-7 inline-flex items-center gap-3 border-b border-[#c6a66b] pb-2.5 text-[9px] uppercase tracking-[0.18em] text-[#f8f4ec]"
                            >
                                Discover the collection

                                <span className="transition-transform duration-300 group-hover:translate-x-2">
                                    →
                                </span>

                            </Link>

                        </div>

                    </div>


                    {/* IMAGE */}
                    <div className="relative h-[400px] overflow-hidden sm:h-[500px] lg:h-[570px]">

                        <img
                            src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1400&q=90"
                            alt="Pearloraa jewelry editorial"
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1600ms] hover:scale-[1.035]"
                        />

                    </div>

                </div>

            </section>


            {/* =====================================
          NEW COLLECTION
      ===================================== */}

            <section
                id="collection"
                className="bg-[#efe7da] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"
            >

                <div className="mx-auto max-w-[1300px]">

                    <div className="mx-auto mb-10 max-w-xl text-center sm:mb-12">

                        <p className="text-[8px] uppercase tracking-[0.32em] text-[#a48755]">
                            The latest chapter
                        </p>

                        <h2 className="mt-3 font-serif text-3xl text-[#1b4332] sm:text-4xl">
                            New Collection
                        </h2>

                        <p className="mt-3 text-xs leading-6 text-[#665a54] sm:text-sm">
                            Delicate forms, luminous details and timeless silhouettes made
                            for the moments you want to keep.
                        </p>

                    </div>


                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-5">

                        {newCollection.map((product, index) => (
                            <div
                                key={product.name}
                                className={`group ${index === 1 ? "sm:-translate-y-5" : ""
                                    }`}
                            >

                                <div className="relative overflow-hidden bg-[#ddd2c3]">

                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="aspect-[4/4.5] h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.035]"
                                    />

                                </div>

                                <div className="flex items-start justify-between gap-3 pt-4">

                                    <div>

                                        <h3 className="font-serif text-base text-[#1b4332] sm:text-lg">
                                            {product.name}
                                        </h3>

                                        <p className="mt-1 text-[10px] text-[#756862]">
                                            Fine Jewellery
                                        </p>

                                    </div>

                                    <p className="whitespace-nowrap text-[11px] text-[#1b4332]">
                                        {product.price}
                                    </p>

                                </div>

                                <Link
                                    to="/shop"
                                    className="mt-2 inline-block text-[8px] uppercase tracking-[0.18em] text-[#a48755]"
                                >
                                    Shop now →
                                </Link>

                            </div>
                        ))}

                    </div>

                </div>

            </section>


            {/* =====================================
          SHOP BY CATEGORY
      ===================================== */}

            <section className="bg-[#f8f4ec] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">

                <div className="mx-auto max-w-[1300px]">

                    <div className="mb-9 text-center sm:mb-11">

                        <p className="text-[8px] uppercase tracking-[0.32em] text-[#a48755]">
                            Find your signature
                        </p>

                        <h2 className="mt-2 font-serif text-3xl text-[#1b4332] sm:text-4xl">
                            Shop by Category
                        </h2>

                    </div>


                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">

                        {dynamicCategories.map((category) => (
                            <Link
                                to="/shop"
                                key={category.name}
                                className="group"
                            >

                                <div className="relative overflow-hidden">

                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="aspect-[4/4.5] w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
                                    />

                                    <div className="absolute inset-0 bg-[#321019]/0 transition-all duration-500 group-hover:bg-[#321019]/15" />

                                </div>

                                <div className="flex items-center justify-between border-b border-[#1b4332]/15 py-4">

                                    <h3 className="font-serif text-xl text-[#1b4332]">
                                        {category.name}
                                    </h3>

                                    <span className="text-base text-[#a48755] transition-transform duration-300 group-hover:translate-x-2">
                                        →
                                    </span>

                                </div>

                            </Link>
                        ))}

                    </div>

                </div>

            </section>


            {/* =====================================
          GIFTING
      ===================================== */}

            <section className="bg-[#eadfd2] px-5 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-24">

                <div className="mx-auto grid max-w-[1300px] grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">

                    {/* TEXT */}
                    <div className="order-2 lg:order-1">

                        <p className="text-[8px] uppercase tracking-[0.32em] text-[#a48755]">
                            The art of giving
                        </p>

                        <h2 className="mt-4 max-w-md font-serif text-4xl leading-[1.05] text-[#1b4332] sm:text-5xl">
                            A gift worth
                            <br />
                            <span className="italic">
                                remembering.
                            </span>
                        </h2>

                        <p className="mt-5 max-w-sm text-xs leading-6 text-[#655851] sm:text-sm">
                            Thoughtful pieces for birthdays, milestones, quiet celebrations
                            and all the people who deserve something beautiful.
                        </p>

                        <Link
                            to="/gifts"
                            className="mt-7 inline-flex border border-[#1b4332] bg-[#1b4332] px-6 py-3.5 text-[9px] uppercase tracking-[0.18em] text-[#f8f4ec] transition-all duration-300 hover:bg-transparent hover:text-[#1b4332]"
                        >
                            Explore gifts
                        </Link>

                    </div>


                    {/* IMAGE */}
                    <div className="order-1 overflow-hidden lg:order-2">

                        <img
                            src="https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=1300&q=90"
                            alt="Luxury jewelry gift box"
                            className="aspect-[4/3] max-h-[450px] w-full object-cover transition-transform duration-[1400ms] hover:scale-[1.03]"
                        />

                    </div>

                </div>

            </section>


            {/* =====================================
          GIFT CERTIFICATES
      ===================================== */}

            <section className="bg-[#f8f4ec] px-5 py-16 sm:px-8 sm:py-20">

                <div className="mx-auto max-w-4xl border-y border-[#1b4332]/15 px-5 py-10 text-center sm:px-10 sm:py-12">

                    <div className="mx-auto mb-5 flex h-12 w-16 items-center justify-center border border-[#c6a66b]">

                        <span className="font-serif text-lg italic text-[#a48755]">
                            P
                        </span>

                    </div>

                    <p className="text-[8px] uppercase tracking-[0.32em] text-[#a48755]">
                        For something truly personal
                    </p>

                    <h2 className="mt-3 font-serif text-3xl text-[#1b4332] sm:text-4xl">
                        Gift certificates
                    </h2>

                    <p className="mx-auto mt-3 max-w-lg text-xs leading-6 text-[#6b5f58] sm:text-sm">
                        Let them choose the piece that speaks to them. A Pearloraa gift
                        certificate makes every occasion a little more memorable.
                    </p>

                    <Link
                        to="/gift-cards"
                        className="mt-6 inline-block border-b border-[#a48755] pb-1.5 text-[9px] uppercase tracking-[0.18em] text-[#1b4332]"
                    >
                        Shop gift cards →
                    </Link>

                </div>

            </section>


            {/* =====================================
          BRAND STORY
      ===================================== */}

            <section className="bg-[#f8f4ec] px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12 lg:pb-24">

                <div className="mx-auto max-w-[1100px] text-center">

                    <div className="mb-6 flex items-center justify-center gap-4">

                        <span className="h-px w-12 bg-[#c6a66b]" />

                        <span className="text-base text-[#c6a66b]">
                            ✦
                        </span>

                        <span className="h-px w-12 bg-[#c6a66b]" />

                    </div>

                    <p className="text-[8px] uppercase tracking-[0.32em] text-[#a48755]">
                        Our story
                    </p>

                    <h2 className="mt-4 font-serif text-3xl text-[#1b4332] sm:text-4xl lg:text-5xl">
                        Made to be remembered.
                    </h2>

                    <p className="mx-auto mt-5 max-w-2xl text-xs leading-7 text-[#665b55] sm:text-sm">
                        Pearloraa was created around a simple idea: everyday luxury should
                        feel personal. Each piece is thoughtfully designed with timeless
                        proportions, delicate details and a sense of quiet confidence.
                        Jewelry made not only to be worn, but to become part of your story.
                    </p>

                    <Link
                        to="/about"
                        className="mt-7 inline-block border-b border-[#1b4332] pb-1.5 text-[9px] uppercase tracking-[0.18em] text-[#1b4332]"
                    >
                        Discover Pearloraa →
                    </Link>

                </div>

            </section>


            {/* =====================================
          TESTIMONIAL
      ===================================== */}

            <section className="bg-[#efe7da] px-5 py-16 sm:px-8 sm:py-20">

                <div className="mx-auto max-w-2xl text-center">

                    <div className="mb-5 flex justify-center gap-1 text-xs text-[#a48755]">
                        <span>★</span>
                        <span>★</span>
                        <span>★</span>
                        <span>★</span>
                        <span>★</span>
                    </div>

                    <blockquote className="font-serif text-2xl leading-tight text-[#1b4332] sm:text-3xl lg:text-4xl">
                        “The kind of jewelry you reach for every morning and somehow never
                        want to take off.”
                    </blockquote>

                    <p className="mt-5 text-[9px] uppercase tracking-[0.22em] text-[#756963]">
                        — Ananya M.
                    </p>

                </div>

            </section>


            {/* =====================================
          NEWSLETTER
      ===================================== */}

            <section className="bg-[#1b4332] px-5 py-16 sm:px-8 sm:py-20">

                <div className="mx-auto max-w-xl text-center">

                    <p className="text-[8px] uppercase tracking-[0.32em] text-[#c6a66b]">
                        The Pearloraa Journal
                    </p>

                    <h2 className="mt-3 font-serif text-3xl text-[#f8f4ec] sm:text-4xl">
                        A little beauty,
                        <br />
                        <span className="italic text-[#d8c39b]">
                            delivered.
                        </span>
                    </h2>

                    <p className="mx-auto mt-4 max-w-sm text-xs leading-6 text-[#eadfd5]/65 sm:text-sm">
                        New collections, styling notes and stories from Pearloraa,
                        occasionally arriving in your inbox.
                    </p>

                    <form
                        onSubmit={(e) => e.preventDefault()}
                        className="mx-auto mt-7 flex max-w-md border-b border-[#c6a66b]/60"
                    >

                        <input
                            type="email"
                            placeholder="Your email address"
                            aria-label="Email address"
                            className="min-w-0 flex-1 bg-transparent px-1 py-3.5 text-xs text-[#f8f4ec] outline-none placeholder:text-[#eadfd5]/45"
                        />

                        <button
                            type="submit"
                            className="px-2 text-[8px] uppercase tracking-[0.18em] text-[#c6a66b]"
                        >
                            Subscribe →
                        </button>

                    </form>

                </div>

            </section>

        </main>
    );
}


/* =========================================
   PRODUCT CARD
========================================= */

function ProductCard({ product, isWishlisted, onToggleWishlist }) {
    return (
        <article className="group">

            {/* IMAGE */}
            <div className="relative overflow-hidden bg-[#eee6db]">

                <Link to="/shop">

                    <img
                        src={product.image}
                        alt={product.name}
                        className="aspect-square w-full object-cover transition-transform duration-[1000ms] group-hover:scale-[1.035] sm:aspect-[4/4.5]"
                    />

                </Link>


                {/* LABEL */}
                {product.label && (
                    <span className="absolute left-2.5 top-2.5 bg-[#f8f4ec]/90 px-2.5 py-1 text-[7px] uppercase tracking-[0.16em] text-[#1b4332]">
                        {product.label}
                    </span>
                )}


                {/* WISHLIST */}
                <button
                    type="button"
                    aria-label={`${isWishlisted ? "Remove" : "Add"} ${product.name} ${isWishlisted ? "from" : "to"} wishlist`}
                    onClick={() => onToggleWishlist(product.id)}
                    className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#f8f4ec]/90 text-base text-[#1b4332] transition-all duration-300 hover:bg-[#1b4332] hover:text-[#f8f4ec]"
                >
                    {isWishlisted ? "♥" : "♡"}
                </button>

            </div>


            {/* DETAILS */}
            <div className="pt-3">

                <p className="text-[7px] uppercase tracking-[0.18em] text-[#a48755]">
                    {product.category?.name || product.category || "Jewellery"}
                </p>

                <div className="mt-1 flex items-start justify-between gap-2">

                    <Link to="/shop">

                        <h3 className="font-serif text-sm text-[#1b4332] sm:text-base">
                            {product.name}
                        </h3>

                    </Link>

                    <p className="whitespace-nowrap text-[9px] text-[#1b4332] sm:text-[10px]">
                        {product.price}
                    </p>

                </div>

            </div>

        </article>
    );
}
