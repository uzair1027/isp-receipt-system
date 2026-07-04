import { useState } from 'react';
import axios from 'axios';

// Use direct API calls without auth for public portal
const publicApi = axios.create({ baseURL: '/api/v1' });

export function CustomerPortal() {
  const [deviceId, setDeviceId] = useState('');
  const [customer, setCustomer] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookupCustomer = async () => {
    if (!deviceId.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await publicApi.get(`/customers/public-search?q=${deviceId}`);
      if (res.data.length > 0) {
        const c = res.data[0];
        setCustomer(c);
        const payRes = await publicApi.get(`/payments/public/customer/${c.id}`);
        setPayments(payRes.data);
      } else {
        setError('Customer not found. Please check your Device/PPP ID.');
        setCustomer(null);
        setPayments([]);
      }
    } catch {
      setError('Failed to lookup. Please try again.');
    }
    setLoading(false);
  };

  const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amount_paid, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100">
      <header className="bg-gradient-to-r from-slate-900 to-blue-900 text-white py-6 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Lasani Links</h1>
          <p className="text-blue-200 text-sm mt-1">Customer Payment Portal</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 -mt-4">
        <div className="bg-white rounded-2xl p-6 shadow-xl border mb-6">
          <p className="text-sm text-slate-600 mb-3 text-center">Enter your Device/PPP ID to view your payment history:</p>
          <div className="flex gap-3">
            <input type="text" value={deviceId} onChange={(e) => setDeviceId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && lookupCustomer()}
              placeholder="Enter Device/PPP ID (e.g., abbas43)"
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <button onClick={lookupCustomer} disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50">
              {loading ? 'Looking...' : 'Lookup'}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
        </div>

        {customer && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Customer Information</h2>
            <div className="grid grid-cols-2 gap-3">
              <Info label="Device/PPP" value={customer.device_ppp} />
              <Info label="Username" value={customer.username || '-'} />
              <Info label="Package" value={customer.service_plan || '-'} />
              <Info label="Expiry Date" value={customer.expiry_date || 'Not set'} />
            </div>
          </div>
        )}

        {payments.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border overflow-hidden mb-6">
            <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">Payment History</h2>
              <span className="text-sm font-bold text-emerald-600">Total: Rs. {totalPaid.toLocaleString()}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase">
                  <th className="px-4 py-3">Receipt No</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-mono text-blue-600">{p.receipt_number}</td>
                      <td className="px-4 py-3 text-sm">{p.payment_date}</td>
                      <td className="px-4 py-3 text-sm">{p.billing_month}</td>
                      <td className="px-4 py-3 text-sm font-semibold">Rs. {p.amount_paid.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm capitalize">{p.payment_method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-lg border text-center">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Payment Methods</h3>
          <div className="flex justify-center gap-6 text-sm">
            <span className="px-4 py-2 bg-green-50 text-green-700 rounded-xl font-medium">JazzCash: 03071786655</span>
            <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-medium">EasyPaisa: 03078740993</span>
          </div>
          <div className="mt-4">
            <img src="https://i.ibb.co/SZmCzmm/raast-qr.png" alt="RAAST QR" className="w-24 h-24 mx-auto" />
            <p className="text-xs text-slate-500 mt-2">Scan with any banking app to pay via RAAST</p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">Lasani Links - Customer Portal</p>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
    </div>
  );
}