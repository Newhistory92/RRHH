import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { PrimeReactTheme } from "@/app/Componentes/Shell/PrimeReactTheme";
import { ThemeColorMeta } from "@/app/Componentes/Shell/ThemeColorMeta";
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
  title: "RRHH",
  description: "Gestion de Personal",
  // Genera <meta name="apple-mobile-web-app-title" content="Meridia" />:
  // el nombre que iOS usa al agregar la app a la pantalla de inicio.
  // Los iconos (favicon.ico, icon1.png, apple-icon.png) y el manifest.json
  // se detectan solos por convencion de archivos en src/app.
  appleWebApp: {
    capable: true,
    title: "RRHH",
  },
};

export const viewport: Viewport = {
  // Valor inicial; ThemeColorMeta lo actualiza según el tema elegido.
  themeColor: "#F6F7F4",
  // Imprescindible: sin esto env(safe-area-inset-bottom) vale siempre 0 y la
  // barra inferior queda debajo del indicador de inicio del iPhone.
  viewportFit: "cover",
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
          <ThemeColorMeta />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
