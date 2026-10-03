'use client';
import { InputHTMLAttributes, forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...rest }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full h-11 rounded-lg border border-gray-300 px-3 text-sm',
        'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
        'disabled:bg-gray-100',
        className
      )}
      {...rest}
    />
  )
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...rest }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm',
        'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
        className
      )}
      {...rest}
    />
  )
);
Textarea.displayName = 'Textarea';

export function Field({
  label,
  error,
  required,
  children,
  hint,
}: {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-800">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
