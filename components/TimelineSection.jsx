"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Sparkles } from "lucide-react";

// Algoritma Catmull-Rom Spline ke Cubic Bezier untuk lekukan benang yang 100% luwes dan mengikat alami
function catmullRomToSpline(points, tension = 0.8) {
  if (!points || points.length < 2) return "";
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : p2;

    const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension;
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension;

    const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension;
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export default function TimelineSection({ onOpenPhoto }) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, isDesktop: false });
  const [spiralPath, setSpiralPath] = useState("");
  const [activeNodes, setActiveNodes] = useState([]);
  const [revealedChapters, setRevealedChapters] = useState(["1"]);
  const [hoverLineInfo, setHoverLineInfo] = useState(null);
  const [ripples, setRipples] = useState([]);

  // Refs untuk Direct DOM Update & High Performance 60FPS Lerp Animation
  const whitePathRef = useRef(null);
  const redLineElRef = useRef(null);
  const redHeadElRef = useRef(null);

  const totalLengthRef = useRef(5000);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const activeNodesRef = useRef([]);
  const animFrameIdRef = useRef(null);
  const isLoopRunningRef = useRef(false);
  const nodeCentersRef = useRef([]);

  // Memicu ripple shockwave saat garis diklik
  const triggerRipple = (y) => {
    const id = Date.now() + Math.random();
    setRipples((prev) => [...prev.slice(-3), { id, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 900);
  };

  // Navigasi lompat langsung ke babak tertentu saat node atau garis diklik
  const scrollToChapter = (chapId) => {
    if (!containerRef.current) return;
    const targetRow = containerRef.current.querySelector(`[data-timeline-row][data-chapter-id="${chapId}"]`);
    if (targetRow) {
      const rect = targetRow.getBoundingClientRect();
      const nodeRelY = rect.top - containerRef.current.getBoundingClientRect().top + rect.height / 2;
      triggerRipple(nodeRelY);
      targetRow.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Update container dimensions on mount & window resize
  const updateSize = useCallback(() => {
    if (containerRef.current) {
      const w = containerRef.current.offsetWidth;
      const h = containerRef.current.offsetHeight;
      const isDesk = window.innerWidth >= 768;
      setDimensions((prev) => {
        if (prev.width === w && prev.height === h && prev.isDesktop === isDesk) return prev;
        return { width: w, height: h, isDesktop: isDesk };
      });
    }
  }, []);

  useEffect(() => {
    updateSize();
    window.addEventListener("resize", updateSize);

    // ResizeObserver memantau perubahan ukuran dinamis saat gambar selesai loading
    let ro = null;
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      ro = new ResizeObserver(() => {
        updateSize();
      });
      ro.observe(containerRef.current);
    }

    const t1 = setTimeout(updateSize, 200);
    const t2 = setTimeout(updateSize, 800);
    const t3 = setTimeout(updateSize, 1800);

    return () => {
      window.removeEventListener("resize", updateSize);
      if (ro) ro.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [updateSize]);

  // OBSERVER SCROLL REVEAL HALUS & SINEMATIK SAAT DISCROLL KE BAWAH (HP & DESKTOP)
  useEffect(() => {
    if (!containerRef.current) return;
    const rows = containerRef.current.querySelectorAll("[data-timeline-row]");
    if (!rows || rows.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-chapter-id");
            if (id) {
              setRevealedChapters((prev) => (prev.includes(id) ? prev : [...prev, id]));
            }
          }
        });
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.12,
      }
    );

    rows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, [dimensions.height]);

  // Generate kurva benang putih alami yang MENGIKAT KARTU saat discroll ke bawah
  useEffect(() => {
    if (!containerRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const rows = containerRef.current.querySelectorAll("[data-timeline-row]");
    const cX = dimensions.width / 2;
    const waypoints = [];

    rows.forEach((row, idx) => {
      const node = row.querySelector("[data-node]");
      const card = row.querySelector("[data-timeline-card]");
      if (!node || !card) return;

      const nodeRect = node.getBoundingClientRect();
      const nodeRelY = nodeRect.top - containerRect.top + nodeRect.height / 2;

      const tRect = card.getBoundingClientRect();
      const cLeft = tRect.left - containerRect.left;
      const cRight = cLeft + tRect.width;
      const cTop = tRect.top - containerRect.top;
      const cBottom = cTop + tRect.height;
      const cMidX = (cLeft + cRight) / 2;
      const cMidY = (cTop + cBottom) / 2;

      if (dimensions.isDesktop) {
        const isLeft = cMidX < cX;

        if (idx === 0) {
          // Titik mula benang turun dari atas
          waypoints.push({ x: cMidX + (isLeft ? -20 : 20), y: cTop - 30 });
        }

        if (isLeft) {
          // POLA MENGIKAT KARTU KIRI:
          // 1. Benang masuk dari atas menyilang ke sudut kiri luar
          waypoints.push({ x: cLeft - 18, y: cTop + 15 });
          // 2. Membalut dan mengikat sisi luar kartu ke bawah
          waypoints.push({ x: cLeft - 32, y: cMidY });
          // 3. Melingkar di bawah kartu membentuk ikatan tali
          waypoints.push({ x: cLeft - 12, y: cBottom + 18 });
          waypoints.push({ x: cMidX + 15, y: cBottom + 26 });
          waypoints.push({ x: cRight + 12, y: cBottom + 8 });
          // 4. Mengikat masuk ke node tengah sebagai simpul pengait
          waypoints.push({ x: cX - 16, y: nodeRelY + 12 });
        } else {
          // POLA MENGIKAT KARTU KANAN:
          // 1. Benang masuk dari atas menyilang ke sudut kanan luar
          waypoints.push({ x: cRight + 18, y: cTop + 15 });
          // 2. Membalut dan mengikat sisi luar kartu ke bawah
          waypoints.push({ x: cRight + 32, y: cMidY });
          // 3. Melingkar di bawah kartu membentuk ikatan tali
          waypoints.push({ x: cRight + 12, y: cBottom + 18 });
          waypoints.push({ x: cMidX - 15, y: cBottom + 26 });
          waypoints.push({ x: cLeft - 12, y: cBottom + 8 });
          // 4. Mengikat masuk ke node tengah sebagai simpul pengait
          waypoints.push({ x: cX + 16, y: nodeRelY + 12 });
        }
      } else {
        // POLA MENGIKAT KARTU PADA MOBILE:
        const swingDirection = idx % 2 === 0 ? -1 : 1;
        const outerX = swingDirection === -1 ? Math.max(14, cLeft - 20) : Math.min(dimensions.width - 14, cRight + 20);
        const innerX = swingDirection === -1 ? Math.min(dimensions.width - 14, cRight + 14) : Math.max(14, cLeft - 14);

        if (idx === 0) {
          waypoints.push({ x: cMidX, y: cTop - 25 });
        }

        // Benang melingkari sekeliling kartu tengah (mengikat dari luar lalu membalut ke bawah)
        waypoints.push({ x: outerX, y: cTop + 20 });
        waypoints.push({ x: outerX + (swingDirection * 12), y: cMidY });
        waypoints.push({ x: cMidX, y: cBottom + 24 });
        waypoints.push({ x: innerX, y: cBottom + 10 });
        waypoints.push({ x: cX + (swingDirection * -12), y: nodeRelY + 16 });
      }
    });

    if (waypoints.length > 1) {
      const pathD = catmullRomToSpline(waypoints, 0.8);
      setSpiralPath(pathD);
    }
  }, [dimensions]);

  // Hitung total panjang spiral path benang putih saat path berubah
  useEffect(() => {
    if (whitePathRef.current) {
      try {
        const len = whitePathRef.current.getTotalLength();
        if (len > 0) {
          totalLengthRef.current = len;
          whitePathRef.current.style.strokeDasharray = `${len}`;
          whitePathRef.current.style.strokeDashoffset = `${len * (1 - currentProgressRef.current)}`;
        }
      } catch (e) {
        totalLengthRef.current = dimensions.height * 2.8;
      }
    }
  }, [spiralPath, dimensions.height]);

  // ENGINE LERP 60FPS / 120FPS DENGAN CACHED MILESTONE (ZERO LAYOUT THRASHING)
  useEffect(() => {
    let isRunning = true;

    // Cache posisi Y setiap milestone sekali saja (Zero Layout Thrashing)
    const cacheNodePositions = () => {
      if (!containerRef.current) return;
      const cRect = containerRef.current.getBoundingClientRect();
      const nodes = containerRef.current.querySelectorAll("[data-node]");
      const list = [];
      nodes.forEach((node) => {
        const nRect = node.getBoundingClientRect();
        list.push({
          id: node.getAttribute("data-node"),
          y: nRect.top - cRect.top + nRect.height / 2,
        });
      });
      nodeCentersRef.current = list;
    };

    cacheNodePositions();

    // Loop animasi lerp halus berkesinambungan
    const renderLoop = () => {
      if (!isRunning) return;

      const target = targetProgressRef.current;
      const cur = currentProgressRef.current;
      const next = cur + (target - cur) * 0.16;
      const isSettled = Math.abs(target - next) < 0.0002;
      currentProgressRef.current = isSettled ? target : next;

      const progress = currentProgressRef.current;
      const containerH = containerRef.current ? containerRef.current.offsetHeight : dimensions.height;
      const currentY = containerH * progress;
      const isLineActive = progress > 0.002;

      // 1. Update Benang Putih Mengikat
      if (whitePathRef.current && totalLengthRef.current > 0) {
        const offset = totalLengthRef.current * (1 - progress);
        whitePathRef.current.style.strokeDashoffset = `${offset}`;
        whitePathRef.current.style.opacity = isLineActive ? "0.95" : "0";
      }

      // 2. Update Garis Merah Tengah
      if (redLineElRef.current) {
        redLineElRef.current.style.height = `${isLineActive ? currentY : 0}px`;
        redLineElRef.current.style.opacity = isLineActive ? "1" : "0";
      }

      // 3. Update Ujung Kepala Energi Merah Modern (Akselerasi GPU Hardware translate3d)
      if (redHeadElRef.current) {
        redHeadElRef.current.style.transform = `translate3d(-50%, ${currentY}px, 0)`;
        redHeadElRef.current.style.opacity = isLineActive ? "1" : "0";
      }

      // 4. Update Milestone Active State dari Cache (Komputasi 0 microsecond, bebas reflow)
      const centers = nodeCentersRef.current;
      if (centers && centers.length > 0) {
        const currentActive = [];
        for (let i = 0; i < centers.length; i++) {
          if (currentY >= centers[i].y - 20) {
            currentActive.push(centers[i].id);
          }
        }

        const prevActive = activeNodesRef.current;
        if (
          currentActive.length !== prevActive.length ||
          currentActive.some((id, i) => id !== prevActive[i])
        ) {
          activeNodesRef.current = currentActive;
          setActiveNodes(currentActive);
        }
      }

      // Jika pergerakan sudah berhenti sempurna, tidurkan loop untuk menghemat 100% baterai & CPU HP
      if (isSettled) {
        isLoopRunningRef.current = false;
        return;
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    // Scroll listener: merekam progress scroll linimasa langsung saat scroll ke bawah
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;
      
      const focalY = windowH * 0.65;
      const progressPx = focalY - rect.top;
      const totalPx = rect.height - windowH * 0.2;

      let ratio = totalPx > 0 ? progressPx / totalPx : 0;
      ratio = Math.max(0, Math.min(1, ratio));
      targetProgressRef.current = ratio;

      // Bangunkan render loop jika sedang istirahat
      if (!isLoopRunningRef.current) {
        isLoopRunningRef.current = true;
        animFrameIdRef.current = requestAnimationFrame(renderLoop);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      isRunning = false;
      isLoopRunningRef.current = false;
      window.removeEventListener("scroll", handleScroll);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [dimensions]);

  // LINE TENGAH: Selalu berada di tengah container
  const centerX = dimensions.width / 2;

  // Data 5 Babak Perjalanan
  const chapters = [
    {
      id: "1",
      tag: "Babak 01 • Langkah Awal",
      title: "Agnesh Juliasih, S.Pd.",
      desc: "Mengingat kembali hari-hari pertama menginjakkan kaki di dunia perkuliahan. Menyesuaikan diri dengan ritme jadwal baru, tugas kelompok, dan bertemu rekan-rekan baru yang bersama-sama memulai langkah menuju cita-cita.",
      badges: ["Semester Awal", "Adaptasi & Semangat Belajar"],
      image: "/image4.jpeg",
      reverse: false,
    },
    {
      id: "2",
      tag: "Babak 02 • Praktik Lapangan",
      title: "Agnesh Juliasih, S.Pd.",
      desc: "Momen berharga saat pertama kali berdiri di hadapan siswa di ruang kelas. Mengasah kesabaran, menyusun perangkat ajar, dan merasakan panggilan tanggung jawab nyata sebagai seorang calon guru.",
      badges: ["Pengabdian Pendidikan"],
      image: "/image2.jpeg",
      reverse: true,
    },
    {
      id: "3",
      tag: "Babak 03 • Masa Ujian & Riset",
      title: "Agnesh Juliasih, S.Pd.",
      desc: "Melewati fase riset, diskusi mendalam bersama dosen pembimbing, dan malam-malam penyusunan naskah hingga akhirnya dinyatakan lulus di hadapan dewan penguji dengan hasil yang memuaskan.",
      badges: ["Sidang Skripsi Selesai"],
      image: "/image5.jpeg",
      reverse: false,
    },
    {
      id: "4",
      tag: "Babak 04 • Puncak Kelulusan",
      title: "Agnesh Juliasih, S.Pd.",
      desc: "Akhirnya resmi menyandang gelar baru! Hari ini jadi saksi rasa bangga orang-orang terdekat yang selalu mendukungmu dari awal hingga sampai di panggung kelulusan ini.",
      badges: ["Sarjana Pendidikan", "Pencapaian Studi"],
      image: "/image3.jpeg",
      reverse: true,
    },
    {
      id: "5",
      tag: "Babak 05 • Langkah Berikutnya",
      title: "Agnesh Juliasih, S.Pd.",
      desc: "Selamat melangkah ke dunia nyata! Terus melangkah dengan percaya diri, nikmati setiap proses barunya, dan semoga sukses selalu menyertai jalanmu, Agnesh.",
      badges: ["Langkah Berikutnya"],
      image: "/image1.jpeg",
      reverse: false,
    },
  ];

  // Handle hover kursor di sepanjang garis tengah untuk deteksi babak terdekat
  const handleLineMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relY = e.clientY - rect.top;

    const rows = containerRef.current.querySelectorAll("[data-timeline-row]");
    let closest = null;
    let minDiff = Infinity;

    rows.forEach((row) => {
      const rRect = row.getBoundingClientRect();
      const rowMidY = rRect.top - rect.top + rRect.height / 2;
      const diff = Math.abs(relY - rowMidY);
      if (diff < minDiff) {
        minDiff = diff;
        const chapId = row.getAttribute("data-chapter-id");
        closest = chapters.find((c) => c.id === chapId);
      }
    });

    setHoverLineInfo({
      y: relY,
      chapter: closest,
    });
  };

  const handleLineMouseLeave = () => {
    setHoverLineInfo(null);
  };

  // Handle klik di jalur garis tengah untuk smooth scroll langsung ke titik tersebut
  const handleLineClick = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relY = e.clientY - rect.top;
    triggerRipple(relY);

    const targetScroll = window.scrollY + rect.top + relY - window.innerHeight / 2;
    window.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: "smooth",
    });
  };

  return (
    <section ref={containerRef} className="relative z-10 max-w-4xl mx-auto px-3 sm:px-6 pt-8 sm:pt-12 pb-36">
      {/* ── TRACK GARIS TENGAH LINIMASA (BERWARNA MERAH MENYALA AKTIF SAAT SCROLL KE BAWAH) ── */}
      <div className="absolute top-0 bottom-24 left-1/2 -translate-x-1/2 pointer-events-none z-0 w-[5px]">
        {/* Track Abu-Abu Dasar (Bagian Bawah yang Belum Tersentuh Scroll Tetap Abu-Abu) */}
        <div className="absolute inset-0 w-full bg-zinc-700/60 rounded-full" />

        {/* Garis Merah Menyala Aktif Mengalir ke Bawah Saat Scroll */}
        <div
          ref={redLineElRef}
          className="absolute top-0 left-0 right-0 w-full rounded-full transition-opacity duration-150"
          style={{
            height: "0px",
            opacity: 0,
            background: "linear-gradient(to bottom, #fb7185, #ef4444, #dc2626)",
            boxShadow: "0 0 14px #ef4444, 0 0 28px rgba(239, 68, 68, 0.8), 0 0 45px rgba(220, 38, 38, 0.5)",
          }}
        />

        {/* Ujung Kepala Energi Merah Menyala (Nexus Pulse Tip) */}
        <div
          ref={redHeadElRef}
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-150"
          style={{ opacity: 0 }}
        >
          <div className="relative flex items-center justify-center">
            {/* Gelombang Radar Merah */}
            <div className="absolute w-9 h-9 rounded-full bg-red-500/35 animate-ping" />
            {/* Cincin Berpendar Presisi */}
            <div className="w-5 h-5 rounded-full border-2 border-red-500 bg-red-950/90 shadow-[0_0_15px_#ef4444] animate-pulse" />
            {/* Titik Inti Cahaya Merah Modern */}
            <div className="absolute w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
          </div>
        </div>
      </div>

      {/* SVG LINIMASA: BENANG PUTIH MENGIKAT KARTU & EFEK GELOMBANG INTERAKTIF */}
      {dimensions.height > 0 && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        >
          <defs>
            {/* Bayangan Alami Benang Putih Mengikat */}
            <filter id="white-thread-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="rgba(0,0,0,0.55)" />
            </filter>
          </defs>

          {/* 1. Track Dasar Benang Putih Mengitari Kartu */}
          {spiralPath && (
            <path
              d={spiralPath}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1.2"
            />
          )}

          {/* 2. BENANG PUTIH YANG MENGIKAT KARTU KETIKA DISCROLL KE BAWAH */}
          {spiralPath && (
            <path
              ref={whitePathRef}
              d={spiralPath}
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#white-thread-shadow)"
              style={{
                opacity: 0.95,
                willChange: "stroke-dashoffset",
              }}
            />
          )}

          {/* 6. GELOMBANG RIPPLE SHOCKWAVE SAAT GARIS TENGAH DIKLIK */}
          {ripples.map((rip) => (
            <g key={rip.id} transform={`translate(${centerX}, ${rip.y})`}>
              <circle cx="0" cy="0" r="22" fill="none" stroke="#ef4444" strokeWidth="2.5" className="animate-ping" />
              <circle cx="0" cy="0" r="38" fill="none" stroke="#fbbf24" strokeWidth="1.5" className="animate-ping" style={{ animationDuration: "1.2s" }} />
            </g>
          ))}

          {/* 7. INDIKATOR KURSOR INTERAKTIF MENGIKUTI HOVER DI GARIS TENGAH */}
          {hoverLineInfo && (
            <g transform={`translate(${centerX}, ${hoverLineInfo.y})`} className="pointer-events-none transition-transform duration-75">
              <circle cx="0" cy="0" r="14" fill="rgba(239, 68, 68, 0.25)" className="animate-ping" />
              <circle cx="0" cy="0" r="8" fill="none" stroke="#ef4444" strokeWidth="2" className="animate-pulse" />
              <circle cx="0" cy="0" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
            </g>
          )}

          {/* 8. HIT AREA INTERAKTIF DI SEPANJANG GARIS TENGAH (SCRUBBING & CLICK-TO-JUMP) */}
          <rect
            x={centerX - 24}
            y={0}
            width={48}
            height={dimensions.height}
            fill="transparent"
            className="cursor-pointer"
            style={{ pointerEvents: "all" }}
            onMouseMove={handleLineMouseMove}
            onMouseLeave={handleLineMouseLeave}
            onClick={handleLineClick}
          />
        </svg>
      )}

      {/* FLOATING TOOLTIP BABAK SAAT HOVER DI JALUR GARIS TENGAH */}
      {hoverLineInfo && hoverLineInfo.chapter && (
        <div
          className="absolute z-30 pointer-events-none transition-all duration-75 ease-out hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-950/95 border border-red-500/80 text-white text-[11px] font-mono shadow-[0_0_25px_rgba(239,68,68,0.45)] backdrop-blur-md -translate-y-1/2 whitespace-nowrap"
          style={{
            left: `${centerX + 26}px`,
            top: `${hoverLineInfo.y}px`,
          }}
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="font-semibold text-zinc-100">{hoverLineInfo.chapter.tag}</span>
          <span className="text-[10px] text-red-400 font-sans tracking-wide">• Klik untuk lompat</span>
        </div>
      )}

      {/* Chapters Grid */}
      <div className="space-y-16 sm:space-y-20 md:space-y-24 relative z-10">
        {chapters.map((chap) => {
          const isActive = activeNodes.includes(chap.id);
          const isRevealed = revealedChapters.includes(chap.id);

          return (
            <div
              key={chap.id}
              data-timeline-row
              data-chapter-id={chap.id}
              className={`relative flex flex-col md:flex-row items-center gap-6 sm:gap-8 md:gap-12 transition-all duration-700 ${
                chap.reverse ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Milestone Node Badge (Tombol Interaktif Menuju Babak Ini) */}
              <button
                type="button"
                onClick={() => scrollToChapter(chap.id)}
                title={`Klik untuk melompat ke ${chap.tag}`}
                data-node={chap.id}
                className={`absolute left-1/2 -translate-x-1/2 top-0 md:top-1/2 md:-translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-xs tracking-wider z-20 cursor-pointer select-none transition-all duration-500 shadow-xl group hover:scale-125 hover:border-red-400 active:scale-95 ${
                  isRevealed ? "opacity-100 scale-100" : "opacity-0 scale-75"
                } ${
                  isActive
                    ? "bg-zinc-950/95 border-2 border-red-500 text-white scale-110 shadow-red-500/60 shadow-lg ring-4 ring-red-500/25"
                    : "bg-zinc-950/80 backdrop-blur-md border border-white/15 text-zinc-400 hover:text-white hover:border-white/40"
                }`}
              >
                <span>0{chap.id}</span>
                {/* Tooltip Mini Hover di Node */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex items-center px-2.5 py-1 rounded-md bg-zinc-950 border border-red-500/70 text-white text-[10px] font-mono whitespace-nowrap shadow-xl pointer-events-none">
                  Lompat ke Babak 0{chap.id}
                </div>
              </button>

              {/* Teks Card Grid (Animasi Smooth Slide Up Reveal) */}
              <div
                data-timeline-card
                className={`w-full md:w-1/2 pt-12 md:pt-0 transform-gpu transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isRevealed
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-10 scale-95"
                } ${
                  chap.reverse
                    ? "md:pl-10 text-center md:text-left"
                    : "md:pr-10 text-center md:text-right"
                }`}
              >
                <div
                  className={`bg-zinc-900/85 backdrop-blur-xl border rounded-2xl p-4 sm:p-5 md:p-6 transition-all duration-500 relative group overflow-hidden max-w-sm sm:max-w-md mx-auto md:max-w-none ${
                    isActive
                      ? "border-red-500/60 shadow-[0_12px_35px_-8px_rgba(239,68,68,0.35)] -translate-y-1.5 ring-1 ring-red-500/35 bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-950/95"
                      : "border-white/10 opacity-80 translate-y-0"
                  }`}
                >
                  <div
                    className={`flex items-center gap-1.5 mb-1 ${
                      chap.reverse
                        ? "justify-center md:justify-start"
                        : "justify-center md:justify-end"
                    }`}
                  >
                    <span className="text-[10px] font-bold tracking-widest text-rose-400 uppercase">
                      {chap.tag}
                    </span>
                    {isActive && <Sparkles className="w-3 h-3 text-rose-400 animate-pulse" />}
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mt-0.5">{chap.title}</h3>
                  <p className="text-xs text-zinc-300 mt-2 leading-relaxed">{chap.desc}</p>
                  <div
                    className={`mt-3.5 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2 text-[10px] text-zinc-400 font-medium ${
                      chap.reverse
                        ? "justify-center md:justify-start"
                        : "justify-center md:justify-end"
                    }`}
                  >
                    {chap.badges.map((b, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Foto Card Grid (Animasi Smooth Float Up dengan Stagger Delay) */}
              <div
                data-timeline-photo
                className={`w-full md:w-1/2 transform-gpu transition-all duration-700 delay-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isRevealed
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-12 scale-95"
                } ${
                  chap.reverse ? "md:pr-10" : "md:pl-10"
                }`}
              >
                <div
                  onClick={() => onOpenPhoto(chap.image, chap.title)}
                  className={`cursor-pointer rounded-2xl overflow-hidden p-2 bg-zinc-950/90 border transition-all duration-500 group max-w-sm sm:max-w-md mx-auto md:max-w-none ${
                    isActive
                      ? "border-red-500/50 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.85),0_0_20px_rgba(239,68,68,0.2)] -translate-y-1.5 ring-1 ring-red-500/25"
                      : "border-white/10 opacity-80 translate-y-0"
                  }`}
                >
                  <div className="w-full max-w-[260px] sm:max-w-[300px] md:max-w-[340px] mx-auto aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 relative">
                    <img
                      src={chap.image}
                      alt={chap.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <span className="text-[10px] sm:text-[11px] text-white/95 font-medium tracking-wide">
                        Klik untuk memperbesar foto
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
