import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    Layers,
    Users,
    ShoppingBag,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Gem,
} from "lucide-react";

const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Products", path: "/admin/products", icon: Package },
    { name: "Categories", path: "/admin/categories", icon: Layers },
    { name: "Customers", path: "/admin/customers", icon: Users },
    { name: "Orders", path: "/admin/orders", icon: ShoppingBag },
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
            className={`fixed left-0 top-0 z-40 flex h-screen flex-col transition-transform duration-300 ${collapsed ? "w-[72px]" : "w-64"} ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
            style={{ background: "#1b4332" }}
        >
            {/* Logo */}
            <div
                className="flex h-[70px] items-center justify-between border-b px-4 flex-shrink-0"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
                {!collapsed && (
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div
                            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                            style={{ background: "#a48755" }}
                        >
                            <Gem size={16} className="text-white" />
                        </div>
                        <div className="leading-tight">
                            <p
                                className="text-sm font-bold tracking-widest text-white"
                                style={{ letterSpacing: "0.12em" }}
                            >
                                PEARLORAA
                            </p>
                            <p
                                className="text-[8px] font-medium tracking-widest"
                                style={{ color: "#a48755", letterSpacing: "0.22em" }}
                            >
                                ADMIN PANEL
                            </p>
                        </div>
                    </div>
                )}

                {collapsed && (
                    <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "#a48755" }}>
                        <Gem size={16} className="text-white" />
                    </div>
                )}
            </div>

            {/* Toggle button */}
            <button
                onClick={onToggle}
                className="absolute -right-3 top-[58px] z-50 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-md hover:bg-gray-50"
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
                                    {!collapsed && (
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
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}
