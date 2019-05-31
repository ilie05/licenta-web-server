import re

REGEX_email = '^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$'

# max. 63 characters; must not start or end with hyphen
REGEX_label = r'[a-zA-Z90-9]([a-zA-Z90-9-]{0,61}[a-zA-Z90-9])?'


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
                    return email
                else:
                    raise Exception("\'{}\' is not a valid email address".format(original_email))
            else:
                return email

        email = email.split('@')
        if len(email) > 1:
            if regex_res:
                if email[1] == domain:
                    return email[0]
                else:
                    return '.'.join(email)
            else:
                raise Exception("\'{}\' is not a valid email address".format(original_email))
        return str(''.join(email))

    @staticmethod
    def check_domain_name(name: str) -> str:
        name = str(name)
        pattern = r'^{0}(\.{0})*\.?$'.format(REGEX_label)
        if re.match(pattern, name):
            return name

        raise Exception("\'{}\' is not a valid domain name".format(name))


if __name__ == '__main__':
    try:
        res1 = Validation.check_email('mai@l')
        print(res1)
    except Exception as e:
        print(str(e))

    try:
        res2 = Validation.check_domain_name('a@sds.ds')
        print(res2)
    except Exception as e:
        print(str(e))

