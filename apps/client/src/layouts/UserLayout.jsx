import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import Navbar from "../components/layout/Navbar";
import UserSidebar from "../components/layout/UserSidebar";

/**
 * UserLayout — layout for the Client interface.
 * Accessible to any authenticated non-admin user (role === "user").
 * Redirects unauthenticated visitors to /login.
 * Redirects admins to their own isolated interface.
 */
export const UserLayout = () => {
  const { currentUser } = useContext(AuthContext);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role === "admin") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar />
      <div className="flex flex-grow w-full">
        <UserSidebar />
        <main className="flex-1 overflow-y-auto bg-surface p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
