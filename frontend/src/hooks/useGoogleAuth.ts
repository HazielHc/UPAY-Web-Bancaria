import { useNavigate } from "react-router-dom";
import { googleLogin } from "../services/googleAuthService";

export function useGoogleAuth() {
    const navigate = useNavigate();

    async function loginWithGoogle(credential: string) {
        try {
            const data = await googleLogin(credential);

        if (!data.token) {
            throw new Error("No se recibió token del backend");
        }

        localStorage.setItem("token", data.token);

        console.log("LOGIN GOOGLE OK:", data);

        navigate("/profile");

        } catch (error) {
            console.error("Error Google Login:", error);
        }
    }

    return {
        loginWithGoogle
    };
}