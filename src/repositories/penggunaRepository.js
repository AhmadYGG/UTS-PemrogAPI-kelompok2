const pool = require('../config/db');

class PenggunaRepository {
  async create({ nama, email, kata_sandi }) {
    const { rows } = await pool.query(
      `INSERT INTO pengguna (nama, email, kata_sandi)
       VALUES ($1, $2, $3) RETURNING id, nama, email, peran`,
      [nama, email, kata_sandi]
    );
    return rows[0];
  }

  // dipake di scripts/buatAdmin.js
  async simpanAdmin({ nama, email, kata_sandi }) {
    await pool.query(
      `INSERT INTO pengguna (nama, email, kata_sandi, peran)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email) DO UPDATE SET kata_sandi = EXCLUDED.kata_sandi, peran = 'admin'`,
      [nama, email, kata_sandi]
    );
    // password ganti -> hapus sesi lama
    await pool.query(
      'DELETE FROM sesi WHERE pengguna_id = (SELECT id FROM pengguna WHERE email = $1)',
      [email]
    );
  }

  // ada kata_sandi, jangan dikirim ke client
  async findByEmail(email) {
    const { rows } = await pool.query('SELECT * FROM pengguna WHERE email = $1', [email]);
    return rows[0];
  }

  async buatSesi(tokenHash, penggunaId, hari) {
    await pool.query('DELETE FROM sesi WHERE berlaku_sampai <= NOW()');
    await pool.query(
      `INSERT INTO sesi (token_hash, pengguna_id, berlaku_sampai)
       VALUES ($1, $2, NOW() + make_interval(days => $3))`,
      [tokenHash, penggunaId, hari]
    );
  }

  async findBySesi(tokenHash) {
    const { rows } = await pool.query(
      `SELECT p.id, p.nama, p.email, p.peran
       FROM sesi s JOIN pengguna p ON p.id = s.pengguna_id
       WHERE s.token_hash = $1 AND s.berlaku_sampai > NOW()`,
      [tokenHash]
    );
    return rows[0];
  }

  async hapusSesi(tokenHash) {
    await pool.query('DELETE FROM sesi WHERE token_hash = $1', [tokenHash]);
  }
}

module.exports = new PenggunaRepository();
