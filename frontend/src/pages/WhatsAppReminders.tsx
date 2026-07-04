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
  const [message, setMessage] = useState('Assalam-o-Alaikum, your internet package {package} expires on {expiry}. Please renew via JazzCash 03071786655 or EasyPaisa 03078740993. - Lasani Links');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) loadCustomers();
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
      setCustomers(all);
      setFiltered(all);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  const getDaysLeft = (expiryDate: string | null): number | null => {
    if (!expiryDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    return Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysBadge = (days: number | null) => {
    if (days === null) return <span className="text-xs text-slate-400">-</span>;
    if (days < 0) return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">{Math.abs(days)}d ago</span>;
    if (days === 0) return <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Today!</span>;
    if (days === 1) return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Tomorrow</span>;
    if (days <= 3) return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">{days}d left</span>;
    return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{days}d left</span>;
  };

  const applyFilters = () => {
    let result = [...customers];
    
    if (expiryFilter !== '') {
      const days = parseInt(expiryFilter);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      result = result.filter((c: any) => {
        const daysLeft = getDaysLeft(c.expiry_date);
        if (daysLeft === null) return false;
        if (days === -1) return daysLeft < 0; // Already expired
        if (days === 0) return daysLeft === 1; // Tomorrow (remind 1 day early)
        return daysLeft >= 1 && daysLeft <= days + 1; // Remind X days before
      });
    }
    
    if (packageFilter) {
      result = result.filter((c: any) => 
        c.service_plan && c.service_plan.toLowerCase().includes(packageFilter.toLowerCase())
      );
    }
    
    result.sort((a: any, b: any) => {
      const aDays = getDaysLeft(a.expiry_date);
      const bDays = getDaysLeft(b.expiry_date);
      if (aDays === null && bDays === null) return 0;
      if (aDays === null) return 1;
      if (bDays === null) return -1;
      return aDays - bDays;
    });
    
    setFiltered(result);
    setSelected(new Set());
    setCurrentPage(1);
  };

  const toggleSelect = (id: number) => {
    const newSet = new Set(selected);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelected(newSet);
  };

  const selectAll = () => {
    if (selected.size === paginatedData.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginatedData.map((c: any) => c.id)));
    }
  };

  const sendReminders = () => {
    const selectedCustomers = filtered.filter((c: any) => selected.has(c.id));
    if (selectedCustomers.length === 0) return;
    
    if (selectedCustomers.length > 10) {
      if (!confirm(`About to open ${selectedCustomers.length} WhatsApp tabs. Continue?`)) return;
    }
    
    let count = 0;
    const today = new Date().toLocaleDateString('en-PK');
    selectedCustomers.forEach((c: any) => {
      if (c.mobile_phone && c.mobile_phone !== '-' && c.mobile_phone !== 'N/A') {
        const phone = c.mobile_phone.replace(/[^0-9]/g, '');
        const msg = encodeURIComponent(
          message
            .replace('{name}', c.full_name || 'Customer')
            .replace('{package}', c.service_plan || 'N/A')
            .replace('{date}', today)
            .replace('{expiry}', c.expiry_date || 'N/A')
        );
        window.open(`https://wa.me/92${phone}?text=${msg}`, '_blank');
        count++;
      }
    });
    toast.success(`${count} WhatsApp chats opened!`);
  };

  const sendToOne = (customer: any) => {
    if (!customer.mobile_phone || customer.mobile_phone === '-' || customer.mobile_phone === 'N/A') {
      toast.error('No phone number');
      return;
    }
    const phone = customer.mobile_phone.replace(/[^0-9]/g, '');
    const today = new Date().toLocaleDateString('en-PK');
    const msg = encodeURIComponent(
      message
        .replace('{name}', customer.full_name || 'Customer')
        .replace('{package}', customer.service_plan || 'N/A')
        .replace('{date}', today)
        .replace('{expiry}', customer.expiry_date || 'N/A')
    );
    window.open(`https://wa.me/92${phone}?text=${msg}`, '_blank');
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">WhatsApp Reminders</h1>
        <p className="text-sm text-slate-500 mt-1">Remind customers 1 day before expiry</p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 space-y-4">
        <h2 className="text-sm font-semibold text-slate-700">🔍 Filter Customers</h2>
        <div className="flex gap-3 flex-wrap items-end">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Remind Before Expiry</label>
            <select value={expiryFilter} onChange={e => setExpiryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
              <option value="">All Customers</option>
              <option value="0">Tomorrow (1 day before)</option>
              <option value="1">Within 2 Days</option>
              <option value="2">Within 3 Days</option>
              <option value="4">Within 5 Days</option>
              <option value="6">Within 7 Days</option>
              <option value="14">Within 15 Days</option>
              <option value="29">Within 30 Days</option>
              <option value="-1">Already Expired</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Package</label>
            <select value={packageFilter} onChange={e => setPackageFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
              <option value="">All</option>
              {['10MB','15MB','20MB','25MB','30MB','40MB','50MB','80MB'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <button onClick={applyFilters} className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-medium">Apply</button>
          <button onClick={() => { setExpiryFilter(''); setPackageFilter(''); setFiltered(customers); setCurrentPage(1); }}
            className="px-5 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm">Clear</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
        <h2 className="text-sm font-semibold text-slate-700 mb-2">✏️ Message</h2>
        <textarea value={message} onChange={e => setMessage(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" rows={3} />
        <p className="text-xs text-slate-400 mt-1">Use {'{name}'}, {'{package}'}, {'{date}'}, and {'{expiry}'} as placeholders</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-200">
          <span className="font-semibold text-slate-700">{filtered.length} customers</span>
          <div className="flex gap-2">
            <button onClick={selectAll} className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200 transition-colors">
              {selected.size === paginatedData.length && paginatedData.length > 0 ? 'Deselect Page' : 'Select Page'}
            </button>
            <button onClick={sendReminders} disabled={selected.size === 0}
              className="px-5 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:shadow-lg transition-all">
              Send to {selected.size}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead><tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase">
              <th className="px-3 py-3">☐</th>
              <th className="px-3 py-3">Device</th>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Phone</th>
              <th className="px-3 py-3">Package</th>
              <th className="px-3 py-3">Expiry</th>
              <th className="px-3 py-3">Days Left</th>
              <th className="px-3 py-3">Send</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.map((c: any) => (
                <tr key={c.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-3 py-3"><input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} /></td>
                  <td className="px-3 py-3 text-sm font-medium">{c.device_ppp}</td>
                  <td className="px-3 py-3 text-sm">{c.full_name}</td>
                  <td className="px-3 py-3 text-sm">{c.mobile_phone || '-'}</td>
                  <td className="px-3 py-3 text-sm">{c.service_plan || '-'}</td>
                  <td className="px-3 py-3 text-sm">{c.expiry_date || '-'}</td>
                  <td className="px-3 py-3">{daysBadge(getDaysLeft(c.expiry_date))}</td>
                  <td className="px-3 py-3">
                    <button onClick={() => sendToOne(c)} className="text-green-600 hover:text-green-700 text-xs font-medium">📱 Send</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-5 py-3 border-t bg-slate-50">
            <span className="text-xs text-slate-500">Page {currentPage} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="px-3 py-1 bg-white border rounded-lg text-xs disabled:opacity-50 hover:bg-slate-100">← Prev</button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="px-3 py-1 bg-white border rounded-lg text-xs disabled:opacity-50 hover:bg-slate-100">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}