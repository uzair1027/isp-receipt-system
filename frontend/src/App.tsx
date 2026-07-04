import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAuthStore } from './features/auth/hooks/useAuth';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { CustomerDetails } from './pages/CustomerDetails';
import { CSVImport } from './pages/CSVImport';
import { Settings } from './pages/Settings';
import { WhatsAppReminders } from './pages/WhatsAppReminders';
import { PaymentDue } from './pages/PaymentDue';
import { Reports } from './pages/Reports';
import { ProfitDashboard } from './pages/ProfitDashboard';
import { CustomerPortal } from './pages/CustomerPortal';

const queryClient = new QueryClient();

function ProtectedRoute({ children, adminOnly }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const menuItems = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/customers', icon: '👥', label: 'Customers' },
  { to: '/due', icon: '⚠️', label: 'Due Alerts' },
  { to: '/reports', icon: '📈', label: 'Reports' },
  { to: '/profit', icon: '💎', label: 'Profit' },
  { to: '/whatsapp', icon: '💬', label: 'WhatsApp' },
  { to: '/import', icon: '📥', label: 'Import CSV', admin: true },
  { to: '/settings', icon: '⚙️', label: 'Settings', admin: true },
];

function Sidebar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  const sidebarContent = (
    <>
      <Link to="/dashboard" onClick={closeMobile} className="flex items-center gap-3 h-16 px-5 border-b border-white/5">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div>
          <span className="font-semibold text-white text-sm leading-tight">Lasani Links</span>
          <p className="text-[10px] text-slate-400 leading-tight">Receipt Manager</p>
        </div>
      </Link>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {menuItems.filter(m => !m.admin || user?.role === 'admin').map(({ to, icon, label }) => {
          const active = location.pathname.startsWith(to);
          return (
            <Link key={to} to={to} onClick={closeMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}>
              <span className="text-lg">{icon}</span> {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium truncate">{user?.full_name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <button onClick={() => { logout(); closeMobile(); }} className="w-full mt-3 px-3 py-1.5 text-xs text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors text-left">
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg text-lg">
        ☰
      </button>

      {/* Mobile overlay */}
      {mobileOpen && <div onClick={closeMobile} className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" />}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-60 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 z-50 flex-col shadow-2xl shadow-black/20">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <aside className={`lg:hidden fixed top-0 left-0 h-full w-60 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 z-50 flex-col shadow-2xl transition-transform duration-300 flex ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebarContent}
      </aside>
    </>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />
      <div className="lg:pl-60 pt-16 lg:pt-0">
        <main className="p-3 sm:p-4 lg:p-6">{children}</main>
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
        <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', borderRadius: '12px', fontSize: '14px' } }} />
        <Routes>
          <Route path="/portal" element={<CustomerPortal />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><Layout><Customers /></Layout></ProtectedRoute>} />
          <Route path="/customers/:id" element={<ProtectedRoute><Layout><CustomerDetails /></Layout></ProtectedRoute>} />
          <Route path="/import" element={<ProtectedRoute adminOnly><Layout><CSVImport /></Layout></ProtectedRoute>} />
          <Route path="/due" element={<ProtectedRoute><Layout><PaymentDue /></Layout></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
          <Route path="/profit" element={<ProtectedRoute><Layout><ProfitDashboard /></Layout></ProtectedRoute>} />
          <Route path="/whatsapp" element={<ProtectedRoute><Layout><WhatsAppReminders /></Layout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute adminOnly><Layout><Settings /></Layout></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}