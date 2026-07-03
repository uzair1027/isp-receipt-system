import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { customerService, Customer } from '../services/customerService';
import { paymentService } from '../services/paymentService';

export function Dashboard() {
  const navigate = useNavigate();
  const [quickSearch, setQuickSearch] = useState('');
  const [quickResults, setQuickResults] = useState<Customer[]>([]);

  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => paymentService.getDashboardStats(),
    refetchInterval: 30000,
  });

  const handleSearch = async (query: string) => {
    setQuickSearch(query);
    if (query.length < 2) { setQuickResults([]); return; }
    const results = await customerService.search(query, 5);
    setQuickResults(results);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard label="Today's Collection" value={`Rs. ${stats?.today_collection?.toLocaleString() || '0'}`} color="green" />
        <StatCard label="Monthly Collection" value={`Rs. ${stats?.monthly_collection?.toLocaleString() || '0'}`} color="blue" />
        <StatCard label="Payments Today" value={stats?.payments_today?.toString() || '0'} color="purple" />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 relative">
        <h2 className="text-lg font-semibold mb-3">Quick Customer Search</h2>
        <input
          type="text" value={quickSearch} onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name, phone, or device PPP..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        {quickResults.length > 0 && (
          <div className="absolute z-10 left-6 right-6 mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {quickResults.map((c) => (
              <button key={c.id} onClick={() => navigate(`/customers/${c.id}`)}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-0">
                <p className="font-medium">{c.full_name}</p>
                <p className="text-sm text-gray-500">{c.device_ppp}{c.mobile_phone ? ' | ' + c.mobile_phone : ''}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colors: any = { green: 'bg-green-50 border-green-200', blue: 'bg-blue-50 border-blue-200', purple: 'bg-purple-50 border-purple-200' };
  return (
    <div className={`rounded-xl p-6 border ${colors[color]}`}>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
