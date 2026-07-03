import api from './api';

export interface Payment {
  id: number;
  receipt_number: string;
  customer_id: number;
  billing_month: string;
  amount_paid: number;
  payment_method: string;
  payment_note: string | null;
  signature_data: string | null;
  collected_by: number;
  payment_date: string;
  created_at: string;
}

export interface PaymentCreate {
  customer_id: number;
  billing_month: string;
  amount_paid: number;
  payment_method: string;
  payment_note?: string;
  signature_data?: string;
  payment_date: string;
}

export interface DashboardStats {
  today_collection: number;
  monthly_collection: number;
  payments_today: number;
}

export const paymentService = {
  create: async (data: PaymentCreate): Promise<Payment> => {
    const res = await api.post('/payments/', data);
    return res.data;
  },

  getByCustomer: async (customerId: number): Promise<Payment[]> => {
    const res = await api.get(`/payments/customer/${customerId}`);
    return res.data;
  },

  getById: async (id: number): Promise<Payment> => {
    const res = await api.get(`/payments/${id}`);
    return res.data;
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await api.get('/dashboard/stats');
    return res.data;
  },
};
