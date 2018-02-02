# imports
from __future__ import print_function
from flask import Flask, render_template, request, redirect, make_response, Response
import os
import json
import requests
import sys
import psycopg2
import uuid
import csv
import pandas as pd
import numpy as np

if sys.version_info >= (3, 0):
    import urllib.parse as parse
else:
    import urlparse as parse

# globals
app = Flask(__name__)
conn = None

# connect to DB
# db_url =  # + '/?sslmode=require'
parse.uses_netloc.append("postgres")
url = parse.urlparse(os.environ["MEALBOT_DATABASE_URL"])
conn = psycopg2.connect(
    database=url.path[1:], user=url.username, password=url.password,
    host=url.hostname, port=url.port)
print('Connected to database')

# route handlers
@app.route('/')
@app.route('/callback')
@app.route('/dashboard')
@app.route('/onboarding')
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
        conn.commit()
        resp = Response(response='User created', status=200)
    return resp

@app.route('/club/members', methods=['POST'])
# WORKS WITH PYTHON 2 BUT NOT WITH PYTHON 3 FOR SOME REASON
def process_club_members():
    cursor = conn.cursor()
    # need no files error
    # need club_id is not valid error
    clubID = request.args.get('club_id')
    print('clubID: ' + clubID)

    filename = request.files['file'].filename

    if filename.split('.')[-1] in ['xls', 'xlsx']:
        process_members_excel(request.files['file'], clubID)
    else:
        process_members_csv(request.files['file'], clubID)

    return Response(status=200)

def process_members_excel(excel_file, clubID):
    cursor = conn.cursor()
    df = pd.read_excel(excel_file)

    headers = [col.lower().strip() for col in list(df.columns.values)]
    if headers[:2] != ['name', 'email']:
        error = "First 2 column headers should be 'Name' and 'Email'"
        print(error)
        return Response(error, status=404)

    for idx, row in df.iterrows():

        metadata = {}
        for header in headers[2:]:
            value = row[header]
            metadata[header] = str(value) if not pd.isnull(value) else ""

        if row['name'].strip() == '' or row['email'].strip() == '':
            error = "A member's 'Name' or 'Email' column cannot have an empty value"
            print(error);
            conn.rollback()
            return Response(error, status=404)

        cursor.execute("INSERT INTO members VALUES (%s, %s, %s, %s, %s)",
            (str(uuid.uuid4()), row['name'], row['email'], clubID, json.dumps(metadata)))

    conn.commit()

def process_members_csv(csv_file, clubID):
    cursor = conn.cursor()
    reader = csv.reader(csv_file, delimiter=',', quotechar='|')

    is_header = True
    headers = []
    for row in reader:
        if is_header:
            headers = row
            required_headers = [header.lower().strip() for header in row][:2]
            if required_headers != ['name', 'email']:
                error = "First 2 column headers should be 'Name' and 'Email'"
                print(error)
                return Response(error, status=404)
            is_header = False
        else:
            metadata_json = {}
            for col_idx, header in enumerate(headers):
                if col_idx > 1:
                    metadata_json[header] = row[col_idx]
            print('process_club_members: ' + str(metadata_json))
            if row[0].strip() == '' or row[1].strip() == '':
                error = "A member's 'Name' or 'Email' column cannot have an empty value"
                print(error);
                conn.rollback()
                return Response(error, status=404)

            # schema is (member_id varchar PRIMARY KEY, member_name varchar,
            # member_email varchar, club_id varchar FOREIGN KEY, metadata jsonb)
            cursor.execute("INSERT INTO members VALUES (%s, %s, %s, %s, %s)",
                (str(uuid.uuid4()), row[0], row[1], clubID, json.dumps(metadata_json)))

    conn.commit()

if __name__ == '__main__':
    # app.run(debug=True)
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
