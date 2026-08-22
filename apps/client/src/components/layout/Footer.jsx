import React from "react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-surface border-t border-outline-variant py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <div>
          <span className="font-headline-sm text-headline-sm font-bold text-primary">
            RoomieMatch
          </span>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-sm">
            Connecting students and young professionals with compatible living partners and verified properties safely.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-label-md font-label-md text-on-surface-variant">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/tenant/roommates" className="hover:text-primary transition-colors">
            Find Roommates
          </Link>
          <Link to="/tenant/properties" className="hover:text-primary transition-colors">
            Properties
          </Link>
          <a href="#" className="hover:text-primary transition-colors">
            Help Center
          </a>
        </div>
        <div className="font-label-sm text-label-sm text-outline">
          &copy; {new Date().getFullYear()} RoomieMatch. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
