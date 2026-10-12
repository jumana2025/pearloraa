import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar.jsx";
import AdminHeader from "../components/AdminHeader.jsx";

export default function AdminLayout() {
    const token = localStorage.getItem("admin_access");
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    if (!token) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className="min-h-screen" style={{ background: "#f8f4ec" }}>
            {/* Sidebar */}
            <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(prev => !prev)} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/30 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Main content area */}
            <div
                
                className={`flex min-h-screen flex-col transition-all duration-300 ${collapsed ? "lg:ml-[72px]" : "lg:ml-64"}`}
            >
                {/* Topbar */}
                <AdminHeader onMobileToggle={() => setMobileOpen(true)} />

                {/* Page content */}
                <main className="flex-1 p-4 md:p-6 lg:p-8">
                    <Outlet />
                </main>

                {/* Footer */}
                <footer
                    className="border-t px-8 py-4 text-center text-xs"
                    style={{ borderColor: "#e8e0d5", color: "#a48755" }}
                >
                    © {new Date().getFullYear()} Pearloraa Fine Jewellery · Admin Panel
                </footer>
            </div>
        </div>
    );
}
