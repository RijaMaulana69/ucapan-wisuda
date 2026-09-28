"use client";

import { useEffect, useRef } from "react";

export default function BackgroundStars() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = window.innerWidth;
    let height = window.innerHeight;

    const setupCanvasSize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    setupCanvasSize();

    const handleResize = () => {
      setupCanvasSize();
    };

    window.addEventListener("resize", handleResize);

    // 1. Floating Aurora Blobs (Dinamis, bergerak hidup & berubah warna halus)
    const auroraBlobs = [
      { x: width * 0.25, y: height * 0.25, r: 350, color: "rgba(225, 29, 72, 0.08)", vx: 0.3, vy: 0.18 },
      { x: width * 0.75, y: height * 0.45, r: 420, color: "rgba(168, 85, 247, 0.06)", vx: -0.22, vy: 0.25 },
      { x: width * 0.4, y: height * 0.75, r: 380, color: "rgba(239, 68, 68, 0.07)", vx: 0.18, vy: -0.25 },
      { x: width * 0.85, y: height * 0.85, r: 300, color: "rgba(244, 63, 94, 0.06)", vx: -0.25, vy: -0.18 },
    ];

    // 2. Sparkling Stars (Bintang berkelip tajam & lembut)
    const stars = Array.from({ length: 65 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.4,
      alpha: Math.random() * 0.8 + 0.1,
      speed: Math.random() * 0.02 + 0.008,
      direction: Math.random() > 0.5 ? 1 : -1,
      isGold: Math.random() > 0.7,
    }));

    // 3. Floating Confetti / Firefly Embers (Butiran cahaya naik ke atas melayang hidup)
    const embers = Array.from({ length: 26 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.8,
      speedY: Math.random() * 0.5 + 0.2,
      speedX: (Math.random() - 0.5) * 0.35,
      opacity: Math.random() * 0.6 + 0.25,
      color: Math.random() > 0.5 ? "251, 191, 36" : "244, 63, 94", // amber / rose
      wobble: Math.random() * Math.PI * 2,
    }));

    // 4. Shooting Stars (Komet jatuh sesekali melintas anggun)
    let shootingStar = null;
    let nextShootingStarTime = Date.now() + Math.random() * 3000 + 2000;

    let frameCount = 0;

    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, width, height);

      // --- Gambar Aurora Background yang Hidup ---
      auroraBlobs.forEach((blob) => {
        blob.x += blob.vx;
        blob.y += blob.vy;

        if (blob.x < -150 || blob.x > width + 150) blob.vx *= -1;
        if (blob.y < -150 || blob.y > height + 150) blob.vy *= -1;

        const grad = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r);
        grad.addColorStop(0, blob.color);
        grad.addColorStop(1, "transparent");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // --- Gambar Bintang Berkelip ---
      stars.forEach((star) => {
        star.alpha += star.speed * star.direction;
        if (star.alpha > 0.95 || star.alpha < 0.1) {
          star.direction *= -1;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.isGold
          ? `rgba(251, 191, 36, ${Math.max(0, star.alpha * 0.9)})`
          : `rgba(255, 255, 255, ${Math.max(0, star.alpha)})`;
        ctx.fill();
      });

      // --- Gambar Embers Cahaya Melayang Naik (Fireflies / Stardust) dengan GPU Halo Murni ---
      embers.forEach((ember) => {
        ember.y -= ember.speedY;
        ember.wobble += 0.02;
        ember.x += Math.sin(ember.wobble) * 0.5 + ember.speedX;

        // Reset jika keluar dari layar atas
        if (ember.y < -20) {
          ember.y = height + 20;
          ember.x = Math.random() * width;
        }

        // Halo luar bercahaya lembut (Akselerasi GPU murni tanpa beban shadowBlur)
        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.size * 2.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ember.color}, ${ember.opacity * 0.28})`;
        ctx.fill();

        // Inti titik berkilau tajam
        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ember.color}, ${ember.opacity})`;
        ctx.fill();
      });

      // --- Komet / Shooting Star Melintas ---
      const now = Date.now();
      if (!shootingStar && now > nextShootingStarTime) {
        shootingStar = {
          x: Math.random() * (width * 0.8) + width * 0.1,
          y: Math.random() * (height * 0.4),
          length: Math.random() * 80 + 50,
          speed: Math.random() * 6 + 6,
          angle: (Math.PI / 4) + (Math.random() - 0.5) * 0.2,
          alpha: 1,
        };
      }

      if (shootingStar) {
        const tailX = shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length;
        const tailY = shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length;

        const grad = ctx.createLinearGradient(tailX, tailY, shootingStar.x, shootingStar.y);
        grad.addColorStop(0, "rgba(255, 255, 255, 0)");
        grad.addColorStop(1, `rgba(255, 255, 255, ${shootingStar.alpha})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(shootingStar.x, shootingStar.y);
        ctx.stroke();

        shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
        shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;
        shootingStar.alpha -= 0.02;

        if (shootingStar.alpha <= 0 || shootingStar.x > width + 100 || shootingStar.y > height + 100) {
          shootingStar = null;
          nextShootingStarTime = now + Math.random() * 5000 + 3000;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}
