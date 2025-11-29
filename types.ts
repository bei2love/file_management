export interface FileRecord {
  id: string;
  filename: string;
  path: string;
  extension: string;
  size: number;
  md5: string;
  scannedAt: string;
  status: 'scanned' | 'skipped' | 'failed';
}

export interface ScanStats {
  totalFiles: number;
  processedFiles: number;
  totalSize: number;
  startTime: number | null;
  endTime: number | null;
  currentFile: string;
  status: 'idle' | 'scanning' | 'paused' | 'completed';
}

export interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  token: string | null;
}

export enum TabView {
  SCANNER = 'SCANNER',
  RESULTS = 'RESULTS',
  SETUP = 'SETUP'
}