
## Google Authenticator demo

Say we want to use the Google Authenticator app for two-factor authentication of our own site.

The following demo endpoint generates a random token for the Google Authenticator app.

https://demo.redishub.com/gentoken-google-authenticator/evanx@myserver.com/My%20service

<img src="https://evanx.github.io/images/rquery/gentoken.png">

Alternatively, if you don't have a JSON viewer extension installed in your browser, or are using `curl` then try:

https://clidemo.redishub.com/gentoken-google-authenticator/evan@test.com/My%20test%20service

```shell
evans@eowyn:~/rquery$ curl https://clidemo.redishub.com/gentoken-google-authenticator/evan@test.com/My%20test%20service
token=cltdblm4aw
uri=evan@test.com?secret=CLTDBLM4AW&issuer=My test service
otpauth=otpauth://totp/evan%40test.com%3Fsecret%3DCLTDBLM4AW%26issuer%3DMy%20test%20service
googleChartUrl=http://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=otpauth://totp/evan%40test.com%3Fsecret%3DCLTDBLM4AW%26issuer%3DMy%20test%20service
```
We scan the equivalent QR code via Google Charts into our Google Authenticator app:

<img src="https://evanx.github.io/images/rquery/gentoken-qrcode-googlecharts.png">

And voilà, we have a TOTP two-factor authentication facility via our phone:

<img src="https://evanx.github.io/images/rquery/google-authenticator-app.png" width="375">

### Implementation

The random token is generated as follows:
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

The URI encoding of Google Charts URL:
```javascript
const uri = `${account}?secret=${token.toUpperCase()}&issuer=${issuer}`;
const otpauth = 'otpauth://totp/' + encodeURIComponent(uri);
const googleChartUrl = 'http://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=' + otpauth;
```
