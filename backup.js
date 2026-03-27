const fs = require('fs');
const crypto = require('crypto');

const JSON_PATH = './data.json';

// Encryption
function encryptJSON(json) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync('super-secret-password', 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(json)),
    cipher.final()
  ]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Run
try {
  const raw = fs.readFileSync(JSON_PATH, 'utf-8');

  // ⚠️ If already encrypted, skip
  if (raw.includes(':')) {
    console.log('Already encrypted, skipping...');
    process.exit(0);
  }

  const data = JSON.parse(raw);
  const encrypted = encryptJSON(data);

  fs.writeFileSync(JSON_PATH, encrypted);
  console.log('Encrypted successfully!');
} catch (err) {
  console.error(err);
}