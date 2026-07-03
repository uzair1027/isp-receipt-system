import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthStore } from './features/auth/hooks/useAuth';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { CustomerDetails } from './pages/CustomerDetails';
import { CSVImport } from './pages/CSVImport';
import { Settings } from './pages/Settings';
import { WhatsAppReminders } from "./pages/WhatsAppReminders";
import { Reports } from './pages/Reports';
import { Logo } from './components/Logo';

const queryClient = new QueryClient();

function ProtectedRoute({ children, adminOnly }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const Icons = {
  dashboard: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" /></svg>,
  customers: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  import: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  reports: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  settings: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
};

function Sidebar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname.startsWith(path);
  const linkClass = (path: string) => {
    const active = isActive(path);
    return `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
    }`;
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-56 bg-white border-r border-gray-200 z-50 flex flex-col">
      <Link to="/dashboard" className="flex items-center gap-2 h-16 px-4 border-b border-gray-200 hover:bg-gray-50">
        <Logo size={32} />
        <div>
          <span className="font-semibold text-sm text-gray-900 leading-tight">Lasani Links</span>
          <p className="text-[10px] text-gray-400 leading-tight">Receipt Manager</p>
        </div>
      </Link>
      <nav className="flex-1 px-3 py-4 space-y-1">
        <Link to="/dashboard" className={linkClass('/dashboard')}>{Icons.dashboard} Dashboard</Link>
        <Link to="/customers" className={linkClass('/customers')}>{Icons.customers} Customers</Link>
        {user?.role === 'admin' && (
          <Link to="/import" className={linkClass('/import')}>{Icons.import} Import CSV</Link>
        )}
        <Link to="/reports" className={linkClass('/reports')}>{Icons.reports} Reports</Link>
        <Link to="/whatsapp" className={linkClass("/whatsapp")}>?? WhatsApp</Link>
        {user?.role === 'admin' && (
          <Link to="/settings" className={linkClass('/settings')}>{Icons.settings} Settings</Link>
        )}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <p className="text-sm font-medium truncate">{user?.full_name}</p>
        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        <button onClick={logout} className="text-xs text-red-500 hover:text-red-700 mt-1">Logout</button>
      </div>
    </aside>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-56">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  const { checkAuth, user } = useAuthStore();
  useEffect(() => { checkAuth(); }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><Layout><Customers /></Layout></ProtectedRoute>} />
          <Route path="/customers/:id" element={<ProtectedRoute><Layout><CustomerDetails /></Layout></ProtectedRoute>} />
          <Route path="/import" element={<ProtectedRoute adminOnly><Layout><CSVImport /></Layout></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
          <Route path="/whatsapp" element={<ProtectedRoute><Layout><WhatsAppReminders /></Layout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute adminOnly><Layout><Settings /></Layout></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
