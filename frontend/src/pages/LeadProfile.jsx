import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MessageSquare, Globe, Phone, Mail } from 'lucide-react';

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

export default function LeadProfile() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const { data } = await api.get(`/leads/${id}`);
        setLead(data.lead);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      const { data } = await api.put(`/leads/${id}`, { status: newStatus });
      setLead(data.lead);
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleSendWhatsApp = () => {
    if (!lead?.phone) {
      alert('This lead does not have a phone number.');
      return;
    }
    const cleanPhone = lead.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Loading lead profile...</div>;
  if (!lead) return <div className="p-6 text-center text-red-500">Lead not found.</div>;

  const renderSourceBadge = (source) => {
    switch (source) {
      case 'whatsapp':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <MessageSquare className="h-3.5 w-3.5 text-emerald-600" /> WhatsApp
          </span>
        );
      case 'facebook':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <FacebookIcon className="h-3.5 w-3.5 text-blue-600" /> Facebook Lead Ads
          </span>
        );
      case 'website':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <Globe className="h-3.5 w-3.5 text-purple-600" /> Website Form
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 capitalize">
            {source}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
            {renderSourceBadge(lead.source)}
          </div>
          <p className="text-sm text-gray-500">Created {new Date(lead.created_at).toLocaleDateString()}</p>
        </div>

        <div className="flex items-center gap-2">
          {lead.phone && (
            <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1.5 px-3 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 transition">
              <Phone className="h-4 w-4 text-gray-500" /> Call
            </a>
          )}
          <Button variant="outline" onClick={handleSendWhatsApp} className="flex items-center gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50">
            <MessageSquare className="h-4 w-4 text-emerald-600" /> Send WhatsApp
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="font-medium text-gray-500 mb-1">Email</p>
                <p className="text-gray-900 flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-gray-400" /> {lead.email || 'N/A'}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-500 mb-1">Phone</p>
                <p className="text-gray-900 flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-gray-400" /> {lead.phone || 'N/A'}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-500 mb-1">Status</p>
                <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800 capitalize">
                  {lead.status}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-500 mb-1">Score</p>
                <span className={`text-xs font-bold uppercase ${lead.score === 'hot' ? 'text-red-600' : lead.score === 'warm' ? 'text-amber-600' : 'text-blue-600'}`}>
                  {lead.score}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-500 mb-1">Course Interest</p>
                <p className="text-gray-900">{lead.course_interest || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium text-gray-500 mb-1">Campaign / Source Tag</p>
                <p className="text-gray-900 text-xs font-mono bg-gray-50 px-2 py-1 rounded inline-block">
                  {lead.utm_campaign || lead.utm_source || 'direct'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-1.5">
               <label className="text-sm font-medium text-gray-700">Update Lead Status</label>
               <select 
                 className="w-full rounded-md border border-gray-300 p-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" 
                 value={lead.status}
                 disabled={updating}
                 onChange={(e) => handleStatusChange(e.target.value)}
               >
                 <option value="new">New</option>
                 <option value="contacted">Contacted</option>
                 <option value="interested">Interested</option>
                 <option value="demo">Demo</option>
                 <option value="enrolled">Enrolled</option>
                 <option value="lost">Lost</option>
               </select>
             </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity & History</CardTitle>
        </CardHeader>
        <CardContent>
           <p className="text-sm text-gray-500">All inbound WhatsApp messages, Facebook lead events, and counselor calls for this lead are recorded in activities.</p>
        </CardContent>
      </Card>
    </div>
  );
}
