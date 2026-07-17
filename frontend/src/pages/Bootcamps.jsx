import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/axios';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';
import CreateBootcampModal from '../components/bootcamps/CreateBootcampModal';
import { Calendar as CalIcon, Users, MapPin, Clock } from 'lucide-react';

export default function Bootcamps() {
  const { user } = useAuthStore();
  const [bootcamps, setBootcamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  const fetchBootcamps = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/bootcamps');
      setBootcamps(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBootcamps(); }, []);

  const isManagerOrAdmin = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bootcamps</h1>
          <p className="text-sm text-gray-500">Manage free events and workshops</p>
        </div>
        {isManagerOrAdmin && (
          <Button onClick={() => setShowCreate(true)}>+ Schedule Bootcamp</Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : bootcamps.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed bg-white p-12 text-center text-gray-500">
            No bootcamps scheduled yet.
          </div>
        ) : bootcamps.map((bc) => (
          <Card key={bc.id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => navigate(`/bootcamps/${bc.id}`)}>
            <CardContent className="p-5">
              <div className="mb-4">
                <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${new Date(bc.date) < new Date() ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'}`}>
                  {new Date(bc.date) < new Date() ? 'Past Event' : 'Upcoming'}
                </span>
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900 line-clamp-2" title={bc.topic}>{bc.topic}</h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CalIcon className="h-4 w-4 text-gray-400" />
                  {new Date(bc.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  {bc.time}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="truncate">{bc.venue}</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">{bc.registrant_count}</span>
                  <span className="text-gray-500">/ {bc.capacity || '∞'} registered</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateBootcampModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => { setShowCreate(false); fetchBootcamps(); }}
      />
    </div>
  );
}
