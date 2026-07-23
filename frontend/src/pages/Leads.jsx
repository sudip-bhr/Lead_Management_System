import { useEffect, useState } from 'react';
import { useLeadStore } from '../store/leadStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { QuickAddLeadModal } from '../components/leads/QuickAddLeadModal';
import { MessageSquare, Globe, Plus } from 'lucide-react';

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

export default function Leads() {
  const { leads, loading, fetchLeads } = useLeadStore();
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads({ search, source: sourceFilter || undefined });
  }, [fetchLeads, search, sourceFilter]);

  const renderSourceBadge = (source) => {
    switch (source) {
      case 'whatsapp':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            <MessageSquare className="h-3 w-3 text-emerald-600" /> WhatsApp
          </span>
        );
      case 'facebook':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <FacebookIcon className="h-3 w-3 text-blue-600" /> Facebook
          </span>
        );
      case 'website':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
            <Globe className="h-3 w-3 text-purple-600" /> Website
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
            {source}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-sm text-gray-500">Manage and track your lead pipeline from all channels.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Lead
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-3 w-full sm:w-auto">
          <Input 
            placeholder="Search by name, email or phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Lead Sources</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="facebook">Facebook Lead Ads</option>
            <option value="website">Website Form</option>
            <option value="walkin">Walk-in</option>
            <option value="referral">Referral</option>
            <option value="chatbot">Chatbot</option>
            <option value="college">College Seminar</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
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
              <tr><td colSpan="7" className="p-4 text-center text-gray-500">Loading leads...</td></tr>
            ) : leads.length === 0 ? (
              <tr><td colSpan="7" className="p-4 text-center text-gray-500">No leads found.</td></tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="border-b last:border-0 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => navigate(`/leads/${lead.id}`)}>
                  <td className="p-4 font-medium text-blue-600">{lead.name}</td>
                  <td className="p-4 text-gray-600">{lead.email || '—'}</td>
                  <td className="p-4 text-gray-600">{lead.phone || '—'}</td>
                  <td className="p-4 capitalize">
                    <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 font-medium">
                      {lead.status}
                    </span>
                  </td>
                  <td className="p-4 capitalize">
                    <span className={`text-xs font-semibold ${lead.score === 'hot' ? 'text-red-600' : lead.score === 'warm' ? 'text-amber-600' : 'text-blue-600'}`}>
                      {lead.score}
                    </span>
                  </td>
                  <td className="p-4">{renderSourceBadge(lead.source)}</td>
                  <td className="p-4">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/leads/${lead.id}`); }}>View</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <QuickAddLeadModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => fetchLeads({ search, source: sourceFilter || undefined })}
      />
    </div>
  );
}
