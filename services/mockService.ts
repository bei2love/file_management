import { FileRecord } from '../types';

// Deterministic mock data generator
const generateMockFiles = (count: number, basePath: string): FileRecord[] => {
  const types = ['jpg', 'png', 'mp4', 'mkv', 'docx', 'pdf', 'iso'];
  const files: FileRecord[] = [];

  for (let i = 0; i < count; i++) {
    const ext = types[Math.floor(Math.random() * types.length)];
    const name = `file_backup_${i}_${Math.random().toString(36).substring(7)}.${ext}`;
    const size = Math.floor(Math.random() * 1024 * 1024 * 500); // Up to 500MB
    
    files.push({
      id: `file-${i}`,
      filename: name,
      path: `${basePath}/${name}`,
      extension: `.${ext}`,
      size: size,
      md5: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      scannedAt: new Date().toISOString(),
      status: Math.random() > 0.8 ? 'skipped' : 'scanned', // Simulate some being skipped (resumed)
    });
  }
  return files;
};

export const MockAuth = {
  login: async (username: string, password: string): Promise<boolean> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    // Accept admin/admin or anything else for demo purposes as long as it's not empty
    if (username === 'admin' && password === 'admin') {
        return true;
    }
    // Fail if username is empty (just a basic validation)
    return username.length > 0; 
  }
};

// Simulation of a scanning process
export class MockScanner {
  private stopSignal = false;

  stop() {
    this.stopSignal = true;
  }

  async scanDirectory(
    path: string, 
    onProgress: (file: FileRecord, progress: number) => void
  ): Promise<FileRecord[]> {
    this.stopSignal = false;
    const totalFiles = 200; // Simulate 200 files found
    const results: FileRecord[] = generateMockFiles(totalFiles, path);
    
    for (let i = 0; i < totalFiles; i++) {
      if (this.stopSignal) break;

      // Simulate network/disk latency
      await new Promise(resolve => setTimeout(resolve, 50));
      
      onProgress(results[i], ((i + 1) / totalFiles) * 100);
    }

    return this.stopSignal ? [] : results;
  }
}