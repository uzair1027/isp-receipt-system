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
  const [message, setMessage] = useState('Assalam-o-Alaikum, your internet bill of {package} is due on {expiry}. Please pay via JazzCash 03071786655 or EasyPaisa 03078740993. - Lasani Links');

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

  const applyFilters = () => {
    let result = [...customers];
    
    if (expiryFilter !== '') {
      const days = parseInt(expiryFilter);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      result = result.filter((c: any) => {
        if (!c.expiry_date) return false;
        const expDate = new Date(c.expiry_date);
        const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (days === -1) return diffDays < 0; // Already expired
        return diffDays >= 0 && diffDays <= days; // Within X days
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
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
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
    if (selectedCustomers.length === 0) return;
    
    if (selectedCustomers.length > 10) {
      if (!confirm(`About to open ${selectedCustomers.length} WhatsApp tabs. Your browser may slow down. Continue?`)) return;
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">WhatsApp Reminders</h1>
        <p className="text-sm text-slate-500 mt-1">Send payment reminders to customers</p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 space-y-4">
        <h2 className="text-sm font-semibold text-slate-700">🔍 Filter Customers</h2>
        <div className="flex gap-3 flex-wrap items-end">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Due Within</label>
            <select value={expiryFilter} onChange={e => setExpiryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
              <option value="">All Customers</option>
              <option value="0">Today Only</option>
              <option value="1">Within 1 Day</option>
              <option value="2">Within 2 Days</option>
              <option value="3">Within 3 Days</option>
              <option value="5">Within 5 Days</option>
              <option value="7">Within 7 Days</option>
              <option value="15">Within 15 Days</option>
              <option value="30">Within 30 Days</option>
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
          <button onClick={() => { setExpiryFilter(''); setPackageFilter(''); setFiltered(customers); }}
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
              {selected.size === filtered.length ? 'Deselect All' : 'Select All'}
            </button>
            <button onClick={sendReminders} disabled={selected.size === 0}
              className="px-5 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:shadow-lg transition-all">
              Send to {selected.size}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead><tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase">
              <th className="px-4 py-3">☐</th><th className="px-4 py-3">Device</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Package</th><th className="px-4 py-3">Expiry</th><th className="px-4 py-3">Send</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.slice(0, 100).map((c: any) => (
                <tr key={c.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-4 py-3"><input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} /></td>
                  <td className="px-4 py-3 text-sm font-medium">{c.device_ppp}</td>
                  <td className="px-4 py-3 text-sm">{c.full_name}</td>
                  <td className="px-4 py-3 text-sm">{c.mobile_phone || '-'}</td>
                  <td className="px-4 py-3 text-sm">{c.service_plan || '-'}</td>
                  <td className="px-4 py-3 text-sm">{c.expiry_date || '-'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => sendToOne(c)} className="text-green-600 hover:text-green-700 text-xs font-medium">📱 Send</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}