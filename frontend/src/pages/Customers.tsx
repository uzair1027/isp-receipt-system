import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { customerService, Customer } from '../services/customerService';

export function Customers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [searchResults, setSearchResults] = useState<Customer[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page],
    queryFn: () => customerService.getAll(page, 50),
  });

  const customers = searchResults !== null ? searchResults : (data?.customers || []);
  const total = data?.total || 0;

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await customerService.search(searchQuery, 50);
      setSearchResults(results);
    } catch { setSearchResults([]); }
    setIsSearching(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Customers</h1>
          <p className="text-sm text-slate-500 mt-1">{total.toLocaleString()} total customers</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-3 text-slate-400">🔍</span>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by name, phone, device PPP..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          <button onClick={handleSearch} disabled={isSearching}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50">
            {isSearching ? 'Searching...' : 'Search'}
          </button>
          {searchResults !== null && (
            <button onClick={clearSearch} className="px-4 py-2.5 text-slate-500 hover:text-slate-700 text-sm">Clear</button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-500 mt-3">Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-4xl">📭</span>
            <p className="text-slate-500 mt-3">No customers found.</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Device/PPP</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Package</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((customer: Customer) => (
                  <tr key={customer.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-800">{customer.device_ppp}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{customer.full_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{customer.mobile_phone || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{customer.service_plan || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {customer.expiry_date ? (
                        new Date(customer.expiry_date) < new Date() ? (
                          <span className="px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">Expired</span>
                        ) : (
                          <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">Active</span>
                        )
                      ) : (
                        <span className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-full text-xs font-medium">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => navigate(`/customers/${customer.id}`)}
                        className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-xs font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-lg disabled:opacity-40 transition-colors">
                ← Previous
              </button>
              <span className="text-sm text-slate-500 font-medium">Page {page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={customers.length < 50}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-lg disabled:opacity-40 transition-colors">
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}