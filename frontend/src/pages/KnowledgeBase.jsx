import { useEffect, useState } from 'react';
import { api } from '../lib/axios';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const StatusBadge = ({ active }) => (
  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
    {active ? 'Active' : 'Inactive'}
  </span>
);

export default function KnowledgeBase() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [sourceWebsite, setSourceWebsite] = useState('CodeWay Labs');

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/knowledge');
      setDocs(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('source_website', sourceWebsite);

    try {
      setUploading(true);
      setUploadProgress('Uploading & processing file...');
      const { data } = await api.post('/knowledge/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadProgress(`✓ Done! ${data.chunksProcessed} chunks processed from "${data.filename}"`);
      fetchDocs();
    } catch (err) {
      setUploadProgress(`✗ Error: ${err.response?.data?.error || 'Upload failed'}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleToggle = async (id, current) => {
    try {
      await api.patch(`/knowledge/${id}/toggle`, { is_active: !current });
      fetchDocs();
    } catch (err) {
      alert('Failed to update document status.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this knowledge document? The chatbot will lose access to this content.')) return;
    try {
      await api.delete(`/knowledge/${id}`);
      fetchDocs();
    } catch (err) {
      alert('Failed to delete document.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Knowledge Base</h1>
        <p className="text-sm text-gray-500">Documents used by the AI chatbot to answer queries</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label
              className={`flex cursor-pointer items-center gap-2 rounded-md border-2 border-dashed px-6 py-4 transition-colors ${uploading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-sm font-medium text-gray-600">
                {uploading ? 'Processing...' : 'Click to upload PDF, TXT, or MD'}
              </span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.txt,.md"
                disabled={uploading}
                onChange={handleUpload}
              />
            </label>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Target Website</label>
              <select 
                value={sourceWebsite}
                onChange={e => setSourceWebsite(e.target.value)}
                disabled={uploading}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="CodeWay Labs">CodeWay Labs</option>
                <option value="Verve Innovation">Verve Innovation</option>
                <option value="Dursikshya">Dursikshya (LMS)</option>
              </select>
            </div>
          </div>
          {uploadProgress && (
            <p className={`mt-2 text-sm ${uploadProgress.startsWith('✓') ? 'text-emerald-600' : uploadProgress.startsWith('✗') ? 'text-red-500' : 'text-blue-500'}`}>
              {uploadProgress}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Filename</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Website</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Chunks</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Uploaded By</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Uploaded</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="py-8 text-center text-gray-400">Loading...</td></tr>
              ) : docs.length === 0 ? (
                <tr><td colSpan="6" className="py-8 text-center text-gray-400">No documents uploaded yet.</td></tr>
              ) : docs.map((doc) => (
                <tr key={doc.id} className="border-b last:border-0">
                  <td className="px-6 py-4 font-medium">{doc.filename}</td>
                  <td className="px-6 py-4 text-gray-600 font-medium">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs">{doc.source_website || 'Dursikshya'}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{doc.chunk_count}</td>
                  <td className="px-6 py-4 text-gray-600">{doc.uploaded_by_name || 'System'}</td>
                  <td className="px-6 py-4"><StatusBadge active={doc.is_active} /></td>
                  <td className="px-6 py-4 text-gray-500">{new Date(doc.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleToggle(doc.id, doc.is_active)}>
                        {doc.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(doc.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
