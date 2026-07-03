import { useState } from 'react';
import api from '../services/api';

export function ProfitDashboard() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadProfit = async () => {
    setLoading(true);
    try {
      const [y, m] = month.split('-');
      const res = await api.get('/reports/monthly', { params: { year: y, month: m } });
      setData(res.data);
    } catch {} finally { setLoading(false); }
  };

  // Calculate estimated profit (revenue - estimated costs)
  const revenue = data?.total_collection || 0;
  const estimatedCosts = revenue * 0.3; // 30% estimated costs
  const profit = revenue - estimatedCosts;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Profit Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Monthly revenue & profit tracking</p>
      </div>

      <div className="flex gap-3">
        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
          className="px-4 py-2.5 bg-white border rounded-xl text-sm" />
        <button onClick={loadProfit} disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-medium">
          {loading ? 'Loading...' : 'Calculate'}
        </button>
      </div>

      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <p className="text-sm text-slate-500">💰 Total Revenue</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">Rs. {revenue.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <p className="text-sm text-slate-500">📉 Est. Costs (30%)</p>
            <p className="text-3xl font-bold text-red-500 mt-2">Rs. {estimatedCosts.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <p className="text-sm text-slate-500">📈 Net Profit</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">Rs. {profit.toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}