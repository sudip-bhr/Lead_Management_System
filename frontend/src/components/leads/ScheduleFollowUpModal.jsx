import { useState } from 'react';
import { api } from '../../lib/axios';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function ScheduleFollowUpModal({ isOpen, onClose, leadId, onSuccess }) {
  const [taskType, setTaskType] = useState('call');
  const [scheduledAt, setScheduledAt] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/followups', {
        lead_id: leadId,
        task_type: taskType,
        scheduled_at: new Date(scheduledAt).toISOString()
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to schedule follow-up', error);
      alert('Failed to schedule follow-up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Schedule Follow-up</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Task Type</label>
            <select
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
            >
              <option value="call">Call</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Date & Time</label>
            <Input 
              type="datetime-local" 
              required 
              value={scheduledAt} 
              onChange={(e) => setScheduledAt(e.target.value)} 
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>Schedule</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
