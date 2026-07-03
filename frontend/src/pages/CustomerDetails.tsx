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
  const { user } = useAuthStore();
  const [showPay, setShowPay] = useState(false);
  const [showNote, setShowNote] = useState(false);

  const { data: c, isLoading } = useQuery({
    queryKey: ['customer', id], queryFn: () => customerService.getById(Number(id)), enabled: !!id,
  });
  const { data: payments, refetch } = useQuery({
    queryKey: ['payments', id], queryFn: () => paymentService.getByCustomer(Number(id)), enabled: !!id,
  });
  const { data: notes, refetch: refetchNotes } = useQuery({
    queryKey: ['notes', id], queryFn: async () => { const r = await api.get('/notes/customer/' + id); return r.data; }, enabled: !!id,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!c) return <div className="text-center py-12 text-slate-500">Customer not found.</div>;

  const isExpired = c.expiry_date && new Date(c.expiry_date) < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/customers')} className="text-slate-400 hover:text-slate-600 transition-colors">
            ← Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{c.full_name}</h1>
            <p className="text-sm text-slate-500">{c.device_ppp}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isExpired && <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">Expired</span>}
          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{c.service_plan || 'N/A'}</span>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">📋 Customer Information</h2>
          <div className="space-y-3">
            <InfoRow label="Username" value={c.username || '-'} />
            <InfoRow label="Phone" value={c.mobile_phone || '-'} />
            <InfoRow label="Package" value={c.service_plan || '-'} />
            <InfoRow label="Expiry Date" value={c.expiry_date ? <span className={isExpired ? 'text-red-600' : 'text-green-600'}>{c.expiry_date}</span> : 'Not set'} />
            <InfoRow label="Address" value={c.address || '-'} />
          </div>
          {c.comments && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs font-semibold text-amber-700 mb-1">Comments</p>
              <p className="text-sm text-amber-800">{c.comments}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">📝 Notes</h2>
          {user?.role === 'admin' && (
            <button onClick={() => setShowNote(!showNote)}
              className="w-full mb-3 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-sm text-slate-600 transition-colors">
              {showNote ? 'Cancel' : '+ Add Note'}
            </button>
          )}
          {showNote && (
            <NoteForm cid={c.id} done={() => { setShowNote(false); refetchNotes(); }} />
          )}
          {notes && notes.length > 0 ? (
            <div className="space-y-2">
              {notes.map((n: any) => (
                <div key={n.id} className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-semibold text-amber-800">{n.title}</p>
                    {user?.role === 'admin' && (
                      <button onClick={async () => { if (confirm('Delete?')) { await api.delete('/notes/' + n.id); refetchNotes(); } }}
                        className="text-xs text-red-500 hover:text-red-700">✕</button>
                    )}
                  </div>
                  <p className="text-xs text-amber-700 mt-1">{n.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">No notes yet</p>
          )}
        </div>
      </div>

      {/* Collect Payment Button */}
      <button onClick={() => setShowPay(!showPay)}
        className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-green-500/25 transition-all">
        {showPay ? '✕ Cancel' : '💰 Collect Payment'}
      </button>

      {showPay && <PayForm cid={c.id} pkg={c.service_plan || ''} done={() => { setShowPay(false); refetch(); }} />}

      {/* Payment History */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <h2 className="text-sm font-semibold text-slate-700 px-6 py-4 border-b border-slate-200">💳 Payment History</h2>
        {!payments || payments.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No payments yet</div>
        ) : (
          <table className="w-full">
            <thead><tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-3">Receipt</th><th className="px-6 py-3">Date</th><th className="px-6 py-3">Month</th><th className="px-6 py-3">Amount</th><th className="px-6 py-3">Method</th><th className="px-6 py-3 text-right">Print</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 text-sm font-mono text-blue-600">{p.receipt_number}</td>
                  <td className="px-6 py-3 text-sm">{p.payment_date}</td>
                  <td className="px-6 py-3 text-sm">{p.billing_month}</td>
                  <td className="px-6 py-3 text-sm font-semibold">Rs. {p.amount_paid.toLocaleString()}</td>
                  <td className="px-6 py-3"><span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs capitalize">{p.payment_method}</span></td>
                  <td className="px-6 py-3 text-right">
                    <button onClick={() => window.open(`/api/v1/receipts/${p.id}`)}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs hover:bg-blue-100 transition-colors">🖨️ Print</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-700">{value}</span>
    </div>
  );
}

function NoteForm({ cid, done }: { cid: number; done: () => void }) {
  const [t, setT] = useState(''); const [m, setM] = useState(''); const [s, setS] = useState(false);
  return (
    <form onSubmit={async (e) => { e.preventDefault(); setS(true);
      try { await api.post('/notes/', { customer_id: cid, title: t, message: m }); toast.success('Note saved!'); done(); }
      catch { toast.error('Failed'); } finally { setS(false); }
    }} className="space-y-2 mb-3">
      <input value={t} onChange={e => setT(e.target.value)} placeholder="Title" className="w-full px-3 py-2 bg-white border rounded-lg text-sm" required />
      <textarea value={m} onChange={e => setM(e.target.value)} placeholder="Message..." className="w-full px-3 py-2 bg-white border rounded-lg text-sm" rows={2} required />
      <button disabled={s} className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">{s ? 'Saving...' : 'Save Note'}</button>
    </form>
  );
}

function PayForm({ cid, pkg, done }: { cid: number; pkg: string; done: () => void }) {
  const amt = getAmount(pkg);
  const [mo, setMo] = useState(new Date().toISOString().slice(0, 7));
  const [amount, setAmount] = useState(amt ? amt.toString() : '');
  const [method, setMethod] = useState('cash');
  const [expiry, setExpiry] = useState(new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (amt) setAmount(amt.toString()); }, [amt]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-4">
      <h2 className="text-sm font-semibold text-slate-700">💳 New Payment</h2>
      {amt && <div className="p-3 bg-blue-50 rounded-xl text-sm text-blue-700">Package: <strong>{pkg}</strong> → <strong>Rs. {amt}</strong></div>}
      <form onSubmit={async (e) => { e.preventDefault();
        if (!amount || Number(amount) <= 0) { toast.error('Enter amount'); return; }
        setLoading(true);
        try {
          await api.put('/customers/' + cid, { expiry_date: expiry });
          await api.post('/payments/', { customer_id: cid, billing_month: mo, amount_paid: Number(amount), payment_method: method, payment_date: new Date().toISOString().slice(0, 10) });
          toast.success('Payment saved!'); done();
        } catch { toast.error('Failed'); } finally { setLoading(false); }
      }} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input type="month" value={mo} onChange={e => setMo(e.target.value)} className="px-3 py-2 border rounded-xl text-sm" required />
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="px-3 py-2 border rounded-xl text-sm" required placeholder="Amount" />
          <input type="date" value={expiry} onChange={e => setExpiry(e.target.value)} className="px-3 py-2 border rounded-xl text-sm" />
          <select value={method} onChange={e => setMethod(e.target.value)} className="px-3 py-2 border rounded-xl text-sm">
            <option value="cash">Cash</option><option value="bank">Bank</option><option value="jazzcash">JazzCash</option><option value="easypaisa">EasyPaisa</option><option value="other">Other</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="w-full py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all">
          {loading ? 'Saving...' : '💾 Save Payment & Update Expiry'}
        </button>
      </form>
    </div>
  );
}