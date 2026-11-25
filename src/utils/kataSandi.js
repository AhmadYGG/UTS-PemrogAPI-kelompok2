const crypto = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(crypto.scrypt);
const OPSI = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };
const PANJANG = 64;

exports.hash = async (kataSandi) => {
  const garam = crypto.randomBytes(16).toString('hex');
  const hasil = await scrypt(kataSandi, garam, PANJANG, OPSI);
  return `${garam}:${hasil.toString('hex')}`;
};

exports.cocok = async (kataSandi, tersimpan) => {
  const [garam, hasil] = tersimpan.split(':');
  const uji = await scrypt(kataSandi, garam, PANJANG, OPSI);
  return crypto.timingSafeEqual(uji, Buffer.from(hasil, 'hex'));
};
