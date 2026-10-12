import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");

    if (loading && !user && token) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#faf9f6]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1b4332] border-t-transparent"></div>
            </div>
        );
    }

    if (!user && !token) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
