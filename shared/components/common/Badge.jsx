import React from "react";

export const Badge = ({ children, variant = "primary", className = "", ...props }) => {
  const base = "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm uppercase tracking-wider";
  
  const variants = {
    primary: "bg-primary-fixed text-on-primary-fixed-variant border border-primary-container",
    secondary: "bg-secondary-fixed text-on-secondary-fixed-variant border border-secondary-container",
    tertiary: "bg-tertiary-fixed text-on-tertiary-fixed-variant border border-tertiary-container",
    error: "bg-error-container text-on-error-container border border-error",
    neutral: "bg-surface-container-highest text-on-surface-variant border border-outline-variant",
    success: "bg-secondary-container text-on-secondary-container border border-secondary"
  };

  return (
    <span
      className={`${base} ${variants[variant] || variants.neutral} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
