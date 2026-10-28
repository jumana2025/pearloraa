import { useState } from "react";
import { Menu, ChevronDown, LogOut } from "lucide-react";
import BrandLogo from "../../components/BrandLogo";

export default function AdminHeader({ onMobileToggle }) {
    const [profileOpen, setProfileOpen] = useState(false);

    const adminUser = (() => {
        try {
            return JSON.parse(localStorage.getItem("admin_user")) || {};
        } catch {
            return {};
        }
    })();

    const adminName =
        adminUser.first_name
            ? `${adminUser.first_name} ${adminUser.last_name || ""}`.trim()
            : adminUser.username || "Admin";

    const handleLogout = () => {
        localStorage.removeItem("admin_access");
        localStorage.removeItem("admin_refresh");
        localStorage.removeItem("admin_user");
        window.location.href = "/admin/login";
    };

    return (
        <header
            className="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b bg-white px-4 lg:px-6"
            style={{ borderColor: "#e8e0d5" }}
        >
            {/* Left */}
            <div className="flex items-center gap-3">
                {/* Mobile sidebar toggle */}
                <button
                    onClick={onMobileToggle}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border text-gray-500 hover:bg-gray-50 lg:hidden"
                    style={{ borderColor: "#e8e0d5" }}
                >
                    <Menu size={18} />
                </button>
                <BrandLogo to="/" size="sm" className="ml-1" />
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
                {/* Visit Store */}
                <a
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    className="hidden items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-gray-50 sm:flex"
                    style={{ borderColor: "#e8e0d5", color: "#493d38" }}
                >
                    Visit Store
                </a>

                {/* Divider */}
                <div className="mx-2 h-6 w-px" style={{ background: "#e8e0d5" }} />

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-gray-50"
                    >
                        <div
                            className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white"
                            style={{ background: "#1b4332" }}
                        >
                            {adminName.charAt(0).toUpperCase()}
                        </div>
                        <div className="hidden text-left sm:block">
                            <p className="text-xs font-semibold" style={{ color: "#1b4332" }}>
                                {adminName}
                            </p>
                            <p className="text-[10px]" style={{ color: "#a48755" }}>
                                Administrator
                            </p>
                        </div>
                        <ChevronDown size={14} className="hidden text-gray-400 sm:block" />
                    </button>

                    {profileOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setProfileOpen(false)}
                            />
                            <div
                                className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-xl border bg-white shadow-lg"
                                style={{ borderColor: "#e8e0d5" }}
                            >
                                <div
                                    className="border-b px-4 py-3"
                                    style={{ borderColor: "#e8e0d5" }}
                                >
                                    <p className="text-xs font-semibold" style={{ color: "#1b4332" }}>
                                        {adminName}
                                    </p>
                                    <p className="text-[11px]" style={{ color: "#a48755" }}>
                                        Administrator
                                    </p>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-500 transition hover:bg-red-50"
                                >
                                    <LogOut size={15} />
                                    Sign out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
