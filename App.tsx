import React, { useState } from 'react';
import { LayoutDashboard, HardDrive, FileText, Settings, ShieldCheck, LogOut } from 'lucide-react';
import { ScanControl } from './components/ScanControl';
import { ResultsTable } from './components/ResultsTable';
import { ServerSetupGuide } from './components/ServerSetupGuide';
import { Login } from './components/Login';
import { TabView, FileRecord, AuthState } from './types';

function App() {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    username: null,
    token: null
  });

  const [activeTab, setActiveTab] = useState<TabView>(TabView.SCANNER);
  const [scanResults, setScanResults] = useState<FileRecord[]>([]);

  const handleLogin = (username: string) => {
    setAuth({
      isAuthenticated: true,
      username: username,
      token: 'mock-token'
    });
  };

  const handleLogout = () => {
    setAuth({
      isAuthenticated: false,
      username: null,
      token: null
    });
    setScanResults([]); // Optional: Clear sensitive data on logout
  };

  const handleScanComplete = (records: FileRecord[]) => {
    setScanResults(prev => [...prev, ...records]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case TabView.SCANNER:
        return <ScanControl onScanComplete={handleScanComplete} />;
      case TabView.RESULTS:
        return <ResultsTable data={scanResults} />;
      case TabView.SETUP:
        return <ServerSetupGuide />;
      default:
        return <ScanControl onScanComplete={handleScanComplete} />;
    }
  };

  if (!auth.isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex-shrink-0 fixed h-full z-10 hidden md:block">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">NAS Guard</h1>
            <p className="text-xs text-gray-500">v1.2.0 Enterprise</p>
          </div>
        </div>
        
        <nav className="p-4 space-y-1">
          <button
            onClick={() => setActiveTab(TabView.SCANNER)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === TabView.SCANNER
                ? 'bg-gray-800 text-indigo-400 border border-gray-700'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <HardDrive className="w-5 h-5" />
            Scanner
          </button>
          
          <button
            onClick={() => setActiveTab(TabView.RESULTS)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === TabView.RESULTS
                ? 'bg-gray-800 text-indigo-400 border border-gray-700'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <div className="relative">
              <FileText className="w-5 h-5" />
              {scanResults.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-900"></span>
              )}
            </div>
            Scan Results
          </button>

          <div className="pt-4 mt-4 border-t border-gray-800">
            <button
              onClick={() => setActiveTab(TabView.SETUP)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === TabView.SETUP
                  ? 'bg-gray-800 text-indigo-400 border border-gray-700'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5" />
            Backend Setup
          </button>
        </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-gray-900">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-indigo-900/50 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
              {auth.username?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{auth.username}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8">
        <header className="mb-8 flex justify-between items-center md:hidden">
           <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-500" />
            <h1 className="text-xl font-bold text-white">NAS Guard</h1>
           </div>
           <button onClick={handleLogout} className="p-2 bg-gray-800 rounded-full border border-gray-700">
             <LogOut className="w-5 h-5 text-gray-400" />
           </button>
        </header>

        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">
              {activeTab === TabView.SCANNER && 'System Scanner'}
              {activeTab === TabView.RESULTS && 'Scan Results'}
              {activeTab === TabView.SETUP && 'Backend Configuration'}
            </h2>
            <p className="text-gray-400 mt-1">
              {activeTab === TabView.SCANNER && 'Configure path and initiate file integrity checks.'}
              {activeTab === TabView.RESULTS && 'View, filter, and export detailed scan reports.'}
              {activeTab === TabView.SETUP && 'Download the Python script required for your Synology NAS.'}
            </p>
          </div>

          <div className="animate-fade-in">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;