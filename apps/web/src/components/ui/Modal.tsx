import React, { useEffect } from 'react';
import { X } from 'lucide-react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: ModalSize;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  size = 'md',
  children,
  footer,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`relative w-full ${sizeClasses[size]} bg-card rounded-2xl border border-border shadow-[var(--shadow-lg)] flex flex-col max-h-[90vh] overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-border">
          <div>
            <h3
              id="modal-title"
              className="text-lg font-semibold text-foreground"
            >
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-muted mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-secondary cursor-pointer transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>

        {/* Optional Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-border bg-background/60 flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
