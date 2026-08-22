import React, { useEffect } from "react";
import { Button } from "./Button";

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className = "",
  ...props
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div
        className={`relative w-full max-w-lg bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ${className}`}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-4 overflow-y-auto text-body-md text-on-surface-variant">
          {children}
        </div>

        {/* Footer */}
        {footer ? (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-outline-variant bg-surface-container-low">
            {footer}
          </div>
        ) : (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-outline-variant bg-surface-container-low">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
