import { useState } from 'react';
import { api } from '../../lib/axios';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function QuickAddLeadModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'website',
    course_interest: '',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/leads', formData);
      setFormData({ name: '', phone: '', email: '', source: 'website', course_interest: '' });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to add lead', error);
      alert(error.response?.data?.error || 'Failed to add lead.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Quick Add Lead</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <Input 
              required 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Phone</label>
            <Input 
              required 
              value={formData.phone} 
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <Input 
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Lead Source</label>
            <select
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="facebook">Facebook Lead Ads</option>
              <option value="website">Website Form</option>
              <option value="walkin">Walk-in</option>
              <option value="referral">Referral</option>
              <option value="college">College Seminar</option>
              <option value="bootcamp">Bootcamp</option>
              <option value="chatbot">Website Chatbot</option>
              <option value="phone_inquiry">Phone Inquiry</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Course Interest</label>
            <Input 
              value={formData.course_interest} 
              onChange={(e) => setFormData({ ...formData, course_interest: e.target.value })} 
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>Add Lead</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
