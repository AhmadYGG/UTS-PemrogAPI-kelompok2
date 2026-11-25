const crypto = require('crypto');

const hash = (token) => crypto.createHash('sha256').update(token).digest('hex');

exports.buat = () => {
  const token = crypto.randomBytes(32).toString('hex');
  return { token, tokenHash: hash(token) };
};

exports.hashDariCookie = (req) => {
  const cocok = /(?:^|;\s*)sesi=([0-9a-f]{64})(?:;|$)/.exec(req.headers.cookie || '');
  return cocok && hash(cocok[1]);
};
