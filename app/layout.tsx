import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
  display:  'swap',
});

export const metadata: Metadata = {
  title:       'CarbonWise — Small daily actions. Big climate impact.',
  description: 'Track and reduce your daily carbon footprint with AI-powered personalised insights and eco challenges.',
  keywords:    ['carbon footprint', 'sustainability', 'climate', 'eco', 'green living'],
  openGraph: {
    title:       'CarbonWise',
    description: 'AI-powered carbon footprint tracker with personalised recommendations.',
    type:        'website',
  },
  robots: 'index, follow',
};

export const viewport: Viewport = {
  themeColor:  '#22c55e',
  width:       'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans`}>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <main id="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
