import React, { useState, useCallback, useRef } from 'react';
import { MonogramStyle, AiAnalysis } from '../types';
import { MONOGRAM_STYLE_OPTIONS, DEFAULT_MONOGRAM_STYLE } from '../constants';
import { generateImage, getAiEnhancementSuggestions } from '../services/geminiService';
import MonogramStyleSelector from './MonogramStyleSelector';
import ImageDisplay from './ImageDisplay';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';
import ActionToolbar from './ActionToolbar';
import AiSuggestions from './AiSuggestions';
import { SparklesIcon } from './Icons';

const MonogramCreator: React.FC = () => {
  const [initials, setInitials] = useState<string>('');
  const [keywords, setKeywords] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<MonogramStyle>(DEFAULT_MONOGRAM_STYLE);
  
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [lastSuccessfulPrompt, setLastSuccessfulPrompt] = useState<string | null>(null);
  const [lastSuccessfulStyle, setLastSuccessfulStyle] = useState<MonogramStyle | null>(null);
  const [lastManualArgs, setLastManualArgs] = useState<{ initials: string; keywords: string; style: MonogramStyle; } | null>(null);

  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const initialsInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = useCallback(async (currentInitials: string, currentKeywords: string, currentStyle: MonogramStyle) => {
    if (!currentInitials.trim()) {
      setError("Please enter initials to generate a monogram.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisError(null);
    setGeneratedImage(null);
    setAiAnalysis(null);

    const fullPrompt = `A detailed, professional monogram logo for the initials '${currentInitials}'. Style: ${currentStyle}. Incorporate these thematic elements: ${currentKeywords || 'classic and elegant'}. Vector art, high contrast, black on a solid white background, centered.`;

    try {
      const imageDataUrl = await generateImage(fullPrompt);
      setGeneratedImage(imageDataUrl);
      const promptForDisplay = `${currentInitials}${currentKeywords ? ` (${currentKeywords})` : ''}`;
      setLastSuccessfulPrompt(promptForDisplay);
      setLastSuccessfulStyle(currentStyle);
      setLastManualArgs({ initials: currentInitials, keywords: currentKeywords, style: currentStyle });

      setIsAnalysisLoading(true);
      try {
        const analysisPrompt = `You are a master heraldry designer. The user created a monogram for initials "${currentInitials}" with style "${currentStyle}" and keywords "${currentKeywords}".
        First, provide a short, single-paragraph explanation of the design concept for this monogram.
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
        setError("An unknown error occurred while generating the monogram.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handlePrimaryGenerateClick = () => {
    handleGenerate(initials, keywords, selectedStyle);
  };

  const handleRegenerate = useCallback(() => {
    if (lastManualArgs) {
        handleGenerate(lastManualArgs.initials, lastManualArgs.keywords, lastManualArgs.style);
    }
  }, [lastManualArgs, handleGenerate]);
  
  const handleEdit = () => {
    initialsInputRef.current?.focus();
    initialsInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  
  const handleSuggestionClick = (suggestionPrompt: string) => {
    // Extract initials and keywords from suggestion if possible for better UX
    const initialsMatch = suggestionPrompt.match(/'([^']+)'/);
    if (initialsMatch) {
        setInitials(initialsMatch[1]);
    }
    
    setIsLoading(true);
    setError(null);
    setAnalysisError(null);
    setGeneratedImage(null);
    setAiAnalysis(null);
    
    generateImage(suggestionPrompt)
        .then(imageDataUrl => {
            setGeneratedImage(imageDataUrl);
            const promptForDisplay = initialsMatch ? initialsMatch[1] : (initials || 'Suggestion');
            setLastSuccessfulPrompt(promptForDisplay);
            setLastSuccessfulStyle(null); // Style is embedded in prompt now
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
            initialsInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
            <label htmlFor="initials" className="block text-sm font-medium text-sky-300">
                Initials:
            </label>
            <input
            type="text"
            id="initials"
            ref={initialsInputRef}
            value={initials}
            onChange={(e) => setInitials(e.target.value)}
            placeholder="e.g., J.S. or AE"
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow placeholder-slate-500"
            disabled={isLoading}
            />
        </div>
        <div className="space-y-2">
            <label htmlFor="keywords" className="block text-sm font-medium text-sky-300">
                Keywords/Elements (optional):
            </label>
            <input
            type="text"
            id="keywords"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g., lion, crown, laurels, elegant"
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow placeholder-slate-500"
            disabled={isLoading}
            />
        </div>
      </div>

      <MonogramStyleSelector
        selectedStyle={selectedStyle}
        onStyleChange={setSelectedStyle}
        options={MONOGRAM_STYLE_OPTIONS}
        disabled={isLoading}
      />

      <button
        onClick={handlePrimaryGenerateClick}
        disabled={isLoading || !initials}
        className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {isLoading ? (
          <LoadingSpinner size="h-5 w-5" />
        ) : (
           <>
            <SparklesIcon className="h-5 w-5 mr-2 group-hover:animate-pulse" />
            Generate Monogram
           </>
        )}
      </button>

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      
      <div className="mt-6 space-y-4">
        <ImageDisplay imageUrl={generatedImage} isLoading={isLoading} prompt={lastSuccessfulPrompt || initials} styleLabel={lastSuccessfulStyle?.toString() || 'Custom Style'} />

        {generatedImage && !isLoading && (
            <ActionToolbar
                imageUrl={generatedImage}
                onRegenerate={handleRegenerate}
                onEdit={handleEdit}
                fullPrompt={lastSuccessfulPrompt || ''}
                fileName={initials || 'monogram'}
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

export default MonogramCreator;
