# TechnoParts

API toko komponen elektronik, buat tugas UTS Pemrograman API. Pake Express + PostgreSQL.

Relasi: 1 kategori punya banyak produk.
- kategori -> hard delete
- produk -> soft delete (bisa di-restore)

## Cara jalanin

Butuh Node.js 20+ dan PostgreSQL.

```bash
npm install
cp .env.example .env   # isi DB_PASSWORD
psql -U postgres -f sql/schema.sql
psql -U postgres -d db_uts -f sql/seed.sql
npm start
```

Buka http://localhost:3000

Kalau pakai pgAdmin, bikin database `db_uts` manual dulu terus jalanin isi `schema.sql` (bagian CREATE TABLE) sama `seed.sql`.

## Struktur

```
src/
  app.js, server.js
  config/db.js
  routes/
  middlewares/
  controllers/
  repositories/
  utils/
public/     -> tampilan web
sql/        -> schema, seed, login
```

Alurnya: routes -> middlewares -> controllers -> repositories -> db

## Rancangan tabel

**kategori** (tabel induk)

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | SERIAL | primary key |
| nama_kategori | VARCHAR(50) | wajib, UNIQUE |
| deskripsi | VARCHAR(200) | boleh kosong |
| created_at | TIMESTAMP | default NOW() |

**produk** (tabel anak)

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | SERIAL | primary key |
| kategori_id | INTEGER | wajib, FK ke kategori(id) |
| kode_produk | VARCHAR(20) | wajib, UNIQUE |
| nama_produk | VARCHAR(100) | wajib |
| harga | INTEGER | wajib, > 0 |
| stok | INTEGER | default 0, >= 0 |
| created_at | TIMESTAMP | default NOW() |
| deleted_at | TIMESTAMP | NULL = aktif, terisi = sudah di-soft delete |

Relasinya one-to-many: satu kategori bisa dipakai banyak produk lewat `produk.kategori_id`.

## Keputusan desain

- PUT harus kirim semua field, PATCH boleh sebagian. PATCH body kosong -> 400.
- produk yg di soft delete masih nyambung ke kategori, jadi kategorinya gak bisa dihapus (409). hapus permanen produknya dulu.
- kode_produk yg udah di soft delete tetep gak bisa dipake lagi (409), biar pas restore gak bentrok.
- kategori pake hard delete karna cuma data acuan, gak perlu riwayat.

## Endpoint

Kategori

| Method | URL | Keterangan |
| --- | --- | --- |
| GET | /api/kategori | semua kategori |
| GET | /api/kategori/:id | detail |
| GET | /api/kategori/:id/produk | produk di kategori itu |
| POST | /api/kategori | tambah |
| DELETE | /api/kategori/:id | hapus (409 kalau masih ada produknya) |

Produk

| Method | URL | Keterangan |
| --- | --- | --- |
| GET | /api/produk | semua produk aktif |
| GET | /api/produk?kategori_id=1 | filter per kategori |
| GET | /api/produk/:id | detail |
| POST | /api/produk | tambah |
| PUT | /api/produk/:id | update semua field |
| PATCH | /api/produk/:id | update sebagian |
| DELETE | /api/produk/:id | soft delete |
| PATCH | /api/produk/:id/restore | restore |
| DELETE | /api/produk/:id/permanent | hapus permanen (harus udah soft delete dulu) |

Contoh body produk:

```json
{
  "kategori_id": 1,
  "kode_produk": "MCU-NANO",
  "nama_produk": "Papan Nano V3",
  "harga": 45000,
  "stok": 12
}
```

## Testing

- Postman: import `uts.postman_collection.json` + `uts.postman_environment.json`, run foldernya urut (1, 2, 3).
- Screenshot hasil ada di folder `screenshots/`:
  - `screenshots/ss-runner-1.png`: hasil Runner folder 1
  - `screenshots/ss-runner-2.png`: hasil Runner folder 2
  - `screenshots/ss-runner-3.png`: hasil Runner folder 3
  - `screenshots/ss-db-1.png`: abis S07, produk masih ada tapi `deleted_at` keisi
  - `screenshots/ss-db-2.png`: abis S10, `deleted_at` balik NULL
  - `screenshots/ss-db-3.png`: abis S14, kategori sementara udah gak ada

## Tambahan

Ada halaman web (katalog + halaman admin) dan login. Kalau mau pakai login:

```bash
psql -U postgres -d db_uts -f sql/login.sql
# isi ADMIN_EMAIL dan ADMIN_PASSWORD di .env
npm run admin
```
