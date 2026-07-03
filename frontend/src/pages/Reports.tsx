import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export function Reports() {
  const [daily, setDaily] = useState<any>(null);
  const [monthly, setMonthly] = useState<any>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(false);

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
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports</h1>

      {/* Daily Report */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
        <h2 className="text-lg font-semibold mb-4">Daily Collection</h2>
        <div className="flex gap-3 mb-4">
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="px-3 py-2 border rounded-lg" />
          <button onClick={loadDaily} disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            Load
          </button>
        </div>
        {daily && (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <StatBox label="Total Collection" value={`Rs. ${daily.total_collection.toLocaleString()}`} />
              <StatBox label="Total Payments" value={daily.total_payments.toString()} />
              <StatBox label="Date" value={daily.date} />
            </div>
            {Object.entries(daily.by_method || {}).map(([method, amount]: [string, any]) => (
              <div key={method} className="flex justify-between py-2 border-b">
                <span className="capitalize">{method}</span>
                <span className="font-medium">Rs. {amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Report */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Monthly Collection</h2>
        <div className="flex gap-3 mb-4">
          <input type="month" value={month} onChange={e => setMonth(e.target.value)}
            className="px-3 py-2 border rounded-lg" />
          <button onClick={loadMonthly} disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            Load
          </button>
        </div>
        {monthly && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <StatBox label="Total Collection" value={`Rs. ${monthly.total_collection.toLocaleString()}`} />
              <StatBox label="Total Payments" value={monthly.total_payments.toString()} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
