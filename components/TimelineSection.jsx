"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Sparkles } from "lucide-react";

// Algoritma Catmull-Rom Spline ke Cubic Bezier untuk lekukan benang yang luwes dan alami
function catmullRomToSpline(points, tension = 0.7) {
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

  // Direct DOM Refs untuk rendering 60/120 FPS tanpa lag di HP
  const whitePathRef = useRef(null);
  const redLineElRef = useRef(null);
  const redHeadElRef = useRef(null);

  const totalLengthRef = useRef(5000);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const activeNodesRef = useRef([]);
  const animFrameIdRef = useRef(null);
  const isTickingRef = useRef(false);
  const nodeCentersRef = useRef([]);
  
  // Cache posisi container untuk 0ns layout queries saat scroll (mencegah Layout Thrashing di HP)
  const containerMetricsRef = useRef({ top: 0, height: 0, isDesktop: false, spineX: 32 });

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
      const nodeRelY = rect.top - containerRef.current.getBoundingClientRect().top + 24;
      triggerRipple(nodeRelY);
      targetRow.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Cache posisi node dan ukuran container
  const updateSize = useCallback(() => {
    if (!containerRef.current) return;
    const w = containerRef.current.offsetWidth;
    const h = containerRef.current.offsetHeight;
    const isDesk = window.innerWidth >= 768;
    const spineX = isDesk ? w / 2 : (window.innerWidth < 640 ? 24 : 32);

    const cRect = containerRef.current.getBoundingClientRect();
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    containerMetricsRef.current = {
      top: cRect.top + scrollY,
      height: h,
      width: w,
      isDesktop: isDesk,
      spineX,
    };

    // Cache node milestones Y
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

    setDimensions((prev) => {
      if (prev.width === w && prev.height === h && prev.isDesktop === isDesk) return prev;
      return { width: w, height: h, isDesktop: isDesk };
    });
  }, []);

  useEffect(() => {
    updateSize();
    window.addEventListener("resize", updateSize);

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

  // Observer Scroll Reveal halus & modern
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
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.1,
      }
    );

    rows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, [dimensions.height]);

  // Kalkulasi Kurva Benang Putih (Desktop = Zigzag mengikat, Mobile = Mengalir anggun di sepanjang garis kiri)
  useEffect(() => {
    if (!containerRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const rows = containerRef.current.querySelectorAll("[data-timeline-row]");
    const isDesk = dimensions.isDesktop;
    const cX = isDesk ? dimensions.width / 2 : containerMetricsRef.current.spineX;
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

      if (isDesk) {
        const isLeft = cMidX < cX;

        if (idx === 0) {
          waypoints.push({ x: cMidX + (isLeft ? -20 : 20), y: cTop - 30 });
        }

        if (isLeft) {
          waypoints.push({ x: cLeft - 18, y: cTop + 15 });
          waypoints.push({ x: cLeft - 32, y: cMidY });
          waypoints.push({ x: cLeft - 12, y: cBottom + 18 });
          waypoints.push({ x: cMidX + 15, y: cBottom + 26 });
          waypoints.push({ x: cRight + 12, y: cBottom + 8 });
          waypoints.push({ x: cX - 16, y: nodeRelY + 12 });
        } else {
          waypoints.push({ x: cRight + 18, y: cTop + 15 });
          waypoints.push({ x: cRight + 32, y: cMidY });
          waypoints.push({ x: cRight + 12, y: cBottom + 18 });
          waypoints.push({ x: cMidX - 15, y: cBottom + 26 });
          waypoints.push({ x: cLeft - 12, y: cBottom + 8 });
          waypoints.push({ x: cX + 16, y: nodeRelY + 12 });
        }
      } else {
        // MOBILE SPLINE: Mengalir anggun di sisi kiri tanpa zig-zag ekstrem yang membuat lag
        if (idx === 0) {
          waypoints.push({ x: cX, y: Math.max(0, nodeRelY - 35) });
        }

        // 1. Melewati node milestone
        waypoints.push({ x: cX, y: nodeRelY });
        // 2. Melengkung halus merangkul tepi kartu
        waypoints.push({ x: cX + 14, y: nodeRelY + 30 });
        // 3. Mengalir lembut di samping kartu
        waypoints.push({ x: cX + 8, y: cMidY });
        // 4. Menutup lengkungan di bawah kartu menuju node berikutnya
        waypoints.push({ x: cX, y: cBottom + 18 });
      }
    });

    if (waypoints.length > 1) {
      const tension = isDesk ? 0.75 : 0.6;
      const pathD = catmullRomToSpline(waypoints, tension);
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
        totalLengthRef.current = dimensions.height * 2.5;
      }
    }
  }, [spiralPath, dimensions.height]);

  // HIGH PERFORMANCE HARDWARE ACCELERATED RENDER LOOP (ZERO LAYOUT REFLOW)
  useEffect(() => {
    let isRunning = true;

    const updateVisuals = (progress) => {
      const metrics = containerMetricsRef.current;
      const containerH = metrics.height || (containerRef.current ? containerRef.current.offsetHeight : dimensions.height);
      const currentY = containerH * progress;
      const isLineActive = progress > 0.001;

      // 1. Update Benang Putih Mengikat (Zero Latency Direct DOM Style)
      if (whitePathRef.current && totalLengthRef.current > 0) {
        const offset = totalLengthRef.current * (1 - progress);
        whitePathRef.current.style.strokeDashoffset = `${offset}`;
        whitePathRef.current.style.opacity = isLineActive ? "0.95" : "0";
      }

      // 2. Update Garis Merah Menyala (Direct GPU height & opacity)
      if (redLineElRef.current) {
        redLineElRef.current.style.height = `${isLineActive ? currentY : 0}px`;
        redLineElRef.current.style.opacity = isLineActive ? "1" : "0";
      }

      // 3. Update Kepala Laser Merah (Transform3d GPU Composite)
      if (redHeadElRef.current) {
        redHeadElRef.current.style.transform = `translate3d(-50%, ${currentY}px, 0)`;
        redHeadElRef.current.style.opacity = isLineActive ? "1" : "0";
      }

      // 4. Update Milestone Active State
      const centers = nodeCentersRef.current;
      if (centers && centers.length > 0) {
        const currentActive = [];
        for (let i = 0; i < centers.length; i++) {
          if (currentY >= centers[i].y - 25) {
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
    };

    // Fungsi Render Frame yang sinkron dengan display refresh rate
    const renderFrame = () => {
      if (!isRunning) return;
      isTickingRef.current = false;

      const target = targetProgressRef.current;
      const cur = currentProgressRef.current;
      const isMobile = !containerMetricsRef.current.isDesktop;

      // Di HP: respon seketika (1:1 instan) agar garis TIDAK PERNAH tertinggal saat scrolling!
      // Di Desktop: lerp halus 0.35 untuk nuansa sinematik
      if (isMobile) {
        currentProgressRef.current = target;
        updateVisuals(target);
      } else {
        const next = cur + (target - cur) * 0.35;
        const isSettled = Math.abs(target - next) < 0.0005;
        currentProgressRef.current = isSettled ? target : next;
        updateVisuals(currentProgressRef.current);

        if (!isSettled) {
          isTickingRef.current = true;
          animFrameIdRef.current = requestAnimationFrame(renderFrame);
        }
      }
    };

    // Scroll Handler MURNI: 0 Mikrodetik, TIDAK PERNAH memanggil getBoundingClientRect() saat scroll!
    const handleScroll = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const metrics = containerMetricsRef.current;
      if (!metrics || metrics.height === 0) return;

      const windowH = window.innerHeight;
      // Titik pemicu fokus (55% di mobile untuk respon cepat seketika)
      const focalY = scrollY + (metrics.isDesktop ? windowH * 0.65 : windowH * 0.55);
      const progressPx = focalY - metrics.top;
      const totalPx = metrics.height - (metrics.isDesktop ? windowH * 0.2 : windowH * 0.1);

      let ratio = totalPx > 0 ? progressPx / totalPx : 0;
      ratio = Math.max(0, Math.min(1, ratio));
      targetProgressRef.current = ratio;

      if (!isTickingRef.current) {
        isTickingRef.current = true;
        animFrameIdRef.current = requestAnimationFrame(renderFrame);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Panggil sekali untuk sinkronisasi posisi awal
    handleScroll();

    return () => {
      isRunning = false;
      window.removeEventListener("scroll", handleScroll);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [dimensions]);

  const spineX = dimensions.isDesktop ? dimensions.width / 2 : containerMetricsRef.current.spineX;

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

  // Handle hover di sepanjang garis tengah untuk deteksi babak terdekat (Desktop)
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

  // Handle klik di jalur garis untuk navigasi instan
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
    <section ref={containerRef} className="relative z-10 max-w-4xl mx-auto px-3 sm:px-6 pt-6 sm:pt-12 pb-36">
      {/* ── TRACK GARIS VERTIKAL LINIMASA (RESPONSIF: KIRI DI MOBILE, TENGAH DI DESKTOP) ── */}
      <div
        className="absolute top-0 bottom-24 left-[24px] sm:left-[32px] md:left-1/2 -translate-x-1/2 pointer-events-none z-0 w-[4px] sm:w-[5px]"
      >
        {/* Track Abu-Abu Dasar */}
        <div className="absolute inset-0 w-full bg-zinc-800/80 rounded-full" />

        {/* Garis Merah Menyala Aktif Mengalir ke Bawah Mengikuti Scroll Real-Time */}
        <div
          ref={redLineElRef}
          className="absolute top-0 left-0 right-0 w-full rounded-full transition-opacity duration-150"
          style={{
            height: "0px",
            opacity: 0,
            background: "linear-gradient(to bottom, #fb7185, #ef4444, #dc2626)",
            boxShadow: "0 0 12px #ef4444, 0 0 24px rgba(239, 68, 68, 0.75)",
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
            <div className="absolute w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-red-500/40 animate-ping" />
            {/* Cincin Berpendar Presisi */}
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-red-500 bg-red-950/90 shadow-[0_0_12px_#ef4444] animate-pulse" />
            {/* Titik Inti Cahaya Putih */}
            <div className="absolute w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
          </div>
        </div>
      </div>

      {/* SVG LINIMASA: BENANG PUTIH MENGIKAT KARTU & EFEK GELOMBANG INTERAKTIF */}
      {dimensions.height > 0 && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        >
          {/* Track Dasar Benang Putih */}
          {spiralPath && (
            <path
              d={spiralPath}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1.2"
            />
          )}

          {/* Benang Putih Mengikat Kartu saat Discroll (GPU Accelerated) */}
          {spiralPath && (
            <path
              ref={whitePathRef}
              d={spiralPath}
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                opacity: 0.95,
                willChange: "stroke-dashoffset",
              }}
            />
          )}

          {/* Gelombang Ripple Shockwave */}
          {ripples.map((rip) => (
            <g key={rip.id} transform={`translate(${spineX}, ${rip.y})`}>
              <circle cx="0" cy="0" r="20" fill="none" stroke="#ef4444" strokeWidth="2.5" className="animate-ping" />
              <circle cx="0" cy="0" r="34" fill="none" stroke="#fbbf24" strokeWidth="1.5" className="animate-ping" style={{ animationDuration: "1.2s" }} />
            </g>
          ))}

          {/* Indikator Hover Interaktif (Desktop) */}
          {hoverLineInfo && dimensions.isDesktop && (
            <g transform={`translate(${spineX}, ${hoverLineInfo.y})`} className="pointer-events-none transition-transform duration-75">
              <circle cx="0" cy="0" r="14" fill="rgba(239, 68, 68, 0.25)" className="animate-ping" />
              <circle cx="0" cy="0" r="8" fill="none" stroke="#ef4444" strokeWidth="2" className="animate-pulse" />
              <circle cx="0" cy="0" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
            </g>
          )}

          {/* Hit Area Interaktif Sepanjang Garis */}
          <rect
            x={spineX - 22}
            y={0}
            width={44}
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

      {/* Floating Tooltip Babak saat Hover (Desktop) */}
      {hoverLineInfo && hoverLineInfo.chapter && dimensions.isDesktop && (
        <div
          className="absolute z-30 pointer-events-none transition-all duration-75 ease-out hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-950/95 border border-red-500/80 text-white text-[11px] font-mono shadow-[0_0_25px_rgba(239,68,68,0.45)] backdrop-blur-md -translate-y-1/2 whitespace-nowrap"
          style={{
            left: `${spineX + 26}px`,
            top: `${hoverLineInfo.y}px`,
          }}
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="font-semibold text-zinc-100">{hoverLineInfo.chapter.tag}</span>
          <span className="text-[10px] text-red-400 font-sans tracking-wide">• Klik untuk lompat</span>
        </div>
      )}

      {/* Chapters List */}
      <div className="space-y-12 sm:space-y-16 md:space-y-24 relative z-10">
        {chapters.map((chap) => {
          const isActive = activeNodes.includes(chap.id);
          const isRevealed = revealedChapters.includes(chap.id);

          return (
            <div
              key={chap.id}
              data-timeline-row
              data-chapter-id={chap.id}
              className={`relative w-full transition-all duration-500 ${
                chap.reverse ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Milestone Node Badge (Tombol Bulat 01, 02, dst. - Menempel Presisi di Garis) */}
              <button
                type="button"
                onClick={() => scrollToChapter(chap.id)}
                title={`Klik untuk melompat ke ${chap.tag}`}
                data-node={chap.id}
                className={`absolute left-[24px] sm:left-[32px] md:left-1/2 -translate-x-1/2 top-0 md:top-1/2 md:-translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm tracking-wider z-20 cursor-pointer select-none transform-gpu transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl group hover:scale-125 hover:border-red-400 active:scale-95 ${
                  isRevealed ? "opacity-100 scale-100" : "opacity-0 scale-75"
                } ${
                  isActive
                    ? "bg-zinc-950 border-2 border-red-500 text-white scale-110 shadow-red-500/60 shadow-lg ring-4 ring-red-500/25"
                    : "bg-zinc-950/90 backdrop-blur-xl border border-white/20 text-zinc-400 hover:text-white hover:border-white/40"
                }`}
              >
                <span>0{chap.id}</span>
                {/* Tooltip Mini Hover di Node */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden md:group-hover:flex items-center px-2.5 py-1 rounded-md bg-zinc-950 border border-red-500/70 text-white text-[10px] font-mono whitespace-nowrap shadow-xl pointer-events-none">
                  Lompat ke Babak 0{chap.id}
                </div>
              </button>

              {/* Konten Kartu Babak: Di Mobile tampil luas di kanan garis (pl-14/pl-16), di Desktop simetris */}
              <div
                className={`pl-14 sm:pl-16 md:pl-0 w-full flex flex-col md:flex-row items-center gap-4 sm:gap-6 md:gap-12 ${
                  chap.reverse ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Teks Card Grid (Animasi Smooth Slide Up GPU Composite Murni dengan Clean Glass Blur) */}
                <div
                  data-timeline-card
                  className={`w-full md:w-1/2 transform-gpu transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isRevealed
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 translate-y-6 scale-[0.98]"
                  } ${
                    chap.reverse
                      ? "md:pl-10 text-left"
                      : "md:pr-10 text-left md:text-right"
                  }`}
                >
                  <div
                    className={`bg-zinc-900/80 backdrop-blur-xl border rounded-2xl p-4 sm:p-5 md:p-6 transition-all duration-400 relative group overflow-hidden max-w-none ${
                      isActive
                        ? "border-red-500/60 shadow-[0_10px_30px_-6px_rgba(239,68,68,0.35)] -translate-y-1 ring-1 ring-red-500/35 bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-950/95"
                        : "border-white/10 opacity-85 translate-y-0"
                    }`}
                  >
                    <div
                      className={`flex items-center gap-1.5 mb-1 ${
                        chap.reverse
                          ? "justify-start"
                          : "justify-start md:justify-end"
                      }`}
                    >
                      <span className="text-[10px] sm:text-xs font-bold tracking-widest text-rose-400 uppercase">
                        {chap.tag}
                      </span>
                      {isActive && <Sparkles className="w-3 h-3 text-rose-400 animate-pulse" />}
                    </div>
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mt-0.5">{chap.title}</h3>
                    <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">{chap.desc}</p>
                    <div
                      className={`mt-3.5 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2 text-[10px] text-zinc-400 font-medium ${
                        chap.reverse
                          ? "justify-start"
                          : "justify-start md:justify-end"
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

                {/* Foto Card Grid (Animasi Smooth Float Up GPU Composite Murni) */}
                <div
                  data-timeline-photo
                  className={`w-full md:w-1/2 transform-gpu transition-all duration-600 delay-75 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isRevealed
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 translate-y-8 scale-[0.98]"
                  } ${
                    chap.reverse ? "md:pr-10" : "md:pl-10"
                  }`}
                >
                  <div
                    onClick={() => onOpenPhoto(chap.image, chap.title)}
                    className={`cursor-pointer rounded-2xl overflow-hidden p-1.5 sm:p-2 bg-zinc-950/90 border transition-all duration-400 group max-w-[280px] sm:max-w-[320px] md:max-w-[340px] md:mx-auto ${
                      isActive
                        ? "border-red-500/50 shadow-[0_12px_35px_-8px_rgba(0,0,0,0.85),0_0_20px_rgba(239,68,68,0.2)] -translate-y-1 ring-1 ring-red-500/25"
                        : "border-white/10 opacity-85 translate-y-0"
                    }`}
                  >
                    <div className="w-full aspect-[4/5] sm:aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 relative">
                      <img
                        src={chap.image}
                        alt={chap.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <span className="text-[10px] sm:text-[11px] text-white/95 font-medium tracking-wide">
                          Ketuk untuk memperbesar foto
                        </span>
                      </div>
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
