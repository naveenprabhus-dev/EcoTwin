import React from 'react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Service Interruption',
  message,
  onRetry,
  retryText = 'Retry Request'
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/50 max-w-md mx-auto my-6">
      <div className="p-3 bg-rose-50 rounded-full text-rose-500 mb-4 border border-rose-100/50">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-sm font-sans font-semibold text-gray-800 mb-1">
        {title}
      </h3>
      <p className="text-xs font-sans text-gray-500 max-w-sm mb-5 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="text-xs">
          {retryText}
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
