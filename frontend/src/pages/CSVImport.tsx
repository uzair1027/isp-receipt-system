import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { importService, ImportResult } from '../services/importService';
import { useAuthStore } from '../features/auth/hooks/useAuth';
import toast from 'react-hot-toast';

export function CSVImport() {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const { data: history } = useQuery({
    queryKey: ['importHistory'],
    queryFn: () => importService.getHistory(),
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setResult(null);
    try {
      const res = await importService.uploadCsv(file);
      setResult(res);
      toast.success(res.message);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Import failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Import Customers (CSV)</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-sm text-blue-600 hover:text-blue-800">Dashboard</button>
          <button onClick={logout} className="text-sm text-red-600 hover:text-red-800">Logout</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 mb-6 text-center">
        <div className="text-4xl mb-4">??</div>
        <h2 className="text-lg font-semibold mb-2">Upload Zima.cloud CSV File</h2>
        <p className="text-gray-500 mb-6">Upload a CSV export from Zima.cloud to import or update customers</p>
        
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleUpload}
          className="hidden"
        />
        
        <button
          onClick={() => fileRef.current?.click()}
          disabled={isUploading}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-lg"
        >
          {isUploading ? 'Importing...' : 'Select CSV File'}
        </button>
      </div>

      {result && (
        <div className="bg-green-50 rounded-xl shadow-sm p-6 border border-green-200 mb-6">
          <h2 className="text-lg font-semibold text-green-800 mb-4">Import Results</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox label="Total Rows" value={result.import_log.total_rows} color="text-blue-600" />
            <StatBox label="Imported" value={result.import_log.imported_count} color="text-green-600" />
            <StatBox label="Updated" value={result.import_log.updated_count} color="text-yellow-600" />
            <StatBox label="Skipped" value={result.import_log.skipped_count} color="text-gray-600" />
          </div>
          {result.import_log.error_count > 0 && (
            <p className="text-red-600 mt-4">Errors: {result.import_log.error_count}</p>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <h2 className="text-lg font-semibold p-6 border-b border-gray-200">Import History</h2>
        {!history || history.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No imports yet.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">File</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Imported</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Updated</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Errors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {history.map((h) => (
                <tr key={h.id}>
                  <td className="px-6 py-4 text-sm text-gray-700">{h.file_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{new Date(h.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{h.total_rows}</td>
                  <td className="px-6 py-4 text-sm text-green-600 font-medium">{h.imported_count}</td>
                  <td className="px-6 py-4 text-sm text-yellow-600 font-medium">{h.updated_count}</td>
                  <td className="px-6 py-4 text-sm text-red-600 font-medium">{h.error_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
