/**
 * ThemeToggle.jsx
 * Premium sun/moon toggle switch for dark mode
 */
import React from "react";
import { useTheme } from "../../context/ThemeContext";
import "./ThemeToggle.css";

export const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <label className="theme-switch" title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
      <input 
        type="checkbox" 
        checked={isDarkMode} 
        onChange={toggleTheme}
        aria-label="Toggle dark mode"
      />
      <span className="theme-slider"></span>
    </label>
  );
};

export default ThemeToggle;
