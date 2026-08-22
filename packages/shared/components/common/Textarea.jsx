import React from "react";

export const Textarea = ({
  label,
  error,
  className = "",
  containerClassName = "",
  id,
  rows = 4,
  ...props
}) => {
  const textareaId = id || "textarea_" + Math.random().toString(36).substring(2, 9);
  
  return (
    <div className={`flex flex-col gap-1 w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className="font-label-md text-label-md text-on-surface-variant mb-1"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={`w-full bg-surface-container-low border ${
          error ? "border-error focus:ring-error focus:border-error" : "border-outline-variant focus:ring-primary focus:border-primary"
        } rounded-lg px-4 py-3 text-body-md text-on-surface placeholder-outline focus:outline-none focus:ring-1 transition-colors ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-error font-medium mt-0.5">{error}</span>
      )}
    </div>
  );
};

export default Textarea;
