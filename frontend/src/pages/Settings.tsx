import { useState, useEffect } from 'react';
import { useAuthStore } from '../features/auth/hooks/useAuth';
import toast from 'react-hot-toast';
import api from '../services/api';

export function Settings() {
  const [form, setForm] = useState({
    company_name: '', address: '', phone: '', email: '',
    receipt_footer: '', currency_symbol: 'Rs.', receipt_prefix: 'RCP',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/settings/').then(res => {
      setForm(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings/', form);
      toast.success('Settings saved!');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Company Settings</h1>
      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
          <input type="text" value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Footer</label>
          <input type="text" value={form.receipt_footer} onChange={e => setForm({...form, receipt_footer: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
            <input type="text" value={form.currency_symbol} onChange={e => setForm({...form, currency_symbol: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Prefix</label>
            <input type="text" value={form.receipt_prefix} onChange={e => setForm({...form, receipt_prefix: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>
        <button type="submit" disabled={saving}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
