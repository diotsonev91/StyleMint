import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./MainLayout.css"; 

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      {/* Header or Top Navigation */}
      <Navbar />

      {/* Main page area */}
      <main className="main-content-layout">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
