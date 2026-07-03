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

  const revenue = data?.total_collection || 0;
  const costs = Math.round(revenue * 0.3);
  const profit = revenue - costs;
  const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Profit Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Monthly revenue & profit analysis</p>
      </div>

      <div className="flex gap-3 items-center">
        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm" />
        <button onClick={loadProfit} disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-medium">
          {loading ? 'Calculating...' : 'Calculate Profit'}
        </button>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <span className="text-2xl">💰</span>
              <p className="text-3xl font-bold text-emerald-600 mt-2">Rs. {revenue.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Total Revenue</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <span className="text-2xl">📉</span>
              <p className="text-3xl font-bold text-red-500 mt-2">Rs. {costs.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Est. Costs</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <span className="text-2xl">📈</span>
              <p className="text-3xl font-bold text-blue-600 mt-2">Rs. {profit.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Net Profit ({margin}%)</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Profit Breakdown</h2>
            <div className="w-full h-10 bg-slate-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 flex items-center justify-center text-white text-xs font-bold"
                style={{ width: `${(profit/revenue)*100}%`, minWidth: profit > 0 ? '30px' : '0' }}>
                {profit > 0 ? `Profit ${margin}%` : ''}
              </div>
              <div className="h-full bg-gradient-to-r from-red-400 to-red-300 flex items-center justify-center text-white text-xs font-bold"
                style={{ width: `${(costs/revenue)*100}%` }}>
                Costs {((costs/revenue)*100).toFixed(0)}%
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}