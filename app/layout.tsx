import type { Metadata } from 'next';
import { Prompt } from 'next/font/google';
import './globals.css';

const prompt = Prompt({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  variable: '--font-prompt',
});

export const metadata: Metadata = {
  title: 'Bytezey — Digital Store & Game Marketplace',
  description: 'ศูนย์รวมดิจิทัลไอเทมและไอดีเกมชั้นนำ ส่งสินค้าอัตโนมัติตลอด 24 ชม.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="dark">
      <body className={`${prompt.className} bg-[#050814] text-slate-100 antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
