
import React from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from './Icons';

interface ErrorAlertProps {
  message: string;
  onClose?: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onClose }) => {
  return (
    <div className="mt-4 bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative" role="alert">
      <div className="flex items-start">
        <div className="py-1">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-400 mr-3" />
        </div>
        <div>
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-1">{message}</span>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-200"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;
    