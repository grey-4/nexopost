#!/usr/bin/env python3
import os
import subprocess
import sys
import socket

# Helper to check if a command exists
def command_exists(cmd):
    return subprocess.call(f'type {cmd}', shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL) == 0

# Install npm dependencies if needed
def ensure_npm_deps():
    if not os.path.exists('node_modules'):
        print('Installing npm dependencies...')
        subprocess.check_call(['npm', 'install'])
    else:
        print('npm dependencies already installed.')

# Build TypeScript if dist/app.js does not exist
def ensure_build():
    if not os.path.exists('dist/app.js'):
        print('Building TypeScript...')
        subprocess.check_call(['npx', 'tsc'])
    else:
        print('TypeScript already built.')

# Get local IP address
def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # doesn't have to be reachable
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

# Start backend server
def start_backend():
    print('Starting backend server (node dist/app.js)...')
    return subprocess.Popen(['node', 'dist/app.js'])

# Start client server
def start_client():
    # Prefer python3 http.server, fallback to npx serve
    if command_exists('python3'):
        print('Starting client server (python3 -m http.server 8080 --directory client --bind 0.0.0.0)...')
        return subprocess.Popen(['python3', '-m', 'http.server', '8080', '--directory', 'client', '--bind', '0.0.0.0'])
    elif command_exists('npx'):
        print('Starting client server (npx serve -l 0.0.0.0:8080 client)...')
        return subprocess.Popen(['npx', 'serve', '-l', '0.0.0.0:8080', 'client'])
    else:
        print('Neither python3 nor npx serve found. Please install one of them.')
        sys.exit(1)

if __name__ == '__main__':
    # Check for node and npm
    if not command_exists('node') or not command_exists('npm'):
        print('Node.js and npm are required. Please install them and try again.')
        sys.exit(1)
    # Check for npx
    if not command_exists('npx'):
        print('npx is required. Please install it (usually comes with npm >= 5.2.0).')
        sys.exit(1)
    ensure_npm_deps()
    ensure_build()
    backend_proc = start_backend()
    client_proc = start_client()
    ip = get_ip()
    print(f'\nAccess the client interface at: http://{ip}:8080')
    print('To stop, press Ctrl+C.')
    try:
        backend_proc.wait()
        client_proc.wait()
    except KeyboardInterrupt:
        print('\nShutting down...')
        backend_proc.terminate()
        client_proc.terminate()
        sys.exit(0)
