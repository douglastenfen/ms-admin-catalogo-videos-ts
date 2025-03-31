const crypto = require('crypto');

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
});

const privateKeyInLine = privateKey.replace(/\n/g, '\\n');
const publicKeyInLine = publicKey.replace(/\n/g, '\\n');

console.log(privateKeyInLine);
console.log(publicKeyInLine);
