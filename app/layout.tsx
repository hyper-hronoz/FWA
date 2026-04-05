import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Турагенство Без детей",
  description: "Сайт-визитка туристического агентства Турагенство Без детей.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <header className="site-header">
          <div className="container header-inner">
            <Link href="/" className="brand">
              Турагенство Без детей
            </Link>
            <nav className="nav">
              <Link href="/">Главная</Link>
              <Link href="/tours">Туры</Link>
              <Link href="/about">О нас</Link>
              <Link href="/contacts">Контакты</Link>
            </nav>
          </div>
        </header>
        <main className="container main-content">{children}</main>
        <footer className="site-footer">
          <div className="container">
            <p>
              © {new Date().getFullYear()} Турагенство Без детей. Все права
              защищены.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
