const { MAX_INT, isId } = require('./parseId');

const FIELDS = ['kategori_id', 'kode_produk', 'nama_produk', 'harga', 'stok'];

// postgres gak bisa simpen karakter NUL
const isTeks = (v, max) =>
  typeof v === 'string' && v.trim() !== '' && v.length <= max && !v.includes('\u0000');

// cek per field, return pesan error / null
const rules = {
  kategori_id: (v) =>
    isId(v) ? null : `kategori_id harus bilangan bulat >= 1, maksimal ${MAX_INT}`,
  kode_produk: (v) =>
    isTeks(v, 20)
      ? null
      : 'kode_produk wajib diisi, tidak boleh kosong, maksimal 20 karakter',
  nama_produk: (v) =>
    isTeks(v, 100)
      ? null
      : 'nama_produk wajib diisi, tidak boleh kosong, maksimal 100 karakter',
  harga: (v) =>
    Number.isInteger(v) && v > 0 && v <= MAX_INT ? null : `harga harus bilangan bulat > 0, maksimal ${MAX_INT}`,
  stok: (v) =>
    Number.isInteger(v) && v >= 0 && v <= MAX_INT ? null : `stok harus bilangan bulat >= 0, maksimal ${MAX_INT}`,
};

function sendErrors(res, errors) {
  return res.status(400).json({ status: 'error', message: 'Validasi gagal', errors });
}

// POST & PUT: semua field wajib
exports.validateProduk = (req, res, next) => {
  const body = req.body || {};
  const errors = [];

  for (const field of FIELDS) {
    if (body[field] === undefined) {
      errors.push(`${field} wajib diisi`);
    } else {
      const msg = rules[field](body[field]);
      if (msg) errors.push(msg);
    }
  }

  if (errors.length > 0) return sendErrors(res, errors);
  next();
};

// PATCH: minimal 1 field
exports.validatePatch = (req, res, next) => {
  const body = req.body || {};
  const present = FIELDS.filter((f) => body[f] !== undefined);

  if (present.length === 0) {
    return sendErrors(res, ['Body harus berisi minimal satu field yang valid']);
  }

  const errors = [];
  for (const field of present) {
    const msg = rules[field](body[field]);
    if (msg) errors.push(msg);
  }

  if (errors.length > 0) return sendErrors(res, errors);
  next();
};
