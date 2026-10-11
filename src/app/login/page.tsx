'use client';

import React, { useState } from 'react';
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
  ShieldCheck
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithEmail, loginWithGoogle, user } = useAppStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!identifier.trim()) {
      setErrorMsg('Please enter your email.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);
    soundFx.playClick();

    try {
      const result = await loginWithEmail(identifier, password, rememberMe);
      if (result.success) {
        setSuccessMsg('Welcome back! Launching your gamer arena...');
        soundFx.playLevelUp();
        setTimeout(() => {
          router.push('/dashboard');
        }, 800);
      } else {
        setErrorMsg(result.error || 'Invalid credentials or account not found.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login failed. Please verify your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsGoogleLoading(true);
    soundFx.playClick();

    try {
      const res = await loginWithGoogle();
      if (res.success) {
        setSuccessMsg('Google Authenticated! Loading profile...');
        soundFx.playLevelUp();
        setTimeout(() => {
          router.push('/dashboard');
        }, 800);
      } else {
        setErrorMsg(res.error || 'Google login was interrupted.');
      }
    } catch (err: any) {
      setErrorMsg('Google login failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-[#00F0FF]/15 via-[#ADFF2F]/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#FF0055]/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Top Branding Card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00F0FF]/20 to-[#ADFF2F]/20 border border-[#00F0FF]/30 shadow-[0_0_25px_rgba(0,240,255,0.25)] mb-4 animate-bounce">
            <Gamepad2 className="w-7 h-7 text-[#00F0FF]" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            Welcome to <span className="bg-gradient-to-r from-[#00F0FF] via-[#ADFF2F] to-white bg-clip-text text-transparent">Chill Arena</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Sign in to sync high scores, rank up on leaderboards, and claim rewards
          </p>
        </div>

        {/* Main Form Glass Card */}
        <div className="bg-[#121624]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative">
          {/* Neon Top Edge Accent */}
          <div className="absolute top-0 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent" />

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300">Authentication Alert</p>
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

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="gamer@chillarena.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#0a0d18]/90 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#00F0FF] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-[#0a0d18]/90 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#0a0d18] border-white/20 text-[#00F0FF] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#00F0FF]"
                />
                <span className="text-xs text-slate-300">Remember my gamer session</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#00F0FF] via-[#00C2FF] to-[#0088FF] text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(0,240,255,0.35)] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Enter Arena</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#121624] px-3 text-slate-500 font-bold tracking-wider">
                Or Continue With
              </span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
            className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold flex items-center justify-center gap-3 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#00F0FF]" />
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
            <span>Sign in with Google</span>
          </button>

          {/* Sign Up Link */}
          <div className="text-center mt-6 pt-4 border-t border-white/5">
            <p className="text-xs text-slate-400">
              New to Chill Arena?{' '}
              <Link href="/signup" className="text-[#00F0FF] font-bold hover:underline">
                Create Free Account
              </Link>
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>SaaS-Grade End-to-End Auth & Cloud Anti-Cheat</span>
        </div>
      </div>
    </div>
  );
}
