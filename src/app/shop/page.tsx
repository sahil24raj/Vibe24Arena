'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import confetti from 'canvas-confetti';

interface ShopItemDef {
  id: string;
  name: string;
  priceCoins: number;
  type: string;
  desc: string;
  image: string;
  skinKey?: string;
  highlight?: boolean;
}

export default function ShopPage() {
  const { user, buyShopItem } = useAppStore();
  const [purchaseMsg, setPurchaseMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const shopItems: ShopItemDef[] = [
    {
      id: 'skin_neon_visor',
      skinKey: 'neon_visor',
      name: 'Cyber Neon Visor',
      priceCoins: 350,
      type: 'Avatar Skin',
      desc: 'Sleek holographic cyber visor for your gamer avatar!',
      image: '🕶️'
    },
    {
      id: 'skin_gold_crown',
      skinKey: 'gold_crown',
      name: '24K Gold Champion Crown',
      priceCoins: 800,
      type: 'Avatar Skin',
      desc: 'Gleaming royal gold crown earned by arena champions!',
      image: '👑',
      highlight: true
    },
    {
      id: 'skin_modi_gold',
      skinKey: 'modi_gold',
      name: 'Gold Saffron Rally Jacket',
      priceCoins: 1200,
      type: 'Special Skin',
      desc: 'Shine on the rally track with radiant 24k Gold jacket!',
      image: '✨'
    },
    {
      id: 'skin_daya_laser',
      skinKey: 'daya_laser',
      name: 'Laser Door Smasher Plasma',
      priceCoins: 1500,
      type: 'Special Skin',
      desc: 'Smash doors with neon blue plasma energy aura!',
      image: '⚡'
    }
  ];

  const handleBuy = (item: ShopItemDef) => {
    const isUnlocked = item.skinKey && user.unlockedSkins.includes(item.skinKey);
    if (isUnlocked) {
      setPurchaseMsg({ text: `Already unlocked ${item.name}! Equipped on profile.` });
      return;
    }

    const res = buyShopItem({
      id: item.id,
      name: item.name,
      priceCoins: item.priceCoins,
      skinKey: item.skinKey
    });

    if (res.success) {
      confetti({ particleCount: 60, spread: 70 });
      setPurchaseMsg({ text: `🎉 Successfully unlocked & equipped ${item.name}!` });
    } else {
      soundFx.playHit();
      setPurchaseMsg({ text: res.error || 'Failed to purchase', isError: true });
    }
  };

  return (
    <div className="space-y-8 pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto pt-6">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-surface-container-high border border-purple-500/20 text-xs font-label-sm text-tertiary font-bold uppercase tracking-wider">
          <span className="material-symbols-outlined text-sm">storefront</span>
          <span>REWARDS &amp; SKINS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-headline-xl font-bold text-on-surface uppercase tracking-tight">
          VIBE ARENA REWARDS STORE
        </h1>
        <p className="font-body-md text-soft-lavender leading-relaxed">
          Unlock exclusive avatar skins, crowns, and cyber cosmetics using your earned Vibe Coins.
        </p>

        {/* Real User Coins Balance */}
        <div className="inline-flex items-center gap-2 bg-surface-container-low px-5 py-2 rounded-full border border-tertiary-container/40 text-tertiary font-label-md font-bold mt-2 shadow-[0_0_20px_rgba(235,195,21,0.25)]">
          <span className="text-lg">🪙</span>
          <span>YOUR COIN BALANCE: {user.coins.toLocaleString()} COINS</span>
        </div>
      </div>

      {purchaseMsg && (
        <div
          className={`max-w-xl mx-auto p-4 rounded-xl text-center font-label-md font-bold border ${
            purchaseMsg.isError
              ? 'bg-error-container/20 border-error text-error'
              : 'bg-primary-container/20 border-primary text-primary shadow-[0_0_20px_rgba(139,44,255,0.3)]'
          }`}
        >
          {purchaseMsg.text}
        </div>
      )}

      {/* Grid of Shop Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {shopItems.map((item) => {
          const isUnlocked = item.skinKey && user.unlockedSkins.includes(item.skinKey);
          return (
            <div
              key={item.id}
              className={`p-6 rounded-2xl bg-surface-container border flex flex-col justify-between gap-4 transition-all shadow-xl ${
                item.highlight
                  ? 'border-tertiary/50 shadow-[0_0_30px_rgba(235,195,21,0.25)]'
                  : 'border-purple-500/20 hover:border-primary/40 hover:shadow-[0_0_25px_rgba(139,44,255,0.3)]'
              }`}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-24 h-24 rounded-2xl bg-surface-purple border border-purple-500/30 flex items-center justify-center text-5xl shadow-inner">
                  {item.image}
                </div>
                <div>
                  <span className="font-label-sm text-neon-cyan uppercase font-bold tracking-wider">
                    {item.type}
                  </span>
                  <h3 className="font-headline-sm text-on-surface font-bold mt-0.5">{item.name}</h3>
                  <p className="font-body-sm text-soft-lavender mt-1">{item.desc}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-purple-500/10">
                <div className="flex items-center justify-between font-label-md">
                  <span className="text-soft-lavender">Cost</span>
                  <span className="text-tertiary font-bold flex items-center gap-1">
                    <span>🪙</span> {item.priceCoins.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => handleBuy(item)}
                  disabled={Boolean(isUnlocked)}
                  className={`w-full py-3 rounded-xl font-headline-sm text-sm uppercase tracking-wider font-bold transition-all cursor-pointer ${
                    isUnlocked
                      ? 'bg-surface-container-high text-neon-green border border-neon-green/30 cursor-default'
                      : 'bg-tertiary text-on-tertiary-fixed shadow-[0_0_20px_rgba(235,195,21,0.4)] hover:scale-105 active:scale-95'
                  }`}
                >
                  {isUnlocked ? '✓ UNLOCKED & EQUIPPED' : 'UNLOCK ITEM'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
