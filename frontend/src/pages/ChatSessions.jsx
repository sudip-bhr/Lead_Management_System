import { useEffect, useState } from 'react';
import { api } from '../lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const StatCard = ({ label, value, icon }) => (
  <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm border">
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">{icon}</div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value ?? '–'}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

export default function ChatSessions() {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [selected, setSelected] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sessRes, statsRes] = await Promise.all([
          api.get('/chat/sessions'),
          api.get('/chat/stats')
        ]);
        setSessions(sessRes.data.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const loadTranscript = async (sessionId) => {
    setSelected(sessionId);
    try {
      const { data } = await api.get(`/chat/sessions/${sessionId}`);
      setTranscript(data.session.session_data?.history || []);
    } catch {
      setTranscript([]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Chat Sessions</h1>
        <p className="text-sm text-gray-500">All chatbot conversations and lead captures</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Sessions" value={stats?.totalSessions} icon="💬" />
        <StatCard label="Leads Captured" value={stats?.chatbotLeads} icon="🎯" />
        <StatCard label="Knowledge Chunks" value={stats?.totalChunks} icon="📚" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sessions List */}
        <Card>
          <CardHeader><CardTitle>Recent Sessions</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto divide-y">
              {loading ? (
                <p className="p-4 text-sm text-gray-400">Loading...</p>
              ) : sessions.length === 0 ? (
                <p className="p-4 text-sm text-gray-400">No sessions yet.</p>
              ) : sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => loadTranscript(s.id)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${selected === s.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-800">
                      {s.lead_name ? `🎯 ${s.lead_name}` : '👤 Anonymous'}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.state === 'lead_captured' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {s.state || 'active'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    {s.lead_phone && <p className="text-xs text-gray-500">{s.lead_phone}</p>}
                    <p className="text-xs text-gray-400">{s.message_count} messages</p>
                    <p className="text-xs text-gray-400 ml-auto">{new Date(s.updated_at).toLocaleString()}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transcript Viewer */}
        <Card>
          <CardHeader>
            <CardTitle>{selected ? 'Conversation Transcript' : 'Select a session'}</CardTitle>
          </CardHeader>
          <CardContent>
            {!selected ? (
              <p className="text-sm text-gray-400">Click a session on the left to view the full transcript.</p>
            ) : transcript === null ? (
              <p className="text-sm text-gray-400">Loading transcript...</p>
            ) : transcript.length === 0 ? (
              <p className="text-sm text-gray-400">No messages in this session.</p>
            ) : (
              <div className="max-h-[440px] space-y-3 overflow-y-auto">
                {transcript.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${msg.role === 'assistant' ? 'bg-gray-100 text-gray-800' : 'bg-blue-600 text-white'}`}>
                      <p className="text-[10px] font-semibold uppercase opacity-60 mb-1">{msg.role === 'assistant' ? 'Bot' : 'User'}</p>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
