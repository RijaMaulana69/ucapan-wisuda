"use client";

export default function LetterCard({ onClose }) {
  return (
    <div className="w-full max-w-[540px] mx-auto text-left select-text flex flex-col items-center">
      {/* LEMBARAN KERTAS CATATAN BERGARIS */}
      <div className="relative w-full rounded-2xl bg-[#fdfcf7] text-stone-900 shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(244,63,94,0.12)] border border-[#e5dcce] px-4 py-4 sm:px-8 sm:py-6 overflow-hidden transition-all duration-300 max-h-[80vh] sm:max-h-[85vh] flex flex-col justify-between">
        
        {/* TEKSTUR GARIS BUKU CATATAN HORIZONTAL */}
        <div
          className="absolute inset-0 pointer-events-none opacity-85"
          style={{
            backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, rgba(148, 163, 184, 0.22) 27px, rgba(148, 163, 184, 0.22) 28px)",
            backgroundPosition: "0 30px",
          }}
        />

        {/* GARIS MARGIN VERTIKAL BUKU CATATAN */}
        <div className="absolute top-0 bottom-0 left-7 sm:left-10 w-[1.5px] bg-rose-400/40 pointer-events-none" />

        {/* LUBANG PERFORASI BINDER KERTAS (KIRI BUKU) */}
        <div className="absolute top-0 bottom-0 left-2 sm:left-3 flex flex-col justify-around py-8 pointer-events-none">
          <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-stone-300/60 shadow-inner" />
          <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-stone-300/60 shadow-inner" />
          <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-stone-300/60 shadow-inner" />
        </div>

        {/* KONTEN SURAT DALAM MARGIN BUKU */}
        <div
          className="relative z-10 pl-5 sm:pl-8 pr-1 overflow-y-auto max-h-[calc(80vh-40px)] sm:max-h-[calc(85vh-45px)]"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {/* NAMA PENERIMA SURAT */}
          <div className="mb-3 pt-1">
            <h2 className="font-serifTitle text-lg sm:text-2xl font-bold text-stone-950 tracking-tight leading-snug">
              Agnesh Juliasih, S.Pd. 🎓
            </h2>
          </div>

          {/* ISI SURAT TULISAN TANGAN */}
          <div className="font-kalam text-[14px] sm:text-[16.5px] text-stone-800 leading-[28px] sm:leading-[30px] space-y-3 sm:space-y-4 text-justify select-text pb-2">
            <p className="indent-5 sm:indent-8">
              Selamat ya, Agnesh, atas gelar S.Pd.-nya. Ikut senang akhirnya kamu sampai di tahap ini. Proses kuliah sampai skripsi pasti nggak gampang, dan kamu berhasil melewatinya.
            </p>

            <p className="indent-5 sm:indent-8">
              Semoga ilmu yang sudah dipelajari bisa kepakai dengan baik ke depannya, dan semoga urusan setelah ini dilancarkan. Sukses terus ya.
            </p>
          </div>
        </div>

      </div>

      {/* KLIK TUTUP SURAT HANYA TEKS MINIMALIS */}
      {onClose && (
        <div className="w-full pt-3.5 pb-1 flex justify-center">
          <button
            onClick={onClose}
            className="text-xs sm:text-sm font-light text-zinc-400 hover:text-white active:scale-95 transition-all cursor-pointer tracking-widest uppercase hover:underline underline-offset-8 select-none py-1.5 px-4"
          >
            Tutup Surat
          </button>
        </div>
      )}
    </div>
  );
}
