import type { Metadata } from "next";
import { Inter, Jura } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jura = Jura({
  subsets: ["latin"],
  variable: "--font-jura",
});

export const metadata: Metadata = {
  title: "MotusDAO Hub - Mental Health & Wellness",
  description: "Plataforma integral de salud mental con IA, psicoterapia y academia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jura.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <div className="flex">
              <Sidebar />
              <div className="flex-1 lg:ml-0">
                <Topbar />
                <main className="min-h-[calc(100vh-4rem)]">
                  {children}
                </main>
                <Footer />
              </div>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
