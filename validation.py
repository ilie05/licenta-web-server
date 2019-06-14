import re

REGEX_email = '^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$'
REGEX_label = r'[a-zA-Z90-9]([a-zA-Z90-9-]{0,61}[a-zA-Z90-9])?'
REGEX_domain = '^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$'


class Validation(object):
    @staticmethod
    def check_email(email: str) -> str:
        email = str(email)
        if re.match(REGEX_email, email):
            return email.replace('@', '.')

        raise Exception("\'{}\' is not a valid email address!".format(email))

    @staticmethod
    def check_host_name(name: str, input_type: str) -> str:
        name = str(name)
        pattern = r'^{0}(\.{0})*\.?$'.format(REGEX_label)
        if re.match(pattern, name):
            return name

        raise Exception("\'{0}\' is not a valid {1}!".format(name, input_type))

    @staticmethod
    def check_domain_name(name: str, input_type: str) -> str:
        name = str(name)
        if re.match(REGEX_domain, name):
            return name

        raise Exception("\'{0}\' is not a valid {1}!".format(name, input_type))

    @staticmethod
    def check_ttl(ttl: str, max_val: int) -> int:
        try:
            ttl = int(ttl)
        except:
            raise Exception("\'{}\' must be an integer value!".format(ttl))

        if ttl in range(max_val + 1):
            return ttl

        raise Exception("TTL must be in [0, {0}] range!".format(max_val))


if __name__ == '__main__':
    # try:
    #     res1 = Validation.check_email('boil.com', 'email@boil.com')
    #     print(res1)
    # except Exception as e:
    #     print(str(e))

    # try:
    #     res2 = Validation.check_domain_name('asds', 'DOMAIN')
    #     print(res2)
    # except Exception as e:
    #     print(str(e))

    # try:
    #     res3 = Validation.check_ttl('-8')
    #     print(res3)
    # except Exception as e:
    #     print(str(e))

    try:
        res4 = Validation.check_ipv6('2031:0000:130F:0000:0000:09C0::')
        print(res4)

    except Exception as e:
        print(str(e))
