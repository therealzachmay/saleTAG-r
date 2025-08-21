import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'SaleTAGr',
  description: 'Garage sale listings and posters',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-dark text-white">
        {children}
      </body>
    </html>
  );
}
