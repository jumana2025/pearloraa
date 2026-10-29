import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_ORIGIN } from "../api/axios";
import BrandLogo from "./BrandLogo";

const API_URL = API_ORIGIN;

function getAccessToken() {
    return (
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token")
    );
}

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    const profileRef = useRef(null);

    // ============================================================
    // GET ACCESS TOKEN
    // ============================================================

    // ============================================================
    // SCROLL EFFECT
    // ============================================================

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 30);
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // ============================================================
    // CHECK LOGIN STATUS & ROUTE CHANGES
    // ============================================================

    const checkLoginStatus = useCallback(() => {
        const accessToken = getAccessToken();
        const loggedIn = !!accessToken;
        setIsLoggedIn(loggedIn);

        if (!loggedIn) {
            setCartCount(0);
            setWishlistCount(0);
            localStorage.removeItem("pearloraa_wishlist");
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        Promise.resolve().then(() => {
            if (cancelled) return;
            setMobileOpen(false);
            setProfileOpen(false);
            checkLoginStatus();
        });
        return () => {
            cancelled = true;
        };
    }, [checkLoginStatus, location.pathname]);

    useEffect(() => {
        Promise.resolve().then(checkLoginStatus);

        window.addEventListener("authChanged", checkLoginStatus);
        window.addEventListener("storage", checkLoginStatus);

        return () => {
            window.removeEventListener("authChanged", checkLoginStatus);
            window.removeEventListener("storage", checkLoginStatus);
        };
    }, [checkLoginStatus]);

    // ============================================================
    // CLOSE PROFILE DROPDOWN WHEN CLICKING OUTSIDE
    // ============================================================

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target)
            ) {
                setProfileOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    // ============================================================
    // FETCH CART COUNT FROM DJANGO
    // ============================================================

    const fetchCartCount = useCallback(async () => {
        const token = getAccessToken();

        // User is not logged in
        if (!token) {
            setCartCount(0);
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/api/cart/`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            // Unauthorized
            if (response.status === 401) {
                setCartCount(0);
                return;
            }

            if (!response.ok) {
                setCartCount(0);
                return;
            }

            const data = await response.json();

            console.log(
                "NAVBAR CART RESPONSE:",
                data
            );

            /*
                Example:

                {
                    "id": 1,
                    "user": 2,
                    "items": [
                        {
                            "id": 1,
                            "product": {...},
                            "quantity": 2
                        },
                        {
                            "id": 2,
                            "product": {...},
                            "quantity": 1
                        }
                    ]
                }

                Result:
                2 + 1 = 3
            */

            const items = Array.isArray(data.items)
                ? data.items
                : [];

            const totalQuantity = items.reduce(
                (total, item) => {
                    return (
                        total +
                        Number(item.quantity || 0)
                    );
                },
                0
            );

            setCartCount(totalQuantity);

        } catch (error) {
            console.error(
                "Navbar cart count error:",
                error
            );

            setCartCount(0);
        }
    }, []);

    // ============================================================
    // FETCH WISHLIST COUNT
    // ============================================================

    const updateWishlistCount = useCallback(async () => {
        const token = getAccessToken();
        if (!token) {
            setWishlistCount(0);
            localStorage.removeItem("pearloraa_wishlist");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/wishlist/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (getAccessToken() !== token) return;
            if (!response.ok) {
                setWishlistCount(0);
                return;
            }

            const data = await response.json();
            if (getAccessToken() === token) {
                setWishlistCount(
                    Array.isArray(data.items) ? data.items.length : 0
                );
            }
        } catch (error) {
            console.error("Navbar wishlist count error:", error);
            if (getAccessToken() === token) {
                setWishlistCount(0);
            }
        }
    }, []);

    // ============================================================
    // CART + WISHLIST
    // ============================================================

    useEffect(() => {
        Promise.resolve().then(() => {
            fetchCartCount();
            updateWishlistCount();
        });

        // Cart updated
        const handleCartUpdated = () => {
            fetchCartCount();
        };

        // Wishlist updated
        const handleWishlistUpdated = () => {
            updateWishlistCount();
        };

        // Login/logout
        const handleAuthChanged = () => {
            fetchCartCount();
            updateWishlistCount();
        };

        window.addEventListener(
            "cartUpdated",
            handleCartUpdated
        );

        window.addEventListener(
            "wishlistUpdated",
            handleWishlistUpdated
        );

        window.addEventListener(
            "authChanged",
            handleAuthChanged
        );

        return () => {
            window.removeEventListener(
                "cartUpdated",
                handleCartUpdated
            );

            window.removeEventListener(
                "wishlistUpdated",
                handleWishlistUpdated
            );

            window.removeEventListener(
                "authChanged",
                handleAuthChanged
            );
        };
    }, [fetchCartCount, updateWishlistCount]);

    // ============================================================
    // REFRESH CART WHEN OPENING CART PAGE
    // ============================================================

    useEffect(() => {
        if (location.pathname !== "/cart") return undefined;
        let cancelled = false;
        Promise.resolve().then(() => {
            if (!cancelled) fetchCartCount();
        });
        return () => {
            cancelled = true;
        };
    }, [fetchCartCount, location.pathname]);

    // ============================================================
    // NAVIGATION LINKS
    // ============================================================

    const navLinks = [
        {
            name: "Home",
            path: "/",
        },
        {
            name: "Shop",
            path: "/shop",
        },
        {
            name: "Collections",
            path: "/collections",
        },
        {
            name: "About",
            path: "/about",
        },
        {
            name: "Orders",
            path: "/orders",
        },
    ];

    // ============================================================
    // USER DATA
    // ============================================================

    const getUserData = () => {
        try {
            const stored =
                localStorage.getItem("user") ||
                sessionStorage.getItem("user");
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    };

    // ============================================================
    // VIEW PROFILE
    // ============================================================

    const handleViewProfile = () => {
        setProfileOpen(false);
        setMobileOpen(false);

        navigate("/profile");
    };

    // ============================================================
    // LOGOUT
    // ============================================================

    const handleLogout = () => {
        // Remove JWT tokens
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");

        // Remove saved user
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");

        // Remove old frontend cart
        localStorage.removeItem("pearloraa_cart");

        // Update state
        setIsLoggedIn(false);
        setCartCount(0);
        setWishlistCount(0);

        setProfileOpen(false);
        setMobileOpen(false);

        // Notify other components
        window.dispatchEvent(
            new Event("authChanged")
        );

        // Go home
        navigate("/");
    };

    // ============================================================
    // PROFILE MENU
    // ============================================================

    // ============================================================
    // NAVBAR
    // ============================================================

    return (
        <header
            className={`fixed top-0 left-0 z-50 w-full transition-all duration-500 ${scrolled
                    ? "bg-[#f8f4ec]/95 py-3 shadow-[0_1px_0_rgba(74,23,34,0.08)] backdrop-blur-sm"
                    : "bg-[#f8f4ec] py-5"
                }`}
        >

            <div
                className="
                    mx-auto
                    flex
                    max-w-[1440px]
                    items-center
                    justify-between
                    px-5
                    sm:px-8
                    lg:px-12
                "
            >

                {/* ==================================================
                    LOGO
                ================================================== */}

                <BrandLogo to="/" size="sm" className="group" />

                {/* ==================================================
                    DESKTOP NAVIGATION
                ================================================== */}

                <nav
                    className="
                        hidden
                        items-center
                        gap-8
                        lg:flex
                        xl:gap-10
                    "
                >
                    {navLinks.map((link) => {

                        const active =
                            location.pathname ===
                            link.path;

                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`group relative py-2 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors duration-300 ${active
                                        ? "text-[#1b4332]"
                                        : "text-[#493d38] hover:text-[#1b4332]"
                                    }`}
                            >

                                {link.name}

                                <span
                                    className={`absolute bottom-0 left-0 h-[1px] bg-[#a48755] transition-all duration-300 ${active
                                            ? "w-full"
                                            : "w-0 group-hover:w-full"
                                        }`}
                                />

                            </Link>
                        );
                    })}
                </nav>

                {/* ==================================================
                    RIGHT ACTIONS
                ================================================== */}

                <div
                    className="
                        hidden
                        items-center
                        gap-1
                        sm:flex
                    "
                >

                    {/* Search */}

                    <button
                        type="button"
                        aria-label="Search"
                        className="
                            group
                            rounded-full
                            p-3
                            text-[#1b4332]
                            transition-colors
                            duration-300
                            hover:bg-[#efe7da]
                        "
                    >
                        <SearchIcon />
                    </button>

                    {/* Account */}

                    {!isLoggedIn ? (

                        <Link
                            to="/login"
                            aria-label="Account"
                            className="
                                group
                                rounded-full
                                p-3
                                text-[#1b4332]
                                transition-colors
                                duration-300
                                hover:bg-[#efe7da]
                            "
                        >
                            <UserIcon />
                        </Link>

                    ) : (

                        <div
                            ref={profileRef}
                            className="relative"
                        >

                            <button
                                type="button"
                                onClick={() =>
                                    setProfileOpen(
                                        !profileOpen
                                    )
                                }
                                aria-label="Profile menu"
                                aria-expanded={
                                    profileOpen
                                }
                                className="
                                    group
                                    rounded-full
                                    p-3
                                    text-[#1b4332]
                                    transition-colors
                                    duration-300
                                    hover:bg-[#efe7da]
                                "
                            >
                                <UserIcon />
                            </button>

                            {profileOpen &&
                                <ProfileMenu
                                    user={getUserData()}
                                    onViewProfile={handleViewProfile}
                                    onLogout={handleLogout}
                                />
                            }

                        </div>

                    )}

                    {/* Wishlist */}

                    <Link
                        to="/wishlist"
                        aria-label="Wishlist"
                        className="
                            group
                            relative
                            rounded-full
                            p-3
                            text-[#1b4332]
                            transition-colors
                            duration-300
                            hover:bg-[#efe7da]
                        "
                    >
                        <HeartIcon />

                        {wishlistCount > 0 && (
                            <span
                                className="
                                    absolute
                                    right-1
                                    top-1
                                    flex
                                    h-[15px]
                                    min-w-[15px]
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-[#1b4332]
                                    px-1
                                    text-[8px]
                                    text-[#f8f4ec]
                                "
                            >
                                {wishlistCount}
                            </span>
                        )}
                    </Link>

                    {/* ==================================================
                        CART
                    ================================================== */}

                    <Link
                        to="/cart"
                        aria-label="Shopping bag"
                        className="
                            group
                            relative
                            rounded-full
                            p-3
                            text-[#1b4332]
                            transition-colors
                            duration-300
                            hover:bg-[#efe7da]
                        "
                    >
                        <BagIcon />

                        {/* 
                            IMPORTANT:
                            Badge appears ONLY when cartCount > 0.
                        */}

                        {cartCount > 0 && (
                            <span
                                className="
                                    absolute
                                    right-1
                                    top-1
                                    flex
                                    h-[15px]
                                    min-w-[15px]
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-[#1b4332]
                                    px-1
                                    text-[8px]
                                    text-[#f8f4ec]
                                "
                            >
                                {cartCount}
                            </span>
                        )}

                    </Link>

                </div>

                {/* ==================================================
                    MOBILE MENU BUTTON
                ================================================== */}

                <button
                    type="button"
                    aria-label={
                        mobileOpen
                            ? "Close menu"
                            : "Open menu"
                    }
                    aria-expanded={mobileOpen}
                    onClick={() =>
                        setMobileOpen(
                            !mobileOpen
                        )
                    }
                    className="
                        ml-auto
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        text-[#1b4332]
                        sm:hidden
                    "
                >
                    {mobileOpen
                        ? <CloseIcon />
                        : <MenuIcon />
                    }
                </button>

            </div>

            {/* ======================================================
                MOBILE MENU
            ====================================================== */}

            <div
                className={`overflow-hidden bg-[#f8f4ec] transition-all duration-500 sm:hidden ${mobileOpen
                        ? "max-h-[600px] border-t border-[#1b4332]/10"
                        : "max-h-0"
                    }`}
            >

                <nav
                    className="
                        px-6
                        pb-7
                        pt-4
                    "
                >

                    {navLinks.map((link, index) => {

                        const active =
                            location.pathname ===
                            link.path;

                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`flex items-center justify-between border-b border-[#1b4332]/10 py-4 text-sm uppercase tracking-[0.15em] transition-colors ${active
                                        ? "text-[#1b4332]"
                                        : "text-[#493d38] hover:text-[#1b4332]"
                                    }`}
                            >

                                <span>
                                    {link.name}
                                </span>

                                <span
                                    className="
                                        font-serif
                                        text-xl
                                        text-[#a48755]
                                    "
                                >
                                    {index === 0
                                        ? ""
                                        : "↗"}
                                </span>

                            </Link>
                        );
                    })}

                    {/* ==================================================
                        MOBILE ACTIONS
                    ================================================== */}

                    <div
                        className="
                            mt-5
                            flex
                            items-center
                            gap-2
                        "
                    >

                        {/* Account */}

                        {!isLoggedIn ? (

                            <Link
                                to="/login"
                                className="
                                    flex
                                    flex-1
                                    items-center
                                    justify-center
                                    gap-2
                                    border
                                    border-[#1b4332]/20
                                    py-3
                                    text-[10px]
                                    uppercase
                                    tracking-[0.15em]
                                    text-[#1b4332]
                                "
                            >
                                <UserIcon size={15} />
                                Account
                            </Link>

                        ) : (

                            <button
                                type="button"
                                onClick={() =>
                                    setProfileOpen(
                                        !profileOpen
                                    )
                                }
                                className="
                                    relative
                                    flex
                                    flex-1
                                    items-center
                                    justify-center
                                    gap-2
                                    border
                                    border-[#1b4332]/20
                                    py-3
                                    text-[10px]
                                    uppercase
                                    tracking-[0.15em]
                                    text-[#1b4332]
                                "
                            >
                                <UserIcon size={15} />
                                Profile
                            </button>

                        )}

                        {/* Wishlist */}

                        <Link
                            to="/wishlist"
                            className="
                                flex
                                flex-1
                                items-center
                                justify-center
                                gap-2
                                border
                                border-[#1b4332]/20
                                py-3
                                text-[10px]
                                uppercase
                                tracking-[0.15em]
                                text-[#1b4332]
                            "
                        >
                            <HeartIcon size={15} />
                            Wishlist
                        </Link>

                        {/* Cart */}

                        <Link
                            to="/cart"
                            className="
                                flex
                                flex-1
                                items-center
                                justify-center
                                gap-2
                                bg-[#1b4332]
                                py-3
                                text-[10px]
                                uppercase
                                tracking-[0.15em]
                                text-[#f8f4ec]
                            "
                        >
                            <BagIcon size={15} />
                            Bag
                            {cartCount > 0 &&
                                ` (${cartCount})`
                            }
                        </Link>

                    </div>

                    {/* ==================================================
                        MOBILE PROFILE OPTIONS
                    ================================================== */}

                    {isLoggedIn && profileOpen && (

                        <div
                            className="
                                mt-3
                                overflow-hidden
                                border
                                border-[#1b4332]/10
                                bg-[#efe7da]
                            "
                        >

                            <button
                                type="button"
                                onClick={handleViewProfile}
                                className="
                                    flex
                                    w-full
                                    items-center
                                    gap-3
                                    border-b
                                    border-[#1b4332]/10
                                    px-4
                                    py-3.5
                                    text-left
                                    text-xs
                                    font-medium
                                    tracking-[0.05em]
                                    text-[#1b4332]
                                "
                            >
                                <UserIcon size={16} />
                                Profile View
                            </button>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="
                                    flex
                                    w-full
                                    items-center
                                    gap-3
                                    px-4
                                    py-3.5
                                    text-left
                                    text-xs
                                    font-medium
                                    tracking-[0.05em]
                                    text-red-600
                                "
                            >
                                <LogoutIcon size={16} />
                                Logout
                            </button>

                        </div>

                    )}

                </nav>

            </div>

        </header>
    );
}


/* ============================================================
   ICONS
============================================================ */

function ProfileMenu({ user, onViewProfile, onLogout }) {
    const displayName = user
        ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || "My Account"
        : "My Account";

    return (
        <div
            className="
                absolute
                right-0
                top-full
                z-[100]
                mt-2
                w-52
                overflow-hidden
                rounded-2xl
                border
                border-[#1b4332]/10
                bg-[#f8f4ec]
                shadow-[0_12px_35px_rgba(27,67,50,0.15)]
            "
        >
            {user && (
                <div className="border-b border-[#1b4332]/10 bg-[#efe7da]/50 px-4 py-3">
                    <p className="truncate text-xs font-semibold text-[#1b4332]">
                        {displayName}
                    </p>
                    {user.email && (
                        <p className="truncate text-[10px] text-[#a48755]">
                            {user.email}
                        </p>
                    )}
                </div>
            )}
            <button
                type="button"
                onClick={onViewProfile}
                className="
                    flex
                    w-full
                    items-center
                    gap-3
                    px-4
                    py-3.5
                    text-left
                    text-xs
                    font-medium
                    tracking-[0.05em]
                    text-[#1b4332]
                    transition-colors
                    duration-200
                    hover:bg-[#efe7da]
                "
            >
                <UserIcon size={16} />
                <span>Profile View</span>
            </button>
            <button
                type="button"
                onClick={onLogout}
                className="
                    flex
                    w-full
                    items-center
                    gap-3
                    border-t
                    border-[#1b4332]/10
                    px-4
                    py-3.5
                    text-left
                    text-xs
                    font-medium
                    tracking-[0.05em]
                    text-red-600
                    transition-colors
                    duration-200
                    hover:bg-red-50/70
                "
            >
                <LogoutIcon size={16} />
                <span>Logout</span>
            </button>
        </div>
    );
}

function SearchIcon({ size = 18 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle
                cx="11"
                cy="11"
                r="6.5"
            />

            <path d="m16 16 5 5" />
        </svg>
    );
}


function UserIcon({ size = 18 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle
                cx="12"
                cy="8"
                r="3.5"
            />

            <path
                d="M5 21c.8-4 3.1-6 7-6s6.2 2 7 6"
            />
        </svg>
    );
}


function LogoutIcon({ size = 18 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M10 17l5-5-5-5" />
            <path d="M15 12H3" />
            <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
        </svg>
    );
}


function HeartIcon({ size = 18 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
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


function BagIcon({ size = 18 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M5 8h14l-1 13H6L5 8Z" />
            <path d="M9 9V6a3 3 0 0 1 6 0v3" />
        </svg>
    );
}


function MenuIcon() {
    return (
        <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
        >
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h16" />
        </svg>
    );
}


function CloseIcon() {
    return (
        <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
        >
            <path d="M5 5l14 14" />
            <path d="M19 5 5 19" />
        </svg>
    );
}
