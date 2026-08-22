import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import { NotificationContext } from "@shared/context/NotificationContext";
import Avatar from "@shared/components/common/Avatar";

/**
 * AdminNavbar — top bar exclusively for the Admin interface.
 * Contains no links to user-mode pages whatsoever.
 */
export const AdminNavbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const { unreadCount } = useContext(NotificationContext);
  const navigate = useNavigate();

  return (
    <header className="bg-surface-container-low border-b border-outline-variant shadow-sm w-full sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-screen-2xl mx-auto">

        {/* Brand + mode badge */}
        <Link to="/admin/dashboard" className="flex items-center gap-3 select-none">
          <span className="material-symbols-outlined text-primary text-3xl icon-fill">
            admin_panel_settings
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-headline-lg text-headline-lg font-bold text-primary tracking-tight">
              RoomieMatch
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-error">
              Admin Console
            </span>
          </div>
        </Link>

        {/* Right-side actions */}
        <div className="flex items-center gap-4">

          {/* Notification bell — admin notifications only */}
          <Link
            to="/admin/notifications"
            className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors relative"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-error text-on-error font-bold text-[9px] rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* Admin user info + logout */}
          {currentUser && (
            <div className="flex items-center gap-3 border-l border-outline-variant pl-4">
              <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" />
              <div className="hidden lg:flex flex-col leading-tight">
                <span className="font-label-md text-label-md text-on-surface">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-error font-semibold uppercase tracking-wide">
                  Administrator
                </span>
              </div>
              <button
                onClick={() => { logout(); navigate("/"); }}
                className="text-outline hover:text-error transition-colors p-1"
                title="Logout"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
