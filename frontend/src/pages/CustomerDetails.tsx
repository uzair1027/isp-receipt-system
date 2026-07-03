import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { customerService } from '../services/customerService';
import { paymentService } from '../services/paymentService';
import { useAuthStore } from '../features/auth/hooks/useAuth';
import toast from 'react-hot-toast';
import api from '../services/api';

const RATES: Record<string, number> = {
  '10MB':1200,'15MB':1600,'20MB':2000,'25MB':2500,'30MB':3000,'40MB':4000,'50MB':5000,'80MB':8000,
};

function getAmount(pkg: string): number | null {
  if (!pkg) return null;
  if (RATES[pkg]) return RATES[pkg];
  for (const [k, v] of Object.entries(RATES)) {
    if (pkg.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return null;
}

export function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showPay, setShowPay] = useState(false);
  const [showNote, setShowNote] = useState(false);

  const { data: c, isLoading, refetch } = useQuery({
    queryKey: ['customer', id], queryFn: () => customerService.getById(Number(id)), enabled: !!id,
  });
  const { data: payments, refetch: refetchPayments } = useQuery({
    queryKey: ['payments', id], queryFn: () => paymentService.getByCustomer(Number(id)), enabled: !!id,
  });
  const { data: notes, refetch: refetchNotes } = useQuery({
    queryKey: ['notes', id], queryFn: async () => { const r = await api.get('/notes/customer/' + id); return r.data; }, enabled: !!id,
  });

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!c) return <div className="p-8 text-center">Not found.</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/customers')} className="text-gray-500">Back</button>
          <h1 className="text-2xl font-bold">{c.full_name}</h1>
        </div>
        <button onClick={logout} className="text-sm text-red-600">Logout</button>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 border">
          <h2 className="font-semibold mb-4">Customer Information</h2>
          <Row label="Device/PPP" value={c.device_ppp} />
          <Row label="Username" value={c.username || '-'} />
          <Row label="Phone" value={c.mobile_phone || '-'} />
          <Row label="Package" value={c.service_plan || '-'} />
          <Row label="Expiry" value={c.expiry_date || 'Not set'} />
        </div>
        <div className="bg-white rounded-xl p-6 border">
          <h2 className="font-semibold mb-4">Address / Comments</h2>
          <p className="text-gray-700">{c.address || 'N/A'}</p>
          {c.comments && <div className="mt-4 p-3 bg-yellow-50 rounded-lg"><p className="text-sm text-yellow-800">{c.comments}</p></div>}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border mb-6">
        <div className="flex justify-between mb-4">
          <h2 className="font-semibold">Notes</h2>
          {user?.role === 'admin' && <button onClick={() => setShowNote(!showNote)} className="text-sm text-blue-600">{showNote ? 'Cancel' : '+ Add Note'}</button>}
        </div>
        {showNote && <NoteForm cid={c.id} done={() => { setShowNote(false); refetchNotes(); }} />}
        {notes && notes.length > 0 ? notes.map((n: any) => (
          <div key={n.id} className="p-3 bg-yellow-50 rounded-lg mb-2">
            <div className="flex justify-between"><p className="font-semibold">{n.title}</p>
              {user?.role === 'admin' && <button onClick={async () => { if (confirm('Delete?')) { await api.delete('/notes/' + n.id); refetchNotes(); } }} className="text-xs text-red-500">Delete</button>}
            </div>
            <p className="text-sm">{n.message}</p>
          </div>
        )) : <p className="text-gray-500 text-sm">No notes.</p>}
      </div>

      <button onClick={() => setShowPay(!showPay)} className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium mb-6">
        {showPay ? 'Cancel' : 'Collect Payment'}
      </button>

      {showPay && <PayForm cid={c.id} pkg={c.service_plan || ''} curPhone={c.mobile_phone || ''} curExpiry={c.expiry_date || ''} curPackage={c.service_plan || ''} done={() => { setShowPay(false); refetchPayments(); refetch(); }} />}

      <div className="bg-white rounded-xl border overflow-hidden">
        <h2 className="font-semibold p-6 border-b">Payment History</h2>
        {!payments || payments.length === 0 ? <div className="p-6 text-center text-gray-500">No payments.</div> : (
          <table className="w-full">
            <thead className="bg-gray-50"><tr>
              <th className="text-left px-6 py-3 text-xs text-gray-500">Receipt</th>
              <th className="text-left px-6 py-3 text-xs text-gray-500">Date</th>
              <th className="text-left px-6 py-3 text-xs text-gray-500">Month</th>
              <th className="text-left px-6 py-3 text-xs text-gray-500">Amount</th>
              <th className="text-left px-6 py-3 text-xs text-gray-500">Print</th>
            </tr></thead>
            <tbody>{payments.map((p: any) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-blue-600 font-medium">{p.receipt_number}</td>
                <td className="px-6 py-4 text-sm">{p.payment_date}</td>
                <td className="px-6 py-4 text-sm">{p.billing_month}</td>
                <td className="px-6 py-4 text-sm font-medium">Rs. {p.amount_paid.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm">
                  <button onClick={() => window.open('http://localhost:8000/api/v1/receipts/' + p.id)} className="text-blue-600">Print</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between py-1"><span className="text-sm text-gray-500">{label}</span><span className="text-sm font-medium">{value}</span></div>;
}

function NoteForm({ cid, done }: { cid: number; done: () => void }) {
  const [t, setT] = useState(''); const [m, setM] = useState(''); const [s, setS] = useState(false);
  return <form onSubmit={async (e) => { e.preventDefault(); setS(true);
    try { await api.post('/notes/', { customer_id: cid, title: t, message: m }); toast.success('Saved!'); done(); }
    catch { toast.error('Failed'); } finally { setS(false); }
  }} className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
    <input value={t} onChange={e => setT(e.target.value)} placeholder="Title" className="w-full px-3 py-2 border rounded-lg" required />
    <textarea value={m} onChange={e => setM(e.target.value)} placeholder="Message" className="w-full px-3 py-2 border rounded-lg" rows={3} required />
    <button disabled={s} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">{s ? 'Saving...' : 'Save'}</button>
  </form>;
}

function PayForm({ cid, pkg, curPhone, curExpiry, curPackage, done }: { cid: number; pkg: string; curPhone: string; curExpiry: string; curPackage: string; done: () => void }) {
  const amt = getAmount(pkg);
  const [mo, setMo] = useState(new Date().toISOString().slice(0, 7));
  const [amount, setAmount] = useState(amt ? amt.toString() : '');
  const [method, setMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState(curPhone);
  const [expiry, setExpiry] = useState(curExpiry || new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0, 10));
  const [plan, setPlan] = useState(curPackage);

  useEffect(() => { if (amt) setAmount(amt.toString()); }, [amt]);

  return (
    <div className="bg-white rounded-xl p-6 border mb-6">
      <h2 className="font-semibold mb-4">Collect Payment & Update Info</h2>
      {amt && <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">Package: <strong>{pkg}</strong> ? <strong>Rs. {amt}</strong></div>}
      <form onSubmit={async (e) => { e.preventDefault();
        if (!amount || Number(amount) <= 0) { toast.error('Enter amount'); return; }
        setLoading(true);
        try {
          await api.put('/customers/' + cid, { mobile_phone: phone, service_plan: plan, expiry_date: expiry });
          await api.post('/payments/', { customer_id: cid, billing_month: mo, amount_paid: Number(amount), payment_method: method, payment_date: new Date().toISOString().slice(0, 10) });
          toast.success('Payment saved & customer updated!'); done();
        } catch { toast.error('Failed'); } finally { setLoading(false); }
      }} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs mb-1">Phone</label><input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm" /></div>
          <div><label className="block text-xs mb-1">Package</label><input value={plan} onChange={e => { setPlan(e.target.value); const a = getAmount(e.target.value); if (a) setAmount(a.toString()); }} className="w-full px-2 py-1.5 border rounded text-sm" /></div>
          <div><label className="block text-xs mb-1">Expiry Date</label><input type="date" value={expiry} onChange={e => setExpiry(e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm" /></div>
          <div><label className="block text-xs mb-1">Billing Month</label><input type="month" value={mo} onChange={e => setMo(e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm" required /></div>
          <div><label className="block text-xs mb-1">Amount (Rs.)</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm" required /></div>
          <div><label className="block text-xs mb-1">Method</label><select value={method} onChange={e => setMethod(e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm"><option value="cash">Cash</option><option value="bank">Bank</option><option value="jazzcash">JazzCash</option><option value="easypaisa">EasyPaisa</option><option value="other">Other</option></select></div>
        </div>
        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium">{loading ? 'Saving...' : 'Save Payment & Update'}</button>
      </form>
    </div>
  );
}
