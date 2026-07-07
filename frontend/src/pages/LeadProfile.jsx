import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function LeadProfile() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div>Loading...</div>;
  if (!lead) return <div>Lead not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{lead.name}</h1>
        <div className="flex gap-2">
          <Button variant="outline">Log Call</Button>
          <Button variant="outline">Send WhatsApp</Button>
          <Button>Schedule Follow-up</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Lead Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p>{lead.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p>{lead.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="capitalize">{lead.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Score</p>
                <p className="capitalize">{lead.score}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Course Interest</p>
                <p>{lead.course_interest || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Source</p>
                <p className="capitalize">{lead.source}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
             <div className="space-y-1">
               <label className="text-sm font-medium">Update Status</label>
               <select className="w-full rounded-md border border-gray-300 p-2 text-sm" defaultValue={lead.status}>
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

      {/* Tabs placeholder for Activity Log and Follow-ups */}
      <Card>
        <CardHeader>
          <CardTitle>Activity & Follow-ups</CardTitle>
        </CardHeader>
        <CardContent>
           <p className="text-sm text-gray-500">Activity log and follow-ups will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
