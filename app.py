from flask import Flask, render_template, request, make_response, session, jsonify, redirect, url_for
from validation import Validation
from bson.objectid import ObjectId
import os
import math
import ipaddress
import pymongo
import datetime
from functools import wraps


client = pymongo.MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=500)
db = client['licenta']
collection = db['zones']

app = Flask(__name__)
app.secret_key = os.urandom(24)


def check_connection(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            client.server_info()
            return func(*args, **kwargs)
        except:
            return redirect(url_for('internal_error'))

    return wrapper


@app.route('/')
def index():
    return render_template("index.html")


@app.route('/record', methods=['POST'])
def record():
    try:
        data = request.get_json()
        print("Before processing")
        print(data)
        status, data = process_form(data, 'insert')

        data['modify_time'] = datetime.datetime.utcnow()
        data['status'] = 'insert'
        if status:
            try:
                collection.insert_one(data)
            except:
                return make_response('', 500)
            print("Good processing")
            print(data)
            return make_response('', 200)
        else:
            print("Bad processing")
            print(data)
            return make_response(jsonify(data), 400)
    except:
        print("Exeption! Bad request")
        return make_response('', 412)


@app.route('/404')
def not_found():
    return render_template('errors/404_not_found.html')


@app.route('/400')
def bad_request():
    return render_template('errors/400_bad_request.html')


@app.route('/500')
def internal_error():
    return render_template('errors/500_internal_error.html')


@app.route('/update')
@check_connection
def update():
    domains = collection.find({'status': {'$ne': 'delete'}}, {'domain_details': 1})
    domain_names = [k['domain_details']['domain_name'] for k in domains]
    return render_template('update.html', domain_names=domain_names)


@app.route('/updateRecord', methods=['POST'])
def update_record():
    try:
        data = request.get_json()
        print("Data from client: ")
        print(data)

        status, data = process_form(data)
        if not status:
            print("Bad processing")
            print(data)
            return make_response(jsonify(data), 400)

        print("Good processing")
        print(data)

        sess = session.pop('working_domain', None)
        if not sess:
            print("'working_domain'  is not stored in session")
            return make_response('', 500)
        _id = sess['record_id']

        # find the old document in collection
        old_domain = collection.find_one({'_id': ObjectId(_id)})
        # check if the document does not exist anymore into collection
        if not old_domain.pop('_id', None):
            print("old document does not exist anymore into collection")
            return make_response('', 500)

        # check if the domain from user is the same from session
        if sess['domain_name'] != data['domain_details']['domain_name']:

            print("create new domain and delete the old one")
            # update status for the old document to 'delete'
            try:
                collection.update_one({'_id': ObjectId(_id)}, {'$set': {'status': 'delete'}})
            except:
                return make_response('', 500)
        else:
            print('The domains correspond, update the old document')
            try:
                collection.delete_one({'_id': ObjectId(_id)})
            except:
                return make_response('', 500)

        print("Insert updated or new record into collection")
        # insert updated or new record into collection
        data['modify_time'] = datetime.datetime.utcnow()
        data['status'] = 'insert'
        try:
            collection.insert_one(data)
        except:
            return make_response('', 500)
        return make_response('', 200)
    except:
        print("Exeption! Bad request")
        return make_response('', 400)


@app.route('/successUpdate')
def success_update():
    return render_template('success/success_update.html')


@app.route('/successInsert')
def success_insert():
    return render_template('success/success_insert.html')


@app.route('/successDelete')
def success_delete():
    return render_template('success/success_delete.html')


@app.route('/delete', methods=['POST'])
def delete():
    try:
        domain_name = request.get_json()
        sess = session.pop('working_domain', None)
        if not sess:
            print("'working_domain'  is not stored in session")
            return make_response('', 500)

        if domain_name['domain_name'] != sess['domain_name']:
            return make_response('', 400)

        _id = sess['record_id']
        try:
            collection.update_one({'_id': ObjectId(_id)},
                                  {'$set': {'status': 'delete', 'modify_time': datetime.datetime.utcnow()}})
        except:
            return make_response('', 500)
        return make_response('', 200)
    except:
        return make_response('', 400)


@app.route('/getDomain', methods=['POST'])
def get_domain():
    try:
        domain_name = request.get_json()
        try:
            domain_record = collection.find_one(
                {'domain_details.domain_name': domain_name['domain_name'], 'status': 'insert'})
        except:
            return make_response('', 500)

        # domain not found from SELECT user interface
        if not domain_record:
            return make_response('', 412)

        session['working_domain'] = {'domain_name': domain_name['domain_name'],
                                     'record_id': str(domain_record.pop('_id', None))}
        return make_response(jsonify(domain_record), 200)
    except:
        return make_response('', 412)


@app.errorhandler(404)
def page_not_found(e):
    return render_template('errors/404_not_found.html')


@app.errorhandler(405)
def page_not_found(e):
    return render_template('errors/405_not_allowed.html')


def make_reverse_zone_ipv4(network, subnet):
    num_secv = 4

    secv = math.floor(int(subnet) / 8)
    rr_subnet = network.reverse_pointer
    return '.'.join(rr_subnet.split('/')[1].split('.')[(num_secv - secv):])


def make_reverse_zone_ipv6(network):
    mask = str(network.netmask)
    net_address = str(network.network_address.exploded)

    lis = mask.split(':')
    if '' in lis:
        lis.pop()
        lis.pop()
        for i in range(8 - len(lis)):
            lis.append('0000')

    mask = ''.join(lis)
    net_address = ''.join(net_address.split(':'))
    print(net_address)
    print(mask)

    rev = 'apra.6pi'
    for i in range(len(mask)):
        if mask[i] == '0':
            break
        a = int(net_address[i], 16)
        print(net_address[i])
        m = int(mask[i], 16)
        c = a & m
        rev += '.{}'.format(hex(c)[2:])
    return rev[::-1]


def process_form(data, operation=''):
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

    SUBNET = ''
    # check domain name
    error['domain_details'] = {}
    zone_doc['domain_details'] = {}
    error['ns_records'] = []
    zone_doc['ns_records'] = []
    error['hosts_records'] = []
    zone_doc['hosts_records'] = []
    error['mails_records'] = []
    zone_doc['mails_records'] = []

    try:
        zone_doc['domain_details']['domain_name'] = Validation.check_domain_name(domain_details['domain_name'],
                                                                                 'Domain Name')
        try:
            count = collection.find(
                {'domain_details.domain_name': zone_doc['domain_details']['domain_name'], 'status': 'insert'}).count()
            if operation == 'insert' and count:
                error['domain_details']['domain_name'] = 'Domain "{}" already exists.'.format(
                    zone_doc['domain_details']['domain_name'])
        except Exception as e:
            print(e)
    except Exception as e:
        error['domain_details']['domain_name'] = str(e)

    try:
        zone_doc['domain_details']['admin_mail'] = Validation.check_email(domain_details['admin_mail'])
        zone_doc['domain_details']['original_admin_mail'] = domain_details['admin_mail']
    except Exception as e:
        error['domain_details']['admin_mail'] = str(e)

    try:
        zone_doc['domain_details']['domain_ttl'] = Validation.check_ttl(domain_details['domain_ttl'], 3024000)
    except Exception as e:
        error['domain_details']['domain_ttl'] = str(e)

    try:
        zone_doc['domain_details']['domain_ip_address'] = str(ipaddress.ip_address(domain_details['domain_ip_address']))
    except Exception as e:
        error['domain_details']['domain_ip_address'] = str(e)

    subnet = domain_details['domain_ip_address'] + '/' + domain_details['domain_subnet']

    try:
        SUBNET = ipaddress.ip_network(subnet)
        zone_doc['domain_details']['domain_subnet'] = str(SUBNET)
        if SUBNET.version == 4:
            zone_doc['domain_details']['record_type'] = 'A'
            zone_doc['domain_details']['domain_reverse_addr'] = make_reverse_zone_ipv4(SUBNET,
                                                                                       domain_details['domain_subnet'])
        else:
            zone_doc['domain_details']['record_type'] = 'AAAA'
            zone_doc['domain_details']['domain_reverse_addr'] = make_reverse_zone_ipv6(SUBNET)
    except Exception as e:
        error['domain_details']['domain_subnet'] = 'Domain address {}'.format(str(e))
        return False, error


    # check name server records
    temp_dict = {}
    temp_dict_error = {}

    # Must be at least one NS record for SOA resource record used in zone file
    if not len(ns_records):
        error['ns_records'].append({'ns': 'Must be at least one Name Server record!'})

    for _, record in enumerate(ns_records):
        if type(record['external']) != bool:
            temp_dict['external'] = 'Wrong Type External Record!'
            continue

        if record['external']:
            try:
                temp_dict['ns'] = Validation.check_domain_name(record['ns'], 'NAME SERVER')
            except Exception as e:
                temp_dict_error['ns'] = str(e)
        else:
            try:
                temp_dict['ns'] = Validation.check_host_name(record['ns'], 'NAME SERVER')
            except Exception as e:
                temp_dict_error['ns'] = str(e)

            try:
                ns_ip = ipaddress.ip_address(record['ns_ip'])
                if ns_ip.version != SUBNET.version:
                    temp_dict_error['ns_ip'] = "{0} address must be IPv{1} type".format(record['ns_ip'], SUBNET.version)
                else:
                    if ns_ip == SUBNET.network_address:
                        temp_dict_error['ns_ip'] = "{} address is the same as network address".format(str(ns_ip))
                    elif ns_ip == SUBNET.broadcast_address:
                        temp_dict_error['ns_ip'] = "{} address is the same as broadcast network address".format(str(ns_ip))
                    elif ns_ip in SUBNET:
                        temp_dict['ns_ip'] = str(ns_ip)
                        temp_dict['ns_ip_reverse'] = str(ns_ip.reverse_pointer)
                    else:
                        temp_dict_error['ns_ip'] = "'{0}' address is not in the '{1}' network".format(record['ns_ip'],
                                                                                                      str(SUBNET))
            except Exception as e:
                temp_dict_error['ns_ip'] = str(e)

        try:
            if record['ns_ttl'] == '':
                temp_dict['ns_ttl'] = None
            else:
                temp_dict['ns_ttl'] = Validation.check_ttl(record['ns_ttl'], 1209600)
        except Exception as e:
            temp_dict_error['ns_ttl'] = str(e)

        if len(temp_dict_error.keys()) > 0:
            error['ns_records'].append(temp_dict_error)
        temp_dict_error = {}
        zone_doc['ns_records'].append(temp_dict)
        temp_dict = {}

    # check host records
    temp_dict = {}
    temp_dict_error = {}

    for _, record in enumerate(hosts_records):
        try:
            temp_dict['host_name'] = Validation.check_host_name(record['host_name'], 'HOST NAME')
        except Exception as e:
            temp_dict_error['host_name'] = str(e)

        try:
            host_name_ip = ipaddress.ip_address(record['host_name_ip'])
            if host_name_ip.version != SUBNET.version:
                temp_dict_error['host_name_ip'] = "{0} address must be IPv{1} type".format(record['host_name_ip'],
                                                                                           SUBNET.version)
            else:
                if host_name_ip == SUBNET.network_address:
                    temp_dict_error['host_name_ip'] = "{} address is the same as network address".format(str(host_name_ip))
                elif host_name_ip == SUBNET.broadcast_address:
                    temp_dict_error['host_name_ip'] = "{} address is the same as broadcast network address".format(str(host_name_ip))
                elif host_name_ip in SUBNET:
                    temp_dict['host_name_ip'] = str(host_name_ip)
                    temp_dict['host_name_ip_reverse'] = str(host_name_ip.reverse_pointer)
                else:
                    temp_dict_error['host_name_ip'] = "'{0}' address is not in the '{1}' network".format(
                        record['host_name_ip'], str(SUBNET))
        except Exception as e:
            temp_dict_error['host_name_ip'] = str(e)

        try:
            if record['host_name_ttl'] == '':
                temp_dict['host_name_ttl'] = None
            else:
                temp_dict['host_name_ttl'] = Validation.check_ttl(record['host_name_ttl'], 86400)
        except Exception as e:
            temp_dict_error['host_name_ttl'] = str(e)

        try:
            if record['host_cname'] != '':
                temp_dict['host_cname'] = Validation.check_host_name(record['host_cname'], 'CNAME')
            else:
                temp_dict['host_cname'] = None
        except Exception as e:
            temp_dict_error['host_cname'] = str(e)

        try:
            if record['host_txt'] != '':
                for c in ('\n', '\r', '\t'):
                    if c in record['host_txt']:
                        raise Exception("'{}' invalid character in TXT record".format(c))
                if len(record['host_txt']) > 255:
                    raise Exception("TEXT record can not be longer than 255 characters!")
                temp_dict['host_txt'] = record['host_txt']
            else:
                temp_dict['host_txt'] = None
        except Exception as e:
            temp_dict_error['host_txt'] = str(e)

        if len(temp_dict_error.keys()) > 0:
            error['hosts_records'].append(temp_dict_error)
        temp_dict_error = {}
        zone_doc['hosts_records'].append(temp_dict)
        temp_dict = {}

    # check mail records
    temp_dict = {}
    temp_dict_error = {}

    for _, record in enumerate(mails_records):
        try:
            if type(record['external']) != bool:
                temp_dict['external'] = 'Wrong Type External Record!'
                continue

            if not record['external']:
                try:
                    temp_dict['mail_host'] = Validation.check_host_name(record['mail_host'], 'MAIL HOST NAME')
                except Exception as e:
                    temp_dict_error['mail_host'] = str(e)

                try:
                    mail_ip_host = ipaddress.ip_address(record['mail_ip_host'])
                    if mail_ip_host.version != SUBNET.version:
                        temp_dict_error['mail_ip_host'] = "{0} address must be IPv{1} type".format(
                            record['mail_ip_host'], SUBNET.version)
                    else:
                        if mail_ip_host == SUBNET.network_address:
                            temp_dict_error['mail_ip_host'] = "{} address is the same as network address".format(
                                str(mail_ip_host))
                        elif mail_ip_host == SUBNET.broadcast_address:
                            temp_dict_error[
                                'mail_ip_host'] = "{} address is the same as broadcast network address".format(
                                str(mail_ip_host))
                        if mail_ip_host in SUBNET:
                            temp_dict['mail_ip_host'] = str(mail_ip_host)
                            temp_dict['mail_ip_host_reverse'] = str(mail_ip_host.reverse_pointer)
                        else:
                            temp_dict_error['mail_ip_host'] = "'{0}' address is not in the '{1}' network".format(
                                record['mail_ip_host'], str(SUBNET))
                except Exception as e:
                    temp_dict_error['mail_ip_host'] = str(e)

                try:
                    if record['mail_txt'] != '':
                        for c in ('\n', '\r', '\t'):
                            if c in record['mail_txt']:
                                raise Exception("'{}' invalid character in TXT record".format(c))
                        if len(record['mail_txt']) > 255:
                            raise Exception("TEXT record can not be longer than 255 characters!")
                        temp_dict['mail_txt'] = record['mail_txt']
                    else:
                        temp_dict['mail_txt'] = None
                except Exception as e:
                    temp_dict_error['mail_txt'] = str(e)
            else:
                try:
                    temp_dict['mail_host'] = Validation.check_domain_name(record['mail_host'], 'External Mail Server')
                except Exception as e:
                    temp_dict_error['mail_host'] = str(e)
        except:
            continue

        try:
            if record['mail_cname'] != '':
                temp_dict['mail_cname'] = Validation.check_host_name(record['mail_cname'], 'CNAME')
            else:
                temp_dict['mail_cname'] = None
        except Exception as e:
            temp_dict_error['mail_cname'] = str(e)

        try:
            if record['mail_ttl'] == '':
                temp_dict['mail_ttl'] = None
            else:
                temp_dict['mail_ttl'] = Validation.check_ttl(record['mail_ttl'], 3024000)
        except Exception as e:
            temp_dict_error['mail_ttl'] = str(e)

        try:
            temp_dict['mail_preference'] = Validation.check_ttl(record['mail_preference'], 65535)
        except Exception as e:
            temp_dict_error['mail_preference'] = str(e).replace('TTL', 'Preference')

        if len(temp_dict_error.keys()) > 0:
            error['mails_records'].append(temp_dict_error)
        temp_dict_error = {}
        zone_doc['mails_records'].append(temp_dict)
        temp_dict = {}

    if len(error['domain_details'].keys()) + len(error['ns_records']) + len(error['hosts_records']) + len(
            error['mails_records']) > 0:
        return False, error
    else:
        return True, zone_doc


if __name__ == "__main__":
    app.run(debug=True)
