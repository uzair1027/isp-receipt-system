import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export function WhatsAppReminders() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [expiryFilter, setExpiryFilter] = useState('');
  const [packageFilter, setPackageFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Assalam-o-Alaikum, your internet bill is due. Please pay via JazzCash 03071786655 or EasyPaisa 03078740993. - Lasani Links');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers/', { params: { page: 1, page_size: 100 } });
      setCustomers(res.data.customers);
      setFiltered(res.data.customers);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  const applyFilters = () => {
    let result = [...customers];
    
    if (expiryFilter) {
      const filterDate = new Date(expiryFilter);
      result = result.filter((c: any) => {
        if (!c.expiry_date) return false;
        const expDate = new Date(c.expiry_date);
        const diffDays = Math.ceil((expDate.getTime() - filterDate.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 3; // Expiring within 3 days
      });
    }
    
    if (packageFilter) {
      result = result.filter((c: any) => 
        c.service_plan && c.service_plan.toLowerCase().includes(packageFilter.toLowerCase())
      );
    }
    
    setFiltered(result);
    setSelected(new Set());
  };

  const toggleSelect = (id: number) => {
    const newSet = new Set(selected);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelected(newSet);
  };

  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((c: any) => c.id)));
    }
  };

  const sendReminders = () => {
    const selectedCustomers = filtered.filter((c: any) => selected.has(c.id));
    let count = 0;
    
    selectedCustomers.forEach((c: any) => {
      if (c.mobile_phone && c.mobile_phone !== '-' && c.mobile_phone !== 'N/A') {
        const phone = c.mobile_phone.replace(/[^0-9]/g, '');
        const msg = encodeURIComponent(
          message
            .replace('{name}', c.full_name || 'Customer')
            .replace('{package}', c.service_plan || 'N/A')
        );
        setTimeout(() => {
          window.open(`https://wa.me/92${phone}?text=${msg}`, '_blank');
        }, count * 500);
        count++;
      }
    });
    
    toast.success(`Opening ${count} WhatsApp chats...`);
  };

  const sendToOne = (customer: any) => {
    if (!customer.mobile_phone || customer.mobile_phone === '-' || customer.mobile_phone === 'N/A') {
      toast.error('No phone number');
      return;
    }
    const phone = customer.mobile_phone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      message
        .replace('{name}', customer.full_name || 'Customer')
        .replace('{package}', customer.service_plan || 'N/A')
    );
    window.open(`https://wa.me/92${phone}?text=${msg}`, '_blank');
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">WhatsApp Reminders</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border mb-6 space-y-3">
        <h2 className="font-semibold">Filter Customers</h2>
        <div className="flex gap-3 flex-wrap">
          <div>
            <label className="text-xs text-gray-500 block">Expiry Date (within 3 days)</label>
            <input type="date" value={expiryFilter} onChange={e => setExpiryFilter(e.target.value)} className="px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block">Package</label>
            <select value={packageFilter} onChange={e => setPackageFilter(e.target.value)} className="px-3 py-2 border rounded-lg">
              <option value="">All Packages</option>
              <option value="10MB">10MB</option>
              <option value="15MB">15MB</option>
              <option value="20MB">20MB</option>
              <option value="25MB">25MB</option>
              <option value="30MB">30MB</option>
              <option value="40MB">40MB</option>
              <option value="50MB">50MB</option>
              <option value="80MB">80MB</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button onClick={applyFilters} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Apply Filter</button>
            <button onClick={() => { setExpiryFilter(''); setPackageFilter(''); setFiltered(customers); }} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Clear</button>
          </div>
        </div>
      </div>

      {/* Message Template */}
      <div className="bg-white rounded-xl shadow-sm p-4 border mb-6">
        <h2 className="font-semibold mb-2">Message Template</h2>
        <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full px-3 py-2 border rounded-lg" rows={3} />
        <p className="text-xs text-gray-500 mt-1">Use {'{name}'} and {'{package}'} as placeholders</p>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-6">
        <div className="flex justify-between items-center p-4 border-b">
          <span className="font-semibold">{filtered.length} customers</span>
          <div className="flex gap-2">
            <button onClick={selectAll} className="px-4 py-1.5 bg-gray-200 rounded-lg text-sm">
              {selected.size === filtered.length ? 'Deselect All' : 'Select All'}
            </button>
            <button onClick={sendReminders} disabled={selected.size === 0} className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm disabled:opacity-50">
              Send to {selected.size} Selected
            </button>
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2 text-xs text-gray-500">Select</th>
              <th className="text-left px-4 py-2 text-xs text-gray-500">Device</th>
              <th className="text-left px-4 py-2 text-xs text-gray-500">Name</th>
              <th className="text-left px-4 py-2 text-xs text-gray-500">Phone</th>
              <th className="text-left px-4 py-2 text-xs text-gray-500">Package</th>
              <th className="text-left px-4 py-2 text-xs text-gray-500">Expiry</th>
              <th className="text-left px-4 py-2 text-xs text-gray-500">Send</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.slice(0, 100).map((c: any) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">
                  <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} className="w-4 h-4" />
                </td>
                <td className="px-4 py-2 text-sm">{c.device_ppp}</td>
                <td className="px-4 py-2 text-sm">{c.full_name}</td>
                <td className="px-4 py-2 text-sm">{c.mobile_phone || '-'}</td>
                <td className="px-4 py-2 text-sm">{c.service_plan || '-'}</td>
                <td className="px-4 py-2 text-sm">{c.expiry_date || '-'}</td>
                <td className="px-4 py-2">
                  <button onClick={() => sendToOne(c)} className="text-green-600 hover:text-green-800 text-xs font-medium">
                    ?? WhatsApp
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
