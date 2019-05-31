import re

REGEX_email = '^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$'


class Validation(object):
    def validate_email(self, email: str, domain: str = '') -> str:
        if email == '':
            return None

        regex_res = re.match(REGEX_email, email)
        if domain == '':
            if '@' in email:
                if regex_res:
                    return email
                else:
                    return None
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
                return None
        return str(''.join(email))

if __name__ == '__main__':
    validation = Validation()
    res = validation.validate_email('', 'gmail.com')
    print(res)
