import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, FileImage, Layers, HelpCircle, Loader2, Sparkles, Check } from 'lucide-react';
import html2canvas from 'html2canvas';

export type DownloadFormat = 'png' | 'jpg' | 'svg';
export type ResolutionScale = 1 | 2 | 3;

interface DownloadFormatModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  defaultFilename?: string;
  imageUrl?: string | null;
  elementRef?: React.RefObject<HTMLDivElement | null>;
}

const DownloadFormatModal: React.FC<DownloadFormatModalProps> = ({
  isOpen,
  onClose,
  title = "Export Design Asset",
  defaultFilename = "pikaiso-export",
  imageUrl,
  elementRef
}) => {
  const [format, setFormat] = useState<DownloadFormat>('png');
  const [scale, setScale] = useState<ResolutionScale>(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const formats: { id: DownloadFormat; name: string; ext: string; desc: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'png',
      name: 'PNG Raster Image',
      ext: '.png',
      desc: 'Lossless raster layout preserving pixel-perfect clarity. Supports transparent elements and perfect gradients.',
      icon: <FileImage className="w-5 h-5 text-emerald-400" />,
      badge: 'Recommended'
    },
    {
      id: 'jpg',
      name: 'High-Res JPG',
      ext: '.jpg',
      desc: 'Optimized photo-style format with 95% quality rendering. Ideal for sharing on social platforms or portfolios.',
      icon: <FileImage className="w-5 h-5 text-amber-400" />
    },
    {
      id: 'svg',
      name: 'Scalable SVG Wrapper',
      ext: '.svg',
      desc: 'Scalable vector graphic container that embeds the design internally. Clean resolution-independent presentation for web design.',
      icon: <Layers className="w-5 h-5 text-indigo-400" />
    }
  ];

  const handleDownload = async () => {
    setIsProcessing(true);
    setError(null);
    const filename = `${defaultFilename}-${Date.now()}`;

    try {
      if (elementRef && elementRef.current) {
        // --- Capture DOM Element ---
        const element = elementRef.current;
        
        // Render element to canvas
        const canvas = await html2canvas(element, {
          backgroundColor: '#020617', // Match slate-950
          useCORS: true,
          allowTaint: true,
          scale: scale, // Multiplier (1x, 2x, 3x)
          logging: false
        });

        triggerFileDownload(canvas, filename);
      } else if (imageUrl) {
        // --- Fetch & Process Image URL ---
        const img = new Image();
        img.crossOrigin = "anonymous"; // Handle CORS
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => reject(new Error("Failed to load image. If this persists, try another format or capture the viewport directly."));
          img.src = imageUrl;
        });

        // Create offscreen canvas with resolution scale
        const targetWidth = img.naturalWidth * scale;
        const targetHeight = img.naturalHeight * scale;

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error("Could not initialize 2D rendering context.");
        }

        // Draw with high-quality scaling settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        triggerFileDownload(canvas, filename);
      } else {
        throw new Error("No capture target available.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An unexpected error occurred during generation.");
      setIsProcessing(false);
    }
  };

  const triggerFileDownload = (canvas: HTMLCanvasElement, filename: string) => {
    let downloadUrl = '';
    let ext = '.png';

    if (format === 'png') {
      downloadUrl = canvas.toDataURL('image/png');
      ext = '.png';
    } else if (format === 'jpg') {
      downloadUrl = canvas.toDataURL('image/jpeg', 0.95);
      ext = '.jpg';
    } else if (format === 'svg') {
      // Build an elegant, self-contained SVG file
      const pngData = canvas.toDataURL('image/png');
      const width = canvas.width / scale;
      const height = canvas.height / scale;
      
      const svgString = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <style>
    .embedded-art { width: 100%; height: 100%; object-fit: contain; }
  </style>
  <g id="PikAiso-Artwork-Layer">
    <image class="embedded-art" href="${pngData}" x="0" y="0" width="${width}" height="${height}" />
  </g>
</svg>`;

      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      downloadUrl = URL.createObjectURL(svgBlob);
      ext = '.svg';
    }

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${filename}${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (format === 'svg') {
      URL.revokeObjectURL(downloadUrl);
    }

    setIsProcessing(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        {/* Animated backdrop backdrop-blur-md */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 cursor-pointer"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 15, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-2xl backdrop-blur-xl overflow-hidden"
        >
          {/* Subtle Background Glows */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Header */}
          <div className="flex justify-between items-start mb-5 relative z-10">
            <div>
              <h3 className="text-base font-bold text-slate-100 font-syne flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                {title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Choose your desired export formats and dimensions</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Content */}
          <div className="space-y-5 relative z-10">
            {/* Format Picker */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 font-mono tracking-wider uppercase">Select Format</label>
              <div className="grid grid-cols-1 gap-2.5">
                {formats.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`flex items-start text-left gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                      format === f.id
                        ? 'bg-indigo-950/30 border-indigo-500/80 shadow-md shadow-indigo-500/5'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700/80 hover:bg-slate-900/40'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${format === f.id ? 'bg-indigo-950/50' : 'bg-slate-900'}`}>
                      {f.icon}
                    </div>
                    <div className="flex-1 pr-6">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200 font-syne">{f.name}</span>
                        {f.badge && (
                          <span className="text-[9px] bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded-full font-semibold">
                            {f.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-light leading-relaxed mt-1">
                        {f.desc}
                      </p>
                    </div>

                    {format === f.id && (
                      <div className="absolute top-3.5 right-3.5 bg-indigo-500 text-slate-950 rounded-full p-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3px]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution/Scale Multiplier */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300 font-mono tracking-wider uppercase">Dimension Multiplier</label>
                <span className="text-[10px] text-indigo-400 font-mono">
                  {scale === 1 ? 'Standard Web (72 DPI)' : scale === 2 ? 'High Definition (144 DPI)' : 'Ultra/Print Ready (300 DPI)'}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {([1, 2, 3] as ResolutionScale[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setScale(s)}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold font-mono transition-all cursor-pointer ${
                      scale === s
                        ? 'bg-indigo-500/10 border-indigo-500/80 text-indigo-400'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700/60 hover:text-slate-300'
                    }`}
                  >
                    {s}x {s === 1 ? '(1x)' : s === 2 ? '(Retina)' : '(Ultra)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex gap-3">
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 py-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              
              <button
                onClick={handleDownload}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-xs font-bold text-white transition-all shadow-lg shadow-indigo-500/10 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Generating Assets...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export Artwork
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DownloadFormatModal;
