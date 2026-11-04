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
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      setHasScrolled(true);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#060B1E]/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none">
      <div className="max-w-xl w-full bg-[#0B1536] border border-[#FF9933]/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92%]">
        {/* Header - Compact & Crisp */}
        <div className="bg-gradient-to-r from-[#FF9933] via-[#FFD700] to-[#10B981] px-3.5 py-2 sm:px-4 sm:py-2.5 text-black font-extrabold flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-black shrink-0 animate-bounce" />
            <span className="text-xs sm:text-sm tracking-wider font-black uppercase">
              VIBE ARENA · SATIRE & PARODY NOTICE
            </span>
          </div>
          <span className="text-[10px] sm:text-xs font-black uppercase bg-black/25 text-white px-2 py-0.5 rounded-full shrink-0">
            Art. 19(1)(a)
          </span>
        </div>

        {/* Scrollable Notice Content with smooth custom styling */}
        <div
          onScroll={handleScroll}
          className="p-3.5 sm:p-4 overflow-y-auto space-y-2.5 text-gray-200 text-xs sm:text-[13px] leading-relaxed flex-1 min-h-0"
        >
          {/* Hindi Notice Box */}
          <div className="p-2.5 bg-[#FF9933]/15 border border-[#FF9933]/40 rounded-xl text-amber-200 font-medium">
            <p className="font-bold text-xs sm:text-sm mb-0.5 text-[#FFD700]">
              व्यंग्य एवं हास्य सूचना (Hindi Notice):
            </p>
            <p className="text-[11px] sm:text-xs leading-relaxed text-amber-100/90">
              यह खेल केवल हास्य, व्यंग्य और मनोरंजन के उद्देश्य से बनाया गया है। इसमें दिखाए गए सभी पात्र, संवाद और घटनाएं काल्पनिक एवं अतिरंजित हैं। इनका किसी भी वास्तविक राजनीतिक दल, चुनाव या व्यक्ति की वास्तविकता से कोई संबंध नहीं है।
            </p>
          </div>

          {/* Legal / Creative Summary */}
          <div className="space-y-1.5">
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              Indian Politics Arena — Legal & Creative Disclaimer
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-300">
              <strong className="text-white">INDIAN POLITICS ARENA</strong> is an original satirical arcade fighting game created strictly for parody, creative comedy, and social commentary, exercising freedom of expression under Article 19(1)(a) of the Constitution of India.
            </p>
            <ul className="list-disc pl-4 space-y-1 text-gray-300 text-[11px] sm:text-xs">
              <li>
                <strong className="text-amber-300">Fictional Caricatures:</strong> All 8 fighters are fictional cartoon archetypes and do not use real photographs or trademarked identities.
              </li>
              <li>
                <strong className="text-amber-300">Zero Defamation:</strong> Fictional quotes, moves, and satirical headlines are humorous parodies and not factual allegations.
              </li>
              <li>
                <strong className="text-amber-300">Non-Partisan:</strong> Independent and not affiliated with or endorsed by any political party or government body.
              </li>
              <li>
                <strong className="text-amber-300">Video Game Action:</strong> Fighting mechanics contain purely stylized cartoon animations (punching, jumping, super waves). Do not imitate in real life.
              </li>
            </ul>
          </div>
        </div>

        {/* Action Button Footer - Fully Visible & Never Cut Off */}
        <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 bg-[#080E24] border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
          <p className="text-[10px] sm:text-xs text-gray-400 hidden xs:block">
            {hasScrolled ? '✓ Notice reviewed' : 'Satire & Parody Policy'}
          </p>
          <button
            onClick={onAccept}
            className="w-full xs:w-auto ml-auto px-5 sm:px-7 py-2 sm:py-2.5 bg-gradient-to-r from-[#FF9933] to-[#FFD700] hover:from-[#F97316] hover:to-[#F59E0B] text-black font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
            ENTER ARENA (प्रवेश करें)
          </button>
        </div>
      </div>
    </div>
  );
};
