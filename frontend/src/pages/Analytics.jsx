import { useState } from 'react';
import { api } from '../lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Download, FileSpreadsheet } from 'lucide-react';

export default function Analytics() {
  const [downloading, setDownloading] = useState(false);

  const handleExportCsv = async () => {
    try {
      setDownloading(true);
      // We expect a file blob download
      const response = await api.get('/analytics/export', { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'leads_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Failed to export CSV');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics & Reports</h1>
        <p className="text-sm text-gray-500">Generate reports and export data</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
              Lead Data Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Download a complete CSV of all leads in the system, including their current status, source, and assigned counselor.
            </p>
            <Button onClick={handleExportCsv} disabled={downloading} className="w-full bg-green-600 hover:bg-green-700 text-white">
              <Download className="mr-2 h-4 w-4" />
              {downloading ? 'Preparing Download...' : 'Export Full CSV'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
