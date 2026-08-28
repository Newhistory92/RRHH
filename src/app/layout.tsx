import type { Metadata } from "next";
import { Fraunces, Inter, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { PrimeReactTheme } from "@/app/Componentes/Shell/PrimeReactTheme";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meridia",
  description: "Gestion de Personal",
  // Genera <meta name="apple-mobile-web-app-title" content="Meridia" />:
  // el nombre que iOS usa al agregar la app a la pantalla de inicio.
  // Los iconos (favicon.ico, icon0.svg, icon1.png, apple-icon.png) y el
  // manifest.json se detectan solos por convencion de archivos en src/app.
  appleWebApp: {
    title: "Meridia",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fraunces.variable} ${inter.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <PrimeReactTheme />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
