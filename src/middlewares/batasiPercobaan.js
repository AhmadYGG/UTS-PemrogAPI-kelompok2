// batas percobaan login per IP (disimpan di memori aja)
const MAKS = 10;
const JENDELA_MS = 15 * 60 * 1000;
const catatan = new Map();

module.exports = (req, res, next) => {
  const kini = Date.now();
  for (const [ip, c] of catatan) if (c.sampai <= kini) catatan.delete(ip);

  const c = catatan.get(req.ip) || { jumlah: 0, sampai: kini + JENDELA_MS };
  c.jumlah += 1;
  catatan.set(req.ip, c);

  if (c.jumlah > MAKS) {
    res.set('Retry-After', String(Math.ceil((c.sampai - kini) / 1000)));
    return res.status(429).json({ status: 'error', message: 'Terlalu banyak percobaan, coba lagi 15 menit lagi' });
  }
  // login yg berhasil gak dihitung
  res.on('finish', () => {
    if (res.statusCode === 200) c.jumlah -= 1;
  });
  next();
};

module.exports.kosongkan = () => catatan.clear();
