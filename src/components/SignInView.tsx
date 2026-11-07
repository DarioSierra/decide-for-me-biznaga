import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { Scale, ArrowRight, ShieldCheck, Sliders, BrainCircuit, AlertCircle } from 'lucide-react';

export const SignInView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      console.error('Sign-in error:', err);
      const message = err instanceof Error ? err.message : 'Sign-in failed. Please try again.';
      if (!message.includes('popup-closed-by-user')) {
        setError('Unable to complete Google sign-in. Please ensure popups are enabled and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
      {/* Background subtle grid pattern */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-8 sm:p-10 transition-all">
        {/* Brand Icon & Heading */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200/70 mb-5">
            <Scale className="w-7 h-7 stroke-[2.5]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Rational Mode Active
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Decide For Me
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2 leading-relaxed">
            A hyper-rational decision assistant for chronically indecisive people facing life-altering trade-offs.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="my-8 space-y-3">
          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-start gap-3 text-left">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Calibrated Priorities</p>
              <p className="text-xs text-slate-500 mt-0.5">Define your core non-negotiables, liquidity rules, and autonomy goals.</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-start gap-3 text-left">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Bias-Neutral Comparison</p>
              <p className="text-xs text-slate-500 mt-0.5">Filter out sunk cost fallacy and status quo anxiety with cold mathematical rigor.</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-start gap-3 text-left">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Cloud Sync & Security</p>
              <p className="text-xs text-slate-500 mt-0.5">Your personal decision criteria is encrypted and synced securely via Firestore.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-semibold text-sm rounded-2xl transition-all shadow-md shadow-slate-300/50 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Authenticating...</span>
            </div>
          ) : (
            <>
              {/* Google G Logo SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.35 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.65 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform ml-auto" />
            </>
          )}
        </button>

        <p className="text-[11px] text-center text-slate-400 mt-5">
          By signing in, you access your personal decision matrix with secure Firestore persistence.
        </p>
      </div>
    </div>
  );
};
