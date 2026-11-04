'use client';

import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Flame } from 'lucide-react';

interface LoadingScreenProps {
  onAccept: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onAccept }) => {
  const [hasScrolled, setHasScrolled] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 30) {
      setHasScrolled(true);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#060B1E]/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-[#0B1536] border-2 border-[#FF9933]/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FF9933] via-[#FFD700] to-[#10B981] p-4 text-black font-extrabold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="w-6 h-6 text-black animate-bounce" />
            <span className="text-xl tracking-wider font-black uppercase">
              VIBE ARENA · SATIRE & PARODY NOTICE
            </span>
          </div>
          <span className="text-xs font-bold uppercase bg-black/20 px-2.5 py-1 rounded-full">
            Art. 19(1)(a)
          </span>
        </div>

        {/* Scrollable Notice Content */}
        <div
          onScroll={handleScroll}
          className="p-6 overflow-y-auto space-y-4 text-gray-200 text-sm leading-relaxed"
        >
          <div className="p-3.5 bg-[#FF9933]/15 border border-[#FF9933]/40 rounded-xl text-amber-200 font-medium">
            <p className="font-semibold text-base mb-1">व्यंग्य एवं हास्य सूचना (Hindi Notice):</p>
            <p>
              यह खेल केवल हास्य, व्यंग्य और मनोरंजन के उद्देश्य से बनाया गया है। इसमें
              दिखाए गए सभी पात्र, संवाद और घटनाएं काल्पनिक एवं अतिरंजित हैं। इनका किसी
              भी वास्तविक राजनीतिक दल, चुनाव या व्यक्ति की वास्तविकता से कोई संबंध नहीं है।
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              Indian Politics Arena — Legal & Creative Disclaimer
            </h3>
            <p>
              <strong>INDIAN POLITICS ARENA</strong> is an original satirical arcade fighting
              game created strictly for parody, creative comedy, and social commentary,
              exercising freedom of expression under Article 19(1)(a) of the Constitution of
              India.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-300">
              <li>
                <strong>Fictional Caricatures:</strong> All 8 fighters (Chai Commander, Vikas
                Baba, Jumlebaaz, Dharna King, Budget Boss, Media Master, Coalition King, Janata
                Hero) are fictional cartoon archetypes and do not use real photographs or
                trademarked identities.
              </li>
              <li>
                <strong>Zero Defamation:</strong> Fictional quotes, moves, and satirical
                headlines are humorous parodies and must not be interpreted as factual
                allegations.
              </li>
              <li>
                <strong>Non-Partisan:</strong> This game is independent and not affiliated with,
                funded, or endorsed by any political party, candidate, or government body.
              </li>
              <li>
                <strong>Cartoon Video Game Action:</strong> Fighting mechanics contain purely
                stylized video game animations (punching, jumping, super waves). Please do not
                imitate in real life.
              </li>
            </ul>
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="p-4 bg-[#080E24] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            {hasScrolled ? 'Notice reviewed. Ready to enter!' : 'Scroll down to review full terms'}
          </p>
          <button
            onClick={onAccept}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#FF9933] to-[#FFD700] hover:from-[#F97316] hover:to-[#F59E0B] text-black font-black text-base rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            ENTER ARENA (प्रवेश करें)
          </button>
        </div>
      </div>
    </div>
  );
};
