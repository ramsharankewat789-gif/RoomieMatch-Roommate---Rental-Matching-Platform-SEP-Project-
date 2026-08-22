import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import AdminNavbar from "../components/layout/AdminNavbar";
import Sidebar from "../components/layout/Sidebar";

/**
 * AdminLayout — layout wrapper for Admin mode.
 * Only accessible to users with role === "admin".
 * All other authenticated users are sent back to the User mode.
 */
export const AdminLayout = () => {
  const { currentUser } = useContext(AuthContext);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      <AdminNavbar />
      <div className="flex flex-grow w-full">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-surface p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
