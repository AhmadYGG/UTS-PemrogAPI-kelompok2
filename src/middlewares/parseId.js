const MAX_INT = 2147483647; // max INTEGER postgres
const toId = (teks) => (/^\d+$/.test(teks) ? Number(teks) : NaN);
const isId = (v) => Number.isInteger(v) && v >= 1 && v <= MAX_INT;

module.exports = (req, res, next) => {
  const id = toId(req.params.id);
  if (!isId(id)) {
    return res.status(400).json({ status: 'error', message: `ID harus berupa bilangan bulat 1 sampai ${MAX_INT}` });
  }
  req.id = id;
  next();
};

// ?kategori_id= (opsional)
module.exports.parseKategoriFilter = (req, res, next) => {
  if (req.query.kategori_id === undefined) return next();
  const id = toId(req.query.kategori_id);
  if (!isId(id)) {
    return res.status(400).json({ status: 'error', message: 'kategori_id harus bilangan bulat positif' });
  }
  req.kategoriId = id;
  next();
};

module.exports.MAX_INT = MAX_INT;
module.exports.isId = isId;
