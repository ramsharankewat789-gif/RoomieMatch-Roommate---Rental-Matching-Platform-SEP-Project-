import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import Avatar from "@shared/components/common/Avatar";

/**
 * Sidebar — navigation sidebar for Admin mode only.
 * Rendered exclusively inside AdminLayout.
 */
export const Sidebar = () => {
  const { currentUser } = useContext(AuthContext);
  const location = useLocation();

  if (!currentUser || currentUser.role !== "admin") return null;

  const isActive = (path) => location.pathname === path;

  const getLinkClass = (path) => {
    const base =
      "flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md transition-all duration-200";
    return isActive(path)
      ? `${base} bg-primary-container text-on-primary-container font-bold translate-x-1`
      : `${base} text-on-surface-variant hover:bg-surface-variant`;
  };

  return (
    <aside className="hidden md:flex flex-col h-[calc(100vh-73px)] p-4 gap-4 bg-surface-container-low border-r border-outline-variant w-[280px] shrink-0 sticky top-[73px] overflow-y-auto">
      {/* Profile Header */}
      <div className="flex items-center gap-3 px-2 py-3 border-b border-outline-variant mb-2">
        <Avatar src={currentUser.avatar} name={currentUser.name} size="md" />
        <div className="flex flex-col overflow-hidden">
          <span className="font-label-md text-label-md text-on-surface font-bold truncate">
            {currentUser.name}
          </span>
          <span className="font-label-sm text-label-sm text-primary flex items-center gap-0.5 mt-0.5 font-semibold">
            <span className="material-symbols-outlined text-[14px] icon-fill">
              admin_panel_settings
            </span>
            Administrator
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1">
        <Link to="/admin/dashboard" className={getLinkClass("/admin/dashboard")}>
          <span className="material-symbols-outlined">dashboard</span>
          <span>Dashboard Overview</span>
        </Link>
        <Link to="/admin/users" className={getLinkClass("/admin/users")}>
          <span className="material-symbols-outlined font-bold">group</span>
          <span>User Management</span>
        </Link>
        <Link to="/admin/properties" className={getLinkClass("/admin/properties")}>
          <span className="material-symbols-outlined">home_work</span>
          <span>Property Registry</span>
        </Link>
        <Link to="/admin/verifications" className={getLinkClass("/admin/verifications")}>
          <span className="material-symbols-outlined font-bold">verified_user</span>
          <span>Verifications Queue</span>
        </Link>
        <Link to="/admin/reports" className={getLinkClass("/admin/reports")}>
          <span className="material-symbols-outlined font-bold">flag</span>
          <span>Reports Panel</span>
        </Link>
        <Link to="/admin/analytics" className={getLinkClass("/admin/analytics")}>
          <span className="material-symbols-outlined font-bold">analytics</span>
          <span>Analytics Reports</span>
        </Link>
        <Link to="/admin/notifications" className={getLinkClass("/admin/notifications")}>
          <span className="material-symbols-outlined">notifications</span>
          <span>Notifications Board</span>
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
