import { Link } from "react-router-dom";

export default function About() {
    return (
        <main className="min-h-screen bg-[#f8f4ec] text-[#1b4332]">

            {/* HERO */}
            <section className="px-5 pb-16 pt-36 sm:px-8 lg:px-12 lg:pb-24 lg:pt-44">
                <div className="mx-auto max-w-[1440px]">

                    <div className="grid items-end gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">

                        <div>
                            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#a48755]">
                                Our Story
                            </p>

                            <h1 className="mt-4 font-serif text-[43px] leading-[1.05] tracking-[-0.02em] sm:text-[54px] lg:text-[70px]">
                                Jewellery with
                                <br />
                                <span className="italic">meaning.</span>
                            </h1>
                        </div>

                        <div className="max-w-xl lg:pb-2">
                            <p className="text-sm leading-7 text-[#493d38] sm:text-[15px]">
                                Pearloraa was created around a simple idea — jewellery should
                                feel personal. Not simply something you wear, but something
                                that becomes part of your story.
                            </p>

                            <p className="mt-5 text-sm leading-7 text-[#493d38] sm:text-[15px]">
                                From delicate everyday pieces to jewellery chosen for life's
                                most important moments, every Pearloraa collection is designed
                                with timeless elegance in mind.
                            </p>
                        </div>

                    </div>

                </div>
            </section>


            {/* HERO IMAGE */}
            <section className="px-5 sm:px-8 lg:px-12">
                <div className="mx-auto max-w-[1440px]">

                    <div className="relative aspect-[16/9] overflow-hidden sm:aspect-[2.2/1]">

                        <img
                            src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1800&q=85"
                            alt="Pearl jewellery collection"
                            className="h-full w-full object-cover transition-transform duration-1000 hover:scale-[1.02]"
                        />

                        <div className="absolute inset-0 bg-[#321019]/10" />

                        <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10">
                            <p className="text-[9px] uppercase tracking-[0.3em] text-[#f8f4ec]/90">
                                Pearloraa
                            </p>

                            <p className="mt-2 max-w-sm font-serif text-2xl leading-tight text-[#f8f4ec] sm:text-3xl">
                                Made to be remembered.
                            </p>
                        </div>

                    </div>

                </div>
            </section>


            {/* BRAND PHILOSOPHY */}
            <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
                <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-2 lg:gap-24">

                    <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#a48755]">
                            The Pearloraa Philosophy
                        </p>

                        <h2 className="mt-4 font-serif text-[35px] leading-tight sm:text-[44px]">
                            Less noise.
                            <br />
                            More <span className="italic">meaning.</span>
                        </h2>
                    </div>

                    <div className="space-y-5 text-sm leading-7 text-[#493d38]">
                        <p>
                            We believe jewellery does not need to be loud to be noticed.
                            The most beautiful pieces often live in the smallest details —
                            a soft curve, a delicate chain, a luminous pearl or the warmth
                            of gold against the skin.
                        </p>

                        <p>
                            That belief shapes everything we create. Pearloraa collections
                            are intentionally refined, allowing each piece to become part
                            of the person wearing it rather than defining them.
                        </p>

                        <p>
                            Our approach is rooted in timeless design, thoughtful styling
                            and pieces that can move effortlessly from everyday moments to
                            meaningful celebrations.
                        </p>
                    </div>

                </div>
            </section>


            {/* VALUES */}
            <section className="bg-[#efe7da] px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
                <div className="mx-auto max-w-[1200px]">

                    <div className="max-w-xl">
                        <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#a48755]">
                            What Guides Us
                        </p>

                        <h2 className="mt-4 font-serif text-[34px] leading-tight sm:text-[42px]">
                            The details matter.
                        </h2>
                    </div>

                    <div className="mt-12 grid gap-px overflow-hidden border border-[#1b4332]/10 bg-[#1b4332]/10 sm:grid-cols-2 lg:grid-cols-4">

                        <ValueCard
                            number="01"
                            title="Timeless"
                            text="Designs created to remain beautiful beyond a single season."
                        />

                        <ValueCard
                            number="02"
                            title="Thoughtful"
                            text="Every detail is considered, from the silhouette to the finishing touch."
                        />

                        <ValueCard
                            number="03"
                            title="Personal"
                            text="Jewellery should complement your story, your style and your moments."
                        />

                        <ValueCard
                            number="04"
                            title="Beautiful"
                            text="A quiet approach to luxury where elegance lives in the details."
                        />

                    </div>

                </div>
            </section>


            {/* IMAGE + STORY */}
            <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
                <div className="mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">

                    <div className="relative">
                        <div className="aspect-[4/5] overflow-hidden sm:aspect-[5/6]">

                            <img
                                src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85"
                                alt="Elegant gold jewellery"
                                className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                            />

                        </div>

                        <div className="absolute -bottom-5 -right-3 bg-[#1b4332] px-6 py-5 text-[#f8f4ec] sm:-right-5">
                            <p className="text-[9px] uppercase tracking-[0.25em] text-[#c6a66b]">
                                Our belief
                            </p>

                            <p className="mt-1 font-serif text-lg">
                                Beauty in simplicity.
                            </p>
                        </div>
                    </div>


                    <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#a48755]">
                            Designed For Real Life
                        </p>

                        <h2 className="mt-4 font-serif text-[36px] leading-tight sm:text-[46px]">
                            Pieces that become
                            <br />
                            <span className="italic">part of you.</span>
                        </h2>

                        <div className="mt-7 space-y-5 text-sm leading-7 text-[#493d38]">
                            <p>
                                Jewellery has a beautiful way of holding memories. A necklace
                                worn on a first date. Earrings chosen for a celebration. A
                                ring gifted by someone special.
                            </p>

                            <p>
                                Pearloraa creates pieces for those moments — while also
                                believing that you never need a special occasion to wear
                                something beautiful.
                            </p>

                            <p>
                                From understated everyday jewellery to pieces designed to
                                catch the light, our collections are made to live with you.
                            </p>
                        </div>

                        <Link
                            to="/collections"
                            className="group mt-8 inline-flex items-center gap-4 border-b border-[#1b4332] pb-2 text-[10px] font-medium uppercase tracking-[0.2em]"
                        >
                            Discover our collections

                            <span className="transition-transform duration-300 group-hover:translate-x-1">
                                →
                            </span>
                        </Link>
                    </div>

                </div>
            </section>


            {/* CRAFT / DETAILS */}
            <section className="bg-[#1b4332] px-5 py-20 text-[#f8f4ec] sm:px-8 lg:px-12 lg:py-24">
                <div className="mx-auto max-w-[1200px]">

                    <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">

                        <div>
                            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#c6a66b]">
                                Our Approach
                            </p>

                            <h2 className="mt-4 font-serif text-[35px] leading-tight sm:text-[44px]">
                                Crafted with
                                <br />
                                <span className="italic">intention.</span>
                            </h2>
                        </div>

                        <div className="grid gap-8 sm:grid-cols-2">

                            <div className="border-t border-[#f8f4ec]/20 pt-5">
                                <span className="font-serif text-2xl text-[#c6a66b]">
                                    01
                                </span>

                                <h3 className="mt-3 font-serif text-xl">
                                    Thoughtful Design
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-[#f8f4ec]/70">
                                    Clean silhouettes and carefully balanced details create
                                    jewellery that feels effortless.
                                </p>
                            </div>

                            <div className="border-t border-[#f8f4ec]/20 pt-5">
                                <span className="font-serif text-2xl text-[#c6a66b]">
                                    02
                                </span>

                                <h3 className="mt-3 font-serif text-xl">
                                    Timeless Appeal
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-[#f8f4ec]/70">
                                    We favour designs that can remain part of your jewellery
                                    wardrobe for years to come.
                                </p>
                            </div>

                            <div className="border-t border-[#f8f4ec]/20 pt-5">
                                <span className="font-serif text-2xl text-[#c6a66b]">
                                    03
                                </span>

                                <h3 className="mt-3 font-serif text-xl">
                                    Everyday Luxury
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-[#f8f4ec]/70">
                                    Luxury should feel natural — something you can reach for
                                    every day.
                                </p>
                            </div>

                            <div className="border-t border-[#f8f4ec]/20 pt-5">
                                <span className="font-serif text-2xl text-[#c6a66b]">
                                    04
                                </span>

                                <h3 className="mt-3 font-serif text-xl">
                                    Made To Keep
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-[#f8f4ec]/70">
                                    Pieces designed not just for now, but for the memories they
                                    will eventually hold.
                                </p>
                            </div>

                        </div>

                    </div>

                </div>
            </section>


            {/* FINAL CTA */}
            <section className="px-5 py-20 text-center sm:px-8 lg:py-28">
                <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#a48755]">
                    Begin Your Story
                </p>

                <h2 className="mx-auto mt-4 max-w-2xl font-serif text-[35px] leading-tight sm:text-[45px]">
                    Find something that feels
                    <span className="italic"> like you.</span>
                </h2>

                <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">

                    <Link
                        to="/shop"
                        className="inline-flex bg-[#1b4332] px-7 py-3.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[#f8f4ec] transition-colors duration-300 hover:bg-[#321019]"
                    >
                        Shop Jewellery
                    </Link>

                    <Link
                        to="/collections"
                        className="inline-flex border border-[#1b4332]/20 px-7 py-3.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[#1b4332] transition-colors duration-300 hover:border-[#1b4332] hover:bg-[#efe7da]"
                    >
                        View Collections
                    </Link>

                </div>
            </section>

        </main>
    );
}


/* =========================
   VALUE CARD
========================= */

function ValueCard({ number, title, text }) {
    return (
        <div className="bg-[#f8f4ec] p-6 sm:p-7 lg:p-8">

            <span className="font-serif text-xl text-[#a48755]">
                {number}
            </span>

            <h3 className="mt-5 font-serif text-2xl">
                {title}
            </h3>

            <p className="mt-3 text-xs leading-6 text-[#493d38]">
                {text}
            </p>

        </div>
    );
}
