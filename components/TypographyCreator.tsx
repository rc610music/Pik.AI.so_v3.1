import React, { useState, useCallback, useRef } from 'react';
import { TypographyStyle, AiAnalysis } from '../types';
import { TYPOGRAPHY_STYLE_OPTIONS, DEFAULT_TYPOGRAPHY_STYLE } from '../constants';
import { generateImage, getAiEnhancementSuggestions } from '../services/geminiService';
import TypographyStyleSelector from './TypographyStyleSelector';
import ImageDisplay from './ImageDisplay';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';
import ActionToolbar from './ActionToolbar';
import AiSuggestions from './AiSuggestions';
import { SparklesIcon } from './Icons';

const TypographyCreator: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<TypographyStyle>(DEFAULT_TYPOGRAPHY_STYLE);
  
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [lastSuccessfulText, setLastSuccessfulText] = useState<string | null>(null);
  const [lastSuccessfulStyle, setLastSuccessfulStyle] = useState<TypographyStyle | null>(null);
  const [lastFullPrompt, setLastFullPrompt] = useState<string | null>(null);
  const [lastManualArgs, setLastManualArgs] = useState<{ text: string, style: TypographyStyle } | null>(null);

  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const textInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = useCallback(async (currentText: string, currentStyle: TypographyStyle) => {
    if (!currentText.trim()) {
      setError("Please enter text to generate art.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisError(null);
    setGeneratedImage(null);
    setAiAnalysis(null);

    const fullPrompt = `Cinematic typography art of the text "${currentText}". The style is intricate ${currentStyle}. Highly detailed, 8k, on a dark, dramatic background.`;

    try {
      const imageDataUrl = await generateImage(fullPrompt);
      setGeneratedImage(imageDataUrl);
      setLastSuccessfulText(currentText);
      setLastSuccessfulStyle(currentStyle);
      setLastFullPrompt(fullPrompt);
      setLastManualArgs({ text: currentText, style: currentStyle });

      setIsAnalysisLoading(true);
      try {
        const analysisPrompt = `You are a master typographer. The user wants typography art for the text: "${currentText}" in a "${currentStyle}" style.
        First, provide a short, single-paragraph explanation of the design concept.
        Second, suggest 4 creative enhancements. Each suggestion should be a complete, new prompt for generating typography art that builds upon the original idea. Format your response as a single, valid JSON object with two keys: "explanation" (string) and "suggestions" (an array of 4 strings).
        Example suggestion prompt: "Cinematic typography art of the text 'Explore', in a style of carved wood with glowing magical runes inside the letters." Do not include any other text or markdown.`;

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
        setError("An unknown error occurred while generating the typography art.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePrimaryGenerateClick = () => {
    handleGenerate(text, selectedStyle);
  };

  const handleRegenerate = useCallback(() => {
    if (lastManualArgs) {
      handleGenerate(lastManualArgs.text, lastManualArgs.style);
    }
  }, [lastManualArgs, handleGenerate]);
  
  const handleEdit = () => {
    textInputRef.current?.focus();
    textInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  
  const handleSuggestionClick = async (suggestionPrompt: string) => {
    const textMatch = suggestionPrompt.match(/"([^"]+)"/);
    const newText = textMatch ? textMatch[1] : 'Art';
    setText(newText);

    setIsLoading(true);
    setError(null);
    setAnalysisError(null);
    setGeneratedImage(null);
    setAiAnalysis(null);

    try {
        const imageDataUrl = await generateImage(suggestionPrompt);
        setGeneratedImage(imageDataUrl);
        setLastSuccessfulText(newText);
        setLastSuccessfulStyle(null); // Style is now in the prompt
        setLastFullPrompt(suggestionPrompt);
    } catch(err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unknown error occurred while generating from suggestion.");
        }
    } finally {
        setIsLoading(false);
        textInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };


  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="typographyPrompt" className="block text-sm font-medium text-sky-300">
          Enter text for art:
        </label>
        <input
          type="text"
          id="typographyPrompt"
          ref={textInputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g., 'Explore' or 'Create'"
          className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow placeholder-slate-500"
          disabled={isLoading}
        />
      </div>

      <TypographyStyleSelector
        selectedStyle={selectedStyle}
        onStyleChange={setSelectedStyle}
        options={TYPOGRAPHY_STYLE_OPTIONS}
        disabled={isLoading}
      />

      <button
        onClick={handlePrimaryGenerateClick}
        disabled={isLoading}
        className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {isLoading ? (
          <LoadingSpinner size="h-5 w-5" />
        ) : (
           <>
            <SparklesIcon className="h-5 w-5 mr-2 group-hover:animate-pulse" />
            Generate Text Art
           </>
        )}
      </button>

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      
      <div className="mt-6 space-y-4">
        <ImageDisplay imageUrl={generatedImage} isLoading={isLoading} prompt={lastSuccessfulText || text} styleLabel={lastSuccessfulStyle?.toString() || 'Custom Style'} />
        
        {generatedImage && !isLoading && (
            <ActionToolbar
                imageUrl={generatedImage}
                onRegenerate={handleRegenerate}
                onEdit={handleEdit}
                fullPrompt={lastFullPrompt || ''}
                fileName={lastSuccessfulText || 'typography'}
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

export default TypographyCreator;
