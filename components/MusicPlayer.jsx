"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, ChevronDown, Heart } from "lucide-react";

export default function MusicPlayer({ isVisible }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (isVisible && audioRef.current) {
      audioRef.current.volume = 0.6;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isVisible]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleScrubberClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newRatio = Math.max(0, Math.min(1, clickX / rect.width));
    if (audioRef.current && duration > 0) {
      audioRef.current.currentTime = newRatio * duration;
      setCurrentTime(newRatio * duration);
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (!isVisible) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <audio
        ref={audioRef}
        src="/Taylor Swift.mp3"
        loop
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
      />

      {/* CONTAINER PEMUTAR MUSIK: ULTRA SMOOTH SPRING MORPHING DENGAN AKSESIBILITAS TINGGI */}
      <div
        className={`fixed z-50 select-none overflow-hidden transform-gpu transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isMinimized
            ? "bottom-4 left-4 w-14 h-14 rounded-full bg-zinc-950/90 border border-white/20 shadow-[0_10px_35px_rgba(0,0,0,0.85),0_0_20px_rgba(239,68,68,0.3)] backdrop-blur-xl cursor-pointer hover:scale-105 active:scale-95"
            : "bottom-3 sm:bottom-5 left-3 sm:left-5 w-[265px] sm:w-[285px] h-[385px] sm:h-[400px] rounded-[1.75rem] bg-zinc-950/90 border border-white/15 shadow-[0_25px_65px_rgba(0,0,0,0.9),0_0_35px_rgba(244,63,94,0.15)] backdrop-blur-2xl text-white"
        }`}
        onClick={() => {
          if (isMinimized) setIsMinimized(false);
        }}
        title={isMinimized ? "Ketuk untuk membuka pemutar musik" : undefined}
      >
        {/* LAPISAN 1: MINIMIZED VINYL DISC DENGAN SOFT AUDIO RING GLOW */}
        <div
          className={`absolute inset-0 w-full h-full flex items-center justify-center transform-gpu transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isMinimized
              ? "opacity-100 scale-100 blur-0 pointer-events-auto"
              : "opacity-0 scale-50 blur-sm pointer-events-none"
          }`}
        >
          <div className="relative w-full h-full p-1 group flex items-center justify-center">
            {/* Pendaran Cincin Musik Halus */}
            {isPlaying && (
              <div className="absolute inset-0.5 rounded-full border border-red-500/40 animate-ping [animation-duration:3s] pointer-events-none" />
            )}

            <img
              src="/Taylor Swift.jpg"
              alt="Mini Vinyl"
              className="w-full h-full object-cover rounded-full shadow-inner animate-spin [animation-duration:12s]"
              style={{
                animationPlayState: isPlaying ? "running" : "paused",
              }}
            />
            {/* Center Vinyl Spindle Hole */}
            <div className="absolute inset-0 m-auto w-3.5 h-3.5 rounded-full bg-zinc-950 border border-white/50 shadow-md" />

            {/* Hover/Tap overlay hint */}
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
            </div>
          </div>
        </div>

        {/* LAPISAN 2: EXPANDED FULL PLAYER DENGAN BLUR-TO-FOCUS TRANSISI */}
        <div
          className={`absolute inset-0 w-full h-full p-3 sm:p-3.5 flex flex-col justify-between transform-gpu transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            !isMinimized
              ? "opacity-100 scale-100 blur-0 pointer-events-auto delay-75"
              : "opacity-0 scale-90 blur-md pointer-events-none"
          }`}
        >
          {/* Header Bar Player dengan Tombol Minimize di Kanan Atas */}
          <div className="flex items-center justify-between pb-1.5 px-0.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
              Music Player
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(true);
              }}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-zinc-300 hover:text-white transition cursor-pointer"
              title="Kecilkan Pemutar"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* 1. Cover Art Persegi Elegan */}
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-lg group">
            <img
              src="/Taylor Swift.jpg"
              alt="Taylor Swift Album Art"
              className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
                isPlaying ? "scale-105" : "scale-100"
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* 2. Info Lagu & Tombol Suka */}
          <div className="flex items-center justify-between mt-1 px-1">
            <div className="min-w-0 pr-2">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate leading-tight tracking-tight">
                You're On Your Own, Kid
              </h4>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate mt-0.5 font-medium">
                Taylor Swift
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className={`p-1.5 rounded-full transition hover:scale-110 active:scale-95 ${
                isLiked ? "text-rose-500 fill-rose-500" : "text-zinc-400 hover:text-white"
              }`}
              title="Sukai Lagu"
            >
              <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLiked ? "fill-current" : ""}`} />
            </button>
          </div>

          {/* 3. Scrubber Line Halus */}
          <div className="mt-0.5 px-1">
            <div
              onClick={handleScrubberClick}
              className="w-full h-1.5 hover:h-2 bg-white/15 rounded-full cursor-pointer relative transition-all group overflow-hidden"
            >
              <div
                className="h-full bg-white group-hover:bg-rose-500 rounded-full transition-all duration-100 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] sm:text-[10px] text-zinc-400 font-mono mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* 4. Baris Kontrol Player */}
          <div className="flex items-center justify-center gap-4 sm:gap-5 pt-1 border-t border-white/10 px-1">
            <button
              onClick={handleRestart}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition active:scale-90"
              title="Ulangi dari Awal"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white hover:bg-zinc-200 active:scale-90 text-zinc-950 flex items-center justify-center transition shadow-lg shadow-white/20"
              title={isPlaying ? "Jeda" : "Putar"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={handleRestart}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition active:scale-90"
              title="Putar Ulang"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
