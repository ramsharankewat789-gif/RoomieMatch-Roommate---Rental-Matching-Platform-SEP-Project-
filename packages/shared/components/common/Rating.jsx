import React from "react";

export const Rating = ({ value = 0, max = 5, size = "sm", className = "", onChange }) => {
  const stars = [];
  const roundedVal = Math.round(value * 2) / 2; // Round to nearest 0.5

  const sizeClasses = {
    sm: "text-[16px]",
    md: "text-[20px]",
    lg: "text-[28px]"
  };

  const handleStarClick = (idx) => {
    if (onChange) {
      onChange(idx + 1);
    }
  };

  for (let i = 0; i < max; i++) {
    const isClickable = typeof onChange === "function";
    const starIdx = i;

    if (i < Math.floor(roundedVal)) {
      stars.push(
        <span
          key={i}
          onClick={() => handleStarClick(starIdx)}
          className={`material-symbols-outlined text-secondary icon-fill ${
            sizeClasses[size] || sizeClasses.sm
          } ${isClickable ? "cursor-pointer hover:scale-110" : ""}`}
        >
          star
        </span>
      );
    } else if (i === Math.floor(roundedVal) && roundedVal % 1 !== 0) {
      stars.push(
        <span
          key={i}
          onClick={() => handleStarClick(starIdx)}
          className={`material-symbols-outlined text-secondary ${
            sizeClasses[size] || sizeClasses.sm
          } ${isClickable ? "cursor-pointer hover:scale-110" : ""}`}
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }} // material symbols doesn't do native half stars easily, we can render partial or just outlined
        >
          star_half
        </span>
      );
    } else {
      stars.push(
        <span
          key={i}
          onClick={() => handleStarClick(starIdx)}
          className={`material-symbols-outlined text-outline-variant ${
            sizeClasses[size] || sizeClasses.sm
          } ${isClickable ? "cursor-pointer hover:scale-110" : ""}`}
        >
          star
        </span>
      );
    }
  }

  return <div className={`flex items-center gap-0.5 ${className}`}>{stars}</div>;
};

export default Rating;
