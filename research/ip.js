const consul = require('consul')(),
ip = require('ip'),
os = require('os');

console.log(ip.address());
console.log(os.hostname())
