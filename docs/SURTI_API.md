# SURTI API — Brosur & CRM SUNBLIX

API untuk asisten **SURTI**: membaca katalog/brosur resmi dan membaca/menulis CRM.

- **Base URL (uji coba, branch `dev`):** `https://jasasolarpanelindonesia.sunblix.id`
- **Autentikasi:** setiap request wajib membawa kunci layanan SURTI
  - `x-surti-key: <SURTI_CRM_API_KEY>` (disarankan), atau
  - header `Authorization` dengan skema `Bearer` + kunci yang sama
- Tanpa kunci / kunci salah → `401`. Setiap respons memuat `accessVia`
  (`surti-key` | `staff` | `public-web`) untuk audit.
- **Jangan pernah** tampilkan kunci ke pelanggan.

---

## 1. Brosur — `GET /api/surti/brosur`

Katalog resmi SUNBLIX 2026: 17 paket (STANDARD+ 5, PRO 5, PRO+ 7), 3 add-on
baterai, syarat & ketentuan, profil perusahaan, kebijakan, dan link PDF.

| Parameter | Isi |
|---|---|
| `section` | `all` (default), `packages`, `addons`, `terms`, `profile`, `policies`, `pdf` |
| `category` | `STANDARD+`, `PRO`, `PRO+` (tanda `+` ditulis `%2B` di URL) |
| `minKwp`, `maxKwp` | rentang kapasitas, contoh `minKwp=5&maxKwp=8` |
| `maxPrice` | anggaran maksimum dalam rupiah, contoh `maxPrice=150000000` |
| `phase` | `1` atau `3` |
| `q` | cari teks bebas, contoh `q=longi` |
| `id` | satu paket, contoh `id=std_234` |

Filter paket bisa digabung. Hasil paket diurutkan dari harga termurah.

**Contoh — paket PRO dengan anggaran ≤ Rp150 juta:**

```
GET /api/surti/brosur?section=packages&category=PRO&maxPrice=150000000
x-surti-key: <SURTI_CRM_API_KEY>
```

```json
{
  "success": true,
  "accessVia": "surti-key",
  "catalogVersion": "2026",
  "currency": "IDR",
  "packages": {
    "count": 1,
    "items": [
      { "id": "...", "category": "PRO", "name": "SUNBLIX 8.19",
        "kwp": 8.19, "price": 145400000, "priceText": "Rp 145.400.000", "...": "..." }
    ]
  }
}
```

**Contoh — link brosur PDF untuk dikirim ke pelanggan:**

```
GET /api/surti/brosur?section=pdf
→ { "pdf": { "title": "Katalog Resmi SUNBLIX 2026",
             "url": "https://jasasolarpanelindonesia.sunblix.id/SUNBLIX_KATALOG_2026.pdf" } }
```

Field paket: `id, category, name, kwp, batteryKwh, inverterKw, phase, pvArea,
panels, panelsCount, price, priceText, summary`.

---

## 2. CRM — `/api/surti/crm`

**Baca** (leads / surveys / tickets):

```
GET /api/surti/crm?type=leads        # leads | surveys | tickets | (kosong = semua)
x-surti-key: <SURTI_CRM_API_KEY>
```

**Tulis** — `POST /api/surti/crm` dengan `Content-Type: application/json`:

| `action` | Kegunaan | Field utama |
|---|---|---|
| `create_lead` | catat calon pelanggan | `name`, `phone`, `email`, `city`, `monthlyBill`, `customerType` (`residential`/`commercial`/`industrial`), `companyName`, `propertyType`, `systemType`, `source`, `notes` |
| `create_survey` | ajukan jadwal survei lokasi | `customerName`, `phone`, `siteAddress`, `preferredDate`, `preferredTime`, `roofType`, `notes` |
| `create_ticket` | tiket layanan/keluhan | `customerName`, `phone`, `subject`, `description`, `category` (`technical_consultation`/`maintenance`/`warranty_claim`/`billing`/`human_handoff`), `priority` (`low`/`medium`/`high`/`urgent`) |

Contoh:

```json
POST /api/surti/crm
x-surti-key: <SURTI_CRM_API_KEY>

{ "action": "create_lead", "name": "Budi", "phone": "0812xxxx",
  "city": "Bandung", "monthlyBill": 1500000, "source": "telegram",
  "notes": "tertarik paket PRO, punya atap 30 m²" }
```

**Tidak bisa lewat kunci SURTI** (khusus staf): `update_survey`, `update_ticket`,
`clear_all`, dan `DELETE`.

---

## Alur yang disarankan untuk SURTI

1. Pelanggan menyebut tagihan/anggaran → `GET /api/surti/brosur?section=packages&maxPrice=…`
2. Tawarkan 1–3 paket yang cocok, sertakan link PDF (`section=pdf`)
3. Pelanggan berminat → `POST create_lead`
4. Pelanggan setuju survei → `POST create_survey`

## Kode kesalahan

| Kode | Arti |
|---|---|
| 200 | berhasil |
| 400 | parameter/aksi tidak dikenal |
| 401 | kunci tidak ada atau salah |
| 403 | aksi dilarang di produksi |
