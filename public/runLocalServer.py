import http.server
import socketserver

PORT = 8325
print("localhost:{}".format(PORT))

Handler = http.server.SimpleHTTPRequestHandler
print("serving at port", PORT)
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("serving at port", PORT)
    httpd.serve_forever()