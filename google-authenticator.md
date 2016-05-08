
## Google Authenticator demo

Say we want to use the Google Authenticator app for two-factor authentication of our own site.

The following endpoint demonstrates the generation of a TOTP secret for the Google Authenticator app.

https://demo.redishub.com/genkey-ga/evanx@myserver.com/My%20service

<img src="https://evanx.github.io/images/rquery/genkey-ga.png">

<hr>

Alternatively, if you don't have a JSON viewer extension installed in your browser, or are using `curl` then try the `clidemo` domain:

https://clidemo.redishub.com/genkey-ga/evanx@myserver.com/My%20service

```shell
curl 'https://clidemo.redishub.com/genkey-ga/evanx@myserver.com/My%20service'
```
```
tokenKey='RYFK3TJDMY'
uri='evanx@myserver.com?secret=RYFK3TJDMY&issuer=My service'
otpauth='otpauth://totp/evanx%40myserver.com%3Fsecret%3DRYFK3TJDMY%26issuer%3DMy%20service'
googleChartUrl='http://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=otpauth://totp/evanx%40myserver.com%3Fsecret%3DRYFK3TJDMY%26issuer%3DMy%20service'
```

Note that the `tokenKey` is the shared secret needed to generate those 6 digit TOTP tokens e.g. at login time.

We use the `chart.googleapis.com` link to render the QR code for the `otpauth` URL:

<img src="https://evanx.github.io/images/rquery/qrcode-googlecharts.png">

<hr>

In practice, you'll want to use a QR code rendering library to present this to the user e.g. upon registration.

We scan the QR code into our Google Authenticator app, and voilà! We now have a TOTP two-factor authentication facility on our phone:

<img src="https://evanx.github.io/images/rquery/google-authenticator-app.png" width="375">

<hr>

The server would have stored the shared secret, and can call on it later for authentication of a submitted time-based token (one-time password). I guess that essentially we are trusting its original randomness, amongst other things ;)

### Implementation

For illustration, a random key is generated in base32 encoding as follows:
```javascript
generateTokenKey() {
   const symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
   return lodash.reduce(crypto.randomBytes(10), (prev, curr) => {
      return prev + symbols[Math.floor(curr * symbols.length / 256)];
   }, '');
}
```

Note that TOTP keys are intended to be written down somewhere as a phsyical back up, and certainly that is a good idea. Base32 facilitates this by excluding `0` and `1` since they can be confused with `0` and `I` (or `l` when lowercase is used).

Cryptographically speaking, you should use a well regarded OTP library to generate the shared secret key on your server.

For the purposes of demonstration, we generate the URL to render the QR code via Google:
```javascript
const uri = `${account}?secret=${token}&issuer=${issuer}`;
const otpauth = 'otpauth://totp/' + encodeURIComponent(uri);
const googleChartUrl = 'http://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=' + otpauth;
```

You'll want to use a QR code rendering library to present this to the user e.g. upon registration.

You will also need a TOTP library to verify the 6 digit token that the user reads off their Google Authenticator when they login.

We notice on Google Authenticator, or the Chrome "Authenticator" extension or what have you, that the token changes every 30 seconds. That is according to the device's clock. At login time, the server must similarly generate the token for verification, using the shared secret. The tokens before and after are also checked, to provide some leeway.

Beyond that 90 second window, if some clocks are wrong, that's a problem.

Some time ago, I presented the following Java code to similarly generate the 6 digit time-based token on the server. It needs the shared secret associated with the user, and the time, in 30 second intervals since the Epoch.
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

https://twitter.com/@evanxsummers
