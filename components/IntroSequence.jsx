"use client";

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import LetterCard from "./LetterCard";

export default function IntroSequence({ onFinish }) {
  const [stage, setStage] = useState("countdown"); // countdown -> greeting -> envelope -> letter
  const [count, setCount] = useState(3);
  const [isOpening, setIsOpening] = useState(false);
  const [flapOpen, setFlapOpen] = useState(false);
  const [paperSliding, setPaperSliding] = useState(false);
  const [envelopeDismissed, setEnvelopeDismissed] = useState(false);
  const [showFullLetter, setShowFullLetter] = useState(false);

  // 1. Countdown timer estetik & clean
  useEffect(() => {
    if (stage !== "countdown") return;

    if (count > 1) {
      const timer = setTimeout(() => setCount(count - 1), 1100);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setStage("greeting");
      }, 1100);
      return () => clearTimeout(timer);
    }
  }, [count, stage]);

  // 2. Greeting to Envelope transition
  useEffect(() => {
    if (stage !== "greeting") return;
    const timer = setTimeout(() => {
      setStage("envelope");
    }, 2800);
    return () => clearTimeout(timer);
  }, [stage]);

  // 3. Cinematic Smooth Envelope Opening Sequence
  const handleOpenLetter = () => {
    if (isOpening) return;
    setIsOpening(true);

    // Letupan confetti awal
    try {
      confetti({
        particleCount: 50,
        spread: 65,
        startVelocity: 30,
        origin: { y: 0.58 },
        colors: ["#ef4444", "#fbbf24", "#ffffff", "#f43f5e"],
      });
    } catch (e) {}

    // Step 1: Flap amplop terangkat ke atas secara 3D
    setTimeout(() => {
      setFlapOpen(true);
    }, 250);

    // Step 2: Kertas surat meluncur keluar dari amplop
    setTimeout(() => {
      setPaperSliding(true);
    }, 600);

    // Step 3: Amplop memudar mundur
    setTimeout(() => {
      setEnvelopeDismissed(true);
    }, 1050);

    // Step 4: Surat membentang penuh dengan ukuran pas dan responsif di layar
    setTimeout(() => {
      setShowFullLetter(true);
      try {
        confetti({
          particleCount: 70,
          spread: 85,
          startVelocity: 32,
          origin: { y: 0.45 },
          colors: ["#f43f5e", "#fbbf24", "#38bdf8", "#ffffff"],
        });
      } catch (e) {}
    }, 1450);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto px-3 py-3 sm:py-6 sm:px-6 bg-[#090a0f]/95 backdrop-blur-2xl flex flex-col items-center justify-center transition-opacity duration-700">
      {/* Tombol Lewati Intro Halus */}
      <button
        onClick={onFinish}
        className="fixed top-4 right-4 z-50 text-[11px] font-mono tracking-widest uppercase text-zinc-400 hover:text-white px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition backdrop-blur-md cursor-pointer active:scale-95"
        title="Lewati intro langsung ke linimasa"
      >
        Lewati Intro ✕
      </button>

      <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center justify-center text-center my-auto">
        
        {/* TAHAP 1: COUNTDOWN BESAR & BERSIH */}
        {stage === "countdown" && (
          <div className="flex flex-col items-center justify-center select-none py-14">
            <div className="relative flex items-center justify-center">
              <span
                key={count}
                className="text-7xl sm:text-9xl md:text-[10.5rem] font-light font-mono text-white tracking-widest leading-none drop-shadow-[0_4px_30px_rgba(255,255,255,0.25)] animate-scaleUp"
              >
                0{count}
              </span>
            </div>
          </div>
        )}

        {/* TAHAP 2: TIPOGRAFI UCAPAN — TEKS PUTIH CLEAN */}
        {stage === "greeting" && (
          <div className="flex flex-col items-center justify-center text-center px-4 animate-fadeIn py-8">
            <h1 className="text-3xl sm:text-6xl md:text-7xl font-serifTitle font-normal text-white tracking-tight leading-[1.25]">
              Selamat Wisuda, <br />
              <span className="font-bold text-white">
                Agnesh Juliasih, S.Pd.
              </span>
            </h1>
          </div>
        )}

        {/* TAHAP 3: AMPLOP SURAT MEWAH BERSIH & MODERN */}
        {stage === "envelope" && (
          <div className="w-full flex flex-col items-center [perspective:1400px] [-webkit-perspective:1400px]">
            {!showFullLetter && (
              <div
                className={`relative w-full max-w-[300px] sm:max-w-[420px] transition-all duration-700 cursor-pointer select-none ${
                  !isOpening ? "animate-env-float" : ""
                } ${envelopeDismissed ? "translate-y-12 scale-90 opacity-0 pointer-events-none" : ""}`}
                onClick={handleOpenLetter}
              >
                {/* WADAH AMPLOP SURAT BERSIH & ELEGAN */}
                <div className="relative w-full h-[200px] sm:h-[245px] rounded-3xl bg-gradient-to-br from-[#faf7f2] via-[#f4eee3] to-[#e8dec9] border border-amber-300/40 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_35px_rgba(244,63,94,0.12)] overflow-visible">
                  
                  {/* Garis Border Foil Emas Tipis */}
                  <div className="absolute inset-2 rounded-2xl border border-amber-400/30 pointer-events-none" />

                  {/* KERTAS SURAT DALAM AMPLOP */}
                  <div
                    className={`absolute left-3 right-3 sm:left-4 sm:right-4 top-3 h-[170px] sm:h-[200px] rounded-t-2xl bg-[#fdfbf7] border border-stone-200 shadow-md p-3.5 sm:p-4 text-left transition-all duration-700 ease-out z-10 ${
                      paperSliding
                        ? "-translate-y-32 sm:-translate-y-40 opacity-100 scale-100 shadow-2xl"
                        : "translate-y-8 opacity-0 pointer-events-none scale-95"
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-stone-200 pb-1.5 font-mono text-[9px] text-stone-400">
                      <span>Surat Kelulusan</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    </div>
                    <p className="font-serifTitle text-sm sm:text-base font-bold text-stone-900 mt-2">
                      Agnesh Juliasih, S.Pd. 🎓
                    </p>
                    <p className="font-kalam text-xs text-stone-600 mt-1 line-clamp-3 leading-relaxed">
                      Selamat ya, Agnesh, atas gelar S.Pd.-nya. Ikut senang akhirnya kamu sampai di tahap ini...
                    </p>
                  </div>

                  {/* KANTUNG DEPAN AMPLOP */}
                  <div className="absolute inset-0 z-20 rounded-3xl overflow-hidden pointer-events-none flex flex-col justify-end p-4 sm:p-5">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#ede2cf] via-[#f7f2e8] to-[#f4eee3]" />
                    
                    <div className="relative z-20 text-center pb-1">
                      <h3 className="font-serifTitle text-sm sm:text-lg font-bold text-stone-900 leading-snug">
                        Untuk: Agnesh Juliasih, S.Pd.
                      </h3>
                    </div>
                  </div>

                  {/* FLAP PENUTUP AMPLOP 3D (CROSS-BROWSER WEBKIT COMPATIBLE) */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[115px] sm:h-[138px] origin-top transition-transform duration-700 ease-in-out pointer-events-none"
                    style={{
                      transform: flapOpen ? "rotateX(180deg)" : "rotateX(0deg)",
                      WebkitTransform: flapOpen ? "rotateX(180deg)" : "rotateX(0deg)",
                      transformStyle: "preserve-3d",
                      WebkitTransformStyle: "preserve-3d",
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      zIndex: flapOpen ? 5 : 30,
                    }}
                  >
                    <div
                      className="w-full h-full bg-gradient-to-b from-[#faf6ee] to-[#ded0b6] shadow-md border-b border-amber-300/50"
                      style={{
                        clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)",
                      }}
                    />
                  </div>

                  {/* STEMPEL SEGEL LILIN MERAH */}
                  {!isOpening && (
                    <div
                      className="absolute top-[88px] sm:top-[106px] left-1/2 -translate-x-1/2 z-40 flex flex-col items-center group transition-transform duration-300 hover:scale-105 active:scale-95"
                      title="Ketuk untuk membuka surat"
                    >
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-rose-600 via-rose-800 to-rose-950 border-2 border-amber-300 shadow-2xl animate-seal-shimmer flex items-center justify-center cursor-pointer">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-amber-300/60 flex flex-col items-center justify-center text-amber-200">
                          <span className="text-base sm:text-lg leading-none">🎓</span>
                          <span className="font-serif font-black text-[9px] sm:text-[10px] tracking-wider text-amber-100">
                            AJ
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* TAHAP 4: SURAT TERBUKA LENGKAP */}
            {showFullLetter && (
              <div className="w-full animate-letterOpen origin-top">
                <LetterCard onClose={onFinish} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
