import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import { Play, Pause, RotateCcw, Maximize2, Minimize2, Volume2, VolumeX, Award } from 'lucide-react';

export const TimeTracker: React.FC = () => {
  const { courses, tasks, addStudySession } = useStore();
  
  // Timer States
  const [mode, setMode] = useState<'pomodoro' | 'stopwatch'>('pomodoro');
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 mins in seconds
  const [stopwatchTime, setStopwatchTime] = useState(0);
  
  // Course/Task tagging
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedTask, setSelectedTask] = useState('');

  // Pomodoro config states
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [isBreak, setIsBreak] = useState(false);

  // Focus Mode Overlay State
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Ambient sound synthesizer
  const [ambientSound, setAmbientSound] = useState<'none' | 'space' | 'rain'>('none');
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<any[]>([]);

  // Timer tick interval
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        if (mode === 'pomodoro') {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              handleTimerComplete();
              return 0;
            }
            return prev - 1;
          });
        } else {
          setStopwatchTime((prev) => prev + 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, mode]);

  // Sync Timer settings
  useEffect(() => {
    if (mode === 'pomodoro' && !isPlaying) {
      setTimeLeft(isBreak ? breakDuration * 60 : focusDuration * 60);
    }
  }, [focusDuration, breakDuration, isBreak, mode]);

  // Complete Pomodoro
  const handleTimerComplete = () => {
    setIsPlaying(false);
    
    // Log study session if it was a focus period
    if (!isBreak) {
      addStudySession({
        duration: focusDuration,
        type: 'pomodoro',
        courseId: selectedCourse || undefined,
        taskId: selectedTask || undefined,
        startTime: new Date(Date.now() - focusDuration * 60 * 1000).toISOString(),
        endTime: new Date().toISOString()
      });
      alert(`🎉 Hoàn thành phiên Pomodoro! Bạn nhận được ${focusDuration * 4} XP.`);
      setIsBreak(true);
      setTimeLeft(breakDuration * 60);
    } else {
      alert("⏱️ Hết thời gian nghỉ ngơi! Bắt đầu học tiếp thôi.");
      setIsBreak(false);
      setTimeLeft(focusDuration * 60);
    }
  };

  // Stop Stopwatch and log it
  const handleStopStopwatch = () => {
    setIsPlaying(false);
    if (stopwatchTime > 10) { // log if greater than 10 seconds
      const minutes = Math.round(stopwatchTime / 60);
      addStudySession({
        duration: Math.max(1, minutes),
        type: 'stopwatch',
        courseId: selectedCourse || undefined,
        taskId: selectedTask || undefined,
        startTime: new Date(Date.now() - stopwatchTime * 1000).toISOString(),
        endTime: new Date().toISOString()
      });
      alert(`⏱️ Đã lưu phiên học: ${minutes} phút. Nhận được ${Math.max(1, minutes) * 4} XP.`);
    }
    setStopwatchTime(0);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Synthesize sounds using Web Audio API
  const startAmbientSound = (type: 'space' | 'rain') => {
    stopAmbientSound();

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      if (type === 'space') {
        // Space drone synthesizer: Multiple low oscillators with LFO filter
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const lfo = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(60, ctx.currentTime); // low C

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(90, ctx.currentTime); // G

        lfo.frequency.setValueAtTime(0.15, ctx.currentTime); // Very slow filter sweep

        filter.type = 'lowpass';
        filter.Q.setValueAtTime(5, ctx.currentTime);

        gain.gain.setValueAtTime(0.08, ctx.currentTime); // low volume

        // Connect LFO to filter frequency
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(200, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        // Signal chain
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        // Start
        osc1.start();
        osc2.start();
        lfo.start();

        audioNodesRef.current = [osc1, osc2, lfo, ctx];
      } else if (type === 'rain') {
        // Synthesizing rain/brownian noise
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        // Brownian noise generator
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // compensation
        }

        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = noiseBuffer;
        noiseNode.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.12, ctx.currentTime);

        noiseNode.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noiseNode.start();

        audioNodesRef.current = [noiseNode, ctx];
      }
    } catch (e) {
      console.error("Web Audio API failed to load: ", e);
    }
  };

  const stopAmbientSound = () => {
    if (audioNodesRef.current.length > 0) {
      audioNodesRef.current.forEach((node) => {
        try {
          if (node.stop) node.stop();
        } catch (e) {}
      });
      audioNodesRef.current = [];
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    audioContextRef.current = null;
  };

  const toggleSound = (soundType: 'space' | 'rain') => {
    if (ambientSound === soundType) {
      setAmbientSound('none');
      stopAmbientSound();
    } else {
      setAmbientSound(soundType);
      startAmbientSound(soundType);
    }
  };

  // Cleanup audio node on unmount
  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-6 pb-24 space-y-6">
      
      {/* Tab Select & Description */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Bộ Đếm Tập Trung
          </h2>
          <p className="text-slate-400 text-sm">Phương pháp Pomodoro & Đo lường thời gian giúp tăng hiệu suất làm việc.</p>
        </div>

        <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-2xl">
          <button
            onClick={() => {
              setIsPlaying(false);
              setMode('pomodoro');
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === 'pomodoro' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pomodoro
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setMode('stopwatch');
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === 'stopwatch' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Stopwatch
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Config Panel */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Tagging Card */}
          <GlassCard className="space-y-4">
            <h3 className="font-semibold text-slate-200">Gắn Nhãn Buổi Học</h3>
            
            <div>
              <label className="text-xs text-slate-400 block mb-1">Môn Học</label>
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setSelectedTask('');
                }}
                className="w-full glass-input text-sm"
              >
                <option value="" className="bg-slate-900">Không gắn nhãn môn học</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Bài tập / Deadline</label>
              <select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                disabled={!selectedCourse}
                className="w-full glass-input text-sm disabled:opacity-50"
              >
                <option value="" className="bg-slate-900">Không gắn nhãn bài tập</option>
                {tasks
                  .filter(t => t.courseId === selectedCourse && t.status === 'pending')
                  .map(t => (
                    <option key={t.id} value={t.id} className="bg-slate-900">{t.title}</option>
                  ))
                }
              </select>
            </div>
          </GlassCard>

          {/* Pomodoro Settings */}
          {mode === 'pomodoro' && (
            <GlassCard className="space-y-4">
              <h3 className="font-semibold text-slate-200">Cấu hình thời gian</h3>
              
              <div>
                <label className="text-xs text-slate-400 block mb-1">Tập trung: {focusDuration} phút</label>
                <input 
                  type="range" 
                  min="5" 
                  max="60" 
                  step="5"
                  value={focusDuration}
                  onChange={(e) => setFocusDuration(Number(e.target.value))}
                  disabled={isPlaying}
                  className="w-full accent-purple-500 bg-slate-800"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Giải lao: {breakDuration} phút</label>
                <input 
                  type="range" 
                  min="1" 
                  max="30" 
                  step="1"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(Number(e.target.value))}
                  disabled={isPlaying}
                  className="w-full accent-purple-500 bg-slate-800"
                />
              </div>
            </GlassCard>
          )}

          {/* Ambient Music Card */}
          <GlassCard className="space-y-4">
            <h3 className="font-semibold text-slate-200 flex items-center gap-2">
              <Volume2 size={16} className="text-purple-400" />
              Âm Thanh Tập Trung (Web Audio Synthesizer)
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              <GlassButton 
                variant={ambientSound === 'space' ? 'indigo' : 'secondary'}
                onClick={() => toggleSound('space')}
                className="text-xs py-2 gap-1.5"
              >
                <span>Cosmic Drone</span>
              </GlassButton>
              <GlassButton 
                variant={ambientSound === 'rain' ? 'cyan' : 'secondary'}
                onClick={() => toggleSound('rain')}
                className="text-xs py-2 gap-1.5"
              >
                <span>White Noise</span>
              </GlassButton>
            </div>
          </GlassCard>
        </div>

        {/* Center / Right Column: The Timer Display */}
        <div className="md:col-span-2">
          <GlassCard glowColor="purple" className="flex flex-col items-center justify-center py-12 px-6 h-full relative overflow-hidden min-h-[350px]">
            {/* Background glowing circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-purple-500/5 blur-[80px] pointer-events-none"></div>

            {/* Title display */}
            <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-400 mb-6">
              {mode === 'pomodoro' 
                ? (isBreak ? '☕ GIẢI LAO' : '🧠 ĐANG TẬP TRUNG') 
                : '⏱️ STOPWATCH'
              }
            </h3>

            {/* Numeric display */}
            <div className="text-7xl md:text-8xl font-black text-white tracking-tighter select-none font-mono my-4 drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]">
              {mode === 'pomodoro' 
                ? formatTime(timeLeft) 
                : formatTime(stopwatchTime)
              }
            </div>

            {/* Tag label */}
            {selectedCourse && (
              <div className="mb-8 text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full font-medium">
                Mục tiêu: {courses.find(c => c.id === selectedCourse)?.name}
              </div>
            )}

            {/* Timer controls */}
            <div className="flex items-center gap-4">
              {/* Reset */}
              <GlassButton 
                onClick={() => {
                  setIsPlaying(false);
                  if (mode === 'pomodoro') {
                    setTimeLeft(isBreak ? breakDuration * 60 : focusDuration * 60);
                  } else {
                    setStopwatchTime(0);
                  }
                }}
                className="p-3.5 rounded-full"
              >
                <RotateCcw size={20} />
              </GlassButton>

              {/* Play / Pause */}
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-purple-500/25 active:scale-95 transition-all duration-300"
              >
                {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" className="ml-1" />}
              </button>

              {/* Focus Mode Fullscreen toggle */}
              <GlassButton 
                onClick={() => setIsFocusMode(true)}
                className="p-3.5 rounded-full"
              >
                <Maximize2 size={20} />
              </GlassButton>
            </div>

            {/* Stopwatch Stop & Save button */}
            {mode === 'stopwatch' && stopwatchTime > 0 && (
              <GlassButton 
                variant="green" 
                onClick={handleStopStopwatch}
                className="mt-6 gap-2"
              >
                <Award size={16} /> Lưu Buổi Học & Nhận XP
              </GlassButton>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Focus Mode Fullscreen Overlay */}
      {isFocusMode && (
        <div className="fixed inset-0 bg-[#02000a] z-[999] flex flex-col justify-between p-8 animate-fade-in text-white select-none">
          {/* Animated floating node in fullscreen */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] rounded-full bg-purple-900/10 blur-[150px] animate-pulse pointer-events-none"></div>

          {/* Header */}
          <div className="flex items-center justify-between z-10">
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                StudentOS Focus
              </h2>
              {selectedCourse && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Môn học: {courses.find(c => c.id === selectedCourse)?.name}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Audio controller inside Focus Mode */}
              <GlassButton 
                onClick={() => toggleSound('space')}
                variant={ambientSound === 'space' ? 'indigo' : 'secondary'}
                className="px-3.5 py-2 text-xs gap-1.5 rounded-xl border-white/5"
              >
                {ambientSound === 'space' ? <Volume2 size={14} /> : <VolumeX size={14} />} Space Drone
              </GlassButton>
              <GlassButton 
                onClick={() => toggleSound('rain')}
                variant={ambientSound === 'rain' ? 'cyan' : 'secondary'}
                className="px-3.5 py-2 text-xs gap-1.5 rounded-xl border-white/5"
              >
                {ambientSound === 'rain' ? <Volume2 size={14} /> : <VolumeX size={14} />} Rain Noise
              </GlassButton>
            </div>
          </div>

          {/* Core Display */}
          <div className="flex flex-col items-center justify-center z-10 space-y-4">
            <h3 className="text-sm font-semibold tracking-widest text-purple-400 uppercase">
              {mode === 'pomodoro' 
                ? (isBreak ? '🍵 Thư giãn đầu óc' : '🚀 Tập trung cao độ') 
                : '⏱️ Đang ghi nhận thời gian'
              }
            </h3>

            <div className="text-9xl md:text-[12rem] font-black tracking-tighter select-none font-mono drop-shadow-[0_0_60px_rgba(168,85,247,0.35)] animate-pulse" style={{ animationDuration: '3s' }}>
              {mode === 'pomodoro' 
                ? formatTime(timeLeft) 
                : formatTime(stopwatchTime)
              }
            </div>

            {/* Play/Pause controls in focus mode */}
            <div className="flex items-center gap-6 pt-4">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-300 active:scale-95"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
              </button>

              {mode === 'stopwatch' && stopwatchTime > 0 && (
                <GlassButton 
                  variant="green"
                  onClick={() => {
                    handleStopStopwatch();
                    setIsFocusMode(false);
                  }}
                  className="rounded-full py-3"
                >
                  Hoàn thành
                </GlassButton>
              )}
            </div>
          </div>

          {/* Footer controls */}
          <div className="flex justify-center z-10">
            <GlassButton 
              onClick={() => setIsFocusMode(false)}
              className="gap-1.5 px-6 py-2.5 rounded-2xl border-white/5 hover:bg-red-500/10 hover:border-red-500/20"
            >
              <Minimize2 size={16} /> Thoát Chế Độ Tập Trung
            </GlassButton>
          </div>
        </div>
      )}
    </div>
  );
};
export default TimeTracker;
