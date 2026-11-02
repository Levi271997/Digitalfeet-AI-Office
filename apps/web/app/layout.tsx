import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter, Silkscreen, Space_Grotesk } from 'next/font/google';
import { Header } from '@/components/Header';
import { OfficeProvider } from '@/lib/office-context';
import './globals.css';

const body = Inter({ subsets: ['latin'], variable: '--font-body' });
const display = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-display' });
const pixel = Silkscreen({ subsets: ['latin'], weight: '400', variable: '--font-pixel' });

export const metadata: Metadata = {
  title: 'Digitalfeet AI Office',
  description: 'Claude agents as office staff, with a human approval queue.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} ${pixel.variable}`}>
      <body>
        <OfficeProvider>
          <Header />
          {children}
        </OfficeProvider>
      </body>
    </html>
  );
}
