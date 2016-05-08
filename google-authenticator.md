
## Google Authenticator demo

The following demo endpoint generates a random token for the Google Authenticator app.

https://demo.redishub.com/gentoken-google-authenticator/evanx@myserver.com/My%20service

<img src="https://evanx.github.io/images/rquery/gentoken.png">

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
         output += symbols[Math.floor(bytes[i] / 255 * (symbols.length - 1))];
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
