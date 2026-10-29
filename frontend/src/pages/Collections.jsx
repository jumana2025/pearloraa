import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_ORIGIN } from "../api/axios";

const API_URL = `${API_ORIGIN}/api/products/`;
const CATEGORIES_URL = `${API_ORIGIN}/api/products/categories/`;

function getImageUrl(image) {
    if (!image) return "";
    if (image.startsWith("http://") || image.startsWith("https://")) return image;
    return `${API_ORIGIN}${image.startsWith("/") ? "" : "/"}${image}`;
}

export default function Collections() {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(CATEGORIES_URL);
                if (response.ok) {
                    const data = await response.json();
                    setCategories(Array.isArray(data) ? data : data.results || []);
                }
            } catch (err) {
                console.error("Error fetching categories", err);
            }
        };

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

        fetchCategories();
        fetchProducts();
    }, []);

    const dynamicCollections = categories.map((cat, index) => {
        const productsInCat = products.filter(p => p.category?.name === cat.name);
        const image = getImageUrl(cat.image)
            || (productsInCat.length > 0 && productsInCat[0].main_image
                ? getImageUrl(productsInCat[0].main_image)
                : "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=85");
        
        return {
            id: cat.id || cat.name,
            title: cat.name,
            subtitle: "TIMELESS • ELEGANT",
            description: cat.description || `Discover our beautifully crafted ${cat.name} collection.`,
            image: image,
            count: `${productsInCat.length < 10 ? '0' : ''}${productsInCat.length} Pieces`,
            featured: index === 0,
            originalName: cat.name
        };
    });
    return (
        <main className="min-h-screen bg-[#f8f4ec] text-[#1b4332]">

            {/* HERO */}
            <section className="px-5 pb-16 pt-36 sm:px-8 lg:px-12 lg:pb-20 lg:pt-44">
                <div className="mx-auto max-w-[1440px]">

                    <div className="max-w-3xl">
                        <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.3em] text-[#a48755]">
                            Curated For You
                        </p>

                        <h1 className="font-serif text-[42px] leading-[1.05] tracking-[-0.02em] sm:text-[52px] lg:text-[68px]">
                            Collections
                            <span className="text-[#a48755]">.</span>
                        </h1>

                        <p className="mt-6 max-w-xl text-sm leading-7 text-[#493d38] sm:text-[15px]">
                            Discover thoughtfully curated jewellery collections, each
                            created around a different expression of elegance.
                        </p>
                    </div>

                    <div className="mt-12 flex items-center gap-4 border-t border-[#1b4332]/10 pt-5">
                        <span className="h-[1px] w-10 bg-[#a48755]" />
                        <span className="text-[10px] uppercase tracking-[0.25em] text-[#493d38]">
                            Explore our edits
                        </span>
                    </div>

                </div>
            </section>

            {/* COLLECTION GRID */}
            <section className="px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
                <div className="mx-auto max-w-[1440px]">

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                        {dynamicCollections.map((collection) => (
                            <CollectionCard
                                key={collection.id}
                                collection={collection}
                            />
                        ))}
                    </div>

                </div>
            </section>

            {/* EDITORIAL SECTION */}
            <section className="bg-[#efe7da] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
                <div className="mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">

                    <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#a48755]">
                            The Pearloraa Philosophy
                        </p>

                        <h2 className="mt-4 font-serif text-[34px] leading-tight sm:text-[42px]">
                            Jewellery that feels
                            <br />
                            <span className="italic">uniquely yours.</span>
                        </h2>

                        <p className="mt-6 max-w-md text-sm leading-7 text-[#493d38]">
                            We believe the most beautiful jewellery is the kind that becomes
                            part of your story. Our collections bring together timeless
                            silhouettes, delicate details and pieces made to be treasured.
                        </p>

                        <Link
                            to="/shop"
                            className="group mt-8 inline-flex items-center gap-4 border-b border-[#1b4332] pb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#1b4332]"
                        >
                            Explore all jewellery

                            <span className="transition-transform duration-300 group-hover:translate-x-1">
                                →
                            </span>
                        </Link>
                    </div>

                    <div className="relative">
                        <div className="aspect-[4/3] overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1400&q=85"
                                alt="Pearloraa jewellery collection"
                                className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                            />
                        </div>

                        <div className="absolute -bottom-5 -left-3 bg-[#1b4332] px-5 py-4 text-[#f8f4ec] sm:-left-5">
                            <p className="text-[9px] uppercase tracking-[0.25em] text-[#c6a66b]">
                                Designed to last
                            </p>

                            <p className="mt-1 font-serif text-lg">
                                Beyond the moment
                            </p>
                        </div>
                    </div>

                </div>
            </section>

            {/* BOTTOM CTA */}
            <section className="px-5 py-20 text-center sm:px-8 lg:py-28">
                <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#a48755]">
                    Find your piece
                </p>

                <h2 className="mx-auto mt-4 max-w-2xl font-serif text-[34px] leading-tight sm:text-[44px]">
                    Something beautiful is
                    <span className="italic"> waiting for you.</span>
                </h2>

                <Link
                    to="/shop"
                    className="mt-8 inline-flex bg-[#1b4332] px-7 py-3.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[#f8f4ec] transition-colors duration-300 hover:bg-[#321019]"
                >
                    Shop Jewellery
                </Link>
            </section>

        </main>
    );
}


/* =========================
   COLLECTION CARD
========================= */

function CollectionCard({ collection }) {
    return (
        <Link
            to={`/shop?collection=${collection.id}`}
            className={`group block ${collection.featured ? "sm:col-span-2 lg:col-span-2" : ""
                }`}
        >
            <div
                className={`relative overflow-hidden ${collection.featured
                        ? "aspect-[16/9] sm:aspect-[2/1]"
                        : "aspect-[4/5]"
                    }`}
            >

                <img
                    src={collection.image}
                    alt={collection.title}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/10 transition-colors duration-500 group-hover:bg-black/20" />

                {/* Top Label */}
                <div className="absolute left-4 top-4 sm:left-5 sm:top-5">
                    <span className="bg-[#f8f4ec]/90 px-3 py-1.5 text-[8px] font-medium uppercase tracking-[0.18em] text-[#1b4332]">
                        {collection.count}
                    </span>
                </div>

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">

                    <p className="text-[8px] font-medium uppercase tracking-[0.25em] text-[#f8f4ec]/90">
                        {collection.subtitle}
                    </p>

                    <h2
                        className={`mt-2 font-serif leading-none text-[#f8f4ec] ${collection.featured
                                ? "text-[30px] sm:text-[40px]"
                                : "text-[27px] sm:text-[32px]"
                            }`}
                    >
                        {collection.title}
                    </h2>

                    <div className="mt-4 flex items-center gap-3 overflow-hidden">
                        <span className="text-[10px] uppercase tracking-[0.15em] text-[#f8f4ec]">
                            Discover collection
                        </span>

                        <span className="translate-x-[-8px] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                            →
                        </span>
                    </div>

                </div>
            </div>

            {/* Description */}
            <div className="border-b border-[#1b4332]/10 py-4 lg:py-5">
                <p className="max-w-lg text-xs leading-6 text-[#493d38]">
                    {collection.description}
                </p>
            </div>
        </Link>
    );
}
