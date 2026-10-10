import './globals.css';
import { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'SaleTAGr',
  description: 'Garage sale listings and posters',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-dark text-white">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
