import re

REGEX_email = '^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$'

# max. 63 characters; must not start or end with hyphen
REGEX_label = r'[a-zA-Z90-9]([a-zA-Z90-9-]{0,61}[a-zA-Z90-9])?'
REGEX_ipv4 = r'^\d{1,3}(\.\d{1,3}){3}$'
REGEX_ipv6 = r'^[a-fA-F0-9]{1,4}(::?[a-fA-F0-9]{1,4}){1,7}$'
REGEX_domain = '^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$'


class Validation(object):
    @staticmethod
    def check_email(email: str, domain: str = '') -> str:
        email = str(email)
        original_email = email
        if email == '':
            raise Exception("Admin email address must not be empty! ")

        regex_res = re.match(REGEX_email, email)
        if domain == '':
            if '@' in email:
                if regex_res:
                    return email.replace('@', '.')
                else:
                    raise Exception("\'{}\' is not a valid email address!".format(original_email))
            else:
                pattern = r'^{0}(\.{0})*\.?$'.format(REGEX_label)
                if re.match(pattern, email):
                    return email
                else:
                    raise Exception("\'{}\' is not a valid email address!".format(original_email))

        email = email.split('@')
        if len(email) > 1:
            if regex_res:
                if email[1] == domain:
                    return email[0]
                else:
                    return '.'.join(email)
            else:
                raise Exception("\'{}\' is not a valid email address!".format(original_email))
        return str(''.join(email)).replace('@', '.')

    @staticmethod
    def check_host_name(name: str, input_type: str) -> str:
        name = str(name)
        pattern = r'^{0}(\.{0})*\.?$'.format(REGEX_label)
        if re.match(pattern, name):
            return name

        raise Exception("\'{0}\' is not a valid {1}!".format(name, input_type))

    @staticmethod
    def check_domain_name(name: str) -> str:
        name = str(name)
        if re.match(REGEX_domain, name):
            return name

        raise Exception("\'{0}\' is not a valid DOMAIN NAME!".format(name))

    @staticmethod
    def check_ipv4(address: str) -> str:
        address = str(address)
        if re.match(REGEX_ipv4, address):
            return address

        raise Exception("\'{}\' is not a valid IPv4 address!".format(address))

    @staticmethod
    def check_ipv6(address: str) -> str:
        address = str(address)
        if re.match(REGEX_ipv6, address):
            return address

        raise Exception("\'{}\' is not a valid IPv6 address!".format(address))

    @staticmethod
    def check_ttl(ttl: str, max_val: int) -> int:
        if not ttl:
            return 0

        try:
            ttl = int(ttl)
        except:
            raise Exception("\'{}\' must be an integer value!".format(ttl))

        if ttl in range(max_val + 1):
            return ttl

        raise Exception("TTL must be in [0, {0}] range!".format(max_val))


if __name__ == '__main__':
    # try:
    #     res1 = Validation.check_email('maimsail.com')
    #     print(res1)
    # except Exception as e:
    #     print(str(e))

    try:
        res2 = Validation.check_domain_name('asds', 'DOMAIN')
        print(res2)
    except Exception as e:
        print(str(e))

    # try:
    #     res3 = Validation.check_ttl('-8')
    #     print(res3)
    # except Exception as e:
    #     print(str(e))
