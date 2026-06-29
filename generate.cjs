const bcrypt = require('bcryptjs');

const hashes = {
  VITE_COORD_HASH: bcrypt.hashSync('coordinator123', 10),
  VITE_MENTOR_HASH: bcrypt.hashSync('mentor123', 10),
  VITE_CORE_HASH: bcrypt.hashSync('core123', 10),
  VITE_ADMIN_HASH: bcrypt.hashSync('admin123', 10)
};

const fs = require('fs');
fs.writeFileSync('.env', Object.entries(hashes).map(([k, v]) => `${k}=${v}`).join('\n') + '\n');
console.log('Hashes generated');
