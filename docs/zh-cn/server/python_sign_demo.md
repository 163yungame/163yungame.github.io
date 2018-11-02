# python 签名示例
```python
from Crypto.PublicKey import RSA
from Crypto.Signature import PKCS1_v1_5
from Crypto.Hash import SHA
from binascii import hexlify
from urllib import quote_plus

"""
Original parameter string
"""
strToSign = '03146776612-14579579182016-03-14 20:18:38yb60becc49c9-8ce6-4b5d-b214-6614fbfd03f21'

"""
CAUTION: The str before sign needs to be urlencoded first.
         using urllib.quote_plus instead of urllib.quote
"""
encodedStr = quote_plus(strToSign)

"""
Place the PRIVATE key(openssl generated pem format key pair) in the right place.
"""
priv_key = RSA.importKey(open('pkcs8_rsa_private_key.pem', 'r').read())

"""
SHA1 hash the str first then sign it using the private key.
"""
signedStr = PKCS1_v1_5.new(priv_key).sign(SHA.new(encodedStr))

"""
Finally, convert the bytes to hex.
"""
hexStr = hexlify(signedStr)

"""
You can load this python file and manage to produce the correct hexStr using these functions as a base. You can test againest with each function seperatedly to find out what goes wrong. Good luck!

"""

```
