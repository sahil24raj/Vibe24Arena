'use client';

import React from 'react';
import { VibeArenaHero } from '@/components/VibeArenaHero';
import { HeroTrendingCarousel } from '@/components/HeroTrendingCarousel';
import { PickYourVibeSection } from '@/components/PickYourVibeSection';
import { CreateHubSection } from '@/components/CreateHubSection';
import { SquadSocialExperienceSection } from '@/components/SquadSocialExperienceSection';
import { LegendsLeaderboardSection } from '@/components/LegendsLeaderboardSection';
import { ViralSquadBanner } from '@/components/ViralSquadBanner';
import { MultiplayerLobbyModal } from '@/components/MultiplayerLobbyModal';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full relative">
      {/* Real-time Multiplayer Modal */}
      <MultiplayerLobbyModal />

      {/* 1. HERO SECTION: High-Voltage Desi Pitch & Interactive Cyber Spotlight */}
      <VibeArenaHero />

      {/* 2. TOP GAMES HORIZONTAL CAROUSEL: Hype Zone Featured Battles */}
      <HeroTrendingCarousel />

      {/* 3. EXPLORE GAMES BY VIBE: Bento Grid & Tabbed Categories */}
      <PickYourVibeSection />

      {/* 4. CREATE YOUR VIBE / COMPLETE COLLECTION (All 11 Games Arena) */}
      <CreateHubSection />

      {/* 5. THE SOCIAL EXPERIENCE: Where Friends Come to Play (5-Step Simulator) */}
      <SquadSocialExperienceSection />

      {/* 6. LEGENDS OF VIBE ARENA: 3-Player 3D Podium & Live Match Ticker */}
      <LegendsLeaderboardSection />

      {/* 7. SQUAD BANTER & VIRAL BANNER: "Bas ek aur game." */}
      <ViralSquadBanner />
    </div>
  );
}
