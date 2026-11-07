import React from 'react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Scale, LogOut } from 'lucide-react';

interface HeaderProps {
  user: User;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const handleSignOut = () => {
    signOut(auth).catch((err) => console.error('Sign out error:', err));
  };

  return (
    <header className="px-6 sm:px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-white/90 backdrop-blur z-20 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
          <Scale className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-slate-900 leading-none">
            Decide For Me
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Hyper-Rational Decision Engine
          </p>
        </div>
      </div>

      {/* Right Actions & User Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Status Pill */}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Rational Mode Active
        </span>

        {/* User Account & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-7 h-7 rounded-full border border-slate-200 object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
          )}

          <span className="hidden md:inline-block text-xs font-semibold text-slate-700 max-w-[130px] truncate">
            {user.displayName || user.email?.split('@')[0]}
          </span>

          <button
            type="button"
            onClick={handleSignOut}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
