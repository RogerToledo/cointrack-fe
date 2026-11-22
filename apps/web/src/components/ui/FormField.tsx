import React from 'react';

export const inputBaseClasses =
  'w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-card text-foreground placeholder:text-muted-light focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-secondary disabled:text-muted disabled:cursor-not-allowed transition-all';

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function FormLabel({ children, required, className = '', ...props }: FormLabelProps) {
  return (
    <label
      className={`block text-sm font-medium text-foreground mb-1.5 ${className}`}
      {...props}
    >
      {children}
      {required && <span className="text-danger ml-0.5">*</span>}
    </label>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightSlot,
  id,
  required,
  className = '',
  ...props
}: InputProps) {
  return (
    <div>
      {label && (
        <FormLabel htmlFor={id} required={required}>
          {label}
        </FormLabel>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-light pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          id={id}
          required={required}
          className={`${inputBaseClasses} ${leftIcon ? 'pl-10' : ''} ${rightSlot ? 'pr-10' : ''} ${
            error ? 'border-danger focus:border-danger focus:ring-danger/15' : ''
          } ${className}`}
          {...props}
        />
        {rightSlot && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightSlot}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
      {hint && !error && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Select({
  label,
  error,
  hint,
  id,
  required,
  className = '',
  children,
  ...props
}: SelectProps) {
  return (
    <div>
      {label && (
        <FormLabel htmlFor={id} required={required}>
          {label}
        </FormLabel>
      )}
      <select
        id={id}
        required={required}
        className={`${inputBaseClasses} ${
          error ? 'border-danger focus:border-danger focus:ring-danger/15' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
      {hint && !error && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  );
}

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Checkbox({ label, id, className = '', ...props }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center gap-2.5 select-none ${
        props.disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
      } ${className}`}
    >
      <input
        id={id}
        type="checkbox"
        className="w-4 h-4 rounded border-border text-primary accent-primary focus:ring-2 focus:ring-primary/20"
        {...props}
      />
      <span className="text-sm font-medium text-foreground">{label}</span>
    </label>
  );
}
