import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppDashboardLayout } from '@/components/AppDashboardLayout';

export const viewport: Viewport = {
  themeColor: '#141122',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'VIBE ARENA — Your Squad, Your Vibes, Your Arena',
  description: 'Your Squad, Your Vibes, Your Arena. The social gaming playground where friends create instant rooms, play quick multiplayer games, settle bets, and dominate the squad leaderboard. Instant 6-char codes, zero downloads.',
  keywords: [
    'Vibe Arena',
    'Your Squad Your Vibes Your Arena',
    'social gaming',
    'multiplayer party games',
    'Chor Sipahi online',
    'Indian Politics Arena',
    'Tirri Run',
    'Escape From The Door',
    'Raja Mantri Chor Sipahi',
    'Word Builder Pro',
    'Spin Cricket',
    'Pen Flip Battle',
    'room codes',
    'play with friends browser'
  ],
  icons: {
    icon: '/brand/vibe-arena-icon.png',
    shortcut: '/brand/vibe-arena-icon.png',
    apple: '/brand/vibe-arena-icon.png',
  },
  openGraph: {
    title: 'VIBE ARENA — Your Squad, Your Vibes, Your Arena',
    description: 'Your Squad, Your Vibes, Your Arena. Instant desi multiplayer battles, settle hostel bets, roast your friends, and dominate the squad leaderboard.',
    images: ['/brand/vibe-arena-logo.png'],
  },
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&family=Space+Grotesk:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-on-surface antialiased selection:bg-primary-container selection:text-white font-body">
        <AppDashboardLayout>{children}</AppDashboardLayout>
      </body>
    </html>
  );
}
