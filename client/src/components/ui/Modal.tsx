import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  isSubmitting?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
  isSubmitting = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, isSubmitting]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  const maxWidthStyles: Record<string, string> = {
    sm: 'min(100% - 24px, 384px)',
    md: 'min(100% - 24px, 448px)',
    lg: 'min(100% - 24px, 512px)',
    xl: 'min(100% - 24px, 760px)',
    '2xl': 'min(100% - 24px, 672px)',
    '4xl': 'min(100% - 24px, 896px)',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Dismissible Backdrop */}
      <div
        className="fixed inset-0 bg-navy-950/75 backdrop-blur-xs transition-opacity duration-200"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
        aria-hidden="true"
      />

      {/* Centering wrapper with safe padding for all screen widths */}
      <div className="flex min-h-full items-center justify-center p-3 sm:p-6 text-center">
        <div
          className={clsx(
            'relative w-full transform rounded-2xl bg-white text-left shadow-2xl transition-all border border-slate-100 flex flex-col',
            'max-h-[calc(100dvh-24px)] mx-auto',
            maxWidths[maxWidth]
          )}
          style={{ width: maxWidthStyles[maxWidth] || 'min(100% - 24px, 760px)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Title & Close (X) Button */}
          {title ? (
            <div className="flex items-center justify-between border-b border-slate-100 px-5 sm:px-6 py-4 shrink-0 bg-white rounded-t-2xl">
              <div className="pr-3 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">{title}</h3>
                {subtitle && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                aria-label="Close dialog"
                className="shrink-0 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            /* Floating Close (X) button when modal has no title header */
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close dialog"
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-20 shrink-0 rounded-full p-2 bg-slate-100/90 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Modal Scrollable Body */}
          <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
