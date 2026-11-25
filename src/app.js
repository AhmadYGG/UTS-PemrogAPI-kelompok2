const path = require('path');
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use(['/api/kategori', '/api/produk'], require('./middlewares/wajibAdmin'));
app.use('/api/kategori', require('./routes/kategoriRoutes'));
app.use('/api/produk', require('./routes/produkRoutes'));

// 404
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Route tidak ditemukan' });
});

// error handler
app.use((err, req, res, next) => {
  // json rusak
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ status: 'error', message: 'JSON tidak valid' });
  }
  // error lain dari express (url aneh, body kegedean)
  if (err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ status: 'error', message: 'Permintaan tidak dapat diproses' });
  }
  console.error(err);
  res.status(500).json({ status: 'error', message: 'Terjadi kesalahan pada server' });
});

module.exports = app;
