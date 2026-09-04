#!/usr/bin/env python3
"""Simple static file server for the vanilla JS frontend."""
import http.server
import socketserver
import os
from pathlib import Path

PORT = 3000
ROOT = Path(__file__).parent.resolve()

MIME = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.map': 'application/json',
}

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

os.chdir(ROOT)

Handler.extensions_map.update({k: v for k, v in MIME.items()})

with socketserver.ThreadingTCPServer(('', PORT), Handler) as httpd:
    print(f'Frontend server running at http://localhost:{PORT}')
    print(f'API base URL: http://localhost:8000/api')
    print(f'\nTo start the API too:\n  cd .. && php artisan serve --port=8000')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\nShutting down...')
