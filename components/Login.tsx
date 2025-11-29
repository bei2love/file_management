import React, { useState } from 'react';
import { ShieldCheck, Lock, User, ArrowRight, Server } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (username && password) {
        onLogin(username);
      } else {
        setError('Please enter both username and password.');
      }
    } catch (err) {
      setError('Connection to NAS failed. Please check your backend.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
        <div className="bg-gray-800 px-8 py-10 text-center relative overflow-hidden border-b border-gray-700">
            <div className="absolute top-0 left-0 w-full h-full opacity-5">
                 <div className="absolute transform rotate-45 bg-indigo-500 w-40 h-40 -top-10 -left-10"></div>
                 <div className="absolute transform rotate-45 bg-indigo-500 w-20 h-20 top-20 right-10"></div>
            </div>
          <div className="relative z-10 flex justify-center mb-4">
            <div className="bg-gray-900 p-3 rounded-xl shadow-lg border border-gray-700">
              <ShieldCheck className="w-10 h-10 text-indigo-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white relative z-10">NAS Guard</h1>
          <p className="text-gray-400 mt-2 text-sm relative z-10">Secure File Integrity Scanner</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 block">Username</label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-950 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-600"
                  placeholder="Enter username"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 block">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-950 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm p-3 rounded-lg flex items-center gap-2">
                <Server className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white font-semibold transition-all shadow-lg ${
                isLoading 
                  ? 'bg-indigo-800 cursor-not-allowed text-indigo-300' 
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/50 hover:shadow-indigo-500/30'
              }`}
            >
              {isLoading ? 'Authenticating...' : 'Access Dashboard'}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-800 text-center">
             <p className="text-xs text-gray-500">
               Default credentials: <span className="font-mono text-gray-400">admin / admin</span>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};