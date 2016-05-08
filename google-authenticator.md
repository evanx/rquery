
## Google Authenticator demo

Say we want to use the Google Authenticator app for two-factor authentication of our own site.

The following endpoint demonstrates the generation of a TOTP secret for the Google Authenticator app.

https://demo.redishub.com/genkey-topt-google-authenticator/evanx@myserver.com/My%20service

<img src="https://evanx.github.io/images/rquery/genkey-totp-ga.png">

<hr>

Alternatively, if you don't have a JSON viewer extension installed in your browser, or are using `curl` then try the `clidemo` domain:

https://clidemo.redishub.com/genkey-topt-google-authenticator/evanx@myserver.com/My%20service

```shell
evans@eowyn:~/rquery$ curl 'https://clidemo.redishub.com/genkey-topt-google-authenticator/evan@test.com/My%20test%20service'
tokenKey='iim2upaawn'
uri='evan@test.com?secret=IIM2UPAAWN&issuer=My test service'
otpauth='otpauth://totp/evan%40test.com%3Fsecret%3DIIM2UPAAWN%26issuer%3DMy%20test%20service'
googleChartUrl='http://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=otpauth://totp/evan%40test.com%3Fsecret%3DIIM2UPAAWN%26issuer%3DMy%20test%20service'
```

The `tokenKey` is the shared secret needed to generate those 6 digit TOTP tokens e.g. at login time. The secret key is

We cut and paste the `chart.googleapis.com` link to render the QR code for the `otpauth` URL:

<img src="https://evanx.github.io/images/rquery/gentoken-qrcode-googlecharts.png">

<hr>

We scan the QR code into our Google Authenticator app, and voilà! We now have a TOTP two-factor authentication facility on our phone:

<img src="https://evanx.github.io/images/rquery/google-authenticator-app-CROPPED.png" width="375">

### Implementation

For illustration, a random key is generated in base32 encoding as follows:
```javascript
   generateTokenKey() {
      const bytes = crypto.randomBytes(10);
      const symbols = 'abcdefghijklmnopqrstuvwxyz234567';
      var output = '';
      for (var i = 0; i < bytes.length; i++) {
         output += symbols[Math.round(bytes[i] / 255 * (symbols.length - 1))];
      }
      return output;
   }
```
where `0` and `1` are excluded by the relevant standard since they can be confused with `I` and `O.`

In practice, you should use a well regarded OTP library to generate the shared secret key.

The URI encoding of Google Charts URL:
```javascript
const uri = `${account}?secret=${token.toUpperCase()}&issuer=${issuer}`;
const otpauth = 'otpauth://totp/' + encodeURIComponent(uri);
const googleChartUrl = 'http://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=' + otpauth;
```

In practice, you'll want to use a QR code rendering library.

You will also need a TOTP library to verify the 6 digit token that the user reads off their Google Authenticator when they login.

We notice on Google Authenticator, or the Chrome "Authenticator" extension or what have you, that the token changes every 30 seconds. That is according to the device's clock. At login time, the server must similarly generate the token for verification, using the shared secret. In practice, to allow for clock drift, the tokens before and after are also checked. If the client's clock is wrong, or the server's clock is out of whack, that's a problem.

Some time ago, I presented the following Java code to similarly generate the token at login time. It needs the shared secret associated with the user, and the time, in 30 second intervals since the Epoch.
```java
private static long getCode(byte[] secret, long timeIndex)
        throws NoSuchAlgorithmException, InvalidKeyException {
  SecretKeySpec signKey = new SecretKeySpec(secret, "HmacSHA1");
  ByteBuffer buffer = ByteBuffer.allocate(8);
  buffer.putLong(timeIndex);
  byte[] timeBytes = buffer.array();
  Mac mac = Mac.getInstance("HmacSHA1");
  mac.init(signKey);
  byte[] hash = mac.doFinal(timeBytes);
  int offset = hash[19] & 0xf;
  long truncatedHash = hash[offset] & 0x7f;
  for (int i = 1; i < 4; i++) {
      truncatedHash <<= 8;
      truncatedHash |= hash[offset + i] & 0xff;
  }
  return (truncatedHash %= 1000000);
}
```

For Node, I guess i'd install `npm install otplib` or `notp` or `speakeasy.`

Keep safe :)

https://twitter.com/@evanxsummers
