import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const DEFAULT_RATES = { '10MB': 1200, '15MB': 1600, '20MB': 2000, '25MB': 2500, '30MB': 3000, '40MB': 4000, '50MB': 5000, '80MB': 8000 };

export function Settings() {
  const [form, setForm] = useState({ company_name: '', address: '', phone: '', email: '', receipt_footer: '', currency_symbol: 'Rs.', receipt_prefix: 'RCP' });
  const [rates, setRates] = useState(DEFAULT_RATES);
  const [newPkg, setNewPkg] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', full_name: '', password: '', role: 'cashier' });

  useEffect(() => {
    api.get('/settings/').then(res => {
      setForm(res.data);
      if (res.data.website) {
        try { setRates(JSON.parse(res.data.website)); } catch {}
      }
      setLoading(false);
    }).catch(() => setLoading(false));
    
    api.get('/users/').then(res => setUsers(res.data)).catch(() => {});
  }, []);

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const data = { ...form, website: JSON.stringify(rates) };
      await api.put('/settings/', data);
      toast.success('Settings saved!');
    } catch { toast.error('Failed'); }
    setSaving(false);
  };

  const addRate = () => {
    if (newPkg && newPrice) {
      setRates({ ...rates, [newPkg]: parseInt(newPrice) });
      setNewPkg(''); setNewPrice('');
    }
  };

  const removeRate = (key: string) => {
    const updated = { ...rates };
    delete updated[key];
    setRates(updated);
  };

  const addUser = async () => {
    if (!newUser.username || !newUser.password) return;
    try {
      await api.post('/users/', newUser);
      toast.success('User created!');
      setNewUser({ username: '', full_name: '', password: '', role: 'cashier' });
      const res = await api.get('/users/');
      setUsers(res.data);
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Failed'); }
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete('/users/' + id);
      toast.success('User deleted');
      setUsers(users.filter((u: any) => u.id !== id));
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Company Settings */}
      <form onSubmit={saveSettings} className="bg-white rounded-xl shadow-sm p-6 border space-y-4">
        <h2 className="text-lg font-semibold">Company Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm mb-1">Company Name</label><input value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required /></div>
          <div><label className="block text-sm mb-1">Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div className="col-span-2"><label className="block text-sm mb-1">Address</label><input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm mb-1">Receipt Footer</label><input value={form.receipt_footer} onChange={e => setForm({...form, receipt_footer: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm mb-1">Currency</label><input value={form.currency_symbol} onChange={e => setForm({...form, currency_symbol: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
        </div>
        <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{saving ? 'Saving...' : 'Save Company Settings'}</button>
      </form>

      {/* Package Rates */}
      <div className="bg-white rounded-xl shadow-sm p-6 border space-y-4">
        <h2 className="text-lg font-semibold">Package Rates</h2>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(rates).map(([pkg, price]) => (
            <div key={pkg} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
              <span className="text-sm font-medium">{pkg}</span>
              <span className="text-sm text-gray-600">Rs. {price as number}</span>
              <button onClick={() => removeRate(pkg)} className="text-red-500 text-xs">?</button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input placeholder="Package (e.g. 10MB)" value={newPkg} onChange={e => setNewPkg(e.target.value)} className="px-3 py-2 border rounded-lg w-40" />
          <input placeholder="Price (Rs.)" type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} className="px-3 py-2 border rounded-lg w-32" />
          <button onClick={addRate} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">Add Rate</button>
        </div>
        <button onClick={saveSettings} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Save Rates</button>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-xl shadow-sm p-6 border space-y-4">
        <h2 className="text-lg font-semibold">User Management</h2>
        <div className="flex gap-2 mb-4">
          <input placeholder="Username" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="px-3 py-2 border rounded-lg w-32" />
          <input placeholder="Full Name" value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})} className="px-3 py-2 border rounded-lg w-40" />
          <input placeholder="Password" type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="px-3 py-2 border rounded-lg w-28" />
          <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="px-3 py-2 border rounded-lg">
            <option value="cashier">Cashier</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={addUser} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">Add User</button>
        </div>
        <table className="w-full">
          <thead><tr className="text-left text-xs text-gray-500 border-b"><th className="py-2">Username</th><th className="py-2">Full Name</th><th className="py-2">Role</th><th className="py-2">Action</th></tr></thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} className="border-b">
                <td className="py-2 text-sm font-medium">{u.username}</td>
                <td className="py-2 text-sm">{u.full_name}</td>
                <td className="py-2 text-sm capitalize">{u.role}</td>
                <td className="py-2">
                  {u.role !== 'admin' && <button onClick={() => deleteUser(u.id)} className="text-red-500 text-xs">Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
