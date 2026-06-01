import React from "react";
import "../globals-landing.css";

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <main className="public-light min-h-screen bg-white text-foreground">
      {children}
    </main>
  );
};

export default PublicLayout;
