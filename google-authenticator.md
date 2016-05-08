
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
token=cltdblm4aw
uri=evan@test.com?secret=CLTDBLM4AW&issuer=My test service
otpauth=otpauth://totp/evan%40test.com%3Fsecret%3DCLTDBLM4AW%26issuer%3DMy%20test%20service
googleChartUrl=http://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=otpauth://totp/evan%40test.com%3Fsecret%3DCLTDBLM4AW%26issuer%3DMy%20test%20service
```

We cut and paste the `chart.googleapis.com` link to render the QR code for the `otpauth` URL:

<img src="https://evanx.github.io/images/rquery/gentoken-qrcode-googlecharts.png">

<hr>

We scan the QR code into our Google Authenticator app, and voilà! We now have a TOTP two-factor authentication facility on our phone:

<img src="https://evanx.github.io/images/rquery/google-authenticator-app-CROPPED.png" width="375">

### Implementation

A random key is generated in base32 encoding:
```javascript
   generateToken() {
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

The URI encoding of Google Charts URL:
```javascript
const uri = `${account}?secret=${token.toUpperCase()}&issuer=${issuer}`;
const otpauth = 'otpauth://totp/' + encodeURIComponent(uri);
const googleChartUrl = 'http://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=' + otpauth;
```

In practice, you'll want to use an QR code rendering library, and will also need a TOTP library to verify the 6 digit token.

We notice on Google Authenticator, or the Chrome "Authenticator" extension or what have you, that the token changes every 30 seconds.

Some time ago, I presented the following Java code to generate a token for a secret (i.e. user) at a given time.
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
where the `timeIndex` is the number of 30 second intervals since the epoch.

For Node, I guess i'd install `npm install otplib` or `notp` or `speakeasy.`

In practise we compare the 6 digit code that the user enters, against a similarly generated token as above (from the same shared secret) for the current `timeIndex` according to the server's clock. To allow for clock drift, the interval before and after are also compared to the users' submission. So if the client's clock is wrong, or the server's clock is out of whack, that's a problem.

https://twitter.com/@evanxsummers
