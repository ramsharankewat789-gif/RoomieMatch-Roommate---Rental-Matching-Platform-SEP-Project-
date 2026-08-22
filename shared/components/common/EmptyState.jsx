import React from "react";
import Button from "./Button";

export const EmptyState = ({
  icon = "search_off",
  title = "No results found",
  description = "Try adjusting your filters or search terms to find what you are looking for.",
  actionText,
  onActionClick
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-sm max-w-lg mx-auto my-6">
      <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center text-outline mb-4">
        <span className="material-symbols-outlined text-[36px]">{icon}</span>
      </div>
      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">
        {title}
      </h3>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-6">
        {description}
      </p>
      {actionText && onActionClick && (
        <Button variant="primary" onClick={onActionClick}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
