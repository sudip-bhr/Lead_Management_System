import { useState } from 'react';
import { api } from '../../lib/axios';
import { Button } from '../ui/Button';

export function LogActivityModal({ isOpen, onClose, leadId, onSuccess, defaultType = 'note' }) {
  const [type, setType] = useState(defaultType);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/activities', { lead_id: leadId, type, description });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to log activity', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Log Activity</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Type</label>
            <select
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="call">Call</option>
              <option value="message">Message</option>
              <option value="note">Note</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description / Notes</label>
            <textarea
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>Log</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
