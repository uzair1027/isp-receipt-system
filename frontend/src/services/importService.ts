import api from './api';

export interface ImportLog {
  id: number;
  file_name: string;
  imported_by: number;
  total_rows: number;
  imported_count: number;
  updated_count: number;
  skipped_count: number;
  error_count: number;
  created_at: string;
}

export interface ImportResult {
  success: boolean;
  import_log: ImportLog;
  message: string;
}

export const importService = {
  uploadCsv: async (file: File): Promise<ImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/imports/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getHistory: async (): Promise<ImportLog[]> => {
    const res = await api.get('/imports/history');
    return res.data;
  },
};
