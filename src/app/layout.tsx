import './globals.css';
import { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import RegisterSW from '@/components/RegisterSW';

export const metadata: Metadata = {
  title: 'SaleTAGr',
  description: 'QR-code flyers and directions for your garage sale.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icons/icon-192.png', apple: '/icons/icon-192.png' },
};

export const viewport: Viewport = { themeColor: '#0A0A0A', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-dark text-white">
        {children}
        <RegisterSW />
        <Analytics />
      </body>
    </html>
  );
}
