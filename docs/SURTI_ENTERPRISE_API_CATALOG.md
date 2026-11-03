# Katalog Perintah API Resmi — SURTI Enterprise Bridge

Dokumen ini adalah **Kontrak Resmi (Tooling Contract)** yang menjadi acuan asisten AI **SURTI** (Hermes Agent di Telegram) untuk berinteraksi dengan seluruh backend web, database Supabase, dan sistem kalkulasi Engineering **SUNBLIX**.

---

## 1. Konvensi Dasar & Autentikasi

- **Base URL:**
  - Internal VPS (paling cepat & aman): `http://127.0.0.1:3000`
  - Domain Publik: `https://dashboardv2.sunblix.id`
- **Header Wajib:** Setiap panggilan API wajib menyertakan header:
  ```http
  x-surti-key: <SURTI_CRM_API_KEY>
  Content-Type: application/json
  ```
- **Kerahasiaan Kunci:** Kunci layanan dibaca dari baris pertama `/opt/data/surti-master/surti_crm.md`. Jangan pernah mencetak atau menampilkan isi kunci ini ke ruang chat Telegram atau log output.

---

## 2. Modul Engineering & Project Analysis (Utama)

### `POST /api/engineering/analyze-and-report`
Digunakan saat admin mem-forward chat prospek dari WhatsApp ke Telegram. API ini otomatis:
1. Menghitung sizing solar (kWp, jumlah panel, kapasitas inverter, kapasitas baterai) berdasarkan logika resmi **dashboardv2**.
2. Menghitung analisa finansial (penghematan/bulan, penghematan/tahun, estimasi investasi, payback).
3. Menyimpan/memperbarui data lead ke tabel `surti_customers` di Supabase.
4. Men-generate dokumen resmi **Project Planning Analysis (PDF A4)** beresolusi tinggi lengkap dengan kop surat dan grafik.

**Payload Request:**
```json
{
  "customerName": "Bapak Hendra Gunawan",
  "phone": "081399887766",
  "city": "Bandung",
  "monthlyBill": 3500000,
  "plnVa": 7700,
  "phase": "1 Fasa",
  "goal": "Hemat + backup",
  "roofType": "Metal / spandek",
  "roofArea": 60,
  "notes": "Atap hadap utara, beban utama AC & pompa air."
}
```

**Response:**
```json
{
  "success": true,
  "leadId": "uuid-lead-di-supabase",
  "summary": {
    "customerName": "Bapak Hendra Gunawan",
    "city": "Bandung",
    "systemType": "Hemat + backup",
    "systemCapacity": "19.20 kWp (30 Panel)",
    "inverter": "10 kW",
    "battery": "58.5 kWh",
    "dailyProduction": "61.6 kWh / hari",
    "coverage": "74% kebutuhan listrik tertutup PLTS",
    "monthlySaving": "Rp 2.581.272",
    "annualSaving": "Rp 30.975.262",
    "estimatedInvestment": "Rp 445.665.000",
    "payback": "14.4 Tahun"
  },
  "pdf": {
    "filename": "SUNBLIX_Project_Analysis_Bapak_Hendra_Gunawan.pdf",
    "sizeBytes": 732995,
    "base64": "JVBERi0xLjQK..."
  }
}
```

> **Aksi Standar SURTI di Telegram saat Menerima Data Lead:**
> 1. Kirim pesan ringkasan eksekutif ke Admin menggunakan data dari `summary`.
> 2. Sertakan **Catatan Kritis Lapangan (Engineering Highlights & Red Flags)**:
>    - Jarak kabel penarikan (mitigasi rugi tegangan / *voltage drop*).
>    - Tipe atap & jenis bracket anti-bocor (*tile roof hook*, *L-feet*, *ballasted*).
>    - Beban lonjakan (*inrush current*) pompa/motor/AC.
> 3. Konversi `pdf.base64` menjadi file dokumen (`SUNBLIX_Project_Analysis_<Nama>.pdf`) lalu kirimkan file PDF tersebut langsung ke ruang chat Admin.
> 4. Siapkan **Draf Pesan WhatsApp untuk Klien (Siap Copas)** berisi edukasi ramah, estimasi kapasitas & penghematan, serta ajakan *Call to Action* untuk jadwal **Site Survey Gratis**.

---

## 3. Modul CRM & Pipeline Penjualan

### A. Membaca Pipeline & Prospek
```http
GET /api/surti/crm?type=leads
GET /api/surti/crm?type=surveys
GET /api/surti/crm?type=tickets
```
Digunakan saat Admin bertanya status prospek, jadwal survei, atau tiket kendala teknis.

### B. Membaca Detail Satu Lead
```http
GET /api/surti/leads/{leadId}
```

### C. Update Data & Tahapan Funnel Prospek
```http
PATCH /api/surti/leads/{leadId}
```
**Payload Request:**
```json
{
  "stage": "SURVEY_SCHEDULED",
  "city": "Bandung Barat",
  "notes": "Pelanggan setuju survei hari Sabtu."
}
```
*Pilihan `stage`: `NEW_LEAD`, `QUALIFIED`, `SPH_PROPOSED`, `SURVEY_SCHEDULED`, `WON`, `LOST`.*

### D. Verifikasi Prospek
```http
POST /api/surti/leads/{leadId}/verify
```
**Payload Request:**
```json
{
  "verifiedBy": "SURTI",
  "notes": "Nomor WhatsApp aktif dan tagihan listrik sudah dikonfirmasi."
}
```

### E. Menyetujui Lead Masuk ke CRM Aktif (Approval Gate)
```http
POST /api/surti/leads/{leadId}/approve
```
*Hanya dijalankan jika Admin memberikan instruksi persetujuan.*
**Payload Request:**
```json
{
  "requestedBy": "Admin Danny",
  "note": "Disetujui untuk penjadwalan tim engineering."
}
```

---

## 4. Modul Katalog Paket & Brosur Resmi 2026

### `GET /api/surti/brosur`
Digunakan saat pelanggan atau admin menanyakan harga paket resmi SUNBLIX tanpa kalkulasi kustom.

- `GET /api/surti/brosur?section=packages` (Daftar 17 paket standar, pro, pro+)
- `GET /api/surti/brosur?category=PRO&maxPrice=150000000` (Filter anggaran)
- `GET /api/surti/brosur?section=pdf` (Mengambil link download katalog PDF resmi untuk dibagikan)

---

## 5. Modul Surat Penawaran Harga (SPH)

### `GET /api/surti/sph?id={sphId}`
Mengambil data detail proposal SPH.

### `POST /api/surti/sph`
Membuat draf proposal SPH resmi:
```json
{
  "action": "create_draft",
  "customerId": "uuid-pelanggan",
  "customerName": "Bapak Hendra Gunawan",
  "systemType": "hybrid",
  "plnPower": 7700,
  "monthlyBill": 3500000
}
```

---

## 6. Modul SDM & Kemitraan (Dashboard OS)

### A. Data Pelamar Kerja
```http
GET /api/career
```
Mengambil daftar pelamar karir terbaru yang masuk dari form website `/career`.

### B. Permohonan Kemitraan / Partnership
```http
GET /api/partnership
```
Mengambil daftar pengajuan mitra (EPC, subkontraktor, distributor, agen) dari form website `/partnership`.

---

## 7. Batas Keamanan & Guardrails untuk SURTI 🛡️

1. **Dilarang Menghitung Mandiri:** Jangan pernah menghitung estimasi biaya atau daya menggunakan nalar LLM. Selalu panggil `/api/engineering/analyze-and-report`.
2. **Operasi Destruktif Ditolak:** Operasi `DELETE`, pengosongan data massal (`clear_all`), atau reset database tidak dapat diakses oleh kunci SURTI (khusus sesi Direksi/Admin lewat web).
3. **Kerahasiaan Sistem:** Jangan pernah menyebutkan istilah teknis internal (*"API"*, *"Endpoint"*, *"Database"*, *"Supabase"*, *"JSON"*) kepada pelanggan. Berbicaralah layaknya konsultan engineering manusia yang profesional.
4. **Idempotensi:** Jika memproses permintaan berulang, sistem backend otomatis menjaga agar data tidak ganda berdasarkan nomor kontak pelanggan.

