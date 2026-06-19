import { Navigate, Route, Routes } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout.jsx";
import { Home } from "../pages/Home.jsx";
import { Login } from "../pages/Login.jsx";
import { Register } from "../pages/Register.jsx";
import { Profile } from "../pages/Profile.jsx";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
