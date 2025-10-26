import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./dropdown-fix.css";
import Sidebar from "@/components/layout/Sidebar";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stocky - Gestion de stock intelligente",
  description: "Gestion de stock intelligente avec IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <Sidebar />
            
            {/* Main Content */}
            <main className="flex-1 md:ml-64">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
