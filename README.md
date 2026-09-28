# 🎓 The Graduation Journey — Agnesh Juliasih, S.Pd.

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Status](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge)

<p align="center">
  Sebuah karya web interaktif dan memorabilia digital persembahan wisuda atas diraihnya gelar <b>Sarjana Pendidikan (S.Pd.)</b> oleh <b>Agnesh Juliasih</b>.
</p>

</div>

---

## ✨ Fitur Utama

- ⏳ **Interactive Cinematic Intro**:
  - Countdown estetik berukuran besar dengan transisi fade halus.
  - Sapaan nama wisudawati dengan tipografi anggun.
  - Interaksi pembukaan amplop 3D lengkap dengan segel lilin (_wax seal_) dan efek letupan _confetti_.

- 📜 **Ruled Notebook Graduation Letter**:
  - Tampilan kertas surat bergaris otentik dengan font tulisan tangan (_Kalam_ & _Caveat_).
  - Pesan apresiasi tulus dan personal atas kelulusan dan perjuangan studi.
  - Modal baca ulang surat yang dapat diakses kapan saja dari halaman utama.

- 🧵 **Curved Silk Thread & Dynamic Nexus Timeline**:
  - Garis energi linimasa interaktif yang tersinkronisasi presisi 60 FPS dengan pergerakan _scroll_ halaman.
  - 5 babak perjalanan studi dari langkah awal kuliah, praktik mengajar, sidang skripsi, momen pemindahan toga, hingga langkah menuju masa depan.
  - Desain _card_ foto interaktif dengan efek _hover shockwave_ dan fitur pratinjau resolusi penuh (_lightbox modal_).

- 🎵 **Floating Music Player (Vinyl Disc Animation)**:
  - Pemutar musik bertema _You're On Your Own, Kid_ oleh Taylor Swift.
  - Mendukung mode _expanded_ (tampilan album art & kontrol audio) dan mode _minimized_ (piringan vinil berputar estetik di pojok layar).
  - Dilengkapi _interactive progress scrubber_, pengatur waktu audio, dan tombol apresiasi.

- 🌌 **Starry Sky Atmosphere**:
  - Latar belakang kanvas bintang malam yang berkerlip dinamis dan menenangkan.

---

## 🛠️ Teknologi yang Digunakan

| Komponen           | Teknologi                                                        |
| :----------------- | :--------------------------------------------------------------- |
| **Framework**      | [Next.js 15 (App Router)](https://nextjs.org/)                   |
| **Library UI**     | [React 19](https://react.dev/)                                   |
| **Styling**        | [Tailwind CSS](https://tailwindcss.com/)                         |
| **Icons**          | [Lucide React](https://lucide.dev/)                              |
| **Visual Effects** | [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) |
| **Typography**     | Plus Jakarta Sans, Playfair Display, Kalam, Caveat               |

---

## 🚀 Menjalankan Secara Lokal

Pastikan Anda telah menginstal [Node.js](https://nodejs.org/) di komputer Anda.

1. **Clone repository ini:**

   ```bash
   git clone https://github.com/USERNAME-ANDA/NAMA-REPO.git
   cd NAMA-REPO
   ```

2. **Pasang seluruh dependensi:**

   ```bash
   npm install
   ```

3. **Jalankan server pengembangan (Development):**

   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000) di peramban Anda.

4. **Atau jalankan versi produksi (Production Build):**
   ```bash
   npm run build
   npm run start
   ```

---

## 📂 Struktur Direktori

```text
├── app/
│   ├── globals.css          # Styling global & animasi kustom
│   ├── icon.svg             # Favicon toga wisuda
│   ├── layout.js            # Konfigurasi font & metadata
│   └── page.js              # Halaman utama aplikasi
├── components/
│   ├── BackgroundStars.jsx  # Efek kanvas taburan bintang
│   ├── IntroSequence.jsx    # Sequence pembuka, countdown & amplop
│   ├── LetterCard.jsx       # Desain kartu surat kertas catatan
│   ├── MusicPlayer.jsx      # Pemutar musik vinil mengambang
│   └── TimelineSection.jsx  # Linimasa perjalanan berlekuk halus
├── public/
│   ├── favicon.ico          # Ikon browser
│   ├── image1.jpeg - 5.jpeg # Dokumentasi momen foto wisuda
│   ├── Taylor Swift.jpg     # Cover album pemutar musik
│   └── Taylor Swift.mp3     # Lagu pengiring
└── README.md
```

---
