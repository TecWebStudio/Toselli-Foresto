import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevHub IT - Social Network per Professionisti IT",
  description: "Piattaforma social di nicchia per professionisti IT: opportunità di lavoro, formazione avanzata e certificazioni nel settore tecnologico.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 dark:bg-zinc-950`}
      >
        <div className="mx-auto max-w-lg min-h-screen bg-white dark:bg-zinc-950 shadow-lg shadow-zinc-200/50 dark:shadow-none">
          <main className="pb-20 pt-16">
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
