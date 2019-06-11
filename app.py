from flask import Flask, render_template, request, redirect, url_for, make_response, session
from flask import jsonify
from validation import Validation
from bson.objectid import ObjectId
import os
import re
import json
import sys
import pymongo
import datetime

client = pymongo.MongoClient('mongodb://localhost:27017/')
db = client['licenta']
collection = db['zones']

app = Flask(__name__)
app.secret_key = os.urandom(24)

@app.route('/test', methods=['POST', 'GET'])
def test():
    if request.method == 'POST':
        data = request.get_json();
        print(request.get_json())
        print("POST")
        if data['data'] == 'true':
            return make_response(jsonify({'data': "good data"}), 200)
        else:
            #return render_template('test.html', message="HAHAHA")
            return make_response(render_template('test.html', message="HAHAHA"), 400)
    else:
        print("GET")
        print(request.get_json())
        return render_template('test.html')


@app.route('/echo')
def echo():
    return render_template('echo.html')
#
# _id = session.get('working_domain')['record_id']
# dom = collection.find_one({'_id': ObjectId(_id)})


@app.route('/')
def index():
    return render_template("index.html")


@app.route('/record', methods=['POST'])
def record():
    if request.method == 'POST':
        try:
            data = request.get_json()
            print(data)
            status, data = process_form(data)
            if status:
                collection.insert_one(data)
                print("Good processing")
                print(data)
                return make_response(render_template('success.html'), 200)
            else:
                print("Bad processing")
                print(data)
                return make_response(jsonify(data), 400)
        except:
            print("Exeption! Bad request")
            return make_response("", 412)


@app.route('/404')
def not_found():
    return render_template('404_not_found.html')


@app.route('/400')
def bad_request():
    return render_template('400_bad_request.html.html')


@app.route('/update')
def update():
    domains = collection.find({}, {'domain_details': 1})

    domain_names = [k['domain_details']['domain_name'] for k in domains]
    return render_template('update.html', domain_names=domain_names)


@app.route('/updateRecord')
def update_record():
    if request.method == 'POST':
        try:
            data = request.get_json()
            print("Data from client: ")
            print(data)
            status, data = process_form(data)
            if status:
                data['modify_time'] = datetime.datetime.utcnow()
                data['status'] = 'update'
            else:
                return redirect(url_for('/update', errors=data))
        except:
            print("Exeption! Bad request")
            return render_template('400_bad_request.html')
    else:
        print("Else Not POST")
        return render_template('400_bad_request.html')


@app.route('/success')
def success():
    return render_template('success.html')


@app.route('/getDomain', methods=['POST', 'GET'])
def get_domain():
    if request.method == 'POST':
        try:
            domain_name = request.get_json()
            domain_record = collection.find_one({'domain_details.domain_name': domain_name['domain_name']})
            session['working_domain'] = {'domain_name': domain_name['domain_name'],
                                         'record_id': str(domain_record.pop('_id', None))}
            return make_response(jsonify(domain_record), 200)
        except Exception as e:
            return make_response(jsonify({'data': 'some shit!'}), 400)
    elif request.method == 'GET':
        print("GET getDomain method!")
    else:
        return render_template('400_bad_request.html')


def process_form(data):
    zone_doc = {}
    error = {}

    if 'domain_details' not in data:
        raise Exception('Domain details not in data package!')
    if 'ns_records' not in data:
        raise Exception('Name server records not in data package!')
    if 'hosts_records' not in data:
        raise Exception('Host records not in data package!')
    if 'mails_records' not in data:
        raise Exception('Mail records not in data package!')

    domain_details = data['domain_details']
    ns_records = data['ns_records']
    hosts_records = data['hosts_records']
    mails_records = data['mails_records']

    # check domain name
    error['domain_details'] = {}
    zone_doc['domain_details'] = {}

    try:
        zone_doc['domain_details']['domain_name'] = Validation.check_domain_name(domain_details['domain_name'])
    except Exception as e:
        error['domain_details']['domain_name'] = str(e)

    # check admin email
    try:
        zone_doc['domain_details']['admin_mail'] = Validation.check_email(domain_details['admin_mail'],
                                                                          domain_details['domain_name'])
        zone_doc['domain_details']['original_admin_mail'] = domain_details['admin_mail']
    except Exception as e:
        error['domain_details']['admin_mail'] = str(e)

    try:
        zone_doc['domain_details']['domain_ttl'] = Validation.check_ttl(domain_details['domain_ttl'], 3024000)
    except Exception as e:
        error['domain_details']['domain_ttl'] = str(e)

    # check name server records
    error['ns_records'] = []
    zone_doc['ns_records'] = []
    temp_dict = {}
    temp_dict_error = {}

    for _, record in enumerate(ns_records):
        try:
            temp_dict['ns'] = Validation.check_host_name(record['ns'], 'NAME SERVER')
        except Exception as e:
            temp_dict_error['ns'] = str(e)

        try:
            if record['ns_ip_addr_type'] == 'A':
                try:
                    temp_dict['ns_ip_addr_type'] = 'A'
                    temp_dict['ns_ip'] = Validation.check_ipv4(record['ns_ip'])
                except Exception as e:
                    temp_dict_error['ns_ip'] = str(e)
            elif record['ns_ip_addr_type'] == 'AAAA':
                try:
                    temp_dict['ns_ip_addr_type'] = 'AAAA'
                    temp_dict['ns_ip'] = Validation.check_ipv6(record['ns_ip'])
                except Exception as e:
                    temp_dict_error['ns_ip'] = str(e)
            else:
                temp_dict_error['ns_ip_addr_type'] = 'Wrong type of Ip address!'
        except:
            continue

        try:
            temp_dict['ns_ttl'] = Validation.check_ttl(record['ns_ttl'], 1209600)
        except Exception as e:
            temp_dict_error['ns_ttl'] = str(e)

        if len(temp_dict_error.keys()) > 0:
            error['ns_records'].append(temp_dict_error)
        temp_dict_error = {}
        zone_doc['ns_records'].append(temp_dict)
        temp_dict = {}

    # check host records
    error['hosts_records'] = []
    zone_doc['hosts_records'] = []
    temp_dict = {}
    temp_dict_error = {}

    for _, record in enumerate(hosts_records):
        try:
            temp_dict['host_name'] = Validation.check_host_name(record['host_name'], 'HOST NAME')
        except Exception as e:
            temp_dict_error['host_name'] = str(e)
        try:
            if record['host_name_ip_addr_type'] == 'A':
                try:
                    temp_dict['host_name_ip_addr_type'] = 'A'
                    temp_dict['host_name_ip'] = Validation.check_ipv4(record['host_name_ip'])
                except Exception as e:
                    temp_dict_error['host_name_ip'] = str(e)
            elif record['host_name_ip_addr_type'] == 'AAAA':
                try:
                    temp_dict['host_name_ip_addr_type'] = 'AAAA'
                    temp_dict['host_name_ip'] = Validation.check_ipv6(record['host_name_ip'])
                except Exception as e:
                    temp_dict_error['host_name_ip'] = str(e)
            else:
                temp_dict_error['host_name_ip_addr_type'] = 'Wrong type of Ip address!'
        except:
            continue

        try:
            temp_dict['host_name_ttl'] = Validation.check_ttl(record['host_name_ttl'], 86400)
        except Exception as e:
            temp_dict_error['host_name_ttl'] = str(e)

        try:
            temp_dict['host_cname'] = Validation.check_host_name(record['host_cname'], 'CNAME')
        except Exception as e:
            temp_dict_error['host_cname'] = str(e)

        if len(temp_dict_error.keys()) > 0:
            error['hosts_records'].append(temp_dict_error)
        temp_dict_error = {}
        zone_doc['hosts_records'].append(temp_dict)
        temp_dict = {}

    # check mail records
    error['mails_records'] = []
    zone_doc['mails_records'] = []
    temp_dict = {}
    temp_dict_error = {}

    for _, record in enumerate(mails_records):
        try:
            if type(record['external']) != bool:
                temp_dict['external'] = 'Wrong Type External Record!'
                continue

            if not record['external']:
                if record['mail_addr_type'] == 'A':
                    try:
                        temp_dict['mail_addr_type'] = 'A'
                        temp_dict['mail_ip_host'] = Validation.check_ipv4(record['mail_ip_host'])
                    except Exception as e:
                        temp_dict_error['mail_ip_host'] = str(e)
                elif record['mail_addr_type'] == 'AAAA':
                    try:
                        temp_dict['mail_addr_type'] = 'AAAA'
                        temp_dict['mail_ip_host'] = Validation.check_ipv6(record['mail_ip_host'])
                    except Exception as e:
                        temp_dict_error['mail_ip_host'] = str(e)
                else:
                    temp_dict_error['mail_addr_type'] = 'Wrong type of Ip address!'
        except:
            continue

        try:
            temp_dict['mail_host'] = Validation.check_host_name(record['mail_host'], 'MAIL HOST NAME')
        except Exception as e:
            temp_dict_error['mail_host'] = str(e)

        try:
            temp_dict['mail_ttl'] = Validation.check_ttl(record['mail_ttl'], 3024000)
        except Exception as e:
            temp_dict_error['mail_ttl'] = str(e)

        try:
            temp_dict['mail_cname'] = Validation.check_host_name(record['mail_cname'], 'CNAME')
        except Exception as e:
            temp_dict_error['mail_cname'] = str(e)

        try:
            temp_dict['mail_preference'] = Validation.check_ttl(record['mail_preference'], 65535)
        except Exception as e:
            temp_dict_error['mail_preference'] = str(e).replace('TTL', 'Preference')

        if len(temp_dict_error.keys()) > 0:
            error['mails_records'].append(temp_dict_error)
        temp_dict_error = {}
        zone_doc['mails_records'].append(temp_dict)
        temp_dict = {}

    if len(error['domain_details'].keys()) + len(error['ns_records']) + len(error['hosts_records']) + len(error['mails_records']) > 0:
        return False, error
    else:
        return True, zone_doc


if __name__ == '__main__':
    app.run(debug=True)
