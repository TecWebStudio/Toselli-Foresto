import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Outfit } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import { AuthProvider } from "@/lib/AuthContext";
import SplashScreen from "@/components/SplashScreen";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DevHub IT - Social Network per Professionisti IT",
  description: "Piattaforma social di nicchia per professionisti IT: opportunità di lavoro, formazione avanzata e certificazioni nel settore tecnologico.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="scroll-smooth">
      <body
        className={`${spaceGrotesk.variable} ${outfit.variable} antialiased bg-zinc-50 dark:bg-zinc-950`}
      >
        <AuthProvider>
          <SplashScreen />
        {/* Ambient mesh gradient background */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-indigo-500/[0.04] rounded-full blur-[100px]" />
          <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] bg-purple-500/[0.04] rounded-full blur-[100px]" />
          <div className="absolute -bottom-32 left-1/3 w-[450px] h-[450px] bg-violet-500/[0.03] rounded-full blur-[120px]" />
        </div>

        {/* Mobile layout (< lg) */}
        <div className="relative z-10 lg:hidden min-h-screen flex flex-col">
          <main className="flex-1 pt-16 pb-[calc(4rem+env(safe-area-inset-bottom,0px))]">{children}</main>
          <BottomNav />
        </div>

        {/* Desktop layout (≥ lg) — Instagram-style */}
        <div className="relative z-10 hidden lg:block">
          <LeftSidebar />
          <div className="desktop-feed">
            <main className="min-h-screen pb-16 pt-6">{children}</main>
          </div>
          <RightSidebar />
        </div>
        </AuthProvider>
      </body>
    </html>
  );
}
