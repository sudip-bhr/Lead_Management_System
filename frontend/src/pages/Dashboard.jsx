import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Users, TrendingUp, Target, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, FunnelChart, Funnel, LabelList } from 'recharts';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, taskRes, leadsRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/followups/today'),
          api.get('/leads?page=1&limit=5')
        ]);
        setData(dashRes.data);
        setTasks(taskRes.data.data);
        setRecentLeads(leadsRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (!data) return <div>Error loading dashboard.</div>;

  const { metrics, sources, funnel } = data;

  // Colors for charts
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
          <p className="text-sm text-gray-500">Here's your summary for today.</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Leads</p>
                <h3 className="mt-1 text-2xl font-bold">{metrics.total_leads}</h3>
              </div>
              <div className="rounded-full bg-blue-100 p-3 text-blue-600"><Users className="h-5 w-5" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">New Today</p>
                <h3 className="mt-1 text-2xl font-bold">{metrics.new_today}</h3>
              </div>
              <div className="rounded-full bg-green-100 p-3 text-green-600"><TrendingUp className="h-5 w-5" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Enrollments (Month)</p>
                <h3 className="mt-1 text-2xl font-bold">{metrics.enrollments_this_month}</h3>
              </div>
              <div className="rounded-full bg-purple-100 p-3 text-purple-600"><Target className="h-5 w-5" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Conversion Rate (Month)</p>
                <h3 className="mt-1 text-2xl font-bold">{metrics.conversion_rate}%</h3>
              </div>
              <div className="rounded-full bg-orange-100 p-3 text-orange-600"><TrendingUp className="h-5 w-5" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Lead Sources Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Sources (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              {sources.length === 0 ? (
                <div className="flex h-full items-center justify-center text-gray-400">No data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sources} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="source" type="category" width={80} tick={{ fontSize: 12, fill: '#64748b', textTransform: 'capitalize' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {sources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip />
                  <Funnel dataKey="value" data={funnel} isAnimationActive>
                    <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                    {funnel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today's Follow-ups</CardTitle>
            {tasks.some(t => new Date(t.scheduled_at) < new Date() && t.status !== 'completed') && (
              <span className="flex items-center text-xs font-medium text-red-600">
                <AlertCircle className="mr-1 h-3 w-3" /> Overdue tasks
              </span>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-[300px] overflow-y-auto">
              {tasks.length === 0 ? (
                <p className="p-6 text-center text-sm text-gray-500">No tasks for today. Great job!</p>
              ) : (
                tasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${task.status === 'completed' ? 'bg-green-500' : new Date(task.scheduled_at) < new Date() ? 'bg-red-500' : 'bg-blue-500'}`} />
                      <div>
                        <Link to={`/leads/${task.lead_id}`} className="font-medium text-blue-600 hover:underline">{task.lead_name}</Link>
                        <p className="text-xs text-gray-500 capitalize">{task.task_type} • {new Date(task.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-[300px] overflow-y-auto">
              {recentLeads.length === 0 ? (
                <p className="p-6 text-center text-sm text-gray-500">No recent leads.</p>
              ) : (
                recentLeads.map(lead => (
                  <div key={lead.id} className="flex justify-between p-4 hover:bg-gray-50">
                    <div>
                      <Link to={`/leads/${lead.id}`} className="font-medium text-gray-900 hover:underline">{lead.name}</Link>
                      <p className="text-xs text-gray-500">{lead.phone}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-600">{lead.source}</span>
                      <span className={`text-[10px] font-semibold uppercase ${lead.score === 'hot' ? 'text-red-500' : lead.score === 'warm' ? 'text-orange-500' : 'text-blue-500'}`}>
                        {lead.score}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
