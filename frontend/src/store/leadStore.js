import { create } from 'zustand';
import { api } from '../lib/axios';

export const useLeadStore = create((set, _get) => ({
  leads: [],
  total: 0,
  loading: false,
  error: null,
  
  fetchLeads: async (params) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/leads', { params });
      set({ leads: data.data, total: data.meta.total, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  updateLeadLocally: (id, updates) => {
    set((state) => ({
      leads: state.leads.map((lead) => 
        lead.id === id ? { ...lead, ...updates } : lead
      )
    }));
  }
}));
