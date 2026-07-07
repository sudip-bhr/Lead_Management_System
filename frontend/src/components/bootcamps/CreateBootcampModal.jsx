import { useState } from 'react';
import { api } from '../../lib/axios';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export default function CreateBootcampModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({
    topic: '',
    date: '',
    time: '',
    venue: '',
    capacity: 50
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      setLoading(true);
      await api.post('/bootcamps', form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create bootcamp');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Schedule Bootcamp</h2>
          <button onClick={onClose} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Topic / Title</label>
            <Input name="topic" required value={form.topic} onChange={handleChange} placeholder="e.g., Intro to Full Stack Web Dev" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Date</label>
              <Input name="date" type="date" required value={form.date} onChange={handleChange} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Time</label>
              <Input name="time" type="time" required value={form.time} onChange={handleChange} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Venue</label>
            <Input name="venue" required value={form.venue} onChange={handleChange} placeholder="e.g., Main Hall, Dursikshya OR Zoom Link" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Capacity (Max attendees)</label>
            <Input name="capacity" type="number" min="1" required value={form.capacity} onChange={handleChange} />
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Scheduling...' : 'Schedule Event'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
