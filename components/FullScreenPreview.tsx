import React, { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import DownloadFormatModal from './DownloadFormatModal';

interface FullScreenPreviewProps {
  imageUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

const FullScreenPreview: React.FC<FullScreenPreviewProps> = ({
  imageUrl,
  isOpen,
  onClose,
  title = "Design Preview",
  subtitle = "Generated with pik.AI.so"
}) => {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Prevent body scrolling when preview is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !imageUrl) return null;

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloadModalOpen(true);
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-fuchsia-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Close Button & Header */}
      <div className="absolute top-4 inset-x-4 flex justify-between items-center z-10">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl px-4 py-2 backdrop-blur-md max-w-[70%]">
          <h3 className="text-sm font-bold text-slate-100 font-syne truncate">{title}</h3>
          <p className="text-[10px] text-slate-400 font-mono tracking-wider truncate uppercase mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadClick}
            className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 text-indigo-400 hover:text-indigo-300 backdrop-blur-md transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/5"
            title="Export Artwork File"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-red-950/60 border border-slate-800/80 text-slate-400 hover:text-red-400 backdrop-blur-md transition-all cursor-pointer shadow-lg"
            title="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div 
        className="relative max-w-full max-h-[80vh] flex items-center justify-center rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/40 p-2 shadow-2xl backdrop-blur-md cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={imageUrl} 
          alt={title} 
          className="max-h-[75vh] max-w-full object-contain rounded-xl select-none"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Elegant Dismiss Instruction Footer */}
      <p className="absolute bottom-6 text-[10px] text-slate-500 font-mono tracking-widest uppercase animate-pulse">
        Click anywhere outside to dismiss
      </p>

      {/* Interactive format selection and high-res export dialog */}
      <DownloadFormatModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        imageUrl={imageUrl}
        title="Export High-Res Artwork"
        defaultFilename="pikaiso-artwork"
      />
    </div>
  );
};

export default FullScreenPreview;
