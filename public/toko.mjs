import { api, buat, isiAkun, isiKategori, kartu, saring } from './common.mjs';

const $ = (id) => document.getElementById(id);
const param = new URLSearchParams(location.search);
const idKategori = param.get('kategori') ?? '';
const kata = param.get('cari') ?? '';
const beranda = param.size === 0;

isiAkun();
$('sambutan').hidden = !beranda;
$('remah').hidden = beranda;
$('cari').value = kata;

const formSaring = $('saring');
formSaring.urut.value = param.get('urut') ?? '';
formSaring.tersedia.checked = param.has('tersedia');
formSaring.kategori.value = idKategori;
formSaring.cari.value = kata;
formSaring.addEventListener('change', () => formSaring.requestSubmit());

try {
  const [kategori, produk] = await Promise.all([api('GET', '/kategori'), api('GET', '/produk')]);
  const hasil = saring(produk, param);
  const aktif = kategori.find((k) => String(k.id) === idKategori);
  const judul = kata ? `Hasil pencarian "${kata}"` : aktif?.nama_kategori ?? 'Semua barang';

  isiKategori(kategori, beranda || kata ? null : idKategori);
  $('judul').textContent = $('remah-akhir').textContent = judul;
  $('keterangan').textContent = (!kata && aktif?.deskripsi) || '';
  $('jumlah').textContent = `${hasil.length} barang`;
  if (!beranda) document.title = `${judul}, TechnoParts`;

  for (const a of $('samping').children) {
    const id = new URL(a.href).searchParams.get('kategori');
    const banyak = id ? produk.filter((p) => String(p.kategori_id) === id).length : produk.length;
    a.append(buat('span', { className: 'banyak', textContent: banyak }));
  }

  $('barang').replaceChildren(...hasil.map(kartu));
  if (hasil.length === 0) {
    $('barang').replaceWith(buat('p', { className: 'pesan' },
      'Tidak ada barang yang cocok. ',
      buat('a', { href: '/?kategori=', textContent: 'Lihat semua barang' })));
  }
} catch (err) {
  $('barang').replaceWith(buat('p', { className: 'pesan', textContent: err.message }));
}
