import type { Metadata } from 'next';
import { Cormorant_Garamond, Montserrat } from 'next/font/google';

import './globals.css';

const display = Cormorant_Garamond({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const sans = Montserrat({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const title = 'Happy Birthday Katrina!';
const description = 'A little black-and-gold birthday celebration made especially for Katrina.';
const siteOrigin = 'https://happy-birthday-katrina.annieuuu0901.chatgpt.site';
const imageUrl = `${siteOrigin}/og.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title,
  description,
  openGraph: {
    type: 'website',
    title,
    description,
    images: [{ url: imageUrl, width: 1731, height: 909, alt: title }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [imageUrl],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${display.variable} ${sans.variable}`}>{children}</body>
    </html>
  );
}
