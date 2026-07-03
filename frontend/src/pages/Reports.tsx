import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export function Reports() {
  const [daily, setDaily] = useState<any>(null);
  const [monthly, setMonthly] = useState<any>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily');

  const loadDaily = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/daily', { params: { report_date: date } });
      setDaily(res.data);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  const loadMonthly = async () => {
    setLoading(true);
    try {
      const [y, m] = month.split('-');
      const res = await api.get('/reports/monthly', { params: { year: y, month: m } });
      setMonthly(res.data);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Track your collections and payments</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        <button onClick={() => setActiveTab('daily')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'daily' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}>📅 Daily</button>
        <button onClick={() => setActiveTab('monthly')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'monthly' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}>📆 Monthly</button>
      </div>

      {activeTab === 'daily' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Daily Collection Report</h2>
          <div className="flex gap-3">
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <button onClick={loadDaily} disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50">
              {loading ? 'Loading...' : 'Load Report'}
            </button>
          </div>
          {daily && (
            <div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <StatCard label="Total Collection" value={`Rs. ${daily.total_collection.toLocaleString()}`} icon="💰" color="emerald" />
                <StatCard label="Total Payments" value={daily.total_payments.toString()} icon="✅" color="blue" />
                <StatCard label="Date" value={daily.date} icon="📅" color="violet" />
              </div>
              {Object.keys(daily.by_method || {}).length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">By Payment Method</h3>
                  <div className="space-y-2">
                    {Object.entries(daily.by_method).map(([method, amount]: [string, any]) => (
                      <div key={method} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <span className="text-sm font-medium capitalize">{method}</span>
                        <span className="text-sm font-semibold text-slate-700">Rs. {amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'monthly' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Monthly Collection Report</h2>
          <div className="flex gap-3">
            <input type="month" value={month} onChange={e => setMonth(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <button onClick={loadMonthly} disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50">
              {loading ? 'Loading...' : 'Load Report'}
            </button>
          </div>
          {monthly && (
            <div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <StatCard label="Total Collection" value={`Rs. ${monthly.total_collection.toLocaleString()}`} icon="💰" color="emerald" />
                <StatCard label="Total Payments" value={monthly.total_payments.toString()} icon="✅" color="blue" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  const colors: any = {
    emerald: 'from-emerald-500 to-teal-600',
    blue: 'from-blue-500 to-indigo-600',
    violet: 'from-violet-500 to-purple-600',
  };
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xl">{icon}</span>
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-lg`}>
          <span className="text-white text-[10px] font-bold">LL</span>
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}