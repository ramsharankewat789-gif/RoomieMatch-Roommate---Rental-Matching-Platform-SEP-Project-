import React from "react";

export const Button = ({ children, variant = "primary", className = "", ...props }) => {
  const base = "font-label-md text-label-md px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary text-on-primary hover:bg-surface-tint shadow-sm",
    secondary: "bg-secondary text-on-secondary hover:bg-on-secondary-fixed-variant shadow-sm",
    tertiary: "bg-tertiary text-on-tertiary hover:bg-tertiary-container shadow-sm",
    outline: "border border-outline text-primary hover:bg-surface-container-low",
    ghost: "text-on-surface-variant hover:bg-surface-container-low shadow-none",
    danger: "bg-error text-on-error hover:bg-error-container hover:text-on-error-container shadow-sm"
  };

  return (
    <button
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
