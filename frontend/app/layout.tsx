import './globals.css';
import { ReactNode } from 'react';
import Navbar from './components/Navbar';
import { ToastProvider } from './components/ToastProvider';

export const metadata = { title: 'AI Platforms Radar', description: 'Curated AI platforms' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <Navbar />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}