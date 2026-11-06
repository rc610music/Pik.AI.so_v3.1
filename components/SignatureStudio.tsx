import React, { useState, useCallback, useRef } from 'react';
import { SignatureStyle, AiAnalysis } from '../types';
import { SIGNATURE_STYLE_OPTIONS, DEFAULT_SIGNATURE_STYLE } from '../constants';
import { generateImage, getAiEnhancementSuggestions } from '../services/geminiService';
import SignatureStyleSelector from './SignatureStyleSelector';
import ImageDisplay from './ImageDisplay';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';
import ActionToolbar from './ActionToolbar';
import AiSuggestions from './AiSuggestions';
import { SparklesIcon } from './Icons';

const SignatureStudio: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<SignatureStyle>(DEFAULT_SIGNATURE_STYLE);
  
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [lastSuccessfulName, setLastSuccessfulName] = useState<string | null>(null);
  const [lastSuccessfulStyle, setLastSuccessfulStyle] = useState<SignatureStyle | null>(null);
  const [lastFullPrompt, setLastFullPrompt] = useState<string | null>(null);
  const [lastManualArgs, setLastManualArgs] = useState<{ name: string, style: SignatureStyle } | null>(null);

  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = useCallback(async (currentName: string, currentStyle: SignatureStyle) => {
    if (!currentName.trim()) {
      setError("Please enter a name or brand to generate a signature.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisError(null);
    setGeneratedImage(null);
    setAiAnalysis(null);

    const fullPrompt = `A professional signature logo for the name '${currentName}', in a ${currentStyle} style. Clean, vector art, black on a solid white background.`;

    try {
      const imageDataUrl = await generateImage(fullPrompt);
      setGeneratedImage(imageDataUrl);
      setLastSuccessfulName(currentName);
      setLastSuccessfulStyle(currentStyle);
      setLastFullPrompt(fullPrompt);
      setLastManualArgs({ name: currentName, style: currentStyle });

      setIsAnalysisLoading(true);
      try {
        const analysisPrompt = `You are a professional logo designer. The user wants a signature logo for: "${currentName}" in a "${currentStyle}" style.
        First, provide a short, single-paragraph explanation of the design concept.
        Second, suggest 4 creative enhancements. Each suggestion should be a complete, new prompt for generating a signature logo that builds upon the original idea. Format your response as a single, valid JSON object with two keys: "explanation" (string) and "suggestions" (an array of 4 strings).
        Example suggestion prompt: "A minimalist line art signature logo for 'Nova Designs', with a subtle geometric planet icon integrated." Do not include any other text or markdown.`;
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
        setError("An unknown error occurred while generating the signature.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handlePrimaryGenerateClick = () => {
    handleGenerate(name, selectedStyle);
  };

  const handleRegenerate = useCallback(() => {
    if (lastManualArgs) {
      handleGenerate(lastManualArgs.name, lastManualArgs.style);
    }
  }, [lastManualArgs, handleGenerate]);
  
  const handleEdit = () => {
    nameInputRef.current?.focus();
    nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  
  const handleSuggestionClick = async (suggestionPrompt: string) => {
    // A suggestion for a signature is a full new prompt, so we don't need the old style/name.
    // We can try to parse the name from the suggestion for better UX.
    const nameMatch = suggestionPrompt.match(/'([^']+)'/);
    const newName = nameMatch ? nameMatch[1] : 'Signature';
    setName(newName); // Update the input field

    setIsLoading(true);
    setError(null);
    setAnalysisError(null);
    setGeneratedImage(null);
    setAiAnalysis(null);
    
    // Since the suggestion is a self-contained prompt, we call generateImage directly.
    try {
        const imageDataUrl = await generateImage(suggestionPrompt);
        setGeneratedImage(imageDataUrl);
        setLastSuccessfulName(newName); 
        setLastSuccessfulStyle(null); // The style is now embedded in the prompt
        setLastFullPrompt(suggestionPrompt);
    } catch(err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unknown error occurred while generating from suggestion.");
        }
    } finally {
        setIsLoading(false);
        nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };


  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="signaturePrompt" className="block text-sm font-medium text-sky-300">
          Enter name or brand for signature:
        </label>
        <input
          type="text"
          id="signaturePrompt"
          ref={nameInputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., John Smith or 'Nova Designs'"
          className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow placeholder-slate-500"
          disabled={isLoading}
        />
      </div>

      <SignatureStyleSelector
        selectedStyle={selectedStyle}
        onStyleChange={setSelectedStyle}
        options={SIGNATURE_STYLE_OPTIONS}
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
            Generate Signature
           </>
        )}
      </button>

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      
      <div className="mt-6 space-y-4">
        <ImageDisplay imageUrl={generatedImage} isLoading={isLoading} prompt={lastSuccessfulName || name} styleLabel={lastSuccessfulStyle?.toString() || 'Custom Style'} />

        {generatedImage && !isLoading && (
            <ActionToolbar
                imageUrl={generatedImage}
                onRegenerate={handleRegenerate}
                onEdit={handleEdit}
                fullPrompt={lastFullPrompt || ''}
                fileName={lastSuccessfulName || 'signature'}
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

export default SignatureStudio;
