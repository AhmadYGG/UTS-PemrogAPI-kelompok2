import { api, buat, foto, isiAkun, rupiah, saatKirim, statusStok } from './common.mjs';

const $ = (id) => document.getElementById(id);
const form = $('form-produk');
const formKategori = $('form-kategori');
const jendela = $('jendela');

const STATUS = { ada: 'Tersedia', tipis: 'Menipis', habis: 'Habis' };
let kategori = [];
let daftarProduk = [];
let idDiubah = null;

const tombol = (textContent, onclick) => buat('button', { type: 'button', textContent, onclick });

function kabari(teks, ...aksi) {
  $('kabar').replaceChildren(
    buat('span', { textContent: teks }),
    ...aksi,
    tombol('Tutup', () => $('kabar').replaceChildren()));
}

const coba = (aksi) => async () => {
  try {
    await aksi();
  } catch (err) {
    kabari(err.message);
  }
};

function bukaForm(produk) {
  form.reset();
  $('salah-produk').replaceChildren();
  idDiubah = produk?.id ?? null;
  $('judul-form').textContent = produk ? 'Ubah barang' : 'Tambah barang';
  $('simpan').textContent = produk ? 'Simpan perubahan' : 'Tambah barang';
  if (produk) {
    for (const nama of ['nama_produk', 'kategori_id', 'kode_produk', 'harga', 'stok']) {
      form.elements[nama].value = produk[nama];
    }
  }
  jendela.showModal();
}

async function hapus(produk) {
  await api('DELETE', `/produk/${produk.id}`);
  await muat();
  kabari(`${produk.nama_produk} dihapus.`, tombol('Urungkan', coba(async () => {
    await api('PATCH', `/produk/${produk.id}/restore`);
    await muat();
    kabari(`${produk.nama_produk} dikembalikan.`);
  })));
}

async function ubahStok(produk, input) {
  try {
    if (!input.reportValidity()) return;
    await api('PATCH', `/produk/${produk.id}`, { stok: input.valueAsNumber });
    produk.stok = input.valueAsNumber;
    // gak render ulang biar fokus input gak ilang
    input.closest('tr').querySelector('.stok').replaceWith(labelStatus(produk.stok));
    ringkas();
    kabari(`Stok ${produk.nama_produk} disimpan.`);
  } catch (err) {
    kabari(err.errors?.join('. ') ?? err.message);
  } finally {
    input.value = produk.stok;
  }
}

function labelStatus(stok) {
  const [status] = statusStok(stok);
  return buat('span', { className: `stok ${status}`, textContent: STATUS[status] });
}

function ringkas() {
  const banyak = (status) => daftarProduk.filter((p) => statusStok(p.stok)[0] === status).length;
  $('ringkasan').textContent = `${daftarProduk.length} barang, ${banyak('tipis')} menipis, ${banyak('habis')} habis`;
}

function barisProduk(produk) {
  const stok = buat('input', { type: 'number', min: 0, max: 2147483647, required: true, value: produk.stok });
  stok.setAttribute('aria-label', `Stok ${produk.nama_produk}`);
  stok.addEventListener('change', () => ubahStok(produk, stok));
  const sel = (...isi) => buat('td', {}, ...isi);

  return buat('tr', {},
    sel(buat('div', { className: 'sel-barang' },
      foto(produk),
      buat('div', {},
        buat('b', { textContent: produk.nama_produk }),
        buat('span', { className: 'ket', textContent: produk.kode_produk })))),
    sel(kategori.find((k) => k.id === produk.kategori_id)?.nama_kategori ?? ''),
    buat('td', { className: 'angka', textContent: rupiah(produk.harga) }),
    sel(stok),
    sel(labelStatus(produk.stok)),
    buat('td', { className: 'aksi' },
      tombol('Ubah', () => bukaForm(produk)),
      tombol('Hapus', coba(() => hapus(produk)))));
}

function barisKategori(k) {
  return buat('li', {},
    buat('span', {}, buat('b', { textContent: k.nama_kategori }), ' ', buat('span', { className: 'ket', textContent: k.deskripsi ?? '' })),
    tombol('Hapus', coba(async () => {
      if (!confirm(`Hapus kategori ${k.nama_kategori}? Kategori yang dihapus tidak bisa dikembalikan.`)) return;
      await api('DELETE', `/kategori/${k.id}`);
      await muat();
      kabari(`Kategori ${k.nama_kategori} dihapus.`);
    })));
}

async function muat() {
  [kategori, daftarProduk] = await Promise.all([api('GET', '/kategori'), api('GET', '/produk')]);
  form.kategori_id.replaceChildren(...kategori.map((k) => buat('option', { value: k.id, textContent: k.nama_kategori })));
  $('daftar-kategori').replaceChildren(...kategori.map(barisKategori));
  $('daftar-produk').replaceChildren(...daftarProduk.map(barisProduk));
  ringkas();
}

saatKirim(form, $('salah-produk'), async (isi) => {
  const body = { ...isi, kategori_id: Number(isi.kategori_id), harga: Number(isi.harga), stok: Number(isi.stok) };
  if (idDiubah) await api('PUT', `/produk/${idDiubah}`, body);
  else await api('POST', '/produk', body);
  jendela.close();
  kabari(`${body.nama_produk} ${idDiubah ? 'disimpan' : 'ditambahkan'}.`);
  await coba(muat)();
});

saatKirim(formKategori, $('salah-kategori'), async (isi) => {
  await api('POST', '/kategori', isi);
  formKategori.reset();
  await muat();
  kabari(`Kategori ${isi.nama_kategori} ditambahkan.`);
});

$('tambah').addEventListener('click', () => bukaForm());
$('batal').addEventListener('click', () => jendela.close());

const pengguna = await isiAkun();
if (pengguna?.peran === 'admin') {
  $('isi').hidden = false;
  coba(muat)();
} else {
  location.replace(pengguna ? '/' : 'masuk.html');
}
