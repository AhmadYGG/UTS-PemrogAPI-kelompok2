INSERT INTO kategori (nama_kategori, deskripsi) VALUES
  ('Mikrokontroler', 'Papan otak proyek, siap diprogram'),
  ('Sensor', 'Pembaca suhu, jarak, dan gerak'),
  ('Modul', 'RFID, relay, dan WiFi siap sambung'),
  ('Komponen Dasar', 'Resistor, LED, kabel, dan breadboard')
ON CONFLICT (nama_kategori) DO NOTHING;

INSERT INTO produk (kategori_id, kode_produk, nama_produk, harga, stok)
SELECT k.id, v.kode_produk, v.nama_produk, v.harga, v.stok
FROM (VALUES
  (1,  'Mikrokontroler', 'MCU-ESP32',  'ESP32 DevKit V1 30 pin',              68000, 24),
  (2,  'Mikrokontroler', 'MCU-UNO',    'Arduino Uno R3',                     185000, 15),
  (3,  'Mikrokontroler', 'MCU-PICO',   'Raspberry Pi Pico',                   72000,  4),
  (4,  'Sensor',         'SNS-DHT22',  'Sensor suhu dan kelembapan DHT22',    45000, 30),
  (5,  'Sensor',         'SNS-HCSR04', 'Sensor jarak ultrasonik HC-SR04',     16000, 42),
  (6,  'Sensor',         'SNS-PIR501', 'Sensor gerak PIR HC-SR501',           17000,  0),
  (7,  'Modul',          'MDL-RC522',  'Modul RFID RC522 13,56 MHz',          32000, 18),
  (8,  'Modul',          'MDL-RLY1',   'Modul relay 1 channel 5V',            14000,  3),
  (9,  'Modul',          'MDL-ESP01',  'Modul WiFi ESP-01 ESP8266',           24000, 21),
  (10, 'Komponen Dasar', 'KMP-BB830',  'Breadboard 830 titik',                20000, 36),
  (11, 'Komponen Dasar', 'KMP-LED5',   'LED 5 mm aneka warna isi 50',         12500, 60),
  (12, 'Komponen Dasar', 'KMP-R100',   'Resistor 100 ohm isi 100',            10000, 80),
  (13, 'Komponen Dasar', 'KMP-JMP40',  'Kabel jumper female-female isi 40',   14500, 55)
) AS v (urutan, nama_kategori, kode_produk, nama_produk, harga, stok)
JOIN kategori k ON k.nama_kategori = v.nama_kategori
ORDER BY v.urutan
ON CONFLICT (kode_produk) DO NOTHING;
