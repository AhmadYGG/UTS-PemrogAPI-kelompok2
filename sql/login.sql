-- buat fitur login (tambahan), jalanin abis schema.sql
CREATE TABLE IF NOT EXISTS pengguna (
  id          SERIAL PRIMARY KEY,
  nama        VARCHAR(100) NOT NULL,
  email       VARCHAR(254) NOT NULL UNIQUE,
  kata_sandi  VARCHAR(200) NOT NULL,
  peran       VARCHAR(10) NOT NULL DEFAULT 'pembeli' CHECK (peran IN ('pembeli', 'admin')),
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- yg disimpen hash token nya aja
CREATE TABLE IF NOT EXISTS sesi (
  token_hash     CHAR(64) PRIMARY KEY,
  pengguna_id    INTEGER NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,
  berlaku_sampai TIMESTAMP NOT NULL
);
