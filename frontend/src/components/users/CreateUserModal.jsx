import { useState } from 'react';
import { api } from '../../lib/axios';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const ROLES = ['admin', 'manager', 'counselor', 'receptionist'];

export default function CreateUserModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'counselor' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      return setError('Password must be at least 8 characters');
    }
    try {
      setLoading(true);
      await api.post('/users', form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Create New User</h2>
          <button onClick={onClose} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Full Name</label>
            <Input name="name" required value={form.name} onChange={handleChange} placeholder="Aarav Sharma" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <Input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="aarav@dursikshya.com" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <Input name="password" type="password" required value={form.password} onChange={handleChange} placeholder="Min. 8 characters" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Role</label>
            <select
              name="role"
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.role}
              onChange={handleChange}
            >
              {ROLES.map((r) => (
                <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create User'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
