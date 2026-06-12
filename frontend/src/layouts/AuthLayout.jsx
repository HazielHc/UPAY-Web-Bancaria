import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-8 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.2),transparent_34%)]" />
      <Outlet />
    </main>
  );
}
