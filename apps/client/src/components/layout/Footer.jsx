import React from "react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-surface border-t border-outline-variant py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="/images/logo.png" alt="RoomieMatch" className="h-8 w-auto" />
              <span className="font-headline-sm text-headline-sm font-bold text-primary">RoomieMatch</span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed max-w-xs">
              Connecting students and young professionals with compatible living partners
              and verified rental properties.
            </p>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider mb-4">
              Platform
            </h4>
            <nav className="flex flex-col gap-2">
              <Link to="/user/properties" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">
                Browse Properties
              </Link>
              <Link to="/user/roommates" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">
                Find Roommates
              </Link>
              <Link to="/register" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">
                Create Account
              </Link>
              <Link to="/login" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">
                Sign In
              </Link>
            </nav>
          </div>

          {/* Account links */}
          <div>
            <h4 className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider mb-4">
              Account
            </h4>
            <nav className="flex flex-col gap-2">
              <Link to="/user/dashboard" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link to="/user/my-properties" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">
                My Properties
              </Link>
              <Link to="/user/applications" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">
                My Applications
              </Link>
              <Link to="/user/verification" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">
                Verification
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-outline-variant/60 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-center">
          <span className="font-label-sm text-label-sm text-outline">
            &copy; {new Date().getFullYear()} RoomieMatch. All rights reserved.
          </span>
          <span className="font-label-sm text-label-sm text-outline">
            University of Wolverhampton — SEP Project
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
