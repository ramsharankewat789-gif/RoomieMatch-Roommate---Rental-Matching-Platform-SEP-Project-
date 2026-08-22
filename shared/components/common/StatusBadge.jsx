import React from "react";
import Badge from "./Badge";

export const StatusBadge = ({ status = "", className = "" }) => {
  const normStatus = status.toLowerCase();

  let variant = "neutral";
  let label = status;

  if (normStatus === "pending" || normStatus === "under_review" || normStatus === "reviewing") {
    variant = "primary"; // primary fits yellow/blue container
    label = normStatus === "under_review" ? "Under Review" : "Pending";
  } else if (normStatus === "approved" || normStatus === "verified" || normStatus === "resolved" || normStatus === "active") {
    variant = "success";
    label = normStatus === "active" ? "Active" : normStatus.charAt(0).toUpperCase() + normStatus.slice(1);
  } else if (normStatus === "rejected" || normStatus === "declined" || normStatus === "failed" || normStatus === "cancelled" || normStatus === "inactive") {
    variant = "error";
    label = normStatus.charAt(0).toUpperCase() + normStatus.slice(1);
  } else if (normStatus === "unverified" || normStatus === "draft") {
    variant = "neutral";
    label = normStatus.charAt(0).toUpperCase() + normStatus.slice(1);
  }

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
};

export default StatusBadge;
