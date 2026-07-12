import { Navigate, Route, Routes } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout.jsx";
import { Home } from "../pages/Home.jsx";
import { Login } from "../pages/Login.jsx";
import { Register } from "../pages/Register.jsx";
import { Profile } from "../pages/Profile.jsx";
import { Dashboard } from "../pages/Dashboard.jsx";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="/dashboard/:accountId" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
