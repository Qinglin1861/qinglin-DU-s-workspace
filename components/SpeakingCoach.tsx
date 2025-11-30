
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { evaluateSpeaking } from '../services/geminiService';
import { SpeakingFeedback } from '../types';
import { Mic, Square, Loader2, Volume2, Award, RefreshCw, Timer } from 'lucide-react';

const SpeakingCoach: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [topic, setTopic] = useState("Describe a challenge you overcame.");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);
  
  // Timer state
  const [duration, setDuration] = useState(0);
  const maxDuration = 120; // 2 minutes target for Part 2

  // Audio Playback State
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  
  // Audio Visualizer Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const timerIntervalRef = useRef<number>();

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  const cleanupAudio = () => {
    if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = undefined;
    }
    if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const audioUrl = useMemo(() => {
    if (!audioBlob) return null;
    return URL.createObjectURL(audioBlob);
  }, [audioBlob]);

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
        audioRef.current.playbackRate = rate;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Reset state
      setAudioBlob(null);
      setFeedback(null);
      setDuration(0);
      setPlaybackRate(1);
      chunksRef.current = [];

      // Setup Audio Context & Visualizer
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 64; // Low bin count for chunky bars
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      visualize();

      // Setup Recorder
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Start Timer
      timerIntervalRef.current = window.setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return maxDuration;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone", err);
      alert("Microphone access is required.");
    }
  };

  const visualize = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    
    if (!ctx) return;

    // Adjust canvas size to display density (optional, handled by CSS mostly but good for sharpness)
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate bar width based on canvas width and frequency bin count
      // We limit to first ~20 bins for cleaner look since high freq usually empty in speech
      const relevantBins = 24; 
      const barWidth = (canvas.width / relevantBins) - 4;
      let x = 2;

      for (let i = 0; i < relevantBins; i++) {
        // Normalize height
        const value = dataArray[i];
        const barHeight = (value / 255) * canvas.height;
        
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#4f46e5'); // Indigo 600
        gradient.addColorStop(1, '#818cf8'); // Indigo 400

        ctx.fillStyle = gradient;
        
        // Draw rounded rect manually or use fillRect
        // Using fillRect for compatibility, adding roundness via CSS usually, but here drawing on canvas
        const y = canvas.height - barHeight;
        
        ctx.beginPath();
        // Modern browsers support roundRect, fallback to rect if needed
        if (ctx.roundRect) {
             ctx.roundRect(x, y, barWidth, barHeight + 5, 4); // +5 to cover bottom radius
        } else {
            ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();

        x += barWidth + 4;
      }
    };

    draw();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    cleanupAudio();
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSubmit = async () => {
    if (!audioBlob) return;
    setLoading(true);
    try {
      const base64Audio = await blobToBase64(audioBlob);
      const result = await evaluateSpeaking(base64Audio, topic);
      setFeedback(result);
    } catch (e) {
      alert("Speaking evaluation failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const topics = [
    "Describe a challenge you overcame.",
    "Talk about your favorite book.",
    "Discuss the impact of technology on education.",
    "Describe a memorable holiday.",
    "Talk about a person who inspires you."
  ];

  const refreshTopic = () => {
    const random = topics[Math.floor(Math.random() * topics.length)];
    setTopic(random);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center relative overflow-hidden">
         {/* Background decoration */}
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

         <div className="mb-8">
           <span className="text-xs font-bold text-indigo-500 tracking-wider uppercase">Speaking Part 2 Practice</span>
           <h2 className="text-2xl font-bold text-slate-800 mt-2 flex items-center justify-center gap-3">
             "{topic}"
             <button onClick={refreshTopic} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
               <RefreshCw className="w-5 h-5" />
             </button>
           </h2>
           <p className="text-slate-500 text-sm mt-2">Speak for up to 2 minutes</p>
         </div>

         {/* Visualizer Area */}
         <div className="h-32 flex items-end justify-center mb-6 relative">
            {isRecording ? (
                <canvas ref={canvasRef} className="w-full max-w-md h-full" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <div className="flex gap-1 items-end h-16">
                        {[1,2,3,4,3,5,2,4,6,3,5,2,4,3,1].map((h, i) => (
                            <div key={i} style={{height: `${h * 10}%`}} className="w-3 bg-slate-100 rounded-t"></div>
                        ))}
                    </div>
                </div>
            )}
         </div>

         {/* Timer & Progress */}
         {(isRecording || duration > 0) && (
             <div className="mb-8 max-w-md mx-auto">
                 <div className="flex justify-between items-end mb-2">
                     <div className="flex items-center gap-2 text-indigo-600 font-bold font-mono text-xl">
                         <Timer className="w-5 h-5" />
                         {formatTime(duration)}
                     </div>
                     <span className="text-xs text-slate-400 font-medium">Target: 2:00</span>
                 </div>
                 <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                     <div 
                        className="bg-indigo-600 h-full transition-all duration-1000 ease-linear"
                        style={{ width: `${Math.min((duration / maxDuration) * 100, 100)}%` }}
                     ></div>
                 </div>
             </div>
         )}

         <div className="flex justify-center items-center gap-6 mb-4">
           {!isRecording ? (
             <button 
               onClick={startRecording}
               className="group relative w-20 h-20 rounded-full bg-red-50 text-red-600 border-2 border-red-100 flex items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-lg shadow-red-100/50"
             >
               <Mic className="w-8 h-8 group-hover:scale-110 transition-transform" />
               {audioBlob && <span className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></span>}
             </button>
           ) : (
             <button 
               onClick={stopRecording}
               className="w-20 h-20 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-900 hover:scale-105 transition-all shadow-xl ring-4 ring-indigo-100"
             >
               <Square className="w-8 h-8 fill-current" />
             </button>
           )}
         </div>
         
         {!isRecording && audioBlob && (
           <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
             <div className="bg-slate-50 p-3 rounded-full px-6 text-sm text-slate-600 border border-slate-200">
                Recording saved: {formatTime(duration)}
             </div>

             {/* Audio Player with Speed Controls */}
             {audioUrl && (
                <div className="w-full max-w-md space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <audio 
                    ref={audioRef}
                    controls 
                    src={audioUrl} 
                    className="w-full" 
                    onPlay={() => {
                        // Ensure playback rate is applied when play starts
                        if (audioRef.current) audioRef.current.playbackRate = playbackRate;
                    }}
                  />
                  
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Playback Speed</span>
                    <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
                        {[0.75, 1, 1.25, 1.5].map((rate) => (
                            <button
                                key={rate}
                                onClick={() => handleRateChange(rate)}
                                className={`text-xs px-3 py-1.5 rounded-md transition-all font-medium ${
                                    playbackRate === rate
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                                }`}
                            >
                                {rate}x
                            </button>
                        ))}
                    </div>
                  </div>
                </div>
             )}

             <button 
                onClick={handleSubmit}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Award className="w-5 h-5" />}
                Analyze My Speaking
              </button>
           </div>
         )}
       </div>

       {feedback && (
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
               <div className="bg-indigo-600 text-white w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-indigo-200">
                 <span className="text-2xl font-bold">{feedback.bandScore}</span>
                 <span className="text-[10px] opacity-80 uppercase">Band</span>
               </div>
               <div>
                 <h3 className="text-lg font-bold text-slate-800">Performance Analysis</h3>
                 <p className="text-slate-500 text-sm">Detailed breakdown of your speech</p>
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
               <div className="bg-slate-50 p-4 rounded-lg">
                 <div className="text-xs text-slate-500 uppercase mb-1">Fluency</div>
                 <div className="text-xl font-bold text-indigo-600">{feedback.fluencyCoherence}</div>
               </div>
               <div className="bg-slate-50 p-4 rounded-lg">
                 <div className="text-xs text-slate-500 uppercase mb-1">Lexical</div>
                 <div className="text-xl font-bold text-indigo-600">{feedback.lexicalResource}</div>
               </div>
               <div className="bg-slate-50 p-4 rounded-lg">
                 <div className="text-xs text-slate-500 uppercase mb-1">Grammar</div>
                 <div className="text-xl font-bold text-indigo-600">{feedback.grammaticalRange}</div>
               </div>
               <div className="bg-slate-50 p-4 rounded-lg">
                 <div className="text-xs text-slate-500 uppercase mb-1">Pronunciation</div>
                 <div className="text-xl font-bold text-indigo-600">{feedback.pronunciation}</div>
               </div>
            </div>

            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  Feedback
                </h4>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{feedback.feedback}</p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Transcript & Corrections</h4>
                <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-600 italic leading-relaxed">
                  "{feedback.transcript}"
                </div>
              </div>
            </div>
         </div>
       )}
    </div>
  );
};

export default SpeakingCoach;
