from flask import Flask, render_template, request, redirect, url_for
import re
import json
import sys
import pymongo
import datetime


client = pymongo.MongoClient('mongodb://localhost:27017/')
db = client['licenta']
collection = db['zones']

app = Flask(__name__)

REGEX_ipv4 = r'^\d{1,3}(\.\d{1,3}){3}$'
REGEX_ipv6 = r'^[a-fA-F0-9]{1,4}(::?[a-fA-F0-9]{1,4}){1,7}$'


@app.route('/')
def index():
    return render_template("index.html")


@app.route('/record', methods=['POST', 'GET'])
def record():
    message = process_form(request.form)
    if not message:
        message = "Invalid record type!"
    return render_template("inserted.html", message=message)


@app.route('/test')
def test():
    return render_template("test.html")


@app.route('/dream', methods=['POST', 'GET'])
def submited():
    if request.method == 'POST':
        # name = request.form.to_dict()['name']
        # print(request.form.to_dict())
        #data = json.loads(request.data)
        print(request.get_json())
        return render_template("dream.html", message='some message!!!!!')
    else:
        return redirect(url_for('test'))
    #return data


def process_form(form):

    obj = ''

    for key, value in form.to_dict().items():
        obj += '{0}:  {1}<br>'.format(key, value)

    return obj

    if form['ip_addr_type'] == 'A':
        if re.match(REGEX_ipv4, request.form['ip_address']):
            ip_address = form['ip_address']

        else:
            return "Invalid ipv4 address"
    elif form['ip_addr_type'] == 'AAAA':
        if re.match(REGEX_ipv6, request.form['ip_address']):
            ip_address = form['ip_address']
        else:
            return "Invalid ipv6 address"

    zone_doc = {
                'domain': form['domain'],
                'admin_mail': form['admin_mail'],
                'class_type': form['class_type'],
                'ip_addr_type': form['ip_addr_type'],
                'ip_address': ip_address,
                'ip_host': form['ip_host'],
                'mail_host': form['mail_host'],
                'mail_ip_host': form['mail_ip_host'],
                'mail_priority': form['mail_priority'],
                'last_modify': datetime.datetime.utcnow()
                }
    if form['ttl'] != '':
        zone_doc['ttl'] = form['ttl']

    collection.insert_one(zone_doc)
    return zone_doc


if __name__ == '__main__':
    app.run(debug=True)
