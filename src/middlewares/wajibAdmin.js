const repo = require('../repositories/penggunaRepository');
const { hashDariCookie } = require('../utils/token');

const IP_LOKAL = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];
const HOST_LOKAL = ['localhost', '127.0.0.1', '[::1]'];

// cek host juga, biar lewat proxy gak dianggep localhost
const isLokal = (req) =>
  IP_LOKAL.includes(req.socket.remoteAddress) && HOST_LOKAL.includes(req.hostname);

const loginWajib = () => !/^(false)?$/i.test(process.env.LOGIN_WAJIB || '');

// localhost bebas tanpa login (buat postman), kecuali LOGIN_WAJIB=true
module.exports = async (req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD') return next();
  if (!loginWajib() && isLokal(req)) return next();

  try {
    const tokenHash = hashDariCookie(req);
    const pengguna = tokenHash && (await repo.findBySesi(tokenHash));
    if (!pengguna) {
      return res.status(401).json({ status: 'error', message: 'Silakan masuk sebagai admin terlebih dahulu' });
    }
    if (pengguna.peran !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Hanya admin yang boleh mengubah data' });
    }
    next();
  } catch (err) { next(err); }
};
