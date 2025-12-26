import type { Metadata } from 'next';
import { Geist_Mono, Sora } from 'next/font/google';
import './globals.css';

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CROW Client Dashboard',
  description: 'CROW Client Dashboard - Overview',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body
        className={`${sora.variable} ${geistMono.variable} font-sans antialiased bg-[#030005] text-gray-100 selection:bg-violet-500/30 selection:text-violet-200`}
      >
        {children}
      </body>
    </html>
  );
}
