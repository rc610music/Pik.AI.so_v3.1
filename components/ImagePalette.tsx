import React, { useState, useCallback, useRef } from 'react';
import { ArtStyle, AiAnalysis } from '../types';
import { ART_STYLE_OPTIONS, DEFAULT_ART_STYLE } from '../constants';
import { generateImage, getAiEnhancementSuggestions, regenerateImage, surpriseMeImage } from '../services/geminiService';
import ArtStyleSelector from './ArtStyleSelector';
import ImageDisplay from './ImageDisplay';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';
import ActionToolbar from './ActionToolbar';
import AiSuggestions from './AiSuggestions';
import { SparklesIcon, PhotoIcon, XCircleIcon } from './Icons';

const ImagePalette: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [selectedArtStyle, setSelectedArtStyle] = useState<ArtStyle>(DEFAULT_ART_STYLE);
  const [uploadedImage, setUploadedImage] = useState<{ data: string; mimeType: string; previewUrl: string; } | null>(null);

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [lastSuccessfulPrompt, setLastSuccessfulPrompt] = useState<string | null>(null);
  const [lastSuccessfulStyle, setLastSuccessfulStyle] = useState<ArtStyle | null>(null);

  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        setError("Please upload a valid image file (PNG, JPG, etc.).");
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        const result = reader.result as string;
        const mimeType = result.match(/:(.*?);/)?.[1] || 'image/jpeg';
        const base64Data = result.split(',')[1];
        setUploadedImage({
            data: base64Data,
            mimeType: mimeType,
            previewUrl: result
        });
        setError(null);
    };
    reader.onerror = () => {
        setError("Failed to read the file.");
    };
    reader.readAsDataURL(file);
  };

  const clearUploadedImage = () => {
      setUploadedImage(null);
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (isLoading) return;

    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    
    // Create a synthetic event to reuse the handleFileChange logic
    const syntheticEvent = {
        target: { files: event.dataTransfer.files }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    
    handleFileChange(syntheticEvent);
  };
  
  const resetStateForGeneration = () => {
    setIsLoading(true);
    setError(null);
    setAnalysisError(null);
    setGeneratedImage(null);
    setAiAnalysis(null);
  }

  const handleGenerateFromText = useCallback(async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt to generate an image.");
      return;
    }
    resetStateForGeneration();

    const fullPrompt = `${prompt}, in the style of ${selectedArtStyle}`;

    try {
      const imageDataUrl = await generateImage(fullPrompt);
      setGeneratedImage(imageDataUrl);
      setLastSuccessfulPrompt(prompt);
      setLastSuccessfulStyle(selectedArtStyle);

      setIsAnalysisLoading(true);
      try {
        const analysisPrompt = `You are a creative art director. The user created an image based on the prompt: "${prompt}" with the style "${selectedArtStyle}".
        First, provide a short, single-paragraph explanation of a creative concept for this image, as if you were explaining the generated art.
        Second, provide exactly 4 brief, actionable, and creative enhancement suggestions as new prompts that build upon the original idea.
        Format your response as a single, valid JSON object with two keys: "explanation" (string) and "suggestions" (an array of 4 strings). Do not include any other text or markdown.`;
        const analysis = await getAiEnhancementSuggestions(analysisPrompt);
        setAiAnalysis(analysis);
      } catch (err) {
        const message = err instanceof Error ? err.message : "An unknown error occurred during AI analysis.";
        setAnalysisError(message);
      } finally {
        setIsAnalysisLoading(false);
      }

    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("An unknown error occurred while generating the image.");
    } finally {
      setIsLoading(false);
    }
  }, [prompt, selectedArtStyle]);

  const handleGenerateFromImage = useCallback(async () => {
    if (!uploadedImage) return;
    
    resetStateForGeneration();
    
    try {
      const imageDataUrl = await regenerateImage(uploadedImage.data, uploadedImage.mimeType, prompt, selectedArtStyle);
      setGeneratedImage(imageDataUrl);
      setLastSuccessfulPrompt(`Remix of uploaded image${prompt ? ` with prompt: "${prompt}"` : ''}`);
      setLastSuccessfulStyle(selectedArtStyle);
      // AI suggestions are disabled for regeneration to keep the flow simple
    } catch(err) {
      if (err instanceof Error) setError(err.message);
      else setError("An unknown error occurred during image regeneration.");
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImage, prompt, selectedArtStyle]);
  
  const handleSurpriseMe = useCallback(async () => {
    if (!uploadedImage) return;

    resetStateForGeneration();

    try {
        const result = await surpriseMeImage(uploadedImage.data, uploadedImage.mimeType);
        setGeneratedImage(result.imageUrl);
        setLastSuccessfulPrompt(result.newPrompt);
        // The surprise style might be a custom string, not from the enum
        setLastSuccessfulStyle(result.newStyle as ArtStyle); 
        setPrompt(''); // Clear user prompt as it's not used
        setAiAnalysis(null); // No suggestions for surprise me to keep it simple
    } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError("An unknown error occurred during the surprise generation.");
    } finally {
        setIsLoading(false);
    }
  }, [uploadedImage]);


  const handleGenerateClick = () => {
    if (uploadedImage) {
      handleGenerateFromImage();
    } else {
      handleGenerateFromText();
    }
  };

  const handleRegenerate = useCallback(() => {
    // This button should ideally re-run the *last* successful generation type.
    // For now, it regenerates based on current inputs.
    handleGenerateClick();
  }, [handleGenerateClick]);

  const handleEdit = () => {
    promptInputRef.current?.focus();
    promptInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    // If an image is uploaded, the suggestion modifies it. Otherwise, it creates a new image.
    if (uploadedImage) {
      handleGenerateFromImage();
    } else {
      handleGenerateFromText();
    }
    promptInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-6">
      {uploadedImage ? (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-sky-300">
                Source Image:
            </label>
            <div className="relative group rounded-lg overflow-hidden border-2 border-slate-600">
                <img
                    src={uploadedImage.previewUrl}
                    alt="Uploaded preview"
                    className="w-full h-auto max-h-60 object-contain bg-slate-800"
                />
                <button
                    onClick={clearUploadedImage}
                    disabled={isLoading}
                    className="absolute top-2 right-2 p-1 bg-slate-900/70 text-white rounded-full hover:bg-red-600/80 transition-all duration-200 disabled:opacity-50"
                    aria-label="Clear uploaded image"
                >
                    <XCircleIcon className="h-6 w-6" />
                </button>
            </div>
        </div>
      ) : (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-sky-300">
                Upload an image to regenerate (optional):
            </label>
            <div onDragOver={handleDragOver} onDrop={handleDrop} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <PhotoIcon className="mx-auto h-12 w-12 text-slate-500" />
                    <div className="flex text-sm text-slate-400">
                        <label
                            htmlFor="image-upload-input"
                            className="relative cursor-pointer bg-slate-800 rounded-md font-medium text-sky-400 hover:text-sky-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-slate-900 focus-within:ring-sky-500 px-1"
                        >
                            <span>Upload a file</span>
                            <input ref={fileInputRef} id="image-upload-input" name="image-upload-input" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" disabled={isLoading}/>
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-500">PNG, JPG, etc.</p>
                </div>
            </div>
        </div>
      )}

      <div className="space-y-2 relative">
        <label htmlFor="prompt" className="block text-sm font-medium text-sky-300">
          {uploadedImage ? 'Describe your desired changes (optional):' : 'Describe your vision:'}
        </label>
        <textarea
          id="prompt"
          ref={promptInputRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={uploadedImage ? 'e.g., make it night time, add a sword' : 'e.g., A majestic lion wearing a crown, on a cosmic throne'}
          rows={uploadedImage ? 2 : 4}
          className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all placeholder-slate-500"
          disabled={isLoading}
        />
         {uploadedImage && (
             <button
                onClick={handleSurpriseMe}
                disabled={isLoading}
                className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-md shadow-md hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700 focus:ring-pink-500 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed group"
                title="Let the AI create a unique artistic spin on your image"
            >
                <SparklesIcon className="h-4 w-4 group-hover:animate-pulse" />
                Surprise Me
            </button>
        )}
      </div>

      <ArtStyleSelector
        selectedStyle={selectedArtStyle}
        onStyleChange={setSelectedArtStyle}
        options={ART_STYLE_OPTIONS}
        disabled={isLoading}
      />

      <button
        onClick={handleGenerateClick}
        disabled={isLoading || (!uploadedImage && !prompt)}
        className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {isLoading ? (
          <LoadingSpinner size="h-5 w-5" />
        ) : (
           <>
            <SparklesIcon className="h-5 w-5 mr-2 group-hover:animate-pulse" />
            Generate Image
           </>
        )}
      </button>

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      
      <div className="mt-6 space-y-4">
        <ImageDisplay imageUrl={generatedImage} isLoading={isLoading} prompt={lastSuccessfulPrompt || prompt} styleLabel={lastSuccessfulStyle || selectedArtStyle} />
        
        {generatedImage && !isLoading && (
          <ActionToolbar
            imageUrl={generatedImage}
            onRegenerate={handleRegenerate}
            onEdit={handleEdit}
            fullPrompt={`${lastSuccessfulPrompt}, in the style of ${lastSuccessfulStyle}`}
            fileName={prompt || 'art'}
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

export default ImagePalette;