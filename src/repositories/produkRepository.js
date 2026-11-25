const pool = require('../config/db');

class ProdukRepository {
  // produk yg belum dihapus, bisa difilter kategori
  async findAll(kategoriId) {
    if (kategoriId) {
      const { rows } = await pool.query(
        'SELECT * FROM produk WHERE deleted_at IS NULL AND kategori_id = $1 ORDER BY id',
        [kategoriId]
      );
      return rows;
    }
    const { rows } = await pool.query(
      'SELECT * FROM produk WHERE deleted_at IS NULL ORDER BY id'
    );
    return rows;
  }

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM produk WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    return rows[0];
  }

  async create({ kategori_id, kode_produk, nama_produk, harga, stok }) {
    const { rows } = await pool.query(
      `INSERT INTO produk (kategori_id, kode_produk, nama_produk, harga, stok)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [kategori_id, kode_produk, nama_produk, harga, stok]
    );
    return rows[0];
  }

  // PUT
  async replace(id, { kategori_id, kode_produk, nama_produk, harga, stok }) {
    const { rows } = await pool.query(
      `UPDATE produk
       SET kategori_id = $1, kode_produk = $2, nama_produk = $3, harga = $4, stok = $5
       WHERE id = $6 AND deleted_at IS NULL
       RETURNING *`,
      [kategori_id, kode_produk, nama_produk, harga, stok, id]
    );
    return rows[0];
  }

  // PATCH, cuma field yg dikirim
  async update(id, fields) {
    const allowed = ['kategori_id', 'kode_produk', 'nama_produk', 'harga', 'stok'];
    const keys = Object.keys(fields).filter((k) => allowed.includes(k));
    if (keys.length === 0) return undefined;

    const sets = keys.map((k, i) => `${k} = $${i + 1}`);
    const values = keys.map((k) => fields[k]);
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE produk SET ${sets.join(', ')}
       WHERE id = $${values.length} AND deleted_at IS NULL
       RETURNING *`,
      values
    );
    return rows[0];
  }

  // soft delete, cuma isi deleted_at
  async softDelete(id) {
    const result = await pool.query(
      'UPDATE produk SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    return result.rowCount > 0;
  }

  // hapus permanen
  async deletePermanent(id) {
    const result = await pool.query(
      'DELETE FROM produk WHERE id = $1 AND deleted_at IS NOT NULL',
      [id]
    );
    return result.rowCount > 0;
  }

  // restore
  async restore(id) {
    const { rows } = await pool.query(
      `UPDATE produk SET deleted_at = NULL
       WHERE id = $1 AND deleted_at IS NOT NULL
       RETURNING *`,
      [id]
    );
    return rows[0];
  }
}

module.exports = new ProdukRepository();
