import React from 'react';

type ButtonVariant = 'primary' | 'success' | 'secondary' | 'accent' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-hover focus:ring-4 focus:ring-primary/20 shadow-xs',
  success:
    'bg-success text-white hover:bg-success-hover focus:ring-4 focus:ring-success/20 shadow-xs',
  secondary:
    'bg-card text-foreground border border-border hover:bg-secondary hover:border-border-hover',
  accent:
    'bg-accent-light text-accent border border-accent/20 hover:bg-accent/15',
  danger:
    'bg-danger text-white hover:bg-danger-hover focus:ring-4 focus:ring-danger/20 shadow-xs',
  ghost:
    'bg-transparent text-muted hover:bg-secondary hover:text-foreground',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-5 py-3 text-sm rounded-xl gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  disabled,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}

type IconButtonTone = 'view' | 'edit' | 'delete' | 'pay' | 'accent' | 'neutral';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: IconButtonTone;
}

const iconToneStyles: Record<IconButtonTone, string> = {
  view: 'text-accent hover:bg-accent-light',
  accent: 'text-muted hover:text-accent hover:bg-accent-light',
  edit: 'text-muted hover:text-warning hover:bg-warning-light',
  delete: 'text-muted hover:text-danger hover:bg-danger-light',
  pay: 'text-success hover:bg-success-light',
  neutral: 'text-muted hover:text-foreground hover:bg-secondary',
};

export function IconButton({
  tone = 'neutral',
  className = '',
  disabled,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent ${iconToneStyles[tone]} ${className}`}
      {...props}
    />
  );
}

export default Button;
