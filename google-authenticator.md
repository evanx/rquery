
## Google Authenticator demo

Say we want to use the Google Authenticator app for two-factor authentication of our own site.

The following demo endpoint generates a random token for the Google Authenticator app.

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
We scan the equivalent QR code via Google Charts into our Google Authenticator app:

<img src="https://evanx.github.io/images/rquery/gentoken-qrcode-googlecharts.png">

<hr>

And voilà, we have a TOTP two-factor authentication facility via our phone:

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

https://twitter.com/@evanxsummers
