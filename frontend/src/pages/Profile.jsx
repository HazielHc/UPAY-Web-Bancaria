import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/authService";

export function Profile() {

    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    useEffect(() => {

    const loadProfile = async () => {

        try {

            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const data = await getProfile();

            setProfile(data);

        } catch {

            localStorage.removeItem("token");

            navigate("/login");
        }
    };

    loadProfile();

}, []);

    return (
        <div>
            <h1>Perfil</h1>

            <p>Email: {profile?.user?.email}</p>
            <p>Rol: {profile?.user?.role}</p>

            <button onClick={logout}>
                Cerrar sesión
            </button>
        </div>
    );
}