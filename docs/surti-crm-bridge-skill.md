---
name: crm-bridge
description: Use when a customer asks about SUNBLIX packages/prices/brochure, or shares CRM-worthy data (name, WhatsApp, city, PLN bill, survey request, complaint). Reads the official catalog and reads/writes the Sunblix CRM via the website API.
required_environment_variables:
  - name: SURTI_CRM_API_KEY
    prompt: Kunci layanan SURTI untuk API brosur & CRM Sunblix
    help: Ada di Coolify, app "Sunblix Web" > Environment > SURTI_CRM_API_KEY
---

# CRM Bridge — Brosur & CRM SUNBLIX

## Koneksi

- Base URL: `https://jasasolarpanelindonesia.sunblix.id`
- Setiap request WAJIB membawa header `x-surti-key: $SURTI_CRM_API_KEY`
- Kunci dibaca dari env var `SURTI_CRM_API_KEY`. **Jangan pernah** menampilkan,
  menyebut, atau mengirim kunci ini ke pelanggan.
- Tanpa kunci / kunci salah → `401`. Respons memuat `accessVia` untuk audit.

## Kapan dipakai

- Pelanggan bertanya paket, harga, kapasitas, baterai, garansi, cara bayar → **Brosur**
- Pelanggan minta brosur/katalog → kirim **link PDF**
- Pelanggan memberi nama, WhatsApp, kota, tagihan PLN → **catat lead**
- Pelanggan setuju survei lokasi → **ajukan survei**
- Pelanggan menyampaikan keluhan teknis → **buat tiket**

## 1. Brosur — `GET /api/surti/brosur`

```bash
B=https://jasasolarpanelindonesia.sunblix.id
H="x-surti-key: $SURTI_CRM_API_KEY"

# paket sesuai anggaran (rupiah)
curl -s -H "$H" "$B/api/surti/brosur?section=packages&maxPrice=100000000"

# paket per kategori + kapasitas (tanda + ditulis %2B)
curl -s -H "$H" "$B/api/surti/brosur?section=packages&category=PRO%2B&minKwp=8"

# link brosur PDF untuk dikirim ke pelanggan
curl -s -H "$H" "$B/api/surti/brosur?section=pdf"

# add-on baterai | syarat & ketentuan | profil | kebijakan
curl -s -H "$H" "$B/api/surti/brosur?section=addons"
curl -s -H "$H" "$B/api/surti/brosur?section=terms"
curl -s -H "$H" "$B/api/surti/brosur?section=policies"
```

Parameter: `section` (`all`, `packages`, `addons`, `terms`, `profile`, `policies`, `pdf`),
`category` (`STANDARD+`, `PRO`, `PRO+`), `minKwp`, `maxKwp`, `maxPrice`, `phase` (`1`/`3`),
`q` (teks bebas), `id` (satu paket). Paket diurutkan dari harga termurah.

Field paket: `id, category, name, kwp, batteryKwh, inverterKw, phase, pvArea,
panels, panelsCount, price, priceText, summary`.

**Aturan:** harga & spesifikasi HANYA dari API ini — jangan mengarang angka.
Tawarkan 1–3 paket yang paling cocok, pakai `priceText`, dan sebutkan bahwa harga
final ditentukan setelah survei lokasi.

## 2. CRM — `/api/surti/crm`

```bash
# catat lead
curl -s -X POST "$B/api/surti/crm" -H "$H" -H "Content-Type: application/json" \
  -d '{"action":"create_lead","name":"<nama>","phone":"<whatsapp>","city":"<kota>",
       "monthlyBill":1500000,"source":"telegram","notes":"<ringkasan kebutuhan>"}'
# → simpan "data.id" dari respons sebagai customerId

# lengkapi lead yang sama (mis. pelanggan baru menyebut kota)
curl -s -X POST "$B/api/surti/crm" -H "$H" -H "Content-Type: application/json" \
  -d '{"action":"create_lead","customerId":"<data.id tadi>","city":"Bandung"}'

# ajukan survei lokasi
curl -s -X POST "$B/api/surti/crm" -H "$H" -H "Content-Type: application/json" \
  -d '{"action":"create_survey","customerName":"<nama>","phone":"<whatsapp>",
       "siteAddress":"<alamat>","preferredDate":"2026-11-05","notes":"<catatan>"}'

# tiket keluhan teknis
curl -s -X POST "$B/api/surti/crm" -H "$H" -H "Content-Type: application/json" \
  -d '{"action":"create_ticket","customerName":"<nama>","phone":"<whatsapp>",
       "category":"maintenance","priority":"medium",
       "subject":"<judul>","description":"<gejala, kode error, MCB trip>"}'

# baca data (leads | surveys | tickets)
curl -s -H "$H" "$B/api/surti/crm?type=leads"
```

**Wajib saat `create_lead`** — isi kolomnya sendiri, jangan hanya di `notes`:
- `monthlyBill` → ANGKA rupiah tanpa titik, mis. pelanggan bilang "1,5 juta" → `1500000`
- `city` → kota yang DISEBUT pelanggan, mis. `"Bandung"`
- Kalau pelanggan belum menyebutnya, **jangan kirim field itu** (jangan menebak,
  jangan isi 0). Lengkapi nanti dengan `create_lead` lagi memakai `customerId`
  yang sama dari respons pertama — data lama tidak terhapus.
- `notes` untuk konteks tambahan saja (daya PLN, luas atap, kebutuhan baterai).

Field lengkap:
- `create_lead`: `name, phone, email, city, monthlyBill, customerType`
  (`residential`/`commercial`/`industrial`)`, companyName, propertyType, systemType, source, notes`
- `create_survey`: `customerName, phone, siteAddress, preferredDate, preferredTime, roofType, notes`
- `create_ticket`: `customerName, phone, subject, description, category`
  (`technical_consultation`/`maintenance`/`warranty_claim`/`billing`/`human_handoff`)`, priority`
  (`low`/`medium`/`high`/`urgent`)

**Tidak bisa lewat kunci SURTI** (khusus staf): `update_survey`, `update_ticket`,
`clear_all`, `DELETE`. Jangan mencobanya.

## Cara menawarkan paket

- Ambil paket dengan `maxPrice` sedikit di atas anggaran pelanggan (± 10%).
- Tawarkan dua kelompok bila memungkinkan:
  - **Hemat** — kategori `STANDARD+` (on-grid, tanpa baterai backup). Ambil dari API.
  - **Lengkap** — kategori `PRO` (hybrid + baterai 10,24 kWh). Ambil dari API.
- Sebut kapasitas (kWp), jumlah modul, dan harga dari `priceText`. Jangan menghitung ulang harga sendiri.
- Hitungan hemat/balik modal: pakai `solarEngine` atau sebut asumsinya. Balik modal
  resmi rata-rata 4–6 tahun, tetapi angka pastinya bergantung pada tarif PLN dan pola pemakaian.
- Selalu tutup dengan: angka final ditentukan setelah survei lokasi.

## Alur percakapan

1. Tanya kebutuhan: tagihan PLN/bulan, kota, jenis bangunan, perlu cadangan saat padam?
2. Ambil paket yang cocok dari Brosur → tawarkan 1–3 pilihan
3. Kirim link PDF bila pelanggan ingin melihat katalog
4. Pelanggan memberi nama + WhatsApp → `create_lead` (sekali saja per pelanggan)
5. Pelanggan setuju survei → `create_survey`

## Aturan

- Catat hanya data yang relevan (jangan suku, agama, dsb.).
- Satu pelanggan satu lead — simpan `data.id` dari respons pertama sebagai
  `customerId`, lalu pakai lagi untuk melengkapi data. Jangan membuat lead baru.
- Bila API gagal: jangan ganggu pelanggan dengan pesan teknis; lanjutkan percakapan
  dan tawarkan dihubungi tim SUNBLIX via WhatsApp.
- Jangan pernah menyebut "API", "kunci", atau "database" kepada pelanggan.
