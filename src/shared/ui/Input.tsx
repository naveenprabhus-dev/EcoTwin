import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-gray-500 tracking-wide font-sans">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`px-3.5 py-2.5 bg-white border rounded-xl text-sm font-sans text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-150 ${
            error
              ? 'border-rose-300 focus:ring-rose-400/30 focus:border-rose-400'
              : 'border-gray-200 focus:ring-emerald-500/10 focus:border-emerald-500'
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs font-sans font-medium text-rose-500 mt-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
