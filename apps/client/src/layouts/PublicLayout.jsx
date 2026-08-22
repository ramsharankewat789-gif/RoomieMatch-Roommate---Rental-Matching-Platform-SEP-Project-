import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar />
      <main className="flex-grow flex flex-col w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
