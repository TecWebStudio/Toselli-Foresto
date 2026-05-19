import type { Metadata, Viewport } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import NotificationSheet from "@/components/NotificationSheet";
import { AuthProvider } from "@/lib/AuthContext";
import { LanguageProvider } from "@/lib/LanguageContext";
import { NotificationProvider } from "@/lib/NotificationContext";
import SplashScreen from "@/components/SplashScreen";
import ThemeApplier from "@/components/ThemeApplier";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
        className={`${syne.variable} ${dmSans.variable} antialiased bg-[#f9f9f8] dark:bg-[#0c0c0b]`}
      >
        <AuthProvider>
          <ThemeApplier />
          <LanguageProvider>
          <NotificationProvider>
          <SplashScreen />
        {/* Ambient mesh gradient background */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-blue-500/[0.035] rounded-full blur-[100px]" />
          <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] bg-violet-500/[0.035] rounded-full blur-[100px]" />
          <div className="absolute -bottom-32 left-1/3 w-[450px] h-[450px] bg-indigo-500/[0.025] rounded-full blur-[120px]" />
        </div>

        {/* Mobile layout (< lg) */}
        <div className="relative z-10 lg:hidden min-h-screen flex flex-col">
          <main className="flex-1 pt-16 pb-[calc(4rem+env(safe-area-inset-bottom,0px))]">{children}</main>
          <BottomNav />
          <NotificationSheet />
        </div>

        {/* Desktop layout (≥ lg) — Instagram-style */}
        <div className="relative z-10 hidden lg:block">
          <LeftSidebar />
          <div className="desktop-feed">
            <main className="min-h-screen pb-16 pt-6">{children}</main>
          </div>
          <RightSidebar />
        </div>
        </NotificationProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
