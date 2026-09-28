import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Menu, Plus, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
            Hey, {user?.name ? user.name.split(' ')[0] : 'there'}! 👋
          </h2>
          <p className="text-xs text-slate-600 hidden sm:block">
            Track your spending & hit your savings goals.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Add Expense Button */}
        <Link
          to="/expenses/add"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 text-white font-semibold text-xs sm:text-sm shadow-sm hover:bg-brand-700 transition-all hover:shadow hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Expense</span>
          <span className="sm:hidden">Add</span>
        </Link>

        {/* User Pill / Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <Link
            to="/profile"
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            title="View Profile"
          >
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>
            <span className="text-xs font-semibold text-slate-700 hidden md:block">
              {user?.name}
            </span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
