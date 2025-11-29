import React, { useState, useMemo } from 'react';
import { Download, Search, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { FileRecord } from '../types';

interface ResultsTableProps {
  data: FileRecord[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredData = useMemo(() => {
    return data.filter(file => 
      file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.path.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const handleExport = () => {
    // Generate CSV content
    const headers = ['ID', 'Filename', 'Path', 'Extension', 'Size (Bytes)', 'MD5', 'Status', 'Scanned At'];
    const rows = filteredData.map(file => [
      file.id,
      file.filename,
      file.path,
      file.extension,
      file.size,
      file.md5,
      file.status,
      file.scannedAt
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `scan_results_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scanned': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'skipped': return <AlertCircle className="w-4 h-4 text-blue-400" />; // Skipped usually means resumable/already done
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <div className="w-4 h-4" />;
    }
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-900 rounded-xl border border-dashed border-gray-700">
        <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
          <Search className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-200">No Scan Results Yet</h3>
        <p className="text-gray-500 mt-1">Run a scan in the Scanner tab to populate this table.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Filter by filename or path..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm placeholder-gray-500"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleExport}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors border border-green-600"
          >
            <Download className="w-4 h-4" />
            Export Excel/CSV
          </button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-800 text-gray-400 font-medium border-b border-gray-700">
              <tr>
                <th className="px-6 py-3 w-10">Status</th>
                <th className="px-6 py-3">Filename</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Size</th>
                <th className="px-6 py-3 font-mono">MD5 Hash</th>
                <th className="px-6 py-3">Path</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredData.slice(0, 100).map((file) => (
                <tr key={file.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center" title={file.status}>
                      {getStatusIcon(file.status)}
                    </div>
                  </td>
                  <td className="px-6 py-3 font-medium text-gray-200">{file.filename}</td>
                  <td className="px-6 py-3 text-gray-500">{file.extension}</td>
                  <td className="px-6 py-3 text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</td>
                  <td className="px-6 py-3 font-mono text-xs text-gray-500">{file.md5}</td>
                  <td className="px-6 py-3 text-gray-600 text-xs truncate max-w-xs" title={file.path}>
                    {file.path}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredData.length > 100 && (
          <div className="px-6 py-3 bg-gray-800 border-t border-gray-700 text-center text-xs text-gray-500">
            Showing first 100 of {filteredData.length} records. Export to see all.
          </div>
        )}
      </div>
    </div>
  );
};