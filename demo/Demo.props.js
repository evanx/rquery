
const Seconds = {
  toMillis: seconds => seconds*1000
};

module.exports = { // web server config
  port: 8765,
  location: '/',
  timeout: Seconds.toMillis(8)
};
