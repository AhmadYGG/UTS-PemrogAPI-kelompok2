import { api, buat, foto, isiAkun, isiKategori, kartu, labelStok, rupiah } from './common.mjs';

const $ = (id) => document.getElementById(id);
const id = new URLSearchParams(location.search).get('id');

const barisRinci = (judul, isi) => [buat('dt', { textContent: judul }), buat('dd', {}, isi)];

isiAkun();

try {
  const kategori = await api('GET', '/kategori');
  isiKategori(kategori, null);

  if (!/^[0-9]+$/.test(id)) throw new Error('Barang tidak ditemukan');
  const produk = await api('GET', `/produk/${id}`);
  const induk = kategori.find((k) => k.id === produk.kategori_id);
  const tautanInduk = () => buat('a', { href: `/?kategori=${induk.id}`, textContent: induk.nama_kategori });
  document.title = `${produk.nama_produk}, TechnoParts`;

  const gambar = foto(produk);
  gambar.alt = produk.nama_produk;

  $('remah').append(tautanInduk(), buat('span', { textContent: produk.nama_produk }));
  $('produk').replaceChildren(
    buat('div', { className: 'bingkai' }, gambar),
    buat('div', { className: 'rincian' },
      buat('h1', { textContent: produk.nama_produk }),
      buat('p', { className: 'harga besar', textContent: rupiah(produk.harga) }),
      buat('p', {}, labelStok(produk.stok)),
      buat('dl', {},
        ...barisRinci('Kode barang', produk.kode_produk),
        ...barisRinci('Kategori', tautanInduk()),
        ...barisRinci('Dijual sejak', new Date(produk.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })))));

  const serupa = (await api('GET', `/kategori/${induk.id}/produk`)).filter((p) => p.id !== produk.id);
  if (serupa.length > 0) {
    $('judul-serupa').textContent = `Barang lain di ${induk.nama_kategori}`;
    $('serupa').replaceChildren(...serupa.slice(0, 4).map(kartu));
    $('lainnya').hidden = false;
  }
} catch (err) {
  $('produk').replaceChildren(buat('p', { className: 'pesan' },
    `${err.message}. `, buat('a', { href: '/?kategori=', textContent: 'Lihat semua barang' })));
}
