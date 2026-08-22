import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import Avatar from "@shared/components/common/Avatar";

/**
 * UserSidebar — unified navigation for all client users.
 * Every user has access to all features: searching, listing, messaging, etc.
 */
export const UserSidebar = () => {
  const { currentUser } = useContext(AuthContext);
  const location = useLocation();

  if (!currentUser) return null;

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

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
          <span className="font-label-sm text-label-sm flex items-center gap-0.5 mt-0.5 font-semibold">
            {currentUser.isVerified ? (
              <span className="text-primary flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px] icon-fill">verified</span>
                Verified Member
              </span>
            ) : (
              <span className="text-on-surface-variant font-normal">Unverified Account</span>
            )}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1">

        {/* Overview */}
        <Link to="/user/dashboard" className={getLinkClass("/user/dashboard")}>
          <span className="material-symbols-outlined">dashboard</span>
          <span>Dashboard</span>
        </Link>

        {/* ── Discover ── */}
        <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
          Discover
        </p>
        <Link to="/user/roommates" className={getLinkClass("/user/roommates")}>
          <span className="material-symbols-outlined">group</span>
          <span>Find Roommates</span>
        </Link>
        <Link to="/user/properties" className={getLinkClass("/user/properties")}>
          <span className="material-symbols-outlined">home_work</span>
          <span>Search Properties</span>
        </Link>
        <Link to="/user/favorites" className={getLinkClass("/user/favorites")}>
          <span className="material-symbols-outlined">favorite</span>
          <span>Favorites</span>
        </Link>

        {/* ── Renting ── */}
        <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
          Renting
        </p>
        <Link to="/user/applications" className={getLinkClass("/user/applications")}>
          <span className="material-symbols-outlined">description</span>
          <span>My Applications</span>
        </Link>
        <Link to="/user/reviews" className={getLinkClass("/user/reviews")}>
          <span className="material-symbols-outlined">rate_review</span>
          <span>My Reviews</span>
        </Link>

        {/* ── Listing ── */}
        <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
          Listing
        </p>
        <Link to="/user/my-properties" className={getLinkClass("/user/my-properties")}>
          <span className="material-symbols-outlined">home_work</span>
          <span>My Properties</span>
        </Link>
        <Link to="/user/my-properties/add" className={getLinkClass("/user/my-properties/add")}>
          <span className="material-symbols-outlined">add_box</span>
          <span>Add Property</span>
        </Link>
        <Link to="/user/my-properties/applications" className={getLinkClass("/user/my-properties/applications")}>
          <span className="material-symbols-outlined">folder_shared</span>
          <span>Received Applications</span>
        </Link>
        <Link to="/user/my-properties/reviews" className={getLinkClass("/user/my-properties/reviews")}>
          <span className="material-symbols-outlined">reviews</span>
          <span>Property Reviews</span>
        </Link>

        {/* ── Account ── */}
        <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
          Account
        </p>
        <Link to="/user/messages" className={getLinkClass("/user/messages")}>
          <span className="material-symbols-outlined">chat</span>
          <span>Messages</span>
        </Link>
        <Link to="/user/preferences" className={getLinkClass("/user/preferences")}>
          <span className="material-symbols-outlined">tune</span>
          <span>Lifestyle Quiz</span>
        </Link>
        <Link to="/user/verification" className={getLinkClass("/user/verification")}>
          <span className="material-symbols-outlined">verified_user</span>
          <span>Verification</span>
        </Link>
        <Link to="/user/profile" className={getLinkClass("/user/profile")}>
          <span className="material-symbols-outlined">person</span>
          <span>My Profile</span>
        </Link>

      </nav>
    </aside>
  );
};

export default UserSidebar;
