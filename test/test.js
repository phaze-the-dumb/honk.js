const HONK = require('../');
const util = require('util');
const fs = require('fs');

let buff = fs.readFileSync(__dirname + '/test.honk');
let startTime = Date.now();

let h = new HONK(buff);
h.debug = true;
h.parse();

console.log('Finished: ' + (Date.now() - startTime) + 'ms');
console.log(util.inspect(h.data, true, 10000000000, true));