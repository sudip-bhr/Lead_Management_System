import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/axios';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';
import { Users, CheckCircle, MessageSquare } from 'lucide-react';

export default function BootcampDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [attendanceEdits, setAttendanceEdits] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [res, statsRes] = await Promise.all([
        api.get(`/bootcamps/${id}`),
        api.get(`/bootcamps/${id}/stats`)
      ]);
      setData(res.data);
      setStats(statsRes.data.stats);
      
      // Initialize edit state
      const initial = {};
      res.data.registrants.forEach(r => initial[r.id] = r.attended);
      setAttendanceEdits(initial);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const isManagerOrAdmin = user?.role === 'admin' || user?.role === 'manager';

  const hasUnsavedChanges = data?.registrants.some(r => attendanceEdits[r.id] !== r.attended);

  const handleSaveAttendance = async () => {
    const changes = Object.keys(attendanceEdits)
      .map(rid => ({ registrantId: parseInt(rid), attended: attendanceEdits[rid] }))
      .filter(a => {
        const orig = data.registrants.find(r => r.id === a.registrantId);
        return orig.attended !== a.attended;
      });

    if (!changes.length) return;

    try {
      setProcessing(true);
      await api.patch(`/bootcamps/${id}/attendance`, { attendees: changes });
      await fetchData();
      alert('Attendance saved!');
    } catch (err) {
      alert('Failed to save attendance');
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkMessage = async () => {
    if (!confirm('Send WhatsApp reminder to all registered attendees?')) return;
    try {
      setProcessing(true);
      const { data: resData } = await api.post(`/bootcamps/${id}/bulk-message`);
      alert(`Successfully sent ${resData.sent} messages.`);
    } catch (err) {
      alert('Failed to send messages');
    } finally {
      setProcessing(false);
    }
  };

  const handleRunPostEvent = async () => {
    if (!confirm('This will move ALL attendees to the "Contacted" pipeline stage and create follow-up tasks for their counselors. Proceed?')) return;
    try {
      setProcessing(true);
      const { data: resData } = await api.post(`/bootcamps/${id}/post-event`);
      alert(`Post-event pipeline complete. ${resData.processed} leads processed.`);
      fetchData();
    } catch (err) {
      alert('Failed to run post-event pipeline');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!data?.bootcamp) return <div>Bootcamp not found</div>;

  const bc = data.bootcamp;
  const isPast = new Date(bc.date) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link to="/bootcamps" className="text-sm text-blue-600 hover:underline">← Back to Bootcamps</Link>
          </div>
          <h1 className="mt-2 text-2xl font-bold">{bc.topic}</h1>
          <p className="text-gray-600">{new Date(bc.date).toLocaleDateString()} at {bc.time} • {bc.venue}</p>
        </div>
        <div className="flex gap-2">
          {isManagerOrAdmin && (
            <>
              <Button variant="outline" onClick={handleBulkMessage} disabled={processing}>
                <MessageSquare className="mr-2 h-4 w-4" /> Send Reminder
              </Button>
              {isPast && (
                <Button onClick={handleRunPostEvent} disabled={processing}>
                  Run Post-Event Pipeline
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Stats Column */}
        <div className="space-y-4 lg:col-span-1">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Registrants</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.total_registrants} <span className="text-sm font-normal text-gray-400">/ {bc.capacity}</span></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Attendance Rate</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.attendance_rate}%</div>
              <p className="text-xs text-gray-500">{stats?.attended} attended, {stats?.no_show} no-show</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Conversion Rate</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats?.conversion_rate}%</div>
              <p className="text-xs text-gray-500">{stats?.converted_to_enrolled} enrolled from attendees</p>
            </CardContent>
          </Card>
        </div>

        {/* Registrants Table */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Registered Leads</CardTitle>
            {hasUnsavedChanges && (
              <Button size="sm" onClick={handleSaveAttendance} disabled={processing}>
                Save Attendance
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Lead Name</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Phone</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-6 py-3 text-center font-medium text-gray-500">Attended?</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.registrants.length === 0 ? (
                  <tr><td colSpan="4" className="py-8 text-center text-gray-400">No one has registered yet.</td></tr>
                ) : (
                  data.registrants.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <Link to={`/leads/${r.lead_id}`} className="font-medium text-blue-600 hover:underline">{r.name}</Link>
                      </td>
                      <td className="px-6 py-3 text-gray-600">{r.phone}</td>
                      <td className="px-6 py-3">
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium capitalize text-gray-600">
                          {r.lead_status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={attendanceEdits[r.id] || false}
                          onChange={(e) => setAttendanceEdits(prev => ({ ...prev, [r.id]: e.target.checked }))}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
