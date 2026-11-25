// postgres gak bisa simpen karakter NUL
const isTeks = (v, min, max) =>
  typeof v === 'string' && v.trim().length >= min && v.length <= max && !v.includes('\u0000');

const rules = {
  nama: (v) => (isTeks(v, 1, 100) ? null : 'nama wajib diisi, maksimal 100 karakter'),
  email: (v) =>
    isTeks(v, 1, 254) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : 'email tidak valid',
  kata_sandi: (v) =>
    typeof v === 'string' && v.length >= 8 && v.length <= 128
      ? null
      : 'kata_sandi wajib 8 sampai 128 karakter',
};

const validate = (fields) => (req, res, next) => {
  const body = req.body || {};
  const errors = fields.map((f) => rules[f](body[f])).filter(Boolean);
  if (errors.length > 0) {
    return res.status(400).json({ status: 'error', message: 'Validasi gagal', errors });
  }
  req.body = { ...body, email: body.email.trim().toLowerCase() };
  next();
};

exports.validateDaftar = validate(['nama', 'email', 'kata_sandi']);
exports.validateMasuk = validate(['email', 'kata_sandi']);
