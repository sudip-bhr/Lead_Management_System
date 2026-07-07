import { useEffect, useState } from 'react';
import { useLeadStore } from '../store/leadStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';

export default function Leads() {
  const { leads, loading, fetchLeads } = useLeadStore();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads({ search });
  }, [fetchLeads, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leads</h1>
        <Button onClick={() => alert('Quick add lead modal will open here')}>Add Lead</Button>
      </div>

      <div className="flex gap-4">
        <Input 
          placeholder="Search leads..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        {/* Filters will go here */}
      </div>

      <div className="rounded-md border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Phone</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Score</th>
              <th className="p-4 font-medium">Source</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="p-4 text-center">Loading...</td></tr>
            ) : leads.length === 0 ? (
              <tr><td colSpan="7" className="p-4 text-center">No leads found.</td></tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="border-b last:border-0 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/leads/${lead.id}`)}>
                  <td className="p-4 font-medium text-blue-600">{lead.name}</td>
                  <td className="p-4">{lead.email}</td>
                  <td className="p-4">{lead.phone}</td>
                  <td className="p-4 capitalize">{lead.status}</td>
                  <td className="p-4 capitalize">{lead.score}</td>
                  <td className="p-4 capitalize">{lead.source}</td>
                  <td className="p-4">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/leads/${lead.id}`); }}>View</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
