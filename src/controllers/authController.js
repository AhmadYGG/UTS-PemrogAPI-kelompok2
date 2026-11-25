const repo = require('../repositories/penggunaRepository');
const kataSandi = require('../utils/kataSandi');
const token = require('../utils/token');

const HARI_SESI = 7;
const opsiCookie = () => ({
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
});

// biar waktu responnya sama kayak password salah
const hashPalsu = kataSandi.hash('bukan kata sandi siapa pun');

async function mulaiSesi(res, pengguna) {
  const { token: nilai, tokenHash } = token.buat();
  await repo.buatSesi(tokenHash, pengguna.id, HARI_SESI);
  res.cookie('sesi', nilai, { ...opsiCookie(), maxAge: HARI_SESI * 24 * 60 * 60 * 1000 });
}

const publik = ({ id, nama, email, peran }) => ({ id, nama, email, peran });

exports.daftar = async (req, res, next) => {
  try {
    const { nama, email, kata_sandi } = req.body;
    const pengguna = await repo.create({ nama: nama.trim(), email, kata_sandi: await kataSandi.hash(kata_sandi) });
    await mulaiSesi(res, pengguna);
    res.status(201).json({ status: 'success', message: 'Akun berhasil dibuat', data: publik(pengguna) });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ status: 'error', message: 'Email sudah terdaftar' });
    }
    next(err);
  }
};

exports.masuk = async (req, res, next) => {
  try {
    const pengguna = await repo.findByEmail(req.body.email);
    const cocok = await kataSandi.cocok(req.body.kata_sandi, pengguna ? pengguna.kata_sandi : await hashPalsu);
    if (!pengguna || !cocok) {
      return res.status(401).json({ status: 'error', message: 'Email atau kata sandi salah' });
    }
    await mulaiSesi(res, pengguna);
    res.json({ status: 'success', message: 'Berhasil masuk', data: publik(pengguna) });
  } catch (err) { next(err); }
};

exports.keluar = async (req, res, next) => {
  try {
    const tokenHash = token.hashDariCookie(req);
    if (tokenHash) await repo.hapusSesi(tokenHash);
    res.clearCookie('sesi', opsiCookie());
    res.status(204).send();
  } catch (err) { next(err); }
};

exports.saya = async (req, res, next) => {
  try {
    const tokenHash = token.hashDariCookie(req);
    const pengguna = tokenHash ? await repo.findBySesi(tokenHash) : undefined;
    res.set('Cache-Control', 'no-store');
    res.json({ status: 'success', message: 'Pengguna saat ini', data: pengguna || null });
  } catch (err) { next(err); }
};
