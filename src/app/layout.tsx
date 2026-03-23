import type { Metadata } from "next";
import { Geist_Mono, Sora } from "next/font/google";
import { Providers } from '@/providers';
import "@b3-crow/ui-kit/styles.css";
import "./globals.css";

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
	title: "CROW Dashboard",
	description: "CROW AI Dashboard - Manage your organization, catalog, analytics and team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
			</head>
			<body className={`${sora.variable} ${geistMono.variable} antialiased`}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
