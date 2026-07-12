import { apiFetch } from "./apiClient";

export const login = async (email: string, password: string) => {
    const data = await apiFetch("auth", "/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("token", data.token);
    return data;
};

export const register = (username: string, email: string, password: string) =>
    apiFetch("auth", "/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
    });

export const getProfile = () => apiFetch("auth", "/auth/profile");