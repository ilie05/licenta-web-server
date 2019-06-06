from flask import Flask, render_template, request, redirect, url_for
from validation import Validation
import re
import json
import sys
import pymongo
import datetime


client = pymongo.MongoClient('mongodb://localhost:27017/')
db = client['licenta']
collection = db['zones']

app = Flask(__name__)


@app.route('/')
def index():
    return render_template("index.html")


@app.route('/record', methods=['POST', 'GET'])
def record():
    if request.method == 'POST':
        process_form(request.get_json())
        return render_template("inserted.html", message='some message!!!!!')
    else:
        return render_template('404_not_found.html')


def process_form(data):
    zone_doc = {}
    error = {}

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
        zone_doc['domain_details']['admin_mail'] = Validation.check_email(domain_details['admin_mail'])
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

    for i, record in enumerate(ns_records):
        try:
            temp_dict['ns'] = Validation.check_domain_name(record['ns'])
        except Exception as e:
            error['ns_records'][i]['ns'] = str(e)

        if record['ns_ip_addr_type'] == 'A':
            try:
                temp_dict['ns_ip_addr_type'] = 'A'
                temp_dict['ns_ip'] = Validation.check_ipv4(record['ns_ip'])
            except Exception as e:
                error['ns_records'][i]['ns_ip'] = str(e)
        elif record['ns_ip_addr_type'] == 'AAAA':
            try:
                temp_dict['ns_ip_addr_type'] = 'AAAA'
                temp_dict['ns_ip'] = Validation.check_ipv6(record['ns_ip'])
            except Exception as e:
                error['ns_records'][i]['ns_ip'] = str(e)
        else:
            error['ns_records'][i]['ns_ip_addr_type'] = 'Wrong type of Ip address!'

        try:
            temp_dict['ns_ttl'] = Validation.check_ttl(record['ns_ttl'], 1209600)
        except Exception as e:
            error['ns_records'][i]['ns_ttl'] = str(e)

        zone_doc['ns_records'].append(temp_dict)
        temp_dict = {}

    # check host records
    error['hosts_records'] = []
    zone_doc['hosts_records'] = []
    temp_dict = {}

    for i, record in enumerate(hosts_records):
        try:
            temp_dict['host_name'] = Validation.check_domain_name(record['host_name'])
        except Exception as e:
            error['hosts_records'][i]['host_name'] = str(e)

        if record['host_name_ip_addr_type'] == 'A':
            try:
                temp_dict['host_name_ip_addr_type'] = 'A'
                temp_dict['host_name_ip'] = Validation.check_ipv4(record['host_name_ip'])
            except Exception as e:
                error['hosts_records'][i]['host_name_ip'] = str(e)
        elif record['host_name_ip_addr_type'] == 'AAAA':
            try:
                temp_dict['host_name_ip_addr_type'] = 'AAAA'
                temp_dict['host_name_ip'] = Validation.check_ipv6(record['host_name_ip'])
            except Exception as e:
                error['hosts_records'][i]['host_name_ip'] = str(e)
        else:
            error['hosts_records'][i]['host_name_ip_addr_type'] = 'Wrong type of Ip address!'

        try:
            temp_dict['host_name_ttl'] = Validation.check_ttl(record['host_name_ttl'], 86400)
        except Exception as e:
            error['hosts_records'][i]['host_name_ttl'] = str(e)

        zone_doc['hosts_records'].append(temp_dict)
        temp_dict = {}

    # check mail records
    error['mails_records'] = []
    zone_doc['mails_records'] = []
    temp_dict = {}

    for i, record in enumerate(hosts_records):
        if type(record['external']) != bool:
            temp_dict['external'] = 'Wrong Type External Record!'
            continue

        if not record['external']:
            if record['mail_addr_type'] == 'A':
                try:
                    temp_dict['mail_addr_type'] = 'A'
                    temp_dict['mail_ip_host'] = Validation.check_ipv4(record['mail_ip_host'])
                except Exception as e:
                    error['mails_records'][i]['mail_ip_host'] = str(e)
            elif record['mail_addr_type'] == 'AAAA':
                try:
                    temp_dict['mail_addr_type'] = 'AAAA'
                    temp_dict['mail_ip_host'] = Validation.check_ipv6(record['mail_ip_host'])
                except Exception as e:
                    error['mails_records'][i]['mail_ip_host'] = str(e)
            else:
                error['mails_records'][i]['mail_addr_type'] = 'Wrong type of Ip address!'

        try:
            temp_dict['mail_host'] = Validation.check_domain_name(record['mail_host'])
        except Exception as e:
            error['mails_records'][i]['mail_host'] = str(e)

        try:
            temp_dict['mail_ttl'] = Validation.check_ttl(record['mail_ttl'], 3024000)
        except Exception as e:
            error['mails_records'][i]['mail_ttl'] = str(e)

        try:
            temp_dict['mail_preference'] = Validation.check_ttl(record['mail_preference'], 65535)
        except Exception as e:
            error['mails_records'][i]['mail_preference'] = str(e).replace('TTL', 'Preference')

        zone_doc['mails_records'].append(temp_dict)
        temp_dict = {}


    collection.insert_one(zone_doc)
    return zone_doc


if __name__ == '__main__':
    app.run(debug=True)
