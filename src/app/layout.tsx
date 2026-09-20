import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'LensVault | Authentic Photography Marketplace',
  description:
    'The premier marketplace for genuine camera photography. Built with automated AI generation detection, EXIF sensor verification, and 64-bit perceptual hash duplicate protection.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased flex flex-col selection:bg-emerald-500 selection:text-zinc-950">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
