'use client';

import { authenticatedFetch } from '@/lib/apiClient';

import React, { useState, useEffect, useRef, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore, GAMES_CATALOG } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { GamerAvatar, isImageSource } from '@/components/profile/GamerAvatar';
import {
  User,
  Trophy,
  Award,
  Zap,
  Flame,
  Shield,
  Star,
  CheckCircle2,
  Clock,
  LogOut,
  RefreshCw,
  Mail,
  Lock,
  Edit3,
  Save,
  Smile,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Loader2,
  HelpCircle,
  BarChart2,
  Target,
  Crown,
  Upload,
  Image as ImageIcon,
  Share2,
  Check,
  Copy,
  ExternalLink,
  Sliders,
  Eye,
  EyeOff,
  Sparkles,
  Gamepad2,
  Swords
} from 'lucide-react';

// Curated Gaming Avatars Grid
const GAMING_AVATARS = [
  { group: 'Legends & Ranks', icons: ['👑', '⚡', '🔥', '🏆', '💎', '🗿', '⚔️', '🛡️'] },
  { group: 'Cyber & Future', icons: ['🚀', '🤖', '🕹️', '👾', '🛸', '🌌', '🧬', '⚡'] },
  { group: 'Beasts & Vibes', icons: ['😎', '☕', '🐱', '🦊', '🍕', '🎯', '🦇', '🥊'] }
];

// All Achievements definition
interface AchievementItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'combat' | 'streak' | 'mastery' | 'community';
  condition: (user: any) => boolean;
}

const ARENA_ACHIEVEMENTS: AchievementItem[] = [
  {
    id: 'b_first_game',
    name: 'First Step',
    description: 'Complete your first arena match in Vibe Arena',
    icon: '🎮',
    category: 'combat',
    condition: (u) => (u.stats?.gamesPlayed || 0) >= 1
  },
  {
    id: 'b_first_win',
    name: 'First Victory',
    description: 'Score your first victory across any arena match',
    icon: '🏆',
    category: 'combat',
    condition: (u) => (u.stats?.totalWins || 0) >= 1
  },
  {
    id: 'b_high_score',
    name: 'Score Master',
    description: 'Achieve a personal best game score of 500+ points',
    icon: '🔥',
    category: 'mastery',
    condition: (u) => Math.max(0, ...Object.values(u.stats?.highScores || {}).map(Number)) >= 500
  },
  {
    id: 'b_ten_wins',
    name: 'Arena Champion',
    description: 'Win 10 competitive arena matches',
    icon: '👑',
    category: 'combat',
    condition: (u) => (u.stats?.totalWins || 0) >= 10
  },
  {
    id: 'b_streak_master',
    name: 'Streak Master',
    description: 'Maintain a 3+ day active arena streak',
    icon: '⚡',
    category: 'streak',
    condition: (u) => (u.streak || 0) >= 3
  },
  {
    id: 'b_hundred_club',
    name: 'Centurion',
    description: 'Play 25 or more arena matches',
    icon: '🎯',
    category: 'combat',
    condition: (u) => (u.stats?.gamesPlayed || 0) >= 25
  },
  {
    id: 'b_pen_flip_ace',
    name: 'Desk Prodigy',
    description: 'Successfully land 5 or more flips in Pen Flip',
    icon: '✏️',
    category: 'mastery',
    condition: (u) => (u.stats?.penFlipsLanded || 0) >= 5
  },
  {
    id: 'b_chai_tycoon',
    name: 'Tapri Mogul',
    description: 'Serve 20+ satisfied customers in Chai Tapri',
    icon: '☕',
    category: 'community',
    condition: (u) => (u.stats?.chaiServed || 0) >= 20
  },
  {
    id: 'b_brain_genius',
    name: 'Mind Over Matter',
    description: 'Reach Level 5 or higher in Vibe Arena',
    icon: '🧠',
    category: 'mastery',
    condition: (u) => (u.level || 1) >= 5
  }
];

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';

  const { user, logout, updateProfileData, syncCloudData } = useAppStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'edit' | 'avatar' | 'achievements' | 'settings'>(
    (initialTab as any) || 'overview'
  );

  // Form State
  const [displayName, setDisplayName] = useState(user.displayName || user.username);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio || 'Grinding games. Chasing high scores.');
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || '🚀');
  const [avatarType, setAvatarType] = useState<'google' | 'upload' | 'preset'>(user.avatarType || 'preset');
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);

  // Privacy State
  const [privacySettings, setPrivacySettings] = useState({
    isPublic: user.privacySettings?.isPublic ?? true,
    showStats: user.privacySettings?.showStats ?? true,
    showGameHistory: user.privacySettings?.showGameHistory ?? true,
    showAchievements: user.privacySettings?.showAchievements ?? true
  });

  // Username validation state
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameMessage, setUsernameMessage] = useState<string>('');
  const usernameDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Status & Feedback States
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync state when user updates in background
  useEffect(() => {
    setDisplayName(user.displayName || user.username);
    setUsername(user.username);
    setBio(user.bio || 'Grinding games. Chasing high scores.');
    setSelectedAvatar(user.avatar || '🚀');
    setAvatarType(user.avatarType || (isImageSource(user.photoURL) && user.avatar === user.photoURL ? 'google' : 'preset'));
    if (user.privacySettings) {
      setPrivacySettings({
        isPublic: user.privacySettings.isPublic ?? true,
        showStats: user.privacySettings.showStats ?? true,
        showGameHistory: user.privacySettings.showGameHistory ?? true,
        showAchievements: user.privacySettings.showAchievements ?? true
      });
    }
  }, [user]);

  // Handle URL query parameter changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'edit', 'avatar', 'achievements', 'settings'].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  // Username Real-time Availability Checker
  const handleUsernameChange = (newVal: string) => {
    const cleaned = newVal.replace(/\s+/g, '_');
    setUsername(cleaned);

    if (usernameDebounceRef.current) clearTimeout(usernameDebounceRef.current);

    if (cleaned.toLowerCase() === user.username.toLowerCase()) {
      setUsernameStatus('idle');
      setUsernameMessage('Current username');
      return;
    }

    if (cleaned.length < 3) {
      setUsernameStatus('invalid');
      setUsernameMessage('Must be at least 3 characters');
      return;
    }

    if (cleaned.length > 20) {
      setUsernameStatus('invalid');
      setUsernameMessage('Max 20 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleaned)) {
      setUsernameStatus('invalid');
      setUsernameMessage('Only letters, numbers, and underscores allowed');
      return;
    }

    setUsernameStatus('checking');
    setUsernameMessage('Checking availability...');

    usernameDebounceRef.current = setTimeout(async () => {
      try {
        const res = await authenticatedFetch(`/api/auth/check-username?username=${encodeURIComponent(cleaned)}&uid=${user.uid || user.id}`);
        const data = await res.json();
        if (data.available) {
          setUsernameStatus('available');
          setUsernameMessage('Username available ✓');
        } else {
          setUsernameStatus('taken');
          setUsernameMessage(data.error || 'Username already taken ✕');
        }
      } catch {
        setUsernameStatus('idle');
        setUsernameMessage('');
      }
    }, 400);
  };

  // Image Upload with Client-Side Cropping & Compression
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSaveError('Please select a valid image file (PNG, JPG, or WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setSaveError('File size is too large. Please select an image under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas to crop into square and compress
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        canvas.width = 256;
        canvas.height = 256;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Center crop
        const startX = (img.width - size) / 2;
        const startY = (img.height - size) / 2;
        ctx.drawImage(img, startX, startY, size, size, 0, 0, 256, 256);

        // Convert to high-quality compressed WebP data URL
        const dataUrl = canvas.toDataURL('image/webp', 0.88);
        setUploadedPreview(dataUrl);
        setSelectedAvatar(dataUrl);
        setAvatarType('upload');
        soundFx.playClick();
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Switch to Google Photo
  const handleUseGooglePhoto = () => {
    if (user.photoURL) {
      setSelectedAvatar(user.photoURL);
      setAvatarType('google');
      soundFx.playClick();
    }
  };

  // Save Profile Handler
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (usernameStatus === 'taken' || usernameStatus === 'invalid') {
      setSaveError('Please choose a valid and available username.');
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);
    setSaveError(null);
    soundFx.playClick();

    try {
      const updates = {
        displayName: displayName.trim(),
        username: username.trim(),
        bio: bio.trim(),
        avatar: selectedAvatar,
        avatarType,
        privacySettings
      };

      const res = await updateProfileData(updates);

      if (res.success) {
        setSaveMessage('Profile updated successfully 🎮');
        soundFx.playLevelUp();
        setTimeout(() => setSaveMessage(null), 4000);
      } else {
        setSaveError(res.error || 'Couldn’t update your profile. Please try again.');
      }
    } catch (err: any) {
      setSaveError(err?.message || 'Error updating profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Copy Profile Link
  const handleCopyProfileLink = () => {
    soundFx.playClick();
    const url = `${window.location.origin}/u/${encodeURIComponent(user.username)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  // Manual Cloud Sync
  const handleManualSync = async () => {
    soundFx.playClick();
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await syncCloudData();
      if (res) {
        soundFx.playLevelUp();
        setSyncStatus('Profile & carrier stats fully synced with cloud database!');
      } else {
        setSyncStatus('Local gamer profile saved.');
      }
    } catch {
      setSyncStatus('Sync error. Please verify network connection.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

  // Logout
  const handleLogout = async () => {
    soundFx.playClick();
    await logout();
    router.push('/login');
  };

  // Career Statistics Calculations
  const highScoresMap = user.stats?.highScores || {};
  const totalScore = Object.values(highScoresMap).reduce((a, b) => a + Number(b), 0);
  const bestScore = Math.max(0, ...Object.values(highScoresMap).map(Number));
  const gamesPlayed = user.stats?.gamesPlayed || 0;
  const totalWins = user.stats?.totalWins || 0;
  const totalLosses = user.stats?.totalLosses || Math.max(0, gamesPlayed - totalWins);
  const winRate = gamesPlayed > 0 ? Math.round((totalWins / gamesPlayed) * 100) : 0;
  
  // Level progression (500 XP per level bracket)
  const xpInLevel = user.xp % 500;
  const xpPercent = Math.min(100, Math.round((xpInLevel / 500) * 100));

  // Rank determination
  const rankDisplay = (user.rank as string) || (gamesPlayed === 0 ? 'Unranked' : user.level >= 10 ? 'Diamond I' : user.level >= 5 ? 'Gold III' : 'Silver I');

  // Achievements Progress
  const unlockedCount = ARENA_ACHIEVEMENTS.filter((a) => a.condition(user)).length;

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Dynamic Status Notifications */}
      {saveMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3 animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span className="font-semibold">{saveMessage}</span>
        </div>
      )}
      {saveError && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3 animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span className="font-semibold">{saveError}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. PROFESSIONAL GAMER PROFILE HERO CARD */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0C101F]/95 via-[#13192F]/90 to-[#0C101F]/95 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.7)] backdrop-blur-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00F0FF]/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#D946EF]/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent" />

        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 relative z-10">
          {/* Gamer Identity Cluster */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Main Gamer Avatar */}
            <div className="relative group">
              <GamerAvatar
                avatar={user.avatar}
                photoURL={user.photoURL}
                avatarType={user.avatarType}
                size="2xl"
                showOnline={true}
                isOnline={true}
                rank={rankDisplay}
                showLevel={true}
                level={user.level}
                glowEffect={true}
              />
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('avatar');
                }}
                className="absolute inset-0 rounded-3xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-xs font-bold text-white cursor-pointer"
              >
                <Edit3 className="w-5 h-5 text-[#00F0FF] mb-1" />
                <span>Change</span>
              </button>
            </div>

            {/* Gamer Meta */}
            <div className="space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {user.displayName || user.username}
                </h1>

                {/* Account Type Badge */}
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full flex items-center gap-1.5 bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00F0FF]" />
                  {user.authType === 'google'
                    ? 'Google Gamer'
                    : user.authType === 'email'
                    ? 'Verified SaaS Gamer'
                    : 'Guest Arena Account'}
                </span>

                {/* Online Indicator Badge */}
                <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE
                </span>
              </div>

              {/* Username & URL Handle */}
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-400 font-mono">
                <span className="text-slate-300 font-semibold">@{user.username}</span>
                {user.email && <span>• {user.email}</span>}
              </div>

              {/* Gamer Bio */}
              <p className="text-sm text-slate-300 max-w-lg italic font-sans">
                &ldquo;{user.bio || 'Grinding games. Chasing high scores.'}&rdquo;
              </p>

              {/* Badges / Quick Metrics */}
              <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 pt-2 font-mono flex-wrap">
                <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Crown className="w-3.5 h-3.5" />
                  {rankDisplay}
                </span>
                <span className="flex items-center gap-1.5 text-orange-400 font-bold">
                  <Flame className="w-3.5 h-3.5" />
                  {user.streak} Day Streak
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Launch Season'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex sm:flex-row lg:flex-col items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTab('edit');
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0088FF] text-black text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.25)] hover:opacity-95 active:scale-95"
            >
              <Edit3 className="w-4 h-4 text-black" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={handleCopyProfileLink}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-cyan-400" />}
              <span>{copiedLink ? 'Link Copied!' : 'Share Profile'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex justify-between text-xs font-bold mb-2 text-slate-300">
            <span className="flex items-center gap-1.5 font-mono">
              <Zap className="w-4 h-4 text-[#00F0FF]" /> Level {user.level} Progress
            </span>
            <span className="text-[#00F0FF] font-mono">
              {xpInLevel.toLocaleString()} / 500 XP ({xpPercent}%) • Total {user.xp.toLocaleString()} XP
            </span>
          </div>
          <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-white/10 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#00F0FF] via-[#ADFF2F] to-[#00F0FF] rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-white/10">
        {[
          { key: 'overview', label: 'Overview & Stats', icon: BarChart2 },
          { key: 'edit', label: 'Edit Profile', icon: Edit3 },
          { key: 'avatar', label: 'Avatar Customizer', icon: Smile },
          { key: 'achievements', label: `Achievements (${unlockedCount}/${ARENA_ACHIEVEMENTS.length})`, icon: Award },
          { key: 'settings', label: 'Privacy & Settings', icon: Sliders }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                soundFx.playClick();
                setActiveTab(tab.key as any);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. TAB CONTENT */}
      {/* ========================================================================= */}

      {/* TAB: OVERVIEW & STATS */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Key Career Metrics Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[#00F0FF]" />
                Career Battle Statistics
              </h2>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Anti-Cheat Server Protected
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#0D101C]/80 border border-white/10 hover:border-cyan-500/40 transition-colors">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Total Score
                </span>
                <div className="text-2xl font-black text-white font-mono">{totalScore.toLocaleString()}</div>
                <span className="text-[11px] text-slate-500 mt-1 block font-mono">Arena Points</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#0D101C]/80 border border-white/10 hover:border-amber-500/40 transition-colors">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Peak Score
                </span>
                <div className="text-2xl font-black text-amber-400 font-mono">{bestScore.toLocaleString()}</div>
                <span className="text-[11px] text-slate-500 mt-1 block font-mono">Personal Best</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#0D101C]/80 border border-white/10 hover:border-emerald-500/40 transition-colors">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Arena Victories
                </span>
                <div className="text-2xl font-black text-emerald-400 font-mono">{totalWins}</div>
                <span className="text-[11px] text-slate-500 mt-1 block font-mono">{totalLosses} Defeats</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#0D101C]/80 border border-white/10 hover:border-cyan-500/40 transition-colors">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Win Ratio
                </span>
                <div className="text-2xl font-black text-cyan-400 font-mono">{winRate}%</div>
                <span className="text-[11px] text-slate-500 mt-1 block font-mono">
                  {gamesPlayed} Total Matches
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-[#0D101C]/80 border border-white/10 hover:border-purple-500/40 transition-colors">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Current Rank
                </span>
                <div className="text-xl font-black text-[#ADFF2F]">{rankDisplay}</div>
                <span className="text-[11px] text-slate-500 mt-1 block font-mono">Tier Standing</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#0D101C]/80 border border-white/10 hover:border-orange-500/40 transition-colors">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Active Streak
                </span>
                <div className="text-2xl font-black text-orange-400 font-mono">🔥 {user.streak} Days</div>
                <span className="text-[11px] text-slate-500 mt-1 block font-mono">Consecutive Play</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#0D101C]/80 border border-white/10 hover:border-yellow-500/40 transition-colors">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Arena Coins
                </span>
                <div className="text-2xl font-black text-amber-300 font-mono">🪙 {user.coins}</div>
                <span className="text-[11px] text-slate-500 mt-1 block font-mono">In-Game Balance</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#0D101C]/80 border border-white/10 hover:border-blue-500/40 transition-colors">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Lifetime XP
                </span>
                <div className="text-2xl font-black text-blue-400 font-mono">{user.xp.toLocaleString()}</div>
                <span className="text-[11px] text-slate-500 mt-1 block font-mono">Level {user.level} Master</span>
              </div>
            </div>
          </div>

          {/* Game High Scores Breakdown */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0D101C]/80 border border-white/10">
            <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2 mb-4">
              <Gamepad2 className="w-5 h-5 text-[#00F0FF]" />
              Arena High Scores by Title
            </h3>

            {Object.keys(highScoresMap).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(highScoresMap).map(([gameId, score]) => {
                  const game = GAMES_CATALOG.find((g) => g.id === gameId);
                  return (
                    <div
                      key={gameId}
                      className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{game?.thumbnail || '🎮'}</span>
                        <div>
                          <div className="text-xs font-bold text-white truncate max-w-[140px]">
                            {game?.title || gameId}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono uppercase">
                            {game?.categoryKey || 'Mini-Game'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black font-mono text-[#00F0FF]">
                          {Number(score).toLocaleString()}
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono">pts</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                <p>No high scores recorded yet.</p>
                <Link
                  href="/games"
                  className="inline-block mt-3 px-4 py-2 rounded-xl bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 font-bold uppercase tracking-wider text-xs"
                >
                  Play Games to Set Records
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: EDIT PROFILE */}
      {activeTab === 'edit' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0D101C]/90 border border-[#00F0FF]/30 shadow-[0_20px_50px_rgba(0,240,255,0.15)] animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#00F0FF]" />
                Edit Gamer Identity
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Update how fellow arena players see you in lobbies, leaderboards, and matches.
              </p>
            </div>
            <Link
              href={`/u/${encodeURIComponent(user.username)}`}
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-xs text-[#00F0FF] hover:underline font-mono"
            >
              <span>Public Preview</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Display Name Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={40}
                  placeholder="e.g. Sahil Raj"
                  className="w-full px-4 py-3 bg-[#070A14] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#00F0FF] transition-colors"
                />
                <p className="text-[11px] text-slate-500 font-mono">
                  Your public friendly name. Shown in match intros and player cards.
                </p>
              </div>

              {/* Username Input with Live Availability Check */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Arena @Username
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-500 font-mono text-sm">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    maxLength={20}
                    placeholder="sahil24raj"
                    className={`w-full pl-8 pr-10 py-3 bg-[#070A14] border rounded-xl text-white text-sm focus:outline-none transition-colors font-mono ${
                      usernameStatus === 'available'
                        ? 'border-emerald-500/70 focus:border-emerald-400'
                        : usernameStatus === 'taken' || usernameStatus === 'invalid'
                        ? 'border-red-500/70 focus:border-red-400'
                        : 'border-white/10 focus:border-[#00F0FF]'
                    }`}
                  />
                  <div className="absolute right-3.5 top-3.5">
                    {usernameStatus === 'checking' && <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />}
                    {usernameStatus === 'available' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {(usernameStatus === 'taken' || usernameStatus === 'invalid') && <AlertCircle className="w-4 h-4 text-red-400" />}
                  </div>
                </div>
                {usernameMessage && (
                  <p
                    className={`text-[11px] font-mono ${
                      usernameStatus === 'available'
                        ? 'text-emerald-400'
                        : usernameStatus === 'taken' || usernameStatus === 'invalid'
                        ? 'text-red-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {usernameMessage}
                  </p>
                )}
              </div>
            </div>

            {/* Gamer Bio with Character Counter */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Gamer Bio
                </label>
                <span className="text-[11px] font-mono text-slate-500">
                  {bio.length} / 180 characters
                </span>
              </div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 180))}
                rows={3}
                placeholder="Grinding one game at a time. Chasing high scores in Vibe Arena."
                className="w-full px-4 py-3 bg-[#070A14] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#00F0FF] transition-colors resize-none"
              />
            </div>

            {/* Live Profile Card Preview */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Live Preview
              </span>
              <div className="flex items-center gap-4">
                <GamerAvatar
                  avatar={selectedAvatar}
                  photoURL={user.photoURL}
                  avatarType={avatarType}
                  size="lg"
                  showOnline={true}
                  rank={rankDisplay}
                />
                <div>
                  <div className="font-bold text-white text-sm">
                    {displayName || username || 'Gamer'}
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    @{username || 'gamer'} • LVL {user.level} {rankDisplay}
                  </div>
                  <div className="text-xs text-slate-300 italic mt-0.5 max-w-md truncate">
                    &ldquo;{bio || 'Ready to compete!'}&rdquo;
                  </div>
                </div>
              </div>
            </div>

            {/* Read-Only Stats Notice */}
            <div className="p-4 rounded-2xl bg-[#00F0FF]/5 border border-[#00F0FF]/20 text-xs text-cyan-200 flex items-start gap-3">
              <Lock className="w-4 h-4 text-[#00F0FF] shrink-0 mt-0.5" />
              <span>
                <strong>Anti-Cheat Security Policy:</strong> Match victories, XP, Levels, and High Scores are verified by backend anti-cheat pipelines and cannot be manually modified.
              </span>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('overview');
                }}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || usernameStatus === 'taken' || usernameStatus === 'invalid'}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0088FF] text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-95 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Save className="w-4 h-4 text-black" />}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB: AVATAR CUSTOMIZER */}
      {activeTab === 'avatar' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0D101C]/90 border border-white/10 space-y-8 animate-in fade-in duration-200">
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Smile className="w-5 h-5 text-[#00F0FF]" />
              Avatar & Photo System
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose between your verified Google profile image, an uploaded photo, or an arena gaming avatar.
            </p>
          </div>

          {/* Section A: Profile Photo Sources (Google & Upload) */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#00F0FF]" />
              Real Profile Photo
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <GamerAvatar
                avatar={selectedAvatar}
                photoURL={user.photoURL}
                avatarType={avatarType}
                size="xl"
                glowEffect={true}
                rank={rankDisplay}
              />

              <div className="space-y-3 flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  {/* Google Profile Button */}
                  {user.photoURL ? (
                    <button
                      type="button"
                      onClick={handleUseGooglePhoto}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                        avatarType === 'google'
                          ? 'bg-[#00F0FF] text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                          : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Use Google Photo</span>
                    </button>
                  ) : (
                    <div className="text-[11px] text-slate-400 font-mono">
                      (Sign in with Google to sync your Google picture automatically)
                    </div>
                  )}

                  {/* Upload Custom Photo Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                      avatarType === 'upload'
                        ? 'bg-[#ADFF2F] text-black shadow-[0_0_15px_rgba(173,255,47,0.4)]'
                        : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* Reset to Default */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAvatar('🚀');
                      setAvatarType('preset');
                      soundFx.playClick();
                    }}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">
                  Supported formats: PNG, JPG, WebP (max 2MB). Automatically optimized for crisp display across mobile & desktop.
                </p>
              </div>
            </div>
          </div>

          {/* Section B: Curated Gaming Avatars Grid */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-[#ADFF2F]" />
              Arena Gaming Avatars
            </h3>

            {GAMING_AVATARS.map((group) => (
              <div key={group.group} className="space-y-2">
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  {group.group}
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {group.icons.map((icon, idx) => {
                    const isSelected = selectedAvatar === icon && avatarType === 'preset';
                    return (
                      <button
                        key={`${group.group}-${idx}-${icon}`}
                        type="button"
                        onClick={() => {
                          setSelectedAvatar(icon);
                          setAvatarType('preset');
                          soundFx.playClick();
                        }}
                        className={`h-14 rounded-2xl flex items-center justify-center text-2xl transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-tr from-[#00F0FF]/30 to-[#ADFF2F]/30 border-2 border-[#00F0FF] scale-110 shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                            : 'bg-white/5 border border-white/10 hover:bg-white/15 hover:scale-105'
                        }`}
                      >
                        {icon}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Save Avatar Action */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => handleSaveProfile()}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0088FF] text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-95 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Save className="w-4 h-4 text-black" />}
              <span>Apply Avatar</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB: ACHIEVEMENTS */}
      {activeTab === 'achievements' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0D101C]/80 border border-white/10 space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Arena Honors & Achievements
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Unlocked honors and combat badges earned through arena victories and skill accomplishments.
              </p>
            </div>
            <div className="text-right font-mono">
              <span className="text-sm font-bold text-amber-400">{unlockedCount}</span>
              <span className="text-xs text-slate-500"> / {ARENA_ACHIEVEMENTS.length} Unlocked</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {ARENA_ACHIEVEMENTS.map((ach) => {
              const isUnlocked = ach.condition(user);
              return (
                <div
                  key={ach.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-white/[0.05] to-amber-500/10 border-amber-500/40 shadow-[0_0_20px_rgba(251,191,36,0.15)]'
                      : 'bg-white/[0.02] border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                        isUnlocked
                          ? 'bg-amber-400/20 border border-amber-400/40 shadow-sm'
                          : 'bg-slate-800/80 border border-slate-700 text-slate-500'
                      }`}
                    >
                      {ach.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className={`text-sm font-bold truncate ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                          {ach.name}
                        </h4>
                        {isUnlocked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-snug mt-1">
                        {ach.description}
                      </p>
                      <div className="mt-2 text-[10px] font-mono font-semibold">
                        {isUnlocked ? (
                          <span className="text-emerald-400">UNLOCKED ✓</span>
                        ) : (
                          <span className="text-slate-500">LOCKED</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: PRIVACY & SETTINGS */}
      {activeTab === 'settings' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0D101C]/80 border border-white/10 space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#00F0FF]" />
              Privacy & Account Settings
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Control your public profile visibility, stats sharing, and database synchronization.
            </p>
          </div>

          <div className="space-y-4">
            {/* Toggle 1: Public Profile */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#00F0FF]" />
                  Public Gamer Profile
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Allow other gamers to view your public gaming card at <code>/u/{user.username}</code>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setPrivacySettings((p) => ({ ...p, isPublic: !p.isPublic }));
                }}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  privacySettings.isPublic ? 'bg-[#00F0FF]' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-black absolute top-0.5 transition-transform ${
                    privacySettings.isPublic ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: Show Career Stats */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-[#ADFF2F]" />
                  Display Career Stats on Public Profile
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Shows your total wins, matches played, and win rate to visitors.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setPrivacySettings((p) => ({ ...p, showStats: !p.showStats }));
                }}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  privacySettings.showStats ? 'bg-[#ADFF2F]' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-black absolute top-0.5 transition-transform ${
                    privacySettings.showStats ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3: Show Achievements */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  Display Unlocked Honors & Badges
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Allows visitors to view your unlocked achievements on your public profile.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setPrivacySettings((p) => ({ ...p, showAchievements: !p.showAchievements }));
                }}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  privacySettings.showAchievements ? 'bg-amber-400' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-black absolute top-0.5 transition-transform ${
                    privacySettings.showAchievements ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Cloud Database Manual Sync */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 text-[#00F0FF] ${isSyncing ? 'animate-spin' : ''}`} />
                Cloud Database Synchronization
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Verifies and writes all high scores, unlocked achievements, and profile preferences to Firestore.
              </p>
              {syncStatus && <p className="text-xs text-emerald-400 mt-1 font-semibold">{syncStatus}</p>}
            </div>

            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              {isSyncing ? <Loader2 className="w-4 h-4 animate-spin text-[#00F0FF]" /> : <RefreshCw className="w-4 h-4 text-[#00F0FF]" />}
              <span>Sync Cloud Now</span>
            </button>
          </div>

          {/* Privacy & Security Disclosure Notice */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 text-[11px] text-slate-400 space-y-1">
            <span className="font-bold text-slate-300 block">🔒 Privacy Guarantee:</span>
            <p>
              Vibe Arena never exposes private account tokens, passwords, raw session identifiers, or internal user database keys. Public profiles only show your gamer tag, achievements, and non-sensitive gameplay metrics.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleSaveProfile()}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0088FF] text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-95 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Save className="w-4 h-4 text-black" />}
              <span>Save Privacy Settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center text-slate-400 font-mono text-sm flex items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#00F0FF]" />
          <span>Loading Vibe Arena Profile...</span>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
