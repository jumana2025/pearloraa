import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import {
    AuthContext,
    getStoredToken,
    getStoredUser,
} from "./AuthContextValue";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => getStoredUser());
    const [loading, setLoading] = useState(true);

    const loadUser = useCallback(async () => {
        const token = getStoredToken();
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const response = await api.get("users/profile/");
            setUser(response.data);
            localStorage.setItem("user", JSON.stringify(response.data));
        } catch (error) {
            if (error.response && error.response.status === 401) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                sessionStorage.removeItem("access_token");
                sessionStorage.removeItem("refresh_token");
                localStorage.removeItem("user");
                sessionStorage.removeItem("user");
                setUser(null);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        Promise.resolve().then(() => {
            if (!cancelled) loadUser();
        });

        const handleAuthChange = () => {
            const cached = getStoredUser();
            if (cached) setUser(cached);
            loadUser();
        };

        window.addEventListener("authChanged", handleAuthChange);
        window.addEventListener("storage", handleAuthChange);

        return () => {
            cancelled = true;
            window.removeEventListener("authChanged", handleAuthChange);
            window.removeEventListener("storage", handleAuthChange);
        };
    }, [loadUser]);

    const login = async (username, password) => {
        const response = await api.post("users/login/", {
            login: username,
            password,
        });

        localStorage.setItem("access_token", response.data.access);
        localStorage.setItem("refresh_token", response.data.refresh);
        if (response.data.user) {
            localStorage.setItem("user", JSON.stringify(response.data.user));
            setUser(response.data.user);
        }

        try {
            const profileResponse = await api.get("users/profile/");
            setUser(profileResponse.data);
            localStorage.setItem("user", JSON.stringify(profileResponse.data));
        } catch {
            // Keep response.data.user
        }

        window.dispatchEvent(new Event("authChanged"));
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
        localStorage.removeItem("pearloraa_cart");

        setUser(null);
        window.dispatchEvent(new Event("authChanged"));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                reloadUser: loadUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
