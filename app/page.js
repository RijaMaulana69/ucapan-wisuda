"use client";

import { useState } from "react";
import BackgroundStars from "@/components/BackgroundStars";
import MusicPlayer from "@/components/MusicPlayer";
import IntroSequence from "@/components/IntroSequence";
import TimelineSection from "@/components/TimelineSection";
import LetterCard from "@/components/LetterCard";
import { X, BookOpen } from "lucide-react";

export default function Home() {
  const [introFinished, setIntroFinished] = useState(false);
  const [showModalLetter, setShowModalLetter] = useState(false);
  const [lightboxData, setLightboxData] = useState(null);

  const handleFinishIntro = () => {
    setIntroFinished(true);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <main className="min-h-screen bg-[#090a0f] text-zinc-100 relative selection:bg-rose-500/30 selection:text-rose-300">
      {/* Background Star Canvas */}
      <BackgroundStars />

      {/* Floating Music Player */}
      <MusicPlayer isVisible={introFinished} />

      {/* Intro Experience (Countdown -> Greeting -> Envelope -> Letter) */}
      {!introFinished && <IntroSequence onFinish={handleFinishIntro} />}

      {/* MAIN WEBSITE CONTENT */}
      {introFinished && (
        <div className="relative z-10 animate-fade-in duration-700">
          {/* Header Section */}
          <header className="pt-16 sm:pt-24 pb-8 sm:pb-12 text-center max-w-2xl mx-auto px-4">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] text-zinc-400 block mb-2">
              The Journey of
            </span>
            <h1 className="font-serifTitle text-3xl sm:text-5xl font-bold tracking-tight text-white mb-3">
              Agnesh Juliasih, S.Pd.
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
              Sebuah catatan perjalanan dan dedikasi hingga meraih gelar sarjana. Dari langkah pertama di kuliah hingga resmi meraih gelar sarjana.
            </p>

            {/* Tombol Baca Ulang Surat */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowModalLetter(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-white/10 hover:border-white/25 text-xs text-zinc-300 hover:text-white transition shadow-lg active:scale-95"
              >
                <BookOpen className="w-3.5 h-3.5 text-rose-400" />
                <span>Baca Ulang Surat</span>
              </button>
            </div>
          </header>

          {/* Timeline Section */}
          <TimelineSection onOpenPhoto={(src, caption) => setLightboxData({ src, caption })} />

          {/* Footer */}
          <footer className="py-12 text-center text-xs text-zinc-500 border-t border-white/5 space-y-1">
            <p className="text-zinc-400 font-medium">Agnesh Juliasih, S.Pd.</p>
          </footer>
        </div>
      )}

      {/* MODAL BACA ULANG SURAT */}
      {showModalLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in duration-300">
          <div className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl">
            <LetterCard onClose={() => setShowModalLetter(false)} />
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {lightboxData && (
        <div
          onClick={() => setLightboxData(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 cursor-pointer animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full flex flex-col items-center cursor-default"
          >
            <button
              onClick={() => setLightboxData(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white p-1 transition"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="bg-zinc-950 border border-white/10 p-2 rounded-2xl shadow-2xl max-h-[85vh] flex flex-col items-center">
              <img
                src={lightboxData.src}
                alt={lightboxData.caption}
                className="max-h-[75vh] w-auto object-contain rounded-xl"
              />
              <p className="text-xs font-semibold text-zinc-300 mt-2.5 text-center">
                {lightboxData.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
