import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Layers, 
  Building2, 
  Briefcase, 
  Palette, 
  Type, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  Compass, 
  FileText, 
  CreditCard, 
  ExternalLink,
  ChevronRight,
  Info,
  Eye
} from 'lucide-react';
import { BrandStyle, BrandPackData } from '../types';
import { BRAND_STYLE_OPTIONS, DEFAULT_BRAND_STYLE } from '../constants';
import { generateImage, generateBrandPackStrategy } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';
import FullScreenPreview from './FullScreenPreview';

// Custom visual cards configuration for Brand Styles
interface StylePresetCard {
  value: BrandStyle;
  label: string;
  description: string;
  gradient: string;
  borderClass: string;
  glowClass: string;
}

const STYLE_PRESET_CARDS: StylePresetCard[] = [
  {
    value: BrandStyle.TECH_MINIMAL,
    label: "Futuristic Tech Minimal",
    description: "Sleek, digital-first aesthetics using cold grays, cyan, and deep blues.",
    gradient: "from-slate-950 via-slate-900 to-cyan-950",
    borderClass: "hover:border-cyan-500/50 border-slate-700/60",
    glowClass: "shadow-cyan-500/20"
  },
  {
    value: BrandStyle.GOLD_LUXURY,
    label: "Golden Luxury & Premium",
    description: "Opulent charcoal blacks paired with metallic bronze, copper, and champagne gold.",
    gradient: "from-neutral-950 via-neutral-900 to-amber-950",
    borderClass: "hover:border-amber-500/50 border-slate-700/60",
    glowClass: "shadow-amber-500/20"
  },
  {
    value: BrandStyle.NEON_CYBER,
    label: "Neon Cyberpunk & Synthwave",
    description: "High-contrast electric colors featuring neon fuchsia, violet, and deep void blacks.",
    gradient: "from-slate-950 via-indigo-950 to-fuchsia-950",
    borderClass: "hover:border-fuchsia-500/50 border-slate-700/60",
    glowClass: "shadow-fuchsia-500/20"
  },
  {
    value: BrandStyle.ECO_ORGANIC,
    label: "Biophilic Eco-Organic",
    description: "Deep, soothing natural hues like sage, forest emerald, warm clay, and sandstone.",
    gradient: "from-stone-950 via-stone-900 to-emerald-950",
    borderClass: "hover:border-emerald-500/50 border-slate-700/60",
    glowClass: "shadow-emerald-500/20"
  },
  {
    value: BrandStyle.SWISS_BRUTALISM,
    label: "Swiss Brutalism & Modern",
    description: "Bold sans-serif typography, stark grid structures, and stark monochromatic contrasts.",
    gradient: "from-zinc-950 via-zinc-900 to-red-950/20",
    borderClass: "hover:border-red-500/50 border-slate-700/60",
    glowClass: "shadow-red-500/10"
  },
  {
    value: BrandStyle.VINTAGE_HERITAGE,
    label: "Vintage Heritage & Classic",
    description: "Sophisticated retro warmth using aged parchment creams, deep navy, and mahogany.",
    gradient: "from-stone-950 via-stone-900 to-orange-950/30",
    borderClass: "hover:border-orange-500/50 border-slate-700/60",
    glowClass: "shadow-orange-500/10"
  },
  {
    value: BrandStyle.COSMIC_NEBULA,
    label: "Cosmic Nebula & Galactic",
    description: "Dreamy, swirling cosmic gradients in deep indigo, royal purple, and starry amethysts.",
    gradient: "from-slate-950 via-slate-900 to-purple-950",
    borderClass: "hover:border-purple-500/50 border-slate-700/60",
    glowClass: "shadow-purple-500/20"
  },
  {
    value: BrandStyle.BAUHAUS_PLAYFUL,
    label: "Bauhaus Playful Geometric",
    description: "Stark primary colors (yellow, red, cobalt) forming bold, geometric patterns.",
    gradient: "from-blue-950/30 via-slate-900 to-yellow-950/20",
    borderClass: "hover:border-blue-500/50 border-slate-700/60",
    glowClass: "shadow-blue-500/20"
  },
  {
    value: BrandStyle.MINIMALIST_NORDIC,
    label: "Minimalist Nordic & Clean",
    description: "Airy, desaturated pastels, soft warm wood accents, and pristine negative space.",
    gradient: "from-slate-900 via-slate-800 to-slate-900",
    borderClass: "hover:border-indigo-400/50 border-slate-700/60",
    glowClass: "shadow-indigo-400/20"
  }
];

const BrandPackCreator: React.FC = () => {
  const [companyName, setCompanyName] = useState<string>('');
  const [industry, setIndustry] = useState<string>('');
  const [keywords, setKeywords] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<BrandStyle>(DEFAULT_BRAND_STYLE);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Progress states
  const [steps, setSteps] = useState<{ id: string; label: string; status: 'idle' | 'loading' | 'done' | 'error' }[]>([
    { id: 'strategy', label: 'Formulating Core Brand Strategy (Gemini)', status: 'idle' },
    { id: 'logo', label: 'Designing Main Brand Logo (Imagen)', status: 'idle' },
    { id: 'card', label: 'Rendering Business Card Concept (Imagen)', status: 'idle' },
    { id: 'banner', label: 'Composing Horizontal Brand Banner (Imagen)', status: 'idle' },
  ]);

  // Completed brand pack data
  const [brandPack, setBrandPack] = useState<BrandPackData | null>(null);
  const [logoImg, setLogoImg] = useState<string | null>(null);
  const [businessCardImg, setBusinessCardImg] = useState<string | null>(null);
  const [bannerImg, setBannerImg] = useState<string | null>(null);

  // Tabs within the generated brand pack
  const [activeSubTab, setActiveSubTab] = useState<'assets' | 'palette' | 'typography' | 'strategy'>('assets');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activePreview, setActivePreview] = useState<{ url: string; title: string; subtitle: string } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleCopyText = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleGenerateBrandPack = async () => {
    if (!companyName.trim() || !industry.trim()) {
      setError("Please enter a company name and an industry/business focus.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setBrandPack(null);
    setLogoImg(null);
    setBusinessCardImg(null);
    setBannerImg(null);

    // Initial steps state
    setSteps([
      { id: 'strategy', label: 'Formulating Core Brand Strategy (Gemini)', status: 'loading' },
      { id: 'logo', label: 'Designing Main Brand Logo (Imagen)', status: 'idle' },
      { id: 'card', label: 'Rendering Business Card Concept (Imagen)', status: 'idle' },
      { id: 'banner', label: 'Composing Horizontal Brand Banner (Imagen)', status: 'idle' },
    ]);

    try {
      // Step 1: Strategy
      const strategy = await generateBrandPackStrategy(companyName, industry, keywords, selectedStyle);
      setBrandPack(strategy);
      
      // Update steps
      setSteps(prev => prev.map(s => {
        if (s.id === 'strategy') return { ...s, status: 'done' as const };
        if (s.id === 'logo') return { ...s, status: 'loading' as const };
        return s;
      }));

      // We'll generate image assets sequentially or in staggered starts to show dynamic loader status
      try {
        const logoUrl = await generateImage(strategy.assets.logoPrompt);
        setLogoImg(logoUrl);
        setSteps(prev => prev.map(s => {
          if (s.id === 'logo') return { ...s, status: 'done' as const };
          if (s.id === 'card') return { ...s, status: 'loading' as const };
          return s;
        }));

        const cardUrl = await generateImage(strategy.assets.businessCardPrompt);
        setBusinessCardImg(cardUrl);
        setSteps(prev => prev.map(s => {
          if (s.id === 'card') return { ...s, status: 'done' as const };
          if (s.id === 'banner') return { ...s, status: 'loading' as const };
          return s;
        }));

        const bannerUrl = await generateImage(strategy.assets.bannerPrompt);
        setBannerImg(bannerUrl);
        setSteps(prev => prev.map(s => {
          if (s.id === 'banner') return { ...s, status: 'done' as const };
          return s;
        }));

      } catch (imgError: any) {
        console.error("Image generation inside Brand Pack failed:", imgError);
        // Fallback or flag errors on remaining assets
        setSteps(prev => prev.map(s => s.status === 'loading' ? { ...s, status: 'error' as const } : s));
        throw new Error(`Strategy generated successfully, but asset rendering failed: ${imgError.message || imgError}`);
      }

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while compiling your brand pack.");
      setSteps(prev => prev.map(s => s.status === 'loading' ? { ...s, status: 'error' as const } : s));
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAsset = (dataUrl: string, suffix: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${companyName.toLowerCase().replace(/\s+/g, '_')}_brand_${suffix}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Brand Form Block */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-700/50 space-y-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-3">
          <Layers className="h-6 w-6 text-indigo-400" />
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">Cohesive Brand Pack Studio</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
          Enter your company details, select a signature style motif, and watch our dual-model workflow fabricate a fully integrated identity: custom vector logo concepts, business cards, letterheads, typography, matching palettes, and a structured design strategy.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="companyName" className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <Building2 className="h-4 w-4 text-indigo-400" />
              Company / Brand Name
            </label>
            <input
              type="text"
              id="companyName"
              ref={inputRef}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Aetheris Cloud"
              className="w-full p-3 bg-slate-900/80 border border-slate-700/50 rounded-xl text-slate-100 font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder-slate-600"
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="industry" className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <Briefcase className="h-4 w-4 text-indigo-400" />
              Industry & Business Focus
            </label>
            <input
              type="text"
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g., Decentralized file storage and node networks"
              className="w-full p-3 bg-slate-900/80 border border-slate-700/50 rounded-xl text-slate-100 font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder-slate-600"
              disabled={isGenerating}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="keywords" className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <Compass className="h-4 w-4 text-indigo-400" />
            Core Brand Keywords / Tone (Optional)
          </label>
          <input
            type="text"
            id="keywords"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g., lightning-fast, high-end, mystical, secure, minimal"
            className="w-full p-3 bg-slate-900/80 border border-slate-700/50 rounded-xl text-slate-100 font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder-slate-600"
            disabled={isGenerating}
          />
        </div>

        {/* Style Selection Grid */}
        <div className="space-y-3">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <Palette className="h-4 w-4 text-indigo-400" />
            Select Brand Identity Motif
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {STYLE_PRESET_CARDS.map((card) => {
              const isSelected = selectedStyle === card.value;
              return (
                <button
                  key={card.value}
                  onClick={() => !isGenerating && setSelectedStyle(card.value)}
                  disabled={isGenerating}
                  className={`relative p-4 rounded-xl text-left bg-gradient-to-br ${card.gradient} border ${card.borderClass} ${isSelected ? 'border-indigo-400 ring-2 ring-indigo-500/30' : 'border-slate-800'} transition-all duration-300 ease-out flex flex-col justify-between h-[120px] overflow-hidden group`}
                >
                  {/* Subtle hover glowing dot */}
                  <div className={`absolute -right-6 -bottom-6 w-16 h-16 rounded-full blur-xl opacity-30 group-hover:opacity-60 transition-opacity bg-indigo-400`}></div>
                  
                  <div>
                    <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                      {card.label}
                      {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">{card.description}</p>
                  </div>
                  
                  <div className="w-full flex justify-end">
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${isSelected ? 'bg-indigo-500/30 text-indigo-300' : 'bg-slate-950/40 text-slate-500'}`}>
                      {isSelected ? 'Selected' : 'Motif'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateBrandPack}
          disabled={isGenerating || !companyName.trim() || !industry.trim()}
          className="w-full relative overflow-hidden flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold tracking-wide shadow-lg shadow-indigo-950/40 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed group"
        >
          {isGenerating ? (
            <div className="flex items-center gap-3">
              <LoadingSpinner size="h-5 w-5" />
              <span>Fabricating Brand Identity Pack...</span>
            </div>
          ) : (
            <>
              <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              <span>Assemble Cohesive Brand Identity Pack</span>
            </>
          )}
        </button>

        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      </div>

      {/* Progress Monitor / Generation Console */}
      {isGenerating && (
        <div className="p-6 rounded-2xl glass-panel border border-slate-700/40 shadow-2xl space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" />
              Brand Fabrication Terminal
            </h3>
            <span className="text-xs font-mono bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded">Active Workflow</span>
          </div>

          <div className="space-y-3 font-mono">
            {steps.map((step, idx) => {
              const isLoading = step.status === 'loading';
              const isDone = step.status === 'done';
              const isError = step.status === 'error';

              return (
                <div key={step.id} className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="text-slate-600">[{idx + 1}]</span>
                    <span className={`${isLoading ? 'text-indigo-400' : isDone ? 'text-emerald-400' : isError ? 'text-red-400' : 'text-slate-500'}`}>
                      {step.label}
                    </span>
                  </div>
                  <div>
                    {isLoading ? (
                      <span className="text-indigo-400 animate-pulse">Running...</span>
                    ) : isDone ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check className="h-4 w-4" /> Success
                      </span>
                    ) : isError ? (
                      <span className="text-red-400">Failed</span>
                    ) : (
                      <span className="text-slate-600">Pending</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Brand Dashboard Display */}
      {brandPack && (
        <div className="space-y-6">
          {/* Brand Header Slate */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-indigo-400 px-2 py-1 bg-indigo-950/50 rounded-md border border-indigo-900/30">
                Cohesive Brand Identity
              </span>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mt-2 font-display">{brandPack.companyName}</h2>
              <p className="text-slate-400 italic text-sm mt-1">"{brandPack.slogan}"</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const content = `
BRAND REPORT: ${brandPack.companyName}
Industry: ${brandPack.industry}
Slogan: ${brandPack.slogan}

BRAND ORIGIN STORY:
${brandPack.story}

CORE VALUES:
1. ${brandPack.pillars[0]?.title}: ${brandPack.pillars[0]?.description}
2. ${brandPack.pillars[1]?.title}: ${brandPack.pillars[1]?.description}
3. ${brandPack.pillars[2]?.title}: ${brandPack.pillars[2]?.description}

RECOMMENDED PALETTE:
Primary: ${brandPack.palette.primaryName} (${brandPack.palette.primary})
Secondary: ${brandPack.palette.secondaryName} (${brandPack.palette.secondary})
Accent: ${brandPack.palette.accentName} (${brandPack.palette.accent})
Background: ${brandPack.palette.backgroundName} (${brandPack.palette.background})

TYPOGRAPHY:
Heading Font: ${brandPack.typography.headingFont}
Body Font: ${brandPack.typography.bodyFont}
Description: ${brandPack.typography.pairDescription}
                  `;
                  handleCopyText(content, 'report');
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg border border-slate-700/50 transition-all font-semibold"
              >
                {copiedField === 'report' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span>{copiedField === 'report' ? 'Copied Strategy!' : 'Copy Brand Report'}</span>
              </button>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveSubTab('assets')}
              className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${activeSubTab === 'assets' ? 'border-indigo-400 text-indigo-300' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              <Layers className="h-4 w-4" />
              Generated Assets
            </button>
            <button
              onClick={() => setActiveSubTab('palette')}
              className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${activeSubTab === 'palette' ? 'border-indigo-400 text-indigo-300' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              <Palette className="h-4 w-4" />
              Color Palette
            </button>
            <button
              onClick={() => setActiveSubTab('typography')}
              className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${activeSubTab === 'typography' ? 'border-indigo-400 text-indigo-300' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              <Type className="h-4 w-4" />
              Typography Design
            </button>
            <button
              onClick={() => setActiveSubTab('strategy')}
              className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${activeSubTab === 'strategy' ? 'border-indigo-400 text-indigo-300' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              <FileText className="h-4 w-4" />
              Brand Pillars
            </button>
          </div>

          {/* Active Tab Panel */}
          <div className="pt-4">
            {activeSubTab === 'assets' && (
              <div className="grid grid-cols-1 gap-6">
                {/* Logo & Card side-by-side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Primary Logo Showcase */}
                  <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                        <h3 className="font-bold text-sm text-slate-200 font-display">Primary Vector Logo</h3>
                      </div>
                      {logoImg && (
                        <button
                          onClick={() => downloadAsset(logoImg, 'logo')}
                          className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                          title="Download PNG"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="aspect-square bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center relative group border border-slate-850 h-[300px]">
                      {logoImg ? (
                        <>
                          <img 
                            src={logoImg} 
                            alt="Primary Logo" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-300" 
                          />
                          {/* Hover glassmorphism overlay with Full Screen Preview button */}
                          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <button
                              onClick={() => setActivePreview({ url: logoImg, title: "Primary Vector Logo", subtitle: brandPack.assets.logoPrompt })}
                              className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-bold text-white transition-all shadow-lg scale-90 group-hover:scale-100 duration-300 cursor-pointer"
                            >
                              <Eye className="w-4 h-4 text-sky-400" />
                              Full Screen Preview
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-600">
                          <LoadingSpinner size="h-8 w-8" />
                          <span className="text-xs font-mono">Generating logo...</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed italic mt-2 border-l-2 border-cyan-500/30 pl-2">
                      <strong>Generated concept prompt:</strong> {brandPack.assets.logoPrompt}
                    </p>
                  </div>

                  {/* Business Card Showcase */}
                  <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                        <h3 className="font-bold text-sm text-slate-200 font-display">Executive Business Card Mockup</h3>
                      </div>
                      {businessCardImg && (
                        <button
                          onClick={() => downloadAsset(businessCardImg, 'card')}
                          className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                          title="Download PNG"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="aspect-square bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center relative group border border-slate-850 h-[300px]">
                      {businessCardImg ? (
                        <>
                          <img 
                            src={businessCardImg} 
                            alt="Business Card" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" 
                          />
                          {/* Hover glassmorphism overlay with Full Screen Preview button */}
                          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <button
                              onClick={() => setActivePreview({ url: businessCardImg, title: "Executive Business Card Mockup", subtitle: brandPack.assets.businessCardPrompt })}
                              className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-bold text-white transition-all shadow-lg scale-90 group-hover:scale-100 duration-300 cursor-pointer"
                            >
                              <Eye className="w-4 h-4 text-sky-400" />
                              Full Screen Preview
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-600">
                          <LoadingSpinner size="h-8 w-8" />
                          <span className="text-xs font-mono">Rendering business card...</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed italic mt-2 border-l-2 border-indigo-500/30 pl-2">
                      <strong>Generated layout prompt:</strong> {brandPack.assets.businessCardPrompt}
                    </p>
                  </div>
                </div>

                {/* Wide Banner Showcase */}
                <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-400"></span>
                      <h3 className="font-bold text-sm text-slate-200 font-display">Horizontal Brand Banner / Web Header</h3>
                    </div>
                    {bannerImg && (
                      <button
                        onClick={() => downloadAsset(bannerImg, 'banner')}
                        className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                        title="Download PNG"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center relative group border border-slate-850 h-[220px]">
                    {bannerImg ? (
                      <>
                        <img 
                          src={bannerImg} 
                          alt="Brand Banner" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" 
                        />
                        {/* Hover glassmorphism overlay with Full Screen Preview button */}
                        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <button
                            onClick={() => setActivePreview({ url: bannerImg, title: "Horizontal Brand Banner / Web Header", subtitle: brandPack.assets.bannerPrompt })}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-bold text-white transition-all shadow-lg scale-90 group-hover:scale-100 duration-300 cursor-pointer"
                          >
                            <Eye className="w-4 h-4 text-sky-400" />
                            Full Screen Preview
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-600">
                        <LoadingSpinner size="h-8 w-8" />
                        <span className="text-xs font-mono">Composing brand banner...</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed italic mt-2 border-l-2 border-fuchsia-500/30 pl-2">
                    <strong>Generated banner prompt:</strong> {brandPack.assets.bannerPrompt}
                  </p>
                </div>
              </div>
            )}

            {activeSubTab === 'palette' && (
              <div className="p-6 rounded-xl glass-panel border border-slate-800 space-y-6">
                <div>
                  <h3 className="font-bold text-base text-slate-200 font-display">Recommended Color Chemistry</h3>
                  <p className="text-xs text-slate-400 mt-1">A highly professional visual grouping designed by Gemini to convey depth, stability, and personality.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Primary Color */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full shadow-lg border border-slate-700/30" style={{ backgroundColor: brandPack.palette.primary }}></div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{brandPack.palette.primaryName}</h4>
                      <code className="text-xs text-indigo-300 font-mono font-semibold">{brandPack.palette.primary}</code>
                      <span className="block text-[10px] uppercase font-mono text-indigo-400 mt-1">Primary Base</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mt-2">{brandPack.palette.primaryDesc}</p>
                  </div>

                  {/* Secondary Color */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full shadow-lg border border-slate-700/30" style={{ backgroundColor: brandPack.palette.secondary }}></div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{brandPack.palette.secondaryName}</h4>
                      <code className="text-xs text-indigo-300 font-mono font-semibold">{brandPack.palette.secondary}</code>
                      <span className="block text-[10px] uppercase font-mono text-cyan-400 mt-1">Secondary Base</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mt-2">{brandPack.palette.secondaryDesc}</p>
                  </div>

                  {/* Accent Color */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full shadow-lg border border-slate-700/30" style={{ backgroundColor: brandPack.palette.accent }}></div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{brandPack.palette.accentName}</h4>
                      <code className="text-xs text-indigo-300 font-mono font-semibold">{brandPack.palette.accent}</code>
                      <span className="block text-[10px] uppercase font-mono text-fuchsia-400 mt-1">Action Accent</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mt-2">{brandPack.palette.accentDesc}</p>
                  </div>

                  {/* Background Color */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full shadow-lg border border-slate-700/30" style={{ backgroundColor: brandPack.palette.background }}></div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{brandPack.palette.backgroundName}</h4>
                      <code className="text-xs text-indigo-300 font-mono font-semibold">{brandPack.palette.background}</code>
                      <span className="block text-[10px] uppercase font-mono text-slate-400 mt-1">Background Surface</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mt-2">{brandPack.palette.backgroundDesc}</p>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'typography' && (
              <div className="p-6 rounded-xl glass-panel border border-slate-800 space-y-6">
                <div>
                  <h3 className="font-bold text-base text-slate-200 font-display">Font Hierarchy Pairings</h3>
                  <p className="text-xs text-slate-400 mt-1">Custom typeface recommendations that complement the chosen logo and design mood.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-850 space-y-4">
                    {/* Live styled demo */}
                    <div className="space-y-3 border-b border-slate-800 pb-4">
                      <span className="text-[10px] uppercase tracking-widest font-mono text-slate-500">Live Typography Preview</span>
                      <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: `'${brandPack.typography.headingFont}', 'Outfit', sans-serif` }}>
                          Aetheris Digital
                        </h1>
                        <p className="text-slate-400 text-sm mt-1" style={{ fontFamily: `'${brandPack.typography.bodyFont}', 'Inter', sans-serif` }}>
                          Expanding user graphic intelligence and streamlining content systems.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-950 p-2.5 rounded border border-slate-800/50">
                      <Info className="h-4 w-4 text-indigo-400" />
                      <span>Google Fonts used: <strong>{brandPack.typography.headingFont}</strong> and <strong>{brandPack.typography.bodyFont}</strong>.</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                        <span className="text-[10px] uppercase font-mono text-indigo-400">Heading Typeface</span>
                        <h4 className="font-bold text-sm text-slate-200 mt-1">{brandPack.typography.headingFont}</h4>
                        <span className="text-[11px] text-slate-400 block mt-0.5">Primary headings, logotype styling</span>
                      </div>
                      <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                        <span className="text-[10px] uppercase font-mono text-indigo-400">Body Typeface</span>
                        <h4 className="font-bold text-sm text-slate-200 mt-1">{brandPack.typography.bodyFont}</h4>
                        <span className="text-[11px] text-slate-400 block mt-0.5">Paragraph details, legal, interface tags</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed italic border-l-2 border-indigo-500/30 pl-3">
                      <strong>Strategist Pairing Notes:</strong> "{brandPack.typography.pairDescription}"
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'strategy' && (
              <div className="p-6 rounded-xl glass-panel border border-slate-800 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Brand Origin & Story */}
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-850 space-y-3">
                    <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-indigo-400" />
                      Brand Origin & Identity Story
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {brandPack.story}
                    </p>
                  </div>

                  {/* Slogan details */}
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-850 space-y-3 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-indigo-400" />
                        Signature Brand Motto / Slogan
                      </h4>
                      <p className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-fuchsia-400 italic mt-3">
                        "{brandPack.slogan}"
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopyText(brandPack.slogan, 'slogan')}
                      className="self-end text-[10px] uppercase font-mono text-indigo-300 flex items-center gap-1 hover:text-white transition-colors"
                    >
                      {copiedField === 'slogan' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>Copy Motto</span>
                    </button>
                  </div>
                </div>

                {/* Core Pillars */}
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2 font-display">
                    <Layers className="h-4 w-4 text-indigo-400" />
                    Core Brand Value Pillars
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {brandPack.pillars.map((pillar, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-850 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-600"></div>
                        <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest block mb-1">
                          Pillar 0{idx + 1}
                        </span>
                        <h5 className="font-bold text-sm text-slate-100 mb-1">{pillar.title}</h5>
                        <p className="text-xs text-slate-400 leading-relaxed">{pillar.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activePreview && (
        <FullScreenPreview
          imageUrl={activePreview.url}
          isOpen={!!activePreview}
          onClose={() => setActivePreview(null)}
          title={activePreview.title}
          subtitle={activePreview.subtitle}
        />
      )}
    </div>
  );
};

export default BrandPackCreator;
