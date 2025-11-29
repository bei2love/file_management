export const PYTHON_BACKEND_SCRIPT = `
import os
import hashlib
import sqlite3
import time
import threading
import json
from datetime import datetime
from pathlib import Path
from flask import Flask, request, jsonify, g
from werkzeug.security import generate_password_hash, check_password_hash

# --- Configuration ---
DB_NAME = "nas_guard.db"
app = Flask(__name__)
app.secret_key = 'change_this_to_a_random_secret_key'

# --- Global Scan State ---
scan_state = {
    "is_scanning": False,
    "current_file": "",
    "processed_count": 0,
    "total_size": 0,
    "start_time": None,
    "status": "idle"
}
scan_lock = threading.Lock()

# --- Database Helper ---
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DB_NAME)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    """Initialize the SQLite database with users and files tables."""
    with app.app_context():
        db = get_db()
        cursor = db.cursor()
        
        # 1. Users Table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TEXT
            )
        ''')
        
        # 2. Files Table (nas_files)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS nas_files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                path TEXT UNIQUE NOT NULL,
                filename TEXT,
                extension TEXT,
                size INTEGER,
                mtime REAL,
                md5 TEXT,
                scanned_at TEXT
            )
        ''')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_path ON nas_files (path)')
        
        # Create default admin user if not exists
        cursor.execute('SELECT * FROM users WHERE username = ?', ('admin',))
        if not cursor.fetchone():
            default_pass = generate_password_hash('admin')
            cursor.execute('INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)',
                           ('admin', default_pass, datetime.now().isoformat()))
            print("Default user 'admin' created with password 'admin'.")
            
        db.commit()

# --- Core Logic ---
def calculate_md5(file_path, block_size=8192):
    md5 = hashlib.md5()
    try:
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(block_size), b''):
                md5.update(chunk)
        return md5.hexdigest()
    except Exception:
        return None

def background_scan_task(root_path):
    global scan_state
    
    with app.app_context():
        conn = sqlite3.connect(DB_NAME) # New connection for thread
        cursor = conn.cursor()
        
        with scan_lock:
            scan_state["status"] = "scanning"
            scan_state["start_time"] = time.time()
            scan_state["processed_count"] = 0
            scan_state["total_size"] = 0

        pending_commits = 0
        BATCH_SIZE = 50

        for root, dirs, files in os.walk(root_path):
            if scan_state["status"] != "scanning": break
            
            for name in files:
                if scan_state["status"] != "scanning": break
                
                file_path = os.path.join(root, name)
                
                # Update UI state
                scan_state["current_file"] = file_path
                
                try:
                    p = Path(file_path)
                    stat = p.stat()
                    mtime = stat.st_mtime
                    size = stat.st_size
                    
                    # Resumable Check
                    cursor.execute('SELECT mtime, size, md5 FROM nas_files WHERE path = ?', (str(p),))
                    row = cursor.fetchone()
                    
                    md5_val = None
                    if row and row[0] == mtime and row[1] == size:
                        md5_val = row[2] # Skip calculation
                    else:
                        md5_val = calculate_md5(p)

                    if md5_val:
                        cursor.execute('''
                            INSERT INTO nas_files (path, filename, extension, size, mtime, md5, scanned_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?)
                            ON CONFLICT(path) DO UPDATE SET
                                size=excluded.size,
                                mtime=excluded.mtime,
                                md5=excluded.md5,
                                scanned_at=excluded.scanned_at
                        ''', (str(p), p.name, p.suffix, size, mtime, md5_val, datetime.now().isoformat()))
                        
                        pending_commits += 1
                        scan_state["processed_count"] += 1
                        scan_state["total_size"] += size

                    if pending_commits >= BATCH_SIZE:
                        conn.commit()
                        pending_commits = 0

                except Exception as e:
                    print(f"Error processing {file_path}: {e}")

        conn.commit()
        conn.close()
        
        with scan_lock:
            scan_state["status"] = "completed"
            scan_state["is_scanning"] = False

# --- API Endpoints ---

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    db = get_db()
    user = db.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()
    
    if user and check_password_hash(user['password_hash'], password):
        return jsonify({"success": True, "message": "Login successful"})
    
    return jsonify({"success": False, "message": "Invalid credentials"}), 401

@app.route('/api/scan/start', methods=['POST'])
def start_scan():
    data = request.json
    path = data.get('path')
    
    if not path or not os.path.exists(path):
        return jsonify({"error": "Invalid path"}), 400
        
    with scan_lock:
        if scan_state["is_scanning"]:
            return jsonify({"error": "Scan already in progress"}), 409
        scan_state["is_scanning"] = True
        
    thread = threading.Thread(target=background_scan_task, args=(path,))
    thread.daemon = True
    thread.start()
    
    return jsonify({"message": "Scan started", "path": path})

@app.route('/api/scan/status', methods=['GET'])
def get_status():
    return jsonify(scan_state)

@app.route('/api/scan/stop', methods=['POST'])
def stop_scan():
    with scan_lock:
        scan_state["status"] = "stopped"
        scan_state["is_scanning"] = False
    return jsonify({"message": "Stopping scan..."})

@app.route('/api/results', methods=['GET'])
def get_results():
    db = get_db()
    cursor = db.execute('SELECT * FROM nas_files ORDER BY scanned_at DESC LIMIT 1000')
    rows = cursor.fetchall()
    results = [dict(row) for row in rows]
    return jsonify(results)

if __name__ == '__main__':
    # Initialize DB before starting server
    if not os.path.exists(DB_NAME):
        init_db()
    
    print("Starting NAS Guard Server on 0.0.0.0:5000")
    app.run(host='0.0.0.0', port=5000)
`;