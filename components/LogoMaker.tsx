
import React, { useState, useCallback, useRef } from 'react';
import { LogoStyle, AiAnalysis } from '../types';
import { LOGO_STYLE_OPTIONS, DEFAULT_LOGO_STYLE } from '../constants';
import { generateImage, getAiEnhancementSuggestions } from '../services/geminiService';
import LogoStyleSelector from './LogoStyleSelector';
import ImageDisplay from './ImageDisplay';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';
import ActionToolbar from './ActionToolbar';
import AiSuggestions from './AiSuggestions';
import { SparklesIcon } from './Icons';

const LogoMaker: React.FC = () => {
  const [companyName, setCompanyName] = useState<string>('');
  const [slogan, setSlogan] = useState<string>('');
  const [keywords, setKeywords] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<LogoStyle>(DEFAULT_LOGO_STYLE);
  
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [lastSuccessfulPrompt, setLastSuccessfulPrompt] = useState<string | null>(null);
  const [lastSuccessfulStyle, setLastSuccessfulStyle] = useState<LogoStyle | null>(null);
  const [lastManualArgs, setLastManualArgs] = useState<{ companyName: string; slogan: string; keywords: string; style: LogoStyle; } | null>(null);

  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = useCallback(async (currentName: string, currentSlogan: string, currentKeywords: string, currentStyle: LogoStyle) => {
    if (!currentName.trim() && !currentKeywords.trim()) {
      setError("Please enter a company name or keywords to generate a logo.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisError(null);
    setGeneratedImage(null);
    setAiAnalysis(null);

    const sloganPart = currentSlogan ? ` with slogan "${currentSlogan}"` : '';
    const fullPrompt = `A professional ${currentStyle} logo for a company named '${currentName}'${sloganPart}. The logo should represent these concepts: ${currentKeywords || 'innovation and trust'}. Clean, vector art, on a solid white background, high-resolution.`;

    try {
      const imageDataUrl = await generateImage(fullPrompt);
      setGeneratedImage(imageDataUrl);
      setLastSuccessfulPrompt(currentName || currentKeywords);
      setLastSuccessfulStyle(currentStyle);
      setLastManualArgs({ companyName: currentName, slogan: currentSlogan, keywords: currentKeywords, style: currentStyle });

      setIsAnalysisLoading(true);
      try {
        const analysisPrompt = `You are a professional brand strategist. The user wants a logo for company "${currentName}" (${currentKeywords}) in a "${currentStyle}" style.
        First, provide a short, single-paragraph explanation of the design concept for this logo.
        Second, provide exactly 4 brief, actionable, and creative enhancement suggestions as new prompts that build upon the original idea.
        Format your response as a single, valid JSON object with two keys: "explanation" (string) and "suggestions" (an array of 4 strings). Do not include any other text or markdown.`;
        const analysis = await getAiEnhancementSuggestions(analysisPrompt);
        setAiAnalysis(analysis);
      } catch (err) {
        const message = err instanceof Error ? err.message : "An unknown error occurred during AI analysis.";
        setAnalysisError(message);
        console.error(err);
      } finally {
        setIsAnalysisLoading(false);
      }

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while generating the logo.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handlePrimaryGenerateClick = () => {
    handleGenerate(companyName, slogan, keywords, selectedStyle);
  };

  const handleRegenerate = useCallback(() => {
    if (lastManualArgs) {
        handleGenerate(lastManualArgs.companyName, lastManualArgs.slogan, lastManualArgs.keywords, lastManualArgs.style);
    }
  }, [lastManualArgs, handleGenerate]);
  
  const handleEdit = () => {
    nameInputRef.current?.focus();
    nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  
  const handleSuggestionClick = (suggestionPrompt: string) => {
    const nameMatch = suggestionPrompt.match(/'([^']+)'/);
    if (nameMatch) {
        setCompanyName(nameMatch[1]);
    }

    setIsLoading(true);
    setError(null);
    setAnalysisError(null);
    setGeneratedImage(null);
    setAiAnalysis(null);
    
    generateImage(suggestionPrompt)
        .then(imageDataUrl => {
            setGeneratedImage(imageDataUrl);
            const promptForDisplay = nameMatch ? nameMatch[1] : (companyName || 'Suggestion');
            setLastSuccessfulPrompt(promptForDisplay);
            setLastSuccessfulStyle(null);
        })
        .catch(err => {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred while generating from suggestion.");
            }
        })
        .finally(() => {
            setIsLoading(false);
            nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
            <label htmlFor="companyName" className="block text-sm font-medium text-sky-300">
                Company Name:
            </label>
            <input
                type="text"
                id="companyName"
                ref={nameInputRef}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Nova Solutions"
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow placeholder-slate-500"
                disabled={isLoading}
            />
        </div>
         <div className="space-y-2">
            <label htmlFor="slogan" className="block text-sm font-medium text-sky-300">
                Slogan (optional):
            </label>
            <input
                type="text"
                id="slogan"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                placeholder="e.g., Innovating Tomorrow"
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow placeholder-slate-500"
                disabled={isLoading}
            />
        </div>
        <div className="space-y-2">
            <label htmlFor="logokeywords" className="block text-sm font-medium text-sky-300">
                Keywords / Concepts:
            </label>
            <input
                type="text"
                id="logokeywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., tech, data, cloud, connection"
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow placeholder-slate-500"
                disabled={isLoading}
            />
        </div>
      </div>

      <LogoStyleSelector
        selectedStyle={selectedStyle}
        onStyleChange={setSelectedStyle}
        options={LOGO_STYLE_OPTIONS}
        disabled={isLoading}
      />

      <button
        onClick={handlePrimaryGenerateClick}
        disabled={isLoading || (!companyName && !keywords)}
        className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {isLoading ? (
          <LoadingSpinner size="h-5 w-5" />
        ) : (
           <>
            <SparklesIcon className="h-5 w-5 mr-2 group-hover:animate-pulse" />
            Generate Logo
           </>
        )}
      </button>

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      
      <div className="mt-6 space-y-4">
        <ImageDisplay imageUrl={generatedImage} isLoading={isLoading} prompt={lastSuccessfulPrompt || companyName} styleLabel={lastSuccessfulStyle?.toString() || 'Custom Style'} />

        {generatedImage && !isLoading && (
            <ActionToolbar
                imageUrl={generatedImage}
                onRegenerate={handleRegenerate}
                onEdit={handleEdit}
                fullPrompt={lastSuccessfulPrompt || ''}
                fileName={companyName || 'logo'}
            />
        )}

        <AiSuggestions
            isLoading={isAnalysisLoading}
            analysis={aiAnalysis}
            error={analysisError}
            onSuggestionClick={handleSuggestionClick}
        />
      </div>
    </div>
  );
};

export default LogoMaker;