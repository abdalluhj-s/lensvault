'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Camera, Lock, Mail, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { UserRole } from '@/types';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('both');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username,
            role,
          },
        },
      });

      if (authError) {
        router.push('/profile');
      } else {
        router.push('/profile');
      }
    } catch {
      router.push('/profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[85vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-md">
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20">
            <Camera className="h-6 w-6 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Join LensVault</h1>
          <p className="mt-1 text-xs text-zinc-400">The marketplace for authentic optical photography</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-950/30 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Elena Vance"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="elena_v"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="elena@lensvault.com"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">I want to:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`rounded-xl py-2 text-xs font-medium border transition-all ${
                  role === 'buyer'
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                }`}
              >
                Buy Licenses
              </button>
              <button
                type="button"
                onClick={() => setRole('seller')}
                className={`rounded-xl py-2 text-xs font-medium border transition-all ${
                  role === 'seller'
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                }`}
              >
                Sell Captures
              </button>
              <button
                type="button"
                onClick={() => setRole('both')}
                className={`rounded-xl py-2 text-xs font-medium border transition-all ${
                  role === 'both'
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                }`}
              >
                Both
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-zinc-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50"
          >
            <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 border-t border-zinc-800 pt-4 text-center text-xs text-zinc-400">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-semibold text-emerald-400 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
