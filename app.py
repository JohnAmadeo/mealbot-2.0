from __future__ import print_function
from flask import Flask, render_template, request, redirect, make_response, Response
import os
import json
import re
import requests
import sys
import urllib.parse

app = Flask(__name__)

@app.route('/')
def serve_index():
    return render_template('login.html')

@app.route('/app')
def serve_app():
    return render_template('app.html')

if __name__ == '__main__':
    # app.run(debug=True)
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

