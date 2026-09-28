import "./globals.css";
import { Plus_Jakarta_Sans, Playfair_Display, Kalam, Caveat } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const kalam = Kalam({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-kalam",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata = {
  title: "The Graduation Journey — Agnesh Juliasih, S.Pd.",
  description: "Tribute wisuda kelulusan Agnesh Juliasih, S.Pd.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`scroll-smooth ${jakarta.variable} ${playfair.variable} ${kalam.variable} ${caveat.variable}`}>
      <body className="bg-[#090a0f] text-zinc-100 font-sans selection:bg-rose-500/30 selection:text-rose-300 min-h-screen overflow-x-hidden antialiased">
        {children}
      </body>
    </html>
  );
}
