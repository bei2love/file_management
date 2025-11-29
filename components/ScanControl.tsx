import React, { useState, useRef, useEffect } from 'react';
import { Play, Square, FolderOpen, Database, Activity, Clock } from 'lucide-react';
import { ScanStats, FileRecord } from '../types';
import { MockScanner } from '../services/mockService';

interface ScanControlProps {
  onScanComplete: (records: FileRecord[]) => void;
}

export const ScanControl: React.FC<ScanControlProps> = ({ onScanComplete }) => {
  const [path, setPath] = useState('/volume1/homes/admin/documents');
  const [stats, setStats] = useState<ScanStats>({
    totalFiles: 0,
    processedFiles: 0,
    totalSize: 0,
    startTime: null,
    endTime: null,
    currentFile: '',
    status: 'idle'
  });
  
  const [logs, setLogs] = useState<string[]>([]);
  const scannerRef = useRef<MockScanner | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleStartScan = async () => {
    if (!path) return;
    
    setStats({
      totalFiles: 0,
      processedFiles: 0,
      totalSize: 0,
      startTime: Date.now(),
      endTime: null,
      currentFile: 'Initializing scan...',
      status: 'scanning'
    });
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Starting scan of ${path}...`]);

    scannerRef.current = new MockScanner();
    const collectedRecords: FileRecord[] = [];

    await scannerRef.current.scanDirectory(path, (file, progress) => {
      collectedRecords.push(file);
      setStats(prev => ({
        ...prev,
        processedFiles: prev.processedFiles + 1,
        totalFiles: prev.totalFiles + 1, // In a real scenario, total might be known or unknown
        totalSize: prev.totalSize + file.size,
        currentFile: file.path
      }));
      setLogs(prev => {
        const newLogs = [...prev];
        if (newLogs.length > 50) newLogs.shift(); // Keep log size manageable
        newLogs.push(`[${file.status.toUpperCase()}] ${file.filename} (${formatBytes(file.size)})`);
        return newLogs;
      });
    });

    setStats(prev => ({ ...prev, status: 'completed', endTime: Date.now(), currentFile: 'Done.' }));
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Scan completed successfully.`]);
    onScanComplete(collectedRecords);
  };

  const handleStopScan = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      setStats(prev => ({ ...prev, status: 'paused', currentFile: 'Stopped by user.' }));
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Scan stopped.`]);
    }
  };

  const isScanning = stats.status === 'scanning';

  return (
    <div className="space-y-6">
      {/* Path Input Section */}
      <div className="bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-800">
        <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-indigo-500" />
          Target Directory
        </h2>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              disabled={isScanning}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-500"
              placeholder="/volume1/data"
            />
            <div className="absolute right-3 top-3 text-xs text-gray-500 font-mono">
              Synology Path
            </div>
          </div>
          {!isScanning ? (
            <button
              onClick={handleStartScan}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-indigo-900/30"
            >
              <Play className="w-4 h-4" />
              Start Scan
            </button>
          ) : (
            <button
              onClick={handleStopScan}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-red-900/30"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-400">
          Enter the absolute path on your NAS. The backend Python script must have read permissions for this directory.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-800 flex items-center gap-4">
          <div className="p-3 bg-blue-900/30 rounded-full text-blue-400 border border-blue-800/50">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Files Processed</p>
            <p className="text-2xl font-bold text-gray-100">{stats.processedFiles.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-800 flex items-center gap-4">
          <div className="p-3 bg-purple-900/30 rounded-full text-purple-400 border border-purple-800/50">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Total Size</p>
            <p className="text-2xl font-bold text-gray-100">{formatBytes(stats.totalSize)}</p>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-800 flex items-center gap-4">
          <div className="p-3 bg-green-900/30 rounded-full text-green-400 border border-green-800/50">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Status</p>
            <p className="text-2xl font-bold text-gray-100 capitalize">{stats.status}</p>
          </div>
        </div>
      </div>

      {/* Live Logs */}
      <div className="bg-black rounded-xl overflow-hidden shadow-lg border border-gray-800">
        <div className="px-4 py-3 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
          <span className="text-sm font-mono text-gray-400">Live Execution Log</span>
          {isScanning && <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>}
        </div>
        <div className="h-64 overflow-y-auto p-4 font-mono text-sm space-y-1 code-scroll bg-black">
          {logs.length === 0 && <p className="text-gray-600 italic">Ready to scan...</p>}
          {logs.map((log, idx) => (
            <div key={idx} className="text-gray-300 border-l-2 border-transparent hover:border-indigo-500 pl-2">
              {log}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
        <div className="px-4 py-2 bg-gray-900 border-t border-gray-800 text-xs text-gray-500 truncate">
          Last Activity: {stats.currentFile || 'None'}
        </div>
      </div>
    </div>
  );
};