import React from "react";

export const Input = ({
  label,
  error,
  icon,
  className = "",
  containerClassName = "",
  id,
  ...props
}) => {
  const inputId = id || "input_" + Math.random().toString(36).substring(2, 9);
  
  return (
    <div className={`flex flex-col gap-1 w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="font-label-md text-label-md text-on-surface-variant mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 text-outline pointer-events-none select-none">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`w-full bg-surface-container-low border ${
            error ? "border-error focus:ring-error focus:border-error" : "border-outline-variant focus:ring-primary focus:border-primary"
          } rounded-lg px-4 py-3 ${
            icon ? "pl-10" : ""
          } text-body-md text-on-surface placeholder-outline focus:outline-none focus:ring-1 transition-colors ${className}`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-error font-medium mt-0.5">{error}</span>
      )}
    </div>
  );
};

export default Input;
