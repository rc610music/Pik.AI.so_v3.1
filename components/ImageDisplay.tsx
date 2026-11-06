
import React, { useState } from 'react';
import { PhotoIcon } from './Icons';
import { Eye } from 'lucide-react';
import FullScreenPreview from './FullScreenPreview';

interface ImageDisplayProps {
  imageUrl: string | null;
  isLoading: boolean;
  prompt: string;
  styleLabel: string;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl, isLoading, prompt, styleLabel }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="mt-6 p-4 aspect-square bg-slate-700/50 rounded-lg flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-600">
        <PhotoIcon className="h-16 w-16 text-slate-500 animate-pulse mb-4" />
        <p className="text-lg font-semibold">Generating your masterpiece...</p>
        <p className="text-sm text-slate-500">Style: {styleLabel}</p>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="mt-6 p-4 aspect-square bg-slate-700/50 rounded-lg flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-600">
        <PhotoIcon className="h-16 w-16 text-slate-500 mb-4" />
        <p className="text-lg font-semibold">Your generated image will appear here.</p>
        <p className="text-sm text-slate-500">Enter a prompt and select a style to begin.</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="relative aspect-square bg-slate-700 rounded-lg overflow-hidden shadow-lg border border-slate-600 group">
        <img 
          src={imageUrl} 
          alt={`Generated image for: ${prompt} in ${styleLabel} style`} 
          className="w-full h-full object-contain transition-transform duration-300 ease-in-out group-hover:scale-105"
        />
        
        {/* Hover glassmorphism overlay with Full Screen Preview button */}
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-bold text-white transition-all shadow-lg scale-90 group-hover:scale-100 duration-300 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-sky-400" />
            Full Screen Preview
          </button>
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-400 text-center italic">
        {prompt} - <span className="font-semibold text-sky-400">{styleLabel}</span>
      </p>

      {/* Full Screen Viewport Overlay Modal */}
      <FullScreenPreview
        imageUrl={imageUrl}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={prompt}
        subtitle={styleLabel}
      />
    </div>
  );
};

export default ImageDisplay;
