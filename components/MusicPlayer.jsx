"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, ChevronDown, Heart, Music2, Volume2, VolumeX } from "lucide-react";

export default function MusicPlayer({ isVisible }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  // Mencoba memutar audio saat terlihat, dengan fallback aman untuk kebijakan Autoplay iOS/Android
  useEffect(() => {
    if (isVisible && audioRef.current) {
      audioRef.current.volume = 0.6;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Browser mobile (iOS/Android) memblokir autoplay otomatis tanpa interaksi
            setIsPlaying(false);
          });
      }
    }
  }, [isVisible]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    const newMuted = !isMuted;
    audioRef.current.muted = newMuted;
    setIsMuted(newMuted);
  }, [isMuted]);

  // Keyboard accessibility shortcuts: Space untuk play/pause, M untuk mute/unmute
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e) => {
      // Abaikan jika fokus sedang berada pada input atau textarea
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, togglePlay, toggleMute]);

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
        src={encodeURI("/Taylor Swift.mp3")}
        loop
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
      />

      {/* 1. FLOATING MINI VINYL BUTTON DENGAN SAFE AREA iOS */}
      <div
        className={`fixed z-50 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-zinc-950/90 border border-white/20 shadow-[0_10px_35px_rgba(0,0,0,0.85),0_0_20px_rgba(239,68,68,0.35)] backdrop-blur-xl cursor-pointer select-none transform-gpu transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110 active:scale-95 ${
          isMinimized
            ? "scale-100 opacity-100 pointer-events-auto"
            : "scale-50 opacity-0 pointer-events-none"
        }`}
        style={{
          bottom: "max(1rem, env(safe-area-inset-bottom, 1rem))",
          left: "max(1rem, env(safe-area-inset-left, 1rem))",
          willChange: "transform, opacity",
        }}
        onClick={() => setIsMinimized(false)}
        title="Ketuk untuk membuka pemutar musik"
      >
        <div className="relative w-full h-full p-1 flex items-center justify-center group">
          {isPlaying && (
            <div className="absolute inset-0 rounded-full border border-red-500/50 animate-ping [animation-duration:2.5s] pointer-events-none" />
          )}

          <img
            src={encodeURI("/Taylor Swift.jpg")}
            alt="Mini Vinyl"
            className="w-full h-full object-cover rounded-full shadow-inner animate-spin [animation-duration:12s]"
            style={{
              animationPlayState: isPlaying ? "running" : "paused",
              willChange: "transform",
            }}
          />
          {/* Center Spindle Hole */}
          <div className="absolute inset-0 m-auto w-3.5 h-3.5 rounded-full bg-zinc-950 border border-white/60 shadow-md" />

          {/* Mini Soundwave Icon Indicator */}
          {isPlaying && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-white shadow-md">
              <Music2 className="w-2.5 h-2.5 animate-pulse" />
            </div>
          )}

          {/* Hover / Tap overlay */}
          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* 2. EXPANDED MODERN MUSIC CARD DENGAN SAFE AREA iOS & ANDROID */}
      <div
        className={`fixed z-50 w-[calc(100vw-2rem)] max-w-[270px] sm:max-w-[290px] rounded-[1.75rem] bg-zinc-950/90 border border-white/15 shadow-[0_25px_65px_rgba(0,0,0,0.95),0_0_30px_rgba(244,63,94,0.18)] backdrop-blur-2xl text-white p-3.5 sm:p-4 select-none transform-gpu origin-bottom-left transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between ${
          !isMinimized
            ? "scale-100 opacity-100 translate-y-0 pointer-events-auto"
            : "scale-75 opacity-0 translate-y-6 pointer-events-none"
        }`}
        style={{
          bottom: "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))",
          left: "max(0.75rem, env(safe-area-inset-left, 0.75rem))",
          willChange: "transform, opacity",
        }}
      >
        {/* Header Bar dengan Tombol Mute dan Minimize */}
        <div className="flex items-center justify-between pb-2 px-0.5">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? "bg-red-500 animate-pulse" : "bg-zinc-600"}`} />
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
              Music Player
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className={`w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center transition cursor-pointer ${
                isMuted ? "text-red-400" : "text-zinc-300 hover:text-white"
              }`}
              title={isMuted ? "Bunyikan Musik (M)" : "Bisukan Musik (M)"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
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
        </div>

        {/* 1. Cover Art Persegi Elegan */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-lg group">
          <img
            src={encodeURI("/Taylor Swift.jpg")}
            alt="Taylor Swift Album Art"
            className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
              isPlaying ? "scale-105" : "scale-100"
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* 2. Info Lagu & Tombol Suka */}
        <div className="flex items-center justify-between mt-2.5 px-1">
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
        <div className="mt-1 px-1">
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
        <div className="flex items-center justify-center gap-4 sm:gap-5 pt-1.5 border-t border-white/10 px-1 mt-1">
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
    </>
  );
}
