import React from "react";
import { ThemeToggle } from "../theme-toggle";

function Header() {
  return (
    <div className="mb-8 flex items-center justify-between">
      <h1 className="text-3xl font-bold">AI Document Assistant</h1>

      <div>
        <ThemeToggle />
      </div>
    </div>
  );
}

export default Header;
