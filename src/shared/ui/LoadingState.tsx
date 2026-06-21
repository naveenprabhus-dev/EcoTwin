import React from 'react';

export interface LoadingStateProps {
  message?: string;
  fullHeight?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Assembling environmental metrics...', fullHeight = false }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${fullHeight ? 'min-h-[400px]' : ''}`}>
      <div className="relative flex items-center justify-center mb-4">
        <div className="animate-ping absolute h-8 w-8 rounded-full bg-emerald-400 opacity-20"></div>
        <svg className="animate-spin h-8 w-8 text-emerald-600 relative" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
      <p className="text-sm font-sans font-medium text-gray-500 animate-pulse">
        {message}
      </p>
    </div>
  );
};

export default LoadingState;
