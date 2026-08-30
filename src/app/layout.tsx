import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SmoothScroll from '../components/layout/SmoothScroll';
import ScrollProgress from '../components/layout/ScrollProgress';
import 'lenis/dist/lenis.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../index.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LABYRINTH - Computer Science Club',
  description: "The official Computer Science Club of Christ University.",
  icons: {
    icon: '/labyrinth-logo.png', // Fallback to logo as tab favicon
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className={`${inter.className} flex flex-col min-h-screen relative bg-bg-primary text-text-primary antialiased overflow-x-hidden`}>
        <AuthProvider>
          <SmoothScroll>
            <ScrollProgress />
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </SmoothScroll>
        </AuthProvider>
      </body>
    </html>
  );
}
