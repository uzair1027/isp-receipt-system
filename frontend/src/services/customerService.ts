import api from './api';

export interface Customer {
  id: number;
  device_ppp: string;
  username: string | null;
  full_name: string;
  service_plan: string | null;
  mobile_phone: string | null;
  address: string | null;
  street: string | null;
  email: string | null;
  national_id: string | null;
  mac_address: string | null;
  comments: string | null;
  expiry_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const customerService = {
  search: async (query: string, limit: number = 20): Promise<Customer[]> => {
    const res = await api.get('/customers/search', { params: { q: query, limit } });
    return res.data;
  },

  getAll: async (page: number = 1, pageSize: number = 20) => {
    const res = await api.get('/customers/', { params: { page, page_size: pageSize } });
    return res.data;
  },

  getById: async (id: number): Promise<Customer> => {
    const res = await api.get('/customers/' + id);
    return res.data;
  },
};
