import React, { useState } from 'react';
import { Copy, Terminal, Server, Check } from 'lucide-react';
import { PYTHON_BACKEND_SCRIPT } from '../services/pythonScriptTemplate';

export const ServerSetupGuide: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PYTHON_BACKEND_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-indigo-900/50 border border-indigo-500/30 text-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold flex items-center gap-3 mb-2 text-indigo-100">
          <Server className="w-6 h-6" />
          Synology NAS Backend Setup
        </h2>
        <p className="text-indigo-200/80">
          Since browsers cannot directly access your NAS file system or database, you need to run the Python backend script directly on your Synology NAS.
        </p>
      </div>

      <div className="bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-800">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Installation Steps</h3>
        <ol className="list-decimal list-inside space-y-4 text-gray-400">
          <li className="pl-2">
            <span className="font-medium text-gray-200">Access your NAS via SSH.</span> You can enable this in Control Panel > Terminal & SNMP.
          </li>
          <li className="pl-2">
            <span className="font-medium text-gray-200">Create the Python script.</span> Copy the code below and save it as <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-indigo-300 border border-gray-700">nas_scanner.py</code>.
          </li>
          <li className="pl-2">
            <span className="font-medium text-gray-200">Run the scanner.</span> Execute the script using Python 3 (usually pre-installed on DSM).
            <div className="mt-2 bg-black text-gray-300 p-3 rounded-lg font-mono text-sm border border-gray-800">
              $ python3 nas_scanner.py /volume1/your_folder
            </div>
          </li>
          <li className="pl-2">
            <span className="font-medium text-gray-200">Export/View Data.</span> This script creates a SQLite database <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-indigo-300 border border-gray-700">nas_file_index.db</code> which you can query or export.
          </li>
        </ol>
      </div>

      <div className="bg-black rounded-xl overflow-hidden shadow-lg border border-gray-800">
        <div className="flex justify-between items-center px-4 py-3 bg-gray-900 border-b border-gray-800">
          <div className="flex items-center gap-2 text-gray-400 font-mono text-sm">
            <Terminal className="w-4 h-4" />
            nas_scanner.py
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs text-gray-300 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
        <div className="p-4 overflow-x-auto code-scroll bg-black">
          <pre className="text-sm font-mono text-gray-400 leading-relaxed">
            {PYTHON_BACKEND_SCRIPT}
          </pre>
        </div>
      </div>
    </div>
  );
};