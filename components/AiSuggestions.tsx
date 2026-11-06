import React from 'react';
import { AiAnalysis } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { SparklesIcon } from './Icons';

interface AiSuggestionsProps {
    isLoading: boolean;
    analysis: AiAnalysis | null;
    error: string | null;
    onSuggestionClick: (suggestion: string) => void;
}

const AiSuggestions: React.FC<AiSuggestionsProps> = ({ isLoading, analysis, error, onSuggestionClick }) => {
    if (isLoading) {
        return (
            <div className="mt-6 p-4 bg-slate-700/50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-700">
                <LoadingSpinner size="h-5 w-5" />
                <p className="ml-3 font-semibold">AI is conjuring creative ideas...</p>
            </div>
        );
    }

    // Silently fail on error, as the main error is shown elsewhere.
    if (error || !analysis) {
        return null;
    }

    return (
        <div className="mt-6 p-5 sm:p-6 bg-gradient-to-br from-slate-700/50 to-slate-700/20 rounded-lg border border-slate-700 space-y-4">
            <h3 className="flex items-center text-lg font-bold text-sky-300">
                <SparklesIcon className="h-6 w-6 mr-2" />
                AI Creative Corner
            </h3>
            
            <div className="p-4 bg-slate-800/50 rounded-md shadow-inner">
                <p className="text-slate-300 italic">{analysis.explanation}</p>
            </div>
            
            <div>
                <h4 className="font-semibold text-slate-200 mb-3">Try these next:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {analysis.suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => onSuggestionClick(suggestion)}
                            className="p-3 text-left bg-slate-600/70 hover:bg-sky-700/50 rounded-lg transition-all duration-200 text-slate-300 hover:text-white text-sm transform hover:scale-[1.03]"
                        >
                           <span className="font-sans mr-2">&rarr;</span>{suggestion}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AiSuggestions;