const STOK_MENIPIS = 5;

const URUTAN = new Map([
  ['murah', (a, b) => a.harga - b.harga],
  ['mahal', (a, b) => b.harga - a.harga],
  ['nama', (a, b) => a.nama_produk.localeCompare(b.nama_produk, 'id')],
]);

export function saring(produk, param) {
  const kategori = param.get('kategori');
  const kata = (param.get('cari') ?? '').trim().toLowerCase();

  const hasil = produk.filter((p) =>
    (!kategori || String(p.kategori_id) === kategori) &&
    (!param.get('tersedia') || p.stok > 0) &&
    `${p.nama_produk} ${p.kode_produk}`.toLowerCase().includes(kata));

  const urutan = URUTAN.get(param.get('urut'));
  return urutan ? hasil.sort(urutan) : hasil;
}

export function statusStok(stok) {
  if (stok < 1) return ['habis', 'Stok habis'];
  return stok > STOK_MENIPIS ? ['ada', `Stok ${stok}`] : ['tipis', `Sisa ${stok}`];
}

export const rupiah = (angka) => 'Rp' + angka.toLocaleString('id-ID');

export function buat(tag, props = {}, ...anak) {
  const el = Object.assign(document.createElement(tag), props);
  el.append(...anak);
  return el;
}

// foto pake nama kode produk
export function foto(produk) {
  const img = buat('img', { alt: '', width: 640, height: 640 });
  img.addEventListener('error', () => { img.src = 'img/tanpa-foto.svg'; }, { once: true });
  img.src = `img/${encodeURIComponent(produk.kode_produk)}.webp`;
  return img;
}

export function labelStok(stok) {
  const [status, teks] = statusStok(stok);
  return buat('span', { className: `stok ${status}`, textContent: teks });
}

export const kartu = (produk) =>
  buat('li', { className: 'kartu' },
    buat('a', { href: `produk.html?id=${produk.id}` },
      buat('span', { className: 'bingkai' }, foto(produk)),
      buat('span', { className: 'nama', textContent: produk.nama_produk })),
    buat('span', { className: 'harga', textContent: rupiah(produk.harga) }),
    labelStok(produk.stok));

// navbar + footer
export function isiKategori(kategori, aktif) {
  const tautan = (id, teks) => {
    const a = buat('a', { href: `/?kategori=${id}`, textContent: teks });
    if (String(id) === aktif) a.setAttribute('aria-current', 'page');
    return a;
  };
  for (const wadah of document.querySelectorAll('[data-kategori]')) {
    wadah.replaceChildren(tautan('', 'Semua barang'), ...kategori.map((k) => tautan(k.id, k.nama_kategori)));
  }
}

export async function api(method, path, body) {
  let res;
  try {
    res = await fetch('/api' + path, {
      method,
      headers: body && { 'Content-Type': 'application/json' },
      body: body && JSON.stringify(body),
    });
  } catch {
    throw new Error('Server tidak bisa dihubungi. Pastikan server menyala, lalu coba lagi.');
  }
  if (res.status === 204) return null;
  const json = await res.json();
  if (!res.ok) throw Object.assign(new Error(json.message), { errors: json.errors });
  return json.data;
}

function tampilkanSalah(el, err) {
  el.replaceChildren(...(err ? err.errors ?? [err.message] : []).map((textContent) => buat('li', { textContent })));
}

// disable tombol biar gak kekirim 2x
export function saatKirim(formulir, salah, kirim) {
  formulir.addEventListener('submit', async (event) => {
    event.preventDefault();
    const kirimTombol = event.submitter ?? formulir.querySelector('button:not([type])');
    kirimTombol.disabled = true;
    tampilkanSalah(salah);
    try {
      await kirim(Object.fromEntries(new FormData(formulir)));
    } catch (err) {
      tampilkanSalah(salah, err);
    } finally {
      kirimTombol.disabled = false;
    }
  });
}

// bagian akun di header
export async function isiAkun() {
  const pengguna = await api('GET', '/auth/saya').catch(() => null);
  const wadah = document.querySelector('[data-akun]');

  if (!pengguna) {
    wadah.replaceChildren(
      buat('a', { href: 'masuk.html', textContent: 'Masuk' }),
      buat('a', { href: 'daftar.html', className: 'tombol', textContent: 'Daftar' }));
    return null;
  }

  const keluar = buat('button', { type: 'button', textContent: 'Keluar' });
  keluar.addEventListener('click', async () => {
    try {
      await api('POST', '/auth/keluar');
      location.assign('/');
    } catch {
      keluar.textContent = 'Gagal keluar, coba lagi';
    }
  });
  wadah.replaceChildren(
    buat('span', { className: 'ket', textContent: pengguna.nama }),
    ...(pengguna.peran === 'admin' ? [buat('a', { href: 'admin.html', textContent: 'Kelola toko' })] : []),
    keluar);
  return pengguna;
}
