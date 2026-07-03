import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { customerService, Customer } from '../services/customerService';
import { paymentService } from '../services/paymentService';
import api from '../services/api';

export function Dashboard() {
  const navigate = useNavigate();
  const [quickSearch, setQuickSearch] = useState('');
  const [quickResults, setQuickResults] = useState<Customer[]>([]);
  const [weeklyData, setWeeklyData] = useState<number[]>([]);
  const [monthlyData, setMonthlyData] = useState<number[]>([]);

  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => paymentService.getDashboardStats(),
    refetchInterval: 30000,
  });

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    try {
      const today = new Date();
      // Last 7 days
      const week: number[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        try {
          const res = await api.get('/reports/daily', { params: { report_date: dateStr } });
          week.push(res.data.total_collection || 0);
        } catch { week.push(0); }
      }
      setWeeklyData(week);

      // Last 6 months
      const months: number[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        try {
          const res = await api.get('/reports/monthly', { params: { year: y, month: m } });
          months.push(res.data.total_collection || 0);
        } catch { months.push(0); }
      }
      setMonthlyData(months);
    } catch {}
  };

  const handleSearch = async (query: string) => {
    setQuickSearch(query);
    if (query.length < 2) { setQuickResults([]); return; }
    try {
      const results = await customerService.search(query, 5);
      setQuickResults(results);
    } catch { setQuickResults([]); }
  };

  const maxWeek = Math.max(...weeklyData, 1);
  const maxMonth = Math.max(...monthlyData, 1);
  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();
  const currentMonths: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    currentMonths.push(monthLabels[d.getMonth()]);
  }

  const cards = [
    { label: "Today's Collection", value: `Rs. ${(stats?.today_collection || 0).toLocaleString()}`, icon: '💰', color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    { label: 'Monthly Collection', value: `Rs. ${(stats?.monthly_collection || 0).toLocaleString()}`, icon: '📊', color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', text: 'text-blue-700' },
    { label: 'Payments Today', value: stats?.payments_today || '0', icon: '✅', color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-700' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Welcome back! Here's your overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon, color, bg, text }) => (
          <div key={label} className={`${bg} rounded-2xl p-5 border border-slate-200/60 hover:shadow-lg transition-shadow`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{icon}</span>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                <span className="text-white text-xs font-bold">LL</span>
              </div>
            </div>
            <p className={`text-3xl font-bold ${text}`}>{value}</p>
            <p className="text-sm text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekly Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">📅 Last 7 Days Collection</h2>
          <div className="flex items-end gap-2 h-40">
            {weeklyData.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-slate-500 font-medium">Rs.{val.toLocaleString()}</span>
                <div className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500"
                  style={{ height: `${(val / maxWeek) * 100}%`, minHeight: '4px' }} />
                <span className="text-[10px] text-slate-400">{weekLabels[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">📈 Last 6 Months</h2>
          <div className="flex items-end gap-2 h-40">
            {monthlyData.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-slate-500 font-medium">Rs.{val.toLocaleString()}</span>
                <div className="w-full bg-gradient-to-t from-violet-500 to-violet-400 rounded-t-lg transition-all hover:from-violet-600 hover:to-violet-500"
                  style={{ height: `${(val / maxMonth) * 100}%`, minHeight: '4px' }} />
                <span className="text-[10px] text-slate-400">{currentMonths[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Search */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 relative">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">🔍 Quick Customer Search</h2>
        <div className="relative">
          <input type="text" value={quickSearch} onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name, phone, or device PPP..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          {quickSearch.length >= 2 && (
            <span className="absolute right-3 top-3 text-xs text-slate-400">{quickResults.length} results</span>
          )}
        </div>
        {quickResults.length > 0 && (
          <div className="absolute z-10 left-6 right-6 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
            {quickResults.map((c) => (
              <button key={c.id} onClick={() => navigate(`/customers/${c.id}`)}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-slate-100 last:border-0 transition-colors">
                <p className="font-medium text-slate-800">{c.full_name}</p>
                <p className="text-xs text-slate-500">{c.device_ppp}{c.mobile_phone ? ' | ' + c.mobile_phone : ''}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
