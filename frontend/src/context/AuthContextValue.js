import { createContext } from "react";

export const AuthContext = createContext(null);

export function getStoredUser() {
    try {
        const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function getStoredToken() {
    return (
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token")
    );
}
