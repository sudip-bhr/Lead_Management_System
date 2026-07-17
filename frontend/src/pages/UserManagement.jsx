import { useEffect, useState } from 'react';
import { api } from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import CreateUserModal from '../components/users/CreateUserModal';

const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-700',
  manager: 'bg-blue-100 text-blue-700',
  counselor: 'bg-green-100 text-green-700',
  receptionist: 'bg-gray-100 text-gray-700'
};

export default function UserManagement() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users');
      setUsers(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleActive = async (userId, currentState) => {
    try {
      await api.patch(`/users/${userId}`, { is_active: !currentState });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Delete this user permanently? This cannot be undone.')) return;
    try {
      await api.delete(`/users/${userId}`);
      fetchUsers();
    } catch {
      alert('Failed to delete user.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-gray-500">Manage team roles and access</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ Add User</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Name</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Email</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Role</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Joined</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="py-8 text-center text-gray-400">Loading...</td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{user.name}</td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${ROLE_COLORS[user.role] || 'bg-gray-100'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                      {user.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {user.id !== currentUser?.id && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(user.id, user.is_active)}
                          >
                            {user.is_active ? 'Suspend' : 'Activate'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(user.id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <CreateUserModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => { setShowCreate(false); fetchUsers(); }}
      />
    </div>
  );
}
