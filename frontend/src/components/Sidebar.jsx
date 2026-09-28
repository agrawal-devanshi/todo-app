import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  PieChart,
  Target,
  PiggyBank,
  User,
  Sparkles,
  X,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Expenses', path: '/expenses', icon: Receipt },
  { name: 'Add Expense', path: '/expenses/add', icon: PlusCircle, isHighlight: true },
  { name: 'Analytics', path: '/analytics', icon: PieChart },
  { name: 'Budget', path: '/budget', icon: Target },
  { name: 'Savings Goals', path: '/savings-goals', icon: PiggyBank },
  { name: 'Profile', path: '/profile', icon: User },
];

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white/95 border-r border-slate-200/80 backdrop-blur-md flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:z-auto`}
      >
        <div>
          {/* Logo & Close on mobile */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 font-display font-extrabold text-lg">
                TS
              </div>
              <div>
                <span className="text-lg font-extrabold text-slate-900 tracking-tight font-display">
                  Teen<span className="text-brand-600">Spend</span>
                </span>
                <span className="block text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                  Smart Money Tracker
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                        : item.isHighlight
                        ? 'text-brand-600 bg-brand-50/70 hover:bg-brand-100/70'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Friendly Motto Badge */}
        <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-brand-50 to-indigo-50/50 border border-brand-100/80">
          <div className="flex items-center gap-2 text-brand-700 text-xs font-bold mb-1">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span>Teen Habit Tip</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            "Know where your money goes. Small changes can add up."
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
