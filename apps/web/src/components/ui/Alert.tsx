import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

type AlertVariant = 'success' | 'error' | 'info' | 'warning';

interface AlertProps {
  variant?: AlertVariant;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

const styles: Record<AlertVariant, string> = {
  success: 'bg-success-light border-success/25 text-success-foreground',
  error: 'bg-danger-light border-danger/25 text-danger',
  info: 'bg-accent-light border-accent/25 text-foreground',
  warning: 'bg-warning-light border-warning/25 text-warning',
};

const icons: Record<AlertVariant, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />,
  error: <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />,
  info: <Info className="w-5 h-5 text-accent flex-shrink-0" />,
  warning: <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />,
};

export function Alert({ variant = 'error', message, onDismiss, className = '' }: AlertProps) {
  return (
    <div
      role="alert"
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border ${styles[variant]} ${className}`}
    >
      {icons[variant]}
      <p className="text-sm font-medium flex-1">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="opacity-70 hover:opacity-100 cursor-pointer transition-opacity"
          aria-label="Fechar alerta"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default Alert;
