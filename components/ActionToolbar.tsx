import React from 'react';
import { RefreshIcon, PencilIcon, DownloadIcon } from './Icons';

interface ActionToolbarProps {
  imageUrl: string;
  onRegenerate: () => void;
  onEdit: () => void;
  fileName: string;
  fullPrompt: string; // Passed from parent, could be used for 'copy prompt' in the future
}

const ActionToolbar: React.FC<ActionToolbarProps> = ({ imageUrl, onRegenerate, onEdit, fileName }) => {
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    // The service defaults to jpeg.
    const cleanFileName = fileName.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
    link.download = `${cleanFileName || 'truaxiom-art'}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex justify-center items-center gap-2 sm:gap-4 mt-4 p-2 bg-slate-700/50 rounded-lg">
      <button
        onClick={onRegenerate}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-600 rounded-md transition-colors"
        aria-label="Regenerate Image"
        title="Regenerate Image"
      >
        <RefreshIcon className="h-5 w-5" />
        <span className="hidden sm:inline">Regenerate</span>
      </button>
      <button
        onClick={onEdit}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-600 rounded-md transition-colors"
        aria-label="Edit Prompt"
        title="Edit Prompt"
      >
        <PencilIcon className="h-5 w-5" />
        <span className="hidden sm:inline">Edit</span>
      </button>
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors"
        aria-label="Download Image"
        title="Download Image"
      >
        <DownloadIcon className="h-5 w-5" />
        <span className="hidden sm:inline">Download</span>
      </button>
    </div>
  );
};

export default ActionToolbar;