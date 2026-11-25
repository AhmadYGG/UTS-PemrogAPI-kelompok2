const repo = require('../repositories/produkRepository');
const kategoriRepo = require('../repositories/kategoriRepository');

const notFound = (res) =>
  res.status(404).json({ status: 'error', message: 'Produk tidak ditemukan' });

// error postgres -> status http
function handleDbError(err, res, next) {
  if (err.code === '23505') {
    return res.status(409).json({ status: 'error', message: 'kode_produk sudah dipakai' });
  }
  if (err.code === '23503') {
    return res.status(422).json({ status: 'error', message: 'kategori_id tidak ditemukan di tabel kategori' });
  }
  return next(err);
}

exports.getAll = async (req, res, next) => {
  try {
    const data = await repo.findAll(req.kategoriId);
    res.json({ status: 'success', message: 'Daftar produk', count: data.length, data });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await repo.findById(req.id);
    if (!data) return notFound(res);
    res.json({ status: 'success', message: 'Detail produk', data });
  } catch (err) { next(err); }
};

// GET /api/kategori/:id/produk
exports.getByKategori = async (req, res, next) => {
  try {
    const kategori = await kategoriRepo.findById(req.id);
    if (!kategori) {
      return res.status(404).json({ status: 'error', message: 'Kategori tidak ditemukan' });
    }
    const data = await repo.findAll(req.id);
    res.json({ status: 'success', message: 'Produk milik kategori', count: data.length, data });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const data = await repo.create(req.body);
    res.status(201).json({ status: 'success', message: 'Produk berhasil ditambahkan', data });
  } catch (err) { handleDbError(err, res, next); }
};

exports.replace = async (req, res, next) => {
  try {
    const data = await repo.replace(req.id, req.body);
    if (!data) return notFound(res);
    res.json({ status: 'success', message: 'Produk berhasil diganti', data });
  } catch (err) { handleDbError(err, res, next); }
};

exports.update = async (req, res, next) => {
  try {
    const data = await repo.update(req.id, req.body);
    if (!data) return notFound(res);
    res.json({ status: 'success', message: 'Produk berhasil diubah', data });
  } catch (err) { handleDbError(err, res, next); }
};

exports.remove = async (req, res, next) => {
  try {
    const deleted = await repo.softDelete(req.id);
    if (!deleted) return notFound(res);
    res.status(204).send();
  } catch (err) { next(err); }
};

// hapus permanen, harus udah di soft delete dulu
exports.removePermanent = async (req, res, next) => {
  try {
    if (await repo.deletePermanent(req.id)) return res.status(204).send();
    if (await repo.findById(req.id)) {
      return res.status(409).json({ status: 'error', message: 'Produk masih aktif, lakukan soft delete terlebih dahulu' });
    }
    notFound(res);
  } catch (err) { next(err); }
};

exports.restore = async (req, res, next) => {
  try {
    const data = await repo.restore(req.id);
    if (!data) return notFound(res);
    res.json({ status: 'success', message: 'Produk berhasil dipulihkan', data });
  } catch (err) { next(err); }
};
