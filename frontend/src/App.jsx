import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import AddExpense from './pages/AddExpense';
import EditExpense from './pages/EditExpense';
import Analytics from './pages/Analytics';
import Budget from './pages/Budget';
import SavingsGoals from './pages/SavingsGoals';
import Profile from './pages/Profile';

/**
 * App Shell for Authenticated Pages
 */
const AuthenticatedLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes inside App Shell */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Dashboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Expenses />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/expenses/add"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <AddExpense />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/expenses/edit/:id"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <EditExpense />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Analytics />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/budget"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Budget />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/savings-goals"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <SavingsGoals />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Profile />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* Default Fallback Redirect to Dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
