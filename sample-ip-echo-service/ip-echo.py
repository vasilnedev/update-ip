from flask import Flask, request
import os

app = Flask(__name__)

port = int(os.environ.get('NODE_PORT', 3000))

@app.route('/')
def get_ip():
    """
    Returns the client's IP address in plain text.
    """
    ip_address = request.remote_addr
    return ip_address, 200, {'Content-Type': 'text/plain'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port)
