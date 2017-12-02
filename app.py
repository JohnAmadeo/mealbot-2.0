from __future__ import print_function
from flask import Flask, render_template, request, redirect, make_response, Response
import os
import json
import re
import requests
import sys
import psycopg2

if sys.version_info >= (3, 0):
    import urllib.parse as parse
else:
  import urlparse as parse

app = Flask(__name__)

@app.route('/')
def serve_index():
    return render_template('login.html')

@app.route('/app')
def serve_app():
    return render_template('app.html')

def connect_to_db():
    db_url = os.environ["DATABASE_URL"] # + '/?sslmode=require'
    parse.uses_netloc.append("postgres")
    url = parse.urlparse(db_url)

    conn = psycopg2.connect(
        database=url.path[1:],
        user=url.username,
        password=url.password,
        host=url.hostname,
        port=url.port
    )

    cursor = conn.cursor()
    # cursor.execute("CREATE TABLE test (name varchar(40));")
    cursor.execute("INSERT INTO test VALUES ('John');")
    cursor.execute("SELECT * FROM test;")
    print (cursor.fetchone())
    conn.commit()

if __name__ == '__main__':
    # app.run(debug=True)
    connect_to_db()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

