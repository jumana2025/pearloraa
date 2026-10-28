import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

const normalizedApiUrl = configuredApiUrl?.replace(/\/+$/, "");

const fallbackApiUrl = import.meta.env.DEV
    ? "http://127.0.0.1:8000/api/"
    : "/api/";

export const API_BASE_URL = normalizedApiUrl
    ? `${normalizedApiUrl.endsWith("/api")
        ? normalizedApiUrl
        : `${normalizedApiUrl}/api`}/`
    : fallbackApiUrl;

export const API_ORIGIN = /^https?:\/\//.test(API_BASE_URL)
    ? API_BASE_URL.replace(/\/api\/?$/, "")
    : "";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const accessToken =
            localStorage.getItem("access_token") ||
            sessionStorage.getItem("access_token");

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;