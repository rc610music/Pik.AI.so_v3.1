import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Sparkles } from 'lucide-react';
import PikAisoLogo from './components/PikAisoLogo';
import TabSelector from './components/TabSelector';
import ImagePalette from './components/ImagePalette';
import SignatureStudio from './components/SignatureStudio';
import TypographyCreator from './components/TypographyCreator';
import MonogramCreator from './components/MonogramCreator';
import LogoMaker from './components/LogoMaker';
import BrandPackCreator from './components/BrandPackCreator';
import MediaStudio from './components/MediaStudio';
import TruAxiomLogo from './components/TruAxiomLogo';
import StarryGalaxyBackground from './components/StarryGalaxyBackground';
import DownloadFormatModal from './components/DownloadFormatModal';

export type Tool = 'palette' | 'signature' | 'typography' | 'monogram' | 'logo' | 'brand' | 'video';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<Tool>('brand');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const toolOutputRef = useRef<HTMLDivElement>(null);

  const getToolDetails = (tool: Tool) => {
    switch (tool) {
      case 'brand':
        return { title: 'Brand Pack Creator', desc: 'Complete brand strategy, vector logo, business card & web banner.' };
      case 'palette':
        return { title: 'Creative Image Palette', desc: 'Generate visual assets and automatically extract designer color chemistry.' };
      case 'signature':
        return { title: 'Signature Studio', desc: 'Design professional vector-ready custom signatures and wordmarks.' };
      case 'typography':
        return { title: 'Cinematic Typography', desc: 'Craft gorgeous, stylized 3D text art with dramatic layouts.' };
      case 'monogram':
        return { title: 'Heraldic Monogram Maker', desc: 'Shape beautiful initials combined with elegant themed accents.' };
      case 'logo':
        return { title: '3D Cube Logo Maker', desc: 'Build stunning volumetric corporate icons with artistic depth.' };
      case 'video':
        return { title: 'Veo Cinematic Media Studio', desc: 'Transform images and descriptive motions into fluid HD video.' };
      default:
        return { title: 'Design Intelligence', desc: 'Expanding human creativity using advanced AI models.' };
    }
  };

  const renderTool = () => {
    switch (activeTool) {
      case 'brand':
        return <BrandPackCreator />;
      case 'palette':
        return <ImagePalette />;
      case 'signature':
        return <SignatureStudio />;
      case 'typography':
        return <TypographyCreator />;
      case 'monogram':
        return <MonogramCreator />;
      case 'logo':
        return <LogoMaker />;
      case 'video':
        return <MediaStudio />;
      default:
        return <BrandPackCreator />;
    }
  }

  return (
    <div className="min-h-screen text-slate-100 flex flex-col items-center p-4 sm:p-8 selection:bg-indigo-500 selection:text-white relative overflow-hidden font-sans">
      {/* Immersive Cosmic Starry Background */}
      <StarryGalaxyBackground />

      {/* Absolute Decorative Blur Elements */}
      <div className="glow-overlay-indigo"></div>
      <div className="glow-overlay-fuchsia"></div>

      <header className="mb-10 flex w-full flex-col items-center text-center relative z-10 max-w-xl">
        <div className="float-slow">
          <PikAisoLogo className="h-28 w-auto mb-2 filter drop-shadow-[0_0_20px_rgba(139,92,246,0.3)]" />
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 via-fuchsia-400 to-cyan-400 tracking-tighter font-syne drop-shadow-sm select-none">
          pik.AI.so
        </h1>
        
        <p className="text-xs font-mono tracking-widest text-indigo-400/80 uppercase mt-2">
          Creative Design Intelligence
        </p>
        
        <p className="max-w-md text-sm text-slate-400/90 mt-4 leading-relaxed font-light">
          "Unlocking a digital world of endless possibilities, greatly expanding every user's graphic and brand design potential."
        </p>
      </header>
      
      <main 
        className={`w-full ${
          activeTool === 'brand' || activeTool === 'video' ? 'max-w-4xl' : 'max-w-2xl'
        } transition-all duration-500 ease-in-out bg-slate-950/40 shadow-2xl rounded-2xl p-4 sm:p-8 space-y-6 backdrop-blur-xl border border-slate-800/60 relative z-10 shadow-glass`}
      >
        <TabSelector activeTool={activeTool} onToolChange={setActiveTool} />
        
        {/* Dynamic Header & Global Download Tool Output Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/30 p-4 rounded-xl border border-slate-800/80">
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-syne flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              {getToolDetails(activeTool).title}
            </h2>
            <p className="text-xs text-slate-400 font-light mt-0.5">
              {getToolDetails(activeTool).desc}
            </p>
          </div>
          
          <button
            onClick={() => setIsDownloadModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-indigo-500/10 cursor-pointer active:scale-98"
            title="Takes a screenshot capture of the active tool viewport"
          >
            <Download className="w-3.5 h-3.5" />
            Download Tool Canvas
          </button>
        </div>

        <div ref={toolOutputRef} className="pt-2 bg-transparent">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTool}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {renderTool()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <DownloadFormatModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        elementRef={toolOutputRef}
        title="Export Canvas Layout"
        defaultFilename={`pikaiso-${activeTool}`}
      />

      <footer className="mt-16 w-full max-w-2xl text-center text-slate-500 text-xs relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-800/80 pt-6">
            <p className="text-slate-500">&copy; {new Date().getFullYear()} pik.AI.so. All Rights Reserved. Powered by Google Gemini.</p>
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Brought to you by</span>
              <a href="https://truaxiom.com" target="_blank" rel="noopener noreferrer" aria-label="TruAxiom">
                  <TruAxiomLogo className="h-7 w-auto opacity-50 hover:opacity-100 transition-opacity" />
              </a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
