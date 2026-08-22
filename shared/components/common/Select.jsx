import React from "react";

export const Select = ({
  label,
  options = [],
  error,
  className = "",
  containerClassName = "",
  id,
  placeholder,
  ...props
}) => {
  const selectId = id || "select_" + Math.random().toString(36).substring(2, 9);
  
  return (
    <div className={`flex flex-col gap-1 w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="font-label-md text-label-md text-on-surface-variant mb-1"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full bg-surface-container-low border ${
          error ? "border-error focus:ring-error focus:border-error" : "border-outline-variant focus:ring-primary focus:border-primary"
        } rounded-lg px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-1 transition-colors ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs text-error font-medium mt-0.5">{error}</span>
      )}
    </div>
  );
};

export default Select;
