# imports
from __future__ import print_function
from flask import Flask, render_template, request, redirect, make_response, Response
import os
import json
import requests
import sys
import psycopg2
import uuid

if sys.version_info >= (3, 0):
    import urllib.parse as parse
else:
    import urlparse as parse

# globals
app = Flask(__name__)
conn = None

# route handlers
@app.route('/')
@app.route('/callback')
@app.route('/dashboard')
def serve_index():
    return render_template('app.html')

@app.route('/user', methods=['POST', 'GET'])
def process_user():
    # need invalid argument check for GET & POST
    cursor = conn.cursor()
    resp = Response()
    if request.method == 'GET':
        email = request.args.get('email')
        cursor.execute("SELECT * FROM users WHERE email = %s", (email, ))
        user_matches = cursor.fetchall()
        # need duplicate user check
        if len(user_matches) == 1:
            user = user_matches[0]
            data = json.dumps({
                'user_id': user[0],
                'email': user[1]
            })
            resp = Response(response=data, status=200, mimetype='application/json')
        elif len(user_matches) == 0:
            resp = Response(response='User not found', status=404)

    elif request.method == 'POST':
        data = request.get_json()
        print (data)
        print (data['email'])
        # need user account w/ requested email already exists check
        cursor.execute("INSERT INTO users VALUES (%s, %s)",
            (str(uuid.uuid4()), data['email']))
        resp = Response(response='User created', status=200)

    conn.commit()
    return resp

# helpers
def connect_to_db():
    global conn
    db_url = os.environ["MEALBOT_DATABASE_URL"] # + '/?sslmode=require'
    parse.uses_netloc.append("postgres")
    url = parse.urlparse(db_url)

    conn = psycopg2.connect(
        database=url.path[1:],
        user=url.username,
        password=url.password,
        host=url.hostname,
        port=url.port
    )

    # cursor = conn.cursor()
    # cursor.execute("CREATE TABLE test (name varchar(40));")
    # cursor.execute("INSERT INTO test VALUES ('John');")
    # cursor.execute("SELECT * FROM test WHERE name = %s", ('John', ))
    # print (cursor.fetchone())
    # conn.commit()

if __name__ == '__main__':
    # app.run(debug=True)
    connect_to_db()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
