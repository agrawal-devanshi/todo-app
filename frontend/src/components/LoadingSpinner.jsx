import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading your financial superpowers...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-xl animate-pulse"></div>
        <Loader2 className={`${sizeClasses[size] || sizeClasses.md} text-brand-600 animate-spin relative`} />
      </div>
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
