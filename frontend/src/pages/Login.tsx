import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/hooks/useAuth';
import toast from 'react-hot-toast';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) { toast.error('Please enter username and password'); return; }
    try {
      await login(username, password);
      toast.success('Welcome!');
      navigate('/dashboard');
    } catch (err: any) {
      const data = err?.response?.data?.detail;
      let msg = 'Invalid username or password';
      if (Array.isArray(data) && data.length > 0) msg = data[0]?.msg || msg;
      else if (typeof data === 'string' && data) msg = data;
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Left Brand */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center">
          <div className="w-28 h-28 mx-auto mb-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30 rotate-3 hover:rotate-0 transition-transform">
            <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">Lasani Links</h1>
          <p className="text-xl text-blue-200/80 font-light">Receipt Management System</p>
          <div className="mt-10 flex gap-4 justify-center">
            <div className="px-4 py-2 bg-white/10 backdrop-blur rounded-full text-white/60 text-sm">💻 ISP Solutions</div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur rounded-full text-white/60 text-sm">📄 Digital Receipts</div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur rounded-full text-white/60 text-sm">💰 Easy Payments</div>
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Lasani Links</h2>
              <p className="text-blue-200/60 text-sm mt-1">Sign in to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400">👤</span>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Enter your username" required autoFocus />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400">🔒</span>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Enter your password" required />
                </div>
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-blue-500/30">
                {isLoading ? 'Signing in...' : 'Sign In →'}
              </button>
            </form>

            <p className="text-center text-slate-400 text-xs mt-6">
              Secure login for authorized staff only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}