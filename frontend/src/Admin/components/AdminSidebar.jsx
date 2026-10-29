import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    Layers,
    Users,
    ShoppingBag,
    Images,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import BrandLogo from "../../components/BrandLogo";

const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Products", path: "/admin/products", icon: Package },
    { name: "Categories", path: "/admin/categories", icon: Layers },
    { name: "Customers", path: "/admin/customers", icon: Users },
    { name: "Orders", path: "/admin/orders", icon: ShoppingBag },
    { name: "Home Images", path: "/admin/home-images", icon: Images },
];

export default function AdminSidebar({ collapsed, onToggle, mobileOpen, setMobileOpen }) {
    const handleLogout = () => {
        localStorage.removeItem("admin_access");
        localStorage.removeItem("admin_refresh");
        localStorage.removeItem("admin_user");
        window.location.href = "/admin/login";
    };

    return (
        <aside
            className={`fixed left-0 top-0 z-40 flex h-dvh w-[min(18rem,85vw)] flex-col transition-transform duration-300 lg:h-screen ${collapsed ? "lg:w-[72px]" : "lg:w-64"} ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
            style={{ background: "#1b4332" }}
        >
            {/* Logo */}
            <div
                className="flex h-[70px] items-center justify-between border-b px-4 flex-shrink-0"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
                {(!collapsed || mobileOpen) && (
                    <BrandLogo size="sm" inverse className="min-w-0 overflow-hidden" />
                )}

                {collapsed && !mobileOpen && (
                    <BrandLogo size="sm" compact inverse className="mx-auto" />
                )}
            </div>

            {/* Toggle button */}
            <button
                onClick={onToggle}
                className="absolute -right-3 top-[58px] z-50 hidden h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-md hover:bg-gray-50 lg:flex"
            >
                {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink onClick={() => setMobileOpen(false)}
                            key={item.path}
                            to={item.path}
                            title={collapsed ? item.name : undefined}
                            className={({ isActive }) =>
                                `group mb-1 flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 ${
                                    isActive
                                        ? "text-white"
                                        : "text-white/60 hover:text-white"
                                }`
                            }
                            style={({ isActive }) =>
                                isActive
                                    ? { background: "#a48755" }
                                    : {}
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon
                                        size={19}
                                        className={`flex-shrink-0 transition-all ${
                                            isActive ? "text-white" : "text-white/60 group-hover:text-white"
                                        }`}
                                    />
                                    {(!collapsed || mobileOpen) && (
                                        <span className="truncate">{item.name}</span>
                                    )}
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div
                className="flex-shrink-0 border-t p-2"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
                <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    title={collapsed ? "Logout" : undefined}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-white/60 transition hover:bg-white/10 hover:text-red-400"
                >
                    <LogOut size={19} className="flex-shrink-0" />
                    {(!collapsed || mobileOpen) && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}
