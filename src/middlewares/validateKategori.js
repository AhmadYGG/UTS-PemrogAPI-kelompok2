exports.validateKategori = (req, res, next) => {
  const errors = [];
  const { nama_kategori, deskripsi } = req.body || {};

  // postgres gak bisa simpen karakter NUL
  if (
    typeof nama_kategori !== 'string' || nama_kategori.trim() === '' ||
    nama_kategori.length > 50 || nama_kategori.includes('\u0000')
  ) {
    errors.push('nama_kategori wajib diisi, tidak boleh kosong, maksimal 50 karakter');
  }

  if (
    deskripsi !== undefined && deskripsi !== null &&
    (typeof deskripsi !== 'string' || deskripsi.length > 200 || deskripsi.includes('\u0000'))
  ) {
    errors.push('deskripsi harus teks, maksimal 200 karakter');
  }

  if (errors.length > 0) {
    return res.status(400).json({ status: 'error', message: 'Validasi gagal', errors });
  }
  next();
};
