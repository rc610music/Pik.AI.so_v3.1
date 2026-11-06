import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, 
  Sparkles, 
  Image as ImageIcon, 
  Eye, 
  Upload, 
  Tv, 
  FileSearch, 
  Brain, 
  LogIn, 
  RefreshCw, 
  Download, 
  Trash2, 
  Maximize2, 
  HelpCircle, 
  Check, 
  ArrowRight,
  Sparkle,
  Flame,
  Gauge
} from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, signInWithGoogle, logout, saveCreation, getUserCreations, deleteCreation, UserCreation } from '../services/firebase';
import FullScreenPreview from './FullScreenPreview';
import DownloadFormatModal from './DownloadFormatModal';

const ASPECT_RATIO_OPTIONS = [
  { value: '1:1', label: '1:1 Square', icon: '▢' },
  { value: '3:2', label: '3:2 Landscape', icon: '▭' },
  { value: '2:3', label: '2:3 Portrait', icon: '▯' },
  { value: '4:3', label: '4:3 Standard', icon: '▭' },
  { value: '3:4', label: '3:4 Portrait', icon: '▯' },
  { value: '16:9', label: '16:9 Cinematic', icon: '📼' },
  { value: '9:16', label: '9:16 Tiktok/Reel', icon: '📱' },
  { value: '21:9', label: '21:9 Ultra-Wide', icon: '🎞️' }
];

const SIZE_OPTIONS = ['1K', '2K', '4K'];

const SUGGESTED_ANALYSIS_PROMPTS = [
  "Analyze this visual asset and evaluate its overall branding quality, composition, and visual impact.",
  "Identify the key design principles used in this content (e.g., symmetry, hierarchy, contrast).",
  "Summarize the visual narrative and suggest 3 high-impact brand improvements.",
  "Deconstruct the color dynamics, light temperature, and emotional atmosphere."
];

const MediaStudio: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'video' | 'image' | 'analyzer' | 'thinking' | 'history'>('video');

  // Video states
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoAspect, setVideoAspect] = useState('16:9');
  const [videoImg, setVideoImg] = useState<string | null>(null);
  const [videoImgName, setVideoImgName] = useState('');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoStatusMessage, setVideoStatusMessage] = useState('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoOpName, setVideoOpName] = useState<string | null>(null);

  // Image states
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageModel, setImageModel] = useState('gemini-3-pro-image-preview');
  const [imageAspect, setImageAspect] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');
  const [editImg, setEditImg] = useState<string | null>(null);
  const [editImgName, setEditImgName] = useState('');
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [generatedImgUrl, setGeneratedImgUrl] = useState<string | null>(null);
  const [isImgPreviewOpen, setIsImgPreviewOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Analyzer states
  const [analyzerPrompt, setAnalyzerPrompt] = useState('');
  const [analyzerFile, setAnalyzerFile] = useState<string | null>(null);
  const [analyzerFileName, setAnalyzerFileName] = useState('');
  const [analyzerFileMime, setAnalyzerFileMime] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzerResult, setAnalyzerResult] = useState<string | null>(null);

  // Thinking Chat states
  const [chatPrompt, setChatPrompt] = useState('');
  const [useHighThinking, setUseHighThinking] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingResult, setThinkingResult] = useState<string | null>(null);
  const [thinkingLogs, setThinkingLogs] = useState<string[]>([]);

  // History states
  const [creations, setCreations] = useState<UserCreation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // General refs
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const analyzerInputRef = useRef<HTMLInputElement>(null);

  // Track auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchHistory(currentUser.uid);
      } else {
        setCreations([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const fetchHistory = async (userId: string) => {
    setIsLoadingHistory(true);
    try {
      const data = await getUserCreations(userId);
      setCreations(data);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        // Strip out metadata prefix for raw base64 (needed for Gemini API inlineData)
        const cleanBase64 = base64String.split(',')[1];
        resolve(cleanBase64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // ----------------------------------------------------
  // VIDEO GENERATION (Veo 3.1)
  // ----------------------------------------------------
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoImgName(file.name);
      const base64 = await fileToBase64(file);
      setVideoImg(base64);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim() && !videoImg) {
      alert("Please enter a video prompt or upload a starting photo.");
      return;
    }

    setIsGeneratingVideo(true);
    setGeneratedVideoUrl(null);
    setVideoStatusMessage("Contacting Veo 3.1 video services...");

    try {
      const mimeType = videoImgName.endsWith('.png') ? 'image/png' : 'image/jpeg';
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          imageBytes: videoImg || undefined,
          mimeType: videoImg ? mimeType : undefined,
          aspectRatio: videoAspect
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to start video operation");

      const { operationName } = data;
      setVideoOpName(operationName);

      // Poll the operation status
      pollVideoStatus(operationName);
    } catch (err: any) {
      console.error(err);
      setVideoStatusMessage(`Error: ${err.message}`);
      setIsGeneratingVideo(false);
    }
  };

  const pollVideoStatus = async (operationName: string) => {
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes maximum
    const intervalMs = 5000; // 5 seconds interval

    const messages = [
      "Analyzing layout & structure...",
      "Interpolating cinematic frames...",
      "Injecting fluid physics and motion dynamics...",
      "Polishing light reflection matrices...",
      "Refining micro-details and pixel clarity...",
      "Structuring cinematic visual pacing...",
      "Almost done, combining frames into MP4 stream..."
    ];

    setVideoStatusMessage("Veo operation queued successfully. Initializing...");

    const checkStatus = async () => {
      attempts++;
      if (attempts > maxAttempts) {
        setVideoStatusMessage("Operation timed out. Please try again later.");
        setIsGeneratingVideo(false);
        return;
      }

      // Randomly cycle encouragement messages
      const msgIndex = Math.min(Math.floor(attempts / 4), messages.length - 1);
      setVideoStatusMessage(`${messages[msgIndex]} (Polling update ${attempts}...)`);

      try {
        const res = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName })
        });

        const statusData = await res.json();
        if (statusData.done) {
          setVideoStatusMessage("Video completed! Fetching video file...");
          downloadAndServeVideo(operationName);
        } else if (statusData.error) {
          setVideoStatusMessage(`Veo error: ${statusData.error.message || 'Generation failed'}`);
          setIsGeneratingVideo(false);
        } else {
          setTimeout(checkStatus, intervalMs);
        }
      } catch (err: any) {
        console.error("Polling error:", err);
        setTimeout(checkStatus, intervalMs); // Keep trying on network glitch
      }
    };

    setTimeout(checkStatus, intervalMs);
  };

  const downloadAndServeVideo = async (operationName: string) => {
    try {
      const res = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName })
      });

      if (!res.ok) throw new Error("Failed to download video file");

      const blob = await res.blob();
      const videoUrl = URL.createObjectURL(blob);
      setGeneratedVideoUrl(videoUrl);
      setIsGeneratingVideo(false);
      setVideoStatusMessage('');

      // Save to Firebase history if logged in
      if (user) {
        // Convert to dataURL or base64 to save or keep local reference. For simplicity,
        // we can store the prompt and parameters in firestore, and since blob URLs are temporary,
        // we can flag the creation.
        await saveCreation({
          userId: user.uid,
          tool: 'video',
          prompt: videoPrompt || "Animate Image to Video",
          style: videoAspect,
          videoUrl: `data:video/mp4;base64,`, // save local details
          metadata: {
            aspectRatio: videoAspect,
            operationName,
            timestamp: new Date().toISOString()
          }
        });
        fetchHistory(user.uid);
      }
    } catch (err: any) {
      setVideoStatusMessage(`Error fetching final video: ${err.message}`);
      setIsGeneratingVideo(false);
    }
  };

  // ----------------------------------------------------
  // IMAGE GENERATION & EDITING
  // ----------------------------------------------------
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImgName(file.name);
      const base64 = await fileToBase64(file);
      setEditImg(base64);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      alert("Please enter an image generation prompt.");
      return;
    }

    setIsGeneratingImg(true);
    setGeneratedImgUrl(null);

    try {
      const mimeType = editImgName.endsWith('.png') ? 'image/png' : 'image/jpeg';
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          model: imageModel,
          aspectRatio: imageAspect,
          imageSize: imageModel === 'gemini-3-pro-image-preview' ? imageSize : undefined,
          base64Image: editImg || undefined,
          mimeType: editImg ? mimeType : undefined
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate image");

      setGeneratedImgUrl(data.imageUrl);

      // Save to Firebase history
      if (user) {
        await saveCreation({
          userId: user.uid,
          tool: 'palette',
          prompt: imagePrompt,
          style: imageModel,
          imageUrl: data.imageUrl,
          metadata: {
            aspectRatio: imageAspect,
            size: imageSize,
            isEdit: !!editImg,
            timestamp: new Date().toISOString()
          }
        });
        fetchHistory(user.uid);
      }
    } catch (err: any) {
      alert(`Error generating image: ${err.message}`);
    } finally {
      setIsGeneratingImg(false);
    }
  };

  // ----------------------------------------------------
  // MEDIA ANALYZER (Image & Video Understanding)
  // ----------------------------------------------------
  const handleAnalyzerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAnalyzerFileName(file.name);
      setAnalyzerFileMime(file.type);
      const base64 = await fileToBase64(file);
      setAnalyzerFile(base64);
    }
  };

  const handleAnalyzeMedia = async () => {
    if (!analyzerFile) {
      alert("Please upload an image or video file first.");
      return;
    }
    if (!analyzerPrompt.trim()) {
      alert("Please enter a question or instruction for Gemini.");
      return;
    }

    setIsAnalyzing(true);
    setAnalyzerResult(null);

    try {
      const response = await fetch('/api/gemini-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: analyzerPrompt,
          fileBase64: analyzerFile,
          mimeType: analyzerFileMime,
          useThinking: false,
          model: 'gemini-3.1-pro-preview' // Best model for complex file understanding
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed");

      setAnalyzerResult(data.text);
    } catch (err: any) {
      alert(`Error analyzing media: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ----------------------------------------------------
  // THINKING LAB (Reasoning)
  // ----------------------------------------------------
  const handleThinkingSubmit = async () => {
    if (!chatPrompt.trim()) return;

    setIsThinking(true);
    setThinkingResult(null);
    setThinkingLogs([]);

    // Simulate thinking steps/logs
    const logs = [
      "Mapping brand parameters...",
      "Evaluating visual ergonomics...",
      "Applying advanced structural typography alignment theory...",
      "Retrieving modern aesthetic paradigms...",
      "Formulating comprehensive art direction response..."
    ];

    let logIdx = 0;
    const interval = setInterval(() => {
      if (logIdx < logs.length) {
        setThinkingLogs(prev => [...prev, logs[logIdx]]);
        logIdx++;
      } else {
        clearInterval(interval);
      }
    }, 1200);

    try {
      const response = await fetch('/api/gemini-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: chatPrompt,
          useThinking: useHighThinking,
          model: 'gemini-3.1-pro-preview'
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Reasoning model failed");

      clearInterval(interval);
      setThinkingResult(data.text);
    } catch (err: any) {
      alert(`Reasoning error: ${err.message}`);
    } finally {
      setIsThinking(false);
    }
  };

  const handleDeleteHistoryItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this creation from your history?")) return;
    try {
      await deleteCreation(id);
      if (user) fetchHistory(user.uid);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full text-slate-100 font-sans">
      {/* Top Banner with Authentication */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 mb-6 rounded-xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md gap-4">
        <div>
          <h2 className="text-xl font-bold text-indigo-400 flex items-center gap-2 font-syne">
            <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
            Media Studio & AI Lab
          </h2>
          <p className="text-xs text-slate-400 font-light mt-0.5">
            Powered by Veo 3.1 & Gemini 3 Intelligence. Syncing with Google Cloud Firestore.
          </p>
        </div>
        
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-xs font-semibold text-slate-200">{user.displayName}</span>
              <span className="text-[10px] text-slate-400 font-mono">{user.email}</span>
            </div>
            {user.photoURL && (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                className="w-8 h-8 rounded-full border border-indigo-500/30"
                referrerPolicy="no-referrer"
              />
            )}
            <button 
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg text-slate-300 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button 
            onClick={handleLogin}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 rounded-lg text-white shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            Google Cloud Sign-In
          </button>
        )}
      </div>

      {/* Internal Navigation Subtabs */}
      <div className="flex border-b border-slate-800 mb-6 overflow-x-auto scrollbar-none gap-2">
        <button
          onClick={() => setActiveTab('video')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'video' 
              ? 'text-indigo-400 border-b-2 border-indigo-500 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Video className="w-4 h-4" />
          Veo Video Studio
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'image' 
              ? 'text-indigo-400 border-b-2 border-indigo-500 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Creative Image Lab
        </button>
        <button
          onClick={() => setActiveTab('analyzer')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'analyzer' 
              ? 'text-indigo-400 border-b-2 border-indigo-500 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileSearch className="w-4 h-4" />
          Media Analyzer
        </button>
        <button
          onClick={() => setActiveTab('thinking')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'thinking' 
              ? 'text-indigo-400 border-b-2 border-indigo-500 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Brain className="w-4 h-4" />
          Deep Thinking Lab
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'history' 
              ? 'text-indigo-400 border-b-2 border-indigo-500 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tv className="w-4 h-4" />
          Cloud History {creations.length > 0 && `(${creations.length})`}
        </button>
      </div>

      {/* Main Feature Screens */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {/* ==================================================== */}
          {/* VEO VIDEO STUDIO */}
          {/* ==================================================== */}
          {activeTab === 'video' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-5 bg-slate-950/20 border border-slate-800/50 rounded-xl p-5 backdrop-blur-sm">
                <div>
                  <label className="block text-xs font-mono text-indigo-400 uppercase tracking-wider mb-2">
                    Visual Starting Frame (Optional Photo)
                  </label>
                  <div 
                    onClick={() => videoInputRef.current?.click()}
                    className="group border border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-900/40 rounded-lg p-6 text-center cursor-pointer transition-all duration-200"
                  >
                    <input 
                      type="file" 
                      ref={videoInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleVideoFileChange}
                    />
                    {videoImg ? (
                      <div className="space-y-2">
                        <img 
                          src={`data:image/jpeg;base64,${videoImg}`} 
                          alt="Starting Frame" 
                          className="max-h-32 mx-auto rounded-md shadow-lg"
                        />
                        <p className="text-[10px] text-slate-400 font-mono truncate">{videoImgName}</p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setVideoImg(null); setVideoImgName(''); }}
                          className="px-2 py-1 text-[9px] bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 rounded transition-colors"
                        >
                          Clear Photo
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-6 h-6 mx-auto text-slate-500 group-hover:text-indigo-400 transition-colors" />
                        <p className="text-xs text-slate-400">Drag & drop or click to upload</p>
                        <p className="text-[10px] text-slate-500">Supports JPG, PNG (Veo starting frame)</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-indigo-400 uppercase tracking-wider mb-2">
                    Action or Motion Prompt
                  </label>
                  <textarea
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    placeholder="Describe how the scene moves (e.g. 'Slow cinematic camera pan around a futuristic neon hologram of a cybernetic tiger, high-end production...')"
                    className="w-full h-24 p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-light resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-indigo-400 uppercase tracking-wider mb-2">
                    Target Aspect Ratio
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setVideoAspect('16:9')}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        videoAspect === '16:9'
                          ? 'bg-indigo-950/40 border-indigo-500/80 text-indigo-300'
                          : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <span>📼</span> 16:9 Landscape
                    </button>
                    <button
                      onClick={() => setVideoAspect('9:16')}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        videoAspect === '9:16'
                          ? 'bg-indigo-950/40 border-indigo-500/80 text-indigo-300'
                          : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <span>📱</span> 9:16 Portrait
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleGenerateVideo}
                  disabled={isGeneratingVideo}
                  className="w-full py-3 px-4 font-bold text-xs bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white rounded-lg transition-all shadow-lg shadow-indigo-500/10 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  {isGeneratingVideo ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      Generating with Veo...
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4" />
                      Generate Cinematic Video
                    </>
                  )}
                </button>
              </div>

              <div className="lg:col-span-7 bg-slate-950/30 border border-slate-800/60 rounded-xl p-5 min-h-[350px] flex flex-col items-center justify-center relative overflow-hidden">
                {isGeneratingVideo ? (
                  <div className="text-center max-w-sm space-y-4">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                      <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                      <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-indigo-400 animate-pulse" />
                    </div>
                    <p className="text-sm font-semibold text-slate-200">Veo 3.1 Fast Generating Video</p>
                    <p className="text-xs text-indigo-400/80 font-mono tracking-widest uppercase animate-pulse">
                      Synthesizing Scene...
                    </p>
                    <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
                      <p className="text-xs text-slate-400 italic leading-relaxed font-light">
                        "{videoStatusMessage}"
                      </p>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Video operations are processed in the cloud and may take 1 to 2 minutes. Feel free to browse other tools; we will automatically persist your video to Cloud History once completed.
                    </p>
                  </div>
                ) : generatedVideoUrl ? (
                  <div className="w-full h-full flex flex-col justify-between space-y-4">
                    <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-black max-h-[400px] flex items-center justify-center shadow-2xl">
                      <video 
                        src={generatedVideoUrl} 
                        controls 
                        autoPlay 
                        loop 
                        className="max-h-[380px] w-auto max-w-full"
                      />
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/30 p-3 rounded-lg border border-slate-800/60">
                      <span className="text-[10px] font-mono text-indigo-400/80">
                        VEO-3.1-FAST-GENERATE-PREVIEW
                      </span>
                      <a 
                        href={generatedVideoUrl} 
                        download={`pikaiso-video-${Date.now()}.mp4`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-800/60 text-indigo-300 text-[10px] font-bold rounded-md transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download MP4
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 text-slate-500 space-y-3">
                    <Tv className="w-12 h-12 mx-auto text-slate-700" />
                    <p className="text-sm font-semibold">Veo Cinematic Theatre</p>
                    <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-light">
                      Input dynamic directions or frame a beautiful design, select your aspect layout, and transform static visuals into fluid, breathtaking videos.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* CREATIVE IMAGE LAB */}
          {/* ==================================================== */}
          {activeTab === 'image' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-4 bg-slate-950/20 border border-slate-800/50 rounded-xl p-5 backdrop-blur-sm">
                
                <div>
                  <label className="block text-xs font-mono text-indigo-400 uppercase tracking-wider mb-2">
                    Studio Model
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setImageModel('gemini-3.1-flash-lite-image-preview')}
                      className={`p-2 rounded-lg border text-[9px] font-semibold text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        imageModel === 'gemini-3.1-flash-lite-image-preview'
                          ? 'bg-indigo-950/40 border-indigo-500/80 text-indigo-300 shadow-lg shadow-indigo-500/5'
                          : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Imagen Lite (Free)</span>
                    </button>
                    <button
                      onClick={() => setImageModel('gemini-3.1-flash-image-preview')}
                      className={`p-2 rounded-lg border text-[9px] font-semibold text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        imageModel === 'gemini-3.1-flash-image-preview'
                          ? 'bg-indigo-950/40 border-indigo-500/80 text-indigo-300 shadow-lg shadow-indigo-500/5'
                          : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Sparkle className="w-3.5 h-3.5" />
                      <span>Imagen Creative</span>
                    </button>
                    <button
                      onClick={() => setImageModel('gemini-3-pro-image-preview')}
                      className={`p-2 rounded-lg border text-[9px] font-semibold text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        imageModel === 'gemini-3-pro-image-preview'
                          ? 'bg-indigo-950/40 border-indigo-500/80 text-indigo-300 shadow-lg shadow-indigo-500/5'
                          : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>Imagen Pro</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-indigo-400 uppercase tracking-wider mb-2">
                    Starting Reference / Edit Image (Optional)
                  </label>
                  <div 
                    onClick={() => imageInputRef.current?.click()}
                    className="group border border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-900/40 rounded-lg p-3 text-center cursor-pointer transition-all"
                  >
                    <input 
                      type="file" 
                      ref={imageInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageFileChange}
                    />
                    {editImg ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img 
                            src={`data:image/jpeg;base64,${editImg}`} 
                            alt="Reference" 
                            className="h-10 w-10 object-cover rounded"
                          />
                          <p className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">{editImgName}</p>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditImg(null); setEditImgName(''); }}
                          className="px-2 py-1 text-[9px] bg-red-950/40 text-red-400 rounded hover:bg-red-900/40"
                        >
                          Clear
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 group-hover:text-indigo-400">
                        + Upload Starting Frame to Edit/Inpaint
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-indigo-400 uppercase tracking-wider mb-2">
                    Visual Prompt & Art Style Directions
                  </label>
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Describe your design (e.g., 'Minimalist line art icon of a soaring falcon, vector graphics, high contrast, golden accents on sleek dark background')"
                    className="w-full h-24 p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-light resize-none"
                  />
                </div>

                {/* Aspect Ratio Picker */}
                <div>
                  <label className="block text-xs font-mono text-indigo-400 uppercase tracking-wider mb-2">
                    Aesthetic Aspect Ratio
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {ASPECT_RATIO_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setImageAspect(opt.value)}
                        className={`p-1.5 rounded text-[10px] font-semibold border transition-all cursor-pointer ${
                          imageAspect === opt.value
                            ? 'bg-indigo-950/40 border-indigo-500/80 text-indigo-300'
                            : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                        title={opt.label}
                      >
                        <div className="text-xs mb-0.5">{opt.icon}</div>
                        <div>{opt.value}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Size Picker (only for Pro) */}
                {imageModel === 'gemini-3-pro-image-preview' && (
                  <div>
                    <label className="block text-xs font-mono text-indigo-400 uppercase tracking-wider mb-2">
                      Image Quality Size Resolution
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {SIZE_OPTIONS.map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setImageSize(sz)}
                          className={`py-1.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                            imageSize === sz
                              ? 'bg-indigo-950/40 border-indigo-500/80 text-indigo-300'
                              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {sz} {sz === '1K' ? '(Standard)' : sz === '2K' ? '(High Definition)' : '(Ultra Definition)'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImg}
                  className="w-full py-3 px-4 font-bold text-xs bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white rounded-lg transition-all shadow-lg shadow-indigo-500/10 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  {isGeneratingImg ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      Generating with Imagen 3...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Visual Masterpiece
                    </>
                  )}
                </button>
              </div>

              <div className="lg:col-span-7 bg-slate-950/30 border border-slate-800/60 rounded-xl p-5 min-h-[350px] flex flex-col items-center justify-center">
                {isGeneratingImg ? (
                  <div className="text-center space-y-3">
                    <RefreshCw className="w-10 h-10 mx-auto text-indigo-400 animate-spin" />
                    <p className="text-sm font-semibold">Imagen 3 is rendering your prompt...</p>
                    <p className="text-xs text-slate-500 font-light max-w-xs leading-relaxed">
                      Compiling design styles, structuring contrasts, and injecting professional artistic theory...
                    </p>
                  </div>
                ) : generatedImgUrl ? (
                  <div className="w-full space-y-4">
                    <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center shadow-lg group">
                      <img 
                        src={generatedImgUrl} 
                        alt="Generated Masterpiece" 
                        className="max-h-[380px] object-contain rounded"
                        referrerPolicy="no-referrer"
                      />
                      {/* Hover glassmorphism overlay with Full Screen Preview button */}
                      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button
                          onClick={() => setIsImgPreviewOpen(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-bold text-white transition-all shadow-lg scale-90 group-hover:scale-100 duration-300 cursor-pointer"
                        >
                          <Eye className="w-4 h-4 text-sky-400" />
                          Full Screen Preview
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/30 p-3 rounded-lg border border-slate-800/60">
                      <span className="text-[10px] font-mono text-indigo-400/80">
                        {imageModel.toUpperCase()} ({imageAspect})
                      </span>
                      <button 
                        onClick={() => setIsDownloadModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-800/60 text-indigo-300 text-[10px] font-bold rounded-md transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export Artwork File
                      </button>
                    </div>
                    {/* Full Screen Viewport Overlay Modal */}
                    <FullScreenPreview
                      imageUrl={generatedImgUrl}
                      isOpen={isImgPreviewOpen}
                      onClose={() => setIsImgPreviewOpen(false)}
                      title={imagePrompt}
                      subtitle={`${imageModel.toUpperCase()} (${imageAspect})`}
                    />
                    {/* Interactive format selection and high-res export dialog */}
                    <DownloadFormatModal
                      isOpen={isDownloadModalOpen}
                      onClose={() => setIsDownloadModalOpen(false)}
                      imageUrl={generatedImgUrl}
                      title="Export High-Res Masterpiece"
                      defaultFilename="pikaiso-masterpiece"
                    />
                  </div>
                ) : (
                  <div className="text-center p-8 text-slate-500 space-y-3">
                    <ImageIcon className="w-12 h-12 mx-auto text-slate-700" />
                    <p className="text-sm font-semibold">Artistic Generation Canvas</p>
                    <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-light">
                      Unleash studio-quality vector files, high-fidelity logos, mockups, or premium textures with precise aspect boundaries and ultra-HD dimensions.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* MEDIA ANALYZER */}
          {/* ==================================================== */}
          {activeTab === 'analyzer' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-4 bg-slate-950/20 border border-slate-800/50 rounded-xl p-5 backdrop-blur-sm">
                <div>
                  <label className="block text-xs font-mono text-indigo-400 uppercase tracking-wider mb-2">
                    Upload Target File (Image/Video)
                  </label>
                  <div 
                    onClick={() => analyzerInputRef.current?.click()}
                    className="group border border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-900/40 rounded-lg p-5 text-center cursor-pointer transition-all"
                  >
                    <input 
                      type="file" 
                      ref={analyzerInputRef} 
                      className="hidden" 
                      accept="image/*,video/*" 
                      onChange={handleAnalyzerFileChange}
                    />
                    {analyzerFile ? (
                      <div className="space-y-2">
                        {analyzerFileMime.startsWith('image') ? (
                          <img 
                            src={`data:${analyzerFileMime};base64,${analyzerFile}`} 
                            alt="Analysis Target" 
                            className="max-h-24 mx-auto rounded"
                          />
                        ) : (
                          <div className="p-3 bg-slate-800/60 rounded max-w-max mx-auto text-xs text-indigo-400 flex items-center gap-1.5 font-mono">
                            <Video className="w-4 h-4" />
                            [VIDEO FILE]
                          </div>
                        )}
                        <p className="text-[10px] text-slate-400 font-mono truncate">{analyzerFileName}</p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setAnalyzerFile(null); setAnalyzerFileName(''); }}
                          className="px-2 py-1 text-[9px] bg-red-950/40 text-red-400 rounded hover:bg-red-900/40"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="w-5 h-5 mx-auto text-slate-500" />
                        <p className="text-xs text-slate-400">Click to upload image or video</p>
                        <p className="text-[9px] text-slate-600">Analyzed using Gemini 3 Pro</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-indigo-400 uppercase tracking-wider mb-2">
                    Gemini Instruction Prompt
                  </label>
                  <textarea
                    value={analyzerPrompt}
                    onChange={(e) => setAnalyzerPrompt(e.target.value)}
                    placeholder="Enter what you want Gemini to analyze or extract from this content..."
                    className="w-full h-24 p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-light resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-indigo-400 uppercase tracking-wider mb-2">
                    Quick Suggested Queries
                  </label>
                  <div className="space-y-1.5">
                    {SUGGESTED_ANALYSIS_PROMPTS.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => setAnalyzerPrompt(p)}
                        className="w-full text-left p-2 rounded bg-slate-900/40 hover:bg-indigo-950/30 border border-slate-800 text-[10px] text-slate-400 hover:text-slate-200 transition-colors block truncate"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleAnalyzeMedia}
                  disabled={isAnalyzing}
                  className="w-full py-3 px-4 font-bold text-xs bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white rounded-lg transition-all shadow-lg shadow-indigo-500/10 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      Analyzing with Gemini Pro...
                    </>
                  ) : (
                    <>
                      <FileSearch className="w-4 h-4" />
                      Extract Intelligence Report
                    </>
                  )}
                </button>
              </div>

              <div className="lg:col-span-7 bg-slate-950/30 border border-slate-800/60 rounded-xl p-5 min-h-[350px] flex flex-col justify-start overflow-y-auto max-h-[500px]">
                {isAnalyzing ? (
                  <div className="m-auto text-center space-y-3">
                    <RefreshCw className="w-8 h-8 mx-auto text-indigo-400 animate-spin" />
                    <p className="text-xs text-slate-400">Gemini Pro is running multimodal comprehension algorithms...</p>
                  </div>
                ) : analyzerResult ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
                        Gemini Multimodal Intelligence Report
                      </h4>
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed font-light space-y-3 whitespace-pre-line">
                      {analyzerResult}
                    </div>
                  </div>
                ) : (
                  <div className="m-auto text-center p-8 text-slate-500 space-y-3">
                    <FileSearch className="w-12 h-12 mx-auto text-slate-700" />
                    <p className="text-sm font-semibold">Intelligence Output Terminal</p>
                    <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-light">
                      Upload any image palette, graphic canvas, brand flyer, or video clip. Ask Gemini to audit contrast, evaluate aesthetics, structure layouts, or extract deep color guidelines.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* DEEP THINKING LAB */}
          {/* ==================================================== */}
          {activeTab === 'thinking' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-4 bg-slate-950/20 border border-slate-800/50 rounded-xl p-5 backdrop-blur-sm">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-mono text-indigo-400 uppercase tracking-wider">
                      Advanced Consultation Prompt
                    </label>
                    <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      <Gauge className="w-3 h-3 text-fuchsia-400" />
                      <span className="text-[8px] font-mono font-bold text-slate-300">HIGH THINKING</span>
                    </div>
                  </div>
                  <textarea
                    value={chatPrompt}
                    onChange={(e) => setChatPrompt(e.target.value)}
                    placeholder="Ask extremely complex design consultation questions (e.g., 'Draft a detailed multi-phase brand launch plan and describe exact typography guidelines for a modern biophilic cosmetics company...')"
                    className="w-full h-36 p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-light resize-none"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-800">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-300">Thinking Mode Status</span>
                    <p className="text-[10px] text-slate-500">Uses reasoning models (thinkingLevel: HIGH)</p>
                  </div>
                  <div className="w-8 h-4 rounded-full bg-indigo-600 flex items-center justify-end p-0.5">
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  </div>
                </div>

                <button
                  onClick={handleThinkingSubmit}
                  disabled={isThinking}
                  className="w-full py-3 px-4 font-bold text-xs bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white rounded-lg transition-all shadow-lg shadow-indigo-500/10 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  {isThinking ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      Gemini is thinking...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      Execute Thinking Analysis
                    </>
                  )}
                </button>
              </div>

              <div className="lg:col-span-7 bg-slate-950/30 border border-slate-800/60 rounded-xl p-5 min-h-[350px] flex flex-col justify-start overflow-y-auto max-h-[500px] relative">
                {isThinking ? (
                  <div className="space-y-4 w-full">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                      <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                      <span className="text-xs font-mono text-slate-400 uppercase">Reasoning Steps</span>
                    </div>
                    
                    {/* Simulated Reasoning logs */}
                    <div className="space-y-2 bg-slate-900/60 p-4 rounded-lg border border-slate-800 font-mono text-[10px] text-indigo-300/80 leading-normal">
                      {thinkingLogs.map((log, idx) => (
                        <div key={idx} className="flex items-center gap-2 animate-fade-in">
                          <Check className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{log}</span>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 animate-pulse text-fuchsia-400">
                        <ArrowRight className="w-3 h-3 text-fuchsia-400 animate-bounce" />
                        <span>Synthesizing final high-thinking advice...</span>
                      </div>
                    </div>
                  </div>
                ) : thinkingResult ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-2 justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
                          High-Reasoning Consultant Response
                        </h4>
                      </div>
                      <span className="text-[9px] font-mono bg-indigo-950 border border-indigo-800/60 text-indigo-300 px-1.5 py-0.5 rounded">
                        COMPLETED
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed font-light space-y-3 whitespace-pre-line">
                      {thinkingResult}
                    </div>
                  </div>
                ) : (
                  <div className="m-auto text-center p-8 text-slate-500 space-y-3">
                    <Brain className="w-12 h-12 mx-auto text-slate-700 animate-pulse" />
                    <p className="text-sm font-semibold">Reasoning Console</p>
                    <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-light">
                      Leverage advanced reasoning loops. Toggle high thinking, ask your deepest creative direction queries, and evaluate layout strategy through mathematically refined design paradigms.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* CLOUD HISTORY */}
          {/* ==================================================== */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {!user ? (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center max-w-md mx-auto space-y-4">
                  <Tv className="w-10 h-10 mx-auto text-indigo-400/80 animate-bounce" />
                  <h3 className="text-sm font-bold text-slate-200">Sync with Firebase Cloud</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    Google Sign-In securely backs up your generated palettes, video clips, and designs to Google Cloud Firestore, letting you access them instantly on any device.
                  </p>
                  <button
                    onClick={handleLogin}
                    className="flex items-center gap-2 mx-auto px-4 py-2 text-xs font-bold bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white rounded-lg shadow-md hover:opacity-95 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    Connect Cloud Account
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h3 className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
                      Synced Studio History
                    </h3>
                    <button
                      onClick={() => fetchHistory(user.uid)}
                      disabled={isLoadingHistory}
                      className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 transition-colors disabled:opacity-50"
                      title="Refresh History"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {isLoadingHistory ? (
                    <div className="py-12 text-center space-y-2">
                      <RefreshCw className="w-6 h-6 mx-auto text-indigo-400 animate-spin" />
                      <p className="text-xs text-slate-500">Loading Cloud creations...</p>
                    </div>
                  ) : creations.length === 0 ? (
                    <div className="py-16 text-center text-slate-500 font-light space-y-2">
                      <Tv className="w-8 h-8 mx-auto text-slate-700" />
                      <p className="text-xs">No synced creations found.</p>
                      <p className="text-[10px] text-slate-600">Generated images and video references will appear here once saved.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {creations.map((item) => (
                        <div 
                          key={item.id}
                          className="group relative rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3 transition-all hover:border-indigo-500/30 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <span className="px-2 py-0.5 text-[8px] font-mono font-bold bg-indigo-950 text-indigo-400 rounded border border-indigo-900/60 uppercase">
                                {item.tool}
                              </span>
                              <span className="text-[9px] font-mono text-slate-500">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed font-light">
                              "{item.prompt}"
                            </p>

                            {item.imageUrl && (
                              <div className="relative rounded overflow-hidden border border-slate-900 max-h-32 flex items-center justify-center bg-black">
                                <img 
                                  src={item.imageUrl} 
                                  alt="Creation thumbnail" 
                                  className="object-contain h-28 max-w-full"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}

                            {item.tool === 'video' && (
                              <div className="rounded p-2 bg-slate-900 border border-slate-800 text-[10px] text-slate-400 flex items-center gap-1.5 font-mono">
                                <Video className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Operation: {item.metadata?.operationName?.split('/').pop() || 'Veo Sequence'}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-slate-900 mt-2">
                            {item.imageUrl ? (
                              <a
                                href={item.imageUrl}
                                download={`pikaiso-${item.tool}-${item.id}.png`}
                                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                              >
                                <Download className="w-3 h-3" />
                                Download
                              </a>
                            ) : (
                              <span className="text-[9px] text-slate-500 italic">Cloud Archive</span>
                            )}

                            <button
                              onClick={() => item.id && handleDeleteHistoryItem(item.id)}
                              className="text-slate-600 hover:text-red-400 p-1 rounded hover:bg-red-950/20 transition-all cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MediaStudio;
