// bikin akun admin dari ADMIN_EMAIL & ADMIN_PASSWORD di .env
require('dotenv').config();
const pool = require('../src/config/db');
const repo = require('../src/repositories/penggunaRepository');
const { hash } = require('../src/utils/kataSandi');

async function main() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const sandi = process.env.ADMIN_PASSWORD || '';
  if (!email.includes('@') || sandi.length < 8 || sandi.length > 128) {
    throw new Error('Isi ADMIN_EMAIL dan ADMIN_PASSWORD (8 sampai 128 karakter) di .env');
  }
  await repo.simpanAdmin({ nama: 'Admin', email, kata_sandi: await hash(sandi) });
  console.log(`Akun admin ${email} siap dipakai. Hapus ADMIN_PASSWORD dari .env.`);
}

main()
  .catch((err) => {
    console.error(err.code === '42P01' ? 'Tabel belum ada. Jalankan sql/login.sql dulu.' : err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
