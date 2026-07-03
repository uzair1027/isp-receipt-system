import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export function PaymentDue() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      let all: any[] = [];
      for (let page = 1; page <= 10; page++) {
        const res = await api.get('/customers/', { params: { page, page_size: 100 } });
        all = all.concat(res.data.customers);
        if (res.data.customers.length < 100) break;
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const processed = all.map((c: any) => {
        const expiry = c.expiry_date ? new Date(c.expiry_date) : null;
        let status = 'unknown';
        let daysLeft: number | null = null;
        
        if (expiry) {
          const diffTime = expiry.getTime() - today.getTime();
          daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (daysLeft < 0) status = 'expired';
          else if (daysLeft === 0) status = 'today';
          else if (daysLeft <= 3) status = 'soon';
          else if (daysLeft <= 7) status = 'week';
          else status = 'ok';
        }
        return { ...c, status, daysLeft };
      });
      
      processed.sort((a: any, b: any) => {
        if (a.daysLeft === null) return 1;
        if (b.daysLeft === null) return -1;
        return a.daysLeft - b.daysLeft;
      });
      
      setCustomers(processed);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const filtered = filter === 'all' ? customers : customers.filter((c: any) => c.status === filter);

  const stats: any = {};
  ['expired', 'today', 'soon', 'week'].forEach(s => {
    stats[s] = customers.filter((c: any) => c.status === s).length;
  });

  const badge = (c: any) => {
    if (c.status === 'expired') return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">Expired {Math.abs(c.daysLeft)}d</span>;
    if (c.status === 'today') return <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Today!</span>;
    if (c.status === 'soon') return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">in {c.daysLeft}d</span>;
    if (c.status === 'week') return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">in {c.daysLeft}d</span>;
    if (c.status === 'ok') return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">OK</span>;
    return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">No Date</span>;
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Payment Due Alerts</h1>

      <div className="grid grid-cols-4 gap-4 mb-4">
        {[{s:'expired',l:'Expired',c:'red'},{s:'today',l:'Due Today',c:'orange'},{s:'soon',l:'Due in 3 Days',c:'yellow'},{s:'week',l:'Due this Week',c:'blue'}].map(({s,l,c}) => (
          <div key={s} onClick={() => setFilter(s)} className={`bg-${c}-50 border border-${c}-200 rounded-xl p-4 cursor-pointer`}>
            <p className={`text-3xl font-bold text-${c}-600`}>{stats[s] || 0}</p>
            <p className={`text-sm text-${c}-500 font-medium`}>{l}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {['all','expired','today','soon','week'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize ${filter === f ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {f} ({f === 'all' ? customers.length : stats[f] || 0})
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50"><tr>
            <th className="text-left px-4 py-3 text-xs text-gray-500">Device</th>
            <th className="text-left px-4 py-3 text-xs text-gray-500">Customer</th>
            <th className="text-left px-4 py-3 text-xs text-gray-500">Phone</th>
            <th className="text-left px-4 py-3 text-xs text-gray-500">Package</th>
            <th className="text-left px-4 py-3 text-xs text-gray-500">Expiry</th>
            <th className="text-left px-4 py-3 text-xs text-gray-500">Status</th>
            <th className="text-left px-4 py-3 text-xs text-gray-500">Action</th>
          </tr></thead>
          <tbody className="divide-y">
            {filtered.slice(0, 200).map((c: any) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{c.device_ppp}</td>
                <td className="px-4 py-3 text-sm">{c.full_name}</td>
                <td className="px-4 py-3 text-sm">{c.mobile_phone || '-'}</td>
                <td className="px-4 py-3 text-sm">{c.service_plan || '-'}</td>
                <td className="px-4 py-3 text-sm">{c.expiry_date || '-'}</td>
                <td className="px-4 py-3">{badge(c)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => navigate(`/customers/${c.id}`)} className="text-blue-600 text-sm font-medium">Collect</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
