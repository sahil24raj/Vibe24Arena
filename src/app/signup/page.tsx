'use client';

import { authenticatedFetch } from '@/lib/apiClient';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Gamepad2, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ShieldCheck,
  Check,
  X,
  Smile
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';

const AVATAR_OPTIONS = ['🚀', '😎', '👑', '🔥', '🗿', '☕', '🕹️', '⚡', '🤖', '🐱', '🍕', '🎯'];

export default function SignUpPage() {
  const router = useRouter();
  const { registerWithEmail, loginWithGoogle } = useAppStore();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🚀');
  const [agreedTerms, setAgreedTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Username validation state
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Password strength calculation
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score; // 0 to 5
  };

  const passwordScore = calculatePasswordStrength(password);

  const getStrengthLabel = (score: number) => {
    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', text: 'text-red-400' };
    if (score <= 3) return { label: 'Moderate', color: 'bg-amber-500', text: 'text-amber-400' };
    return { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-400' };
  };

  // Debounced live username availability check
  useEffect(() => {
    if (!username.trim() || username.length < 3) {
      setUsernameAvailable(null);
      setUsernameError(null);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      setUsernameAvailable(false);
      setUsernameError('Only letters, numbers, and _ are allowed.');
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const res = await authenticatedFetch(`/api/auth/check-username?username=${encodeURIComponent(username.trim())}`);
        const data = await res.json();
        setUsernameAvailable(data.available);
        setUsernameError(data.error || null);
      } catch (err) {
        setUsernameAvailable(true);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Strict client-side validation
    if (!username.trim() || username.trim().length < 3) {
      setErrorMsg('Username must be at least 3 characters long.');
      return;
    }
    if (usernameAvailable === false) {
      setErrorMsg(usernameError || 'This username is already taken.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-check.');
      return;
    }
    if (!agreedTerms) {
      setErrorMsg('Please accept the Terms & Conditions and Fair Play Policy to continue.');
      return;
    }

    setIsLoading(true);
    soundFx.playClick();

    try {
      const result = await registerWithEmail({
        email: email.trim(),
        password,
        username: username.trim(),
        displayName: displayName.trim() || username.trim(),
        avatar: selectedAvatar
      });

      if (result.success) {
        setSuccessMsg('Account created successfully! Preparing your gamer dashboard...');
        soundFx.playLevelUp();
        setTimeout(() => {
          router.push('/dashboard');
        }, 800);
      } else {
        setErrorMsg(result.error || 'Failed to create account.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setErrorMsg(null);
    setIsGoogleLoading(true);
    soundFx.playClick();

    try {
      const res = await loginWithGoogle({ avatar: selectedAvatar });
      if (res.success) {
        setSuccessMsg('Google Account linked! Entering arena...');
        soundFx.playLevelUp();
        setTimeout(() => {
          router.push('/dashboard');
        }, 800);
      } else {
        setErrorMsg(res.error || 'Google sign-up was cancelled.');
      }
    } catch (err: any) {
      setErrorMsg('Google sign-up failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const strength = getStrengthLabel(passwordScore);

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-[#ADFF2F]/15 via-[#00F0FF]/15 to-transparent blur-[130px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-[#ADFF2F]/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-lg z-10">
        {/* Top Header Card */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ADFF2F]/20 to-[#00F0FF]/20 border border-[#ADFF2F]/30 shadow-[0_0_25px_rgba(173,255,47,0.25)] mb-3">
            <Sparkles className="w-7 h-7 text-[#ADFF2F]" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            Join <span className="bg-gradient-to-r from-[#ADFF2F] via-[#00F0FF] to-white bg-clip-text text-transparent">Chill Arena</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Create your official gamer passport & unlock cloud saves
          </p>
        </div>

        {/* Signup Container Glass Card */}
        <div className="bg-[#121624]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative">
          <div className="absolute top-0 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-[#ADFF2F] to-transparent" />

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300">Registration Alert</p>
                <p className="text-xs text-red-400/90 mt-0.5 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
              <p className="text-xs font-semibold">{successMsg}</p>
            </div>
          )}

          {/* Avatar Selector */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Choose Avatar
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => {
                    setSelectedAvatar(av);
                    soundFx.playClick();
                  }}
                  className={`w-11 h-11 flex-shrink-0 rounded-2xl flex items-center justify-center text-xl transition-all ${
                    selectedAvatar === av
                      ? 'bg-gradient-to-tr from-[#00F0FF]/30 to-[#ADFF2F]/30 border-2 border-[#ADFF2F] scale-110 shadow-[0_0_15px_rgba(173,255,47,0.4)]'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field with Live Validation */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Unique Gamer Tag / Username *
                </label>
                {isCheckingUsername && (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin text-[#00F0FF]" /> Checking...
                  </span>
                )}
                {!isCheckingUsername && usernameAvailable === true && (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <Check className="w-3 h-3" /> Available
                  </span>
                )}
                {!isCheckingUsername && usernameAvailable === false && (
                  <span className="text-[11px] text-red-400 flex items-center gap-1 font-semibold">
                    <X className="w-3 h-3" /> Taken
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. MasterGamer_99"
                  maxLength={20}
                  className={`w-full pl-10 pr-4 py-2.5 bg-[#0a0d18]/90 border rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none transition-all ${
                    usernameAvailable === true
                      ? 'border-emerald-500/60 focus:border-emerald-500'
                      : usernameAvailable === false
                      ? 'border-red-500/60 focus:border-red-500'
                      : 'border-white/10 focus:border-[#ADFF2F]'
                  }`}
                />
              </div>
            </div>

            {/* Display Name Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Display Name (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Smile className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="What friends call you"
                  maxLength={30}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0a0d18]/90 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#ADFF2F] transition-all"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="gamer@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0a0d18]/90 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#ADFF2F] transition-all"
                />
              </div>
            </div>

            {/* Password Field + Strength Indicator */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-11 py-2.5 bg-[#0a0d18]/90 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#ADFF2F] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Strength:</span>
                    <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div
                        key={lvl}
                        className={`h-full flex-1 rounded-full transition-all duration-300 ${
                          passwordScore >= lvl ? strength.color : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Confirm Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className={`w-full pl-10 pr-11 py-2.5 bg-[#0a0d18]/90 border rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none transition-all ${
                    confirmPassword && confirmPassword === password
                      ? 'border-emerald-500/60'
                      : confirmPassword && confirmPassword !== password
                      ? 'border-red-500/60'
                      : 'border-white/10 focus:border-[#ADFF2F]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded bg-[#0a0d18] border-white/20 text-[#ADFF2F] focus:ring-0 cursor-pointer accent-[#ADFF2F]"
                />
                <span className="text-xs text-slate-300 leading-snug">
                  I agree to the Chill Arena{' '}
                  <span className="text-[#00F0FF] underline">Terms of Service</span>,{' '}
                  <span className="text-[#00F0FF] underline">Fair Play Anti-Cheat Policy</span>, and Cloud Profile Sync.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#ADFF2F] via-[#70FF00] to-[#00F0FF] text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(173,255,47,0.35)] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Gamer Account...</span>
                </>
              ) : (
                <>
                  <span>Create Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#121624] px-3 text-slate-500 font-bold tracking-wider">
                Or Sign Up With
              </span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isLoading || isGoogleLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold flex items-center justify-center gap-3 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#ADFF2F]" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.54 0 2.9.54 3.96 1.44l2.96-2.96C17.1 1.74 14.74 1 12 1 7.37 1 3.4 3.66 1.46 7.55l3.58 2.78C5.9 7.42 8.7 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.28c0-.79-.07-1.54-.19-2.28H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.68 2.86c2.14-1.98 3.74-4.89 3.74-8.67z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.04 14.67c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09L1.46 7.71C.53 9.57 0 11.72 0 14s.53 4.43 1.46 6.29l3.58-2.78z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.68-2.86c-1.07.72-2.44 1.15-4.25 1.15-3.3 0-6.1-2.42-6.96-5.33L1.46 15.83C3.4 19.72 7.37 23 12 23z"
                />
              </svg>
            )}
            <span>Sign up with Google</span>
          </button>

          {/* Already have account Link */}
          <div className="text-center mt-5 pt-4 border-t border-white/5">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-[#ADFF2F] font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
