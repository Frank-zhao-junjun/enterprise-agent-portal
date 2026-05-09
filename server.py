from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

PORT = int(os.environ.get("DEPLOY_RUN_PORT") or os.environ.get("PORT", "5000"))
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        if self.path.rstrip("/") == "/v1/ping":
            body = b'{"status":"ok"}\n'
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        super().end_headers()

if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", PORT), Handler)
    print(f"Serving on port {PORT}", flush=True)
    server.serve_forever()
