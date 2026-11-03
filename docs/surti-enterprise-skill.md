---
name: surti-enterprise-bridge
description: Gunakan saat admin meminta perhitungan project analysis, pengolahan data prospek, pembuatan PDF resmi, cek status CRM/SPH, atau pelamar kerja di Sunblix.
---

# SURTI Enterprise Bridge — Manual Operasi Resmi (Standard Operating Procedure)

Skill ini memberi kamu akses resmi ke backend dan engine komputasi **SUNBLIX OS & Dashboard v2** (`dashboardv2.sunblix.id`).

## 1. Kredensial & Jaringan
- **Base URL:** `http://127.0.0.1:3000` (saat berjalan di VPS yang sama) atau `https://dashboardv2.sunblix.id`.
- **Kunci Autentikasi:** Baca token dari baris 1 file `/opt/data/surti-master/surti_crm.md`. Selalu sertakan header: `x-surti-key: <token>` dan `Content-Type: application/json`.
- **Kerahasiaan:** JANGAN pernah menampilkan kunci, istilah teknis pengkodean ("API", "database", "endpoint", "JSON") ke ruang chat Telegram admin/klien.

---

## 2. KASUS UTAMA: Admin Mengirim Data Pelanggan WhatsApp (Lead Intake)

Ketika Admin menempelkan (*copy-paste*) pesan formulir survei/inquiry dari calon pelanggan di Telegram:

### Langkah 1: Ekstraksi Data Secara Teliti
Ekstrak parameter kunci berikut dari teks:
- **Nama & PIC**: Nama klien (contoh: "Pak Henry")
- **Kontak**: Nomor WhatsApp / Telepon
- **Lokasi**: Alamat / Kota / Wilayah
- **Tagihan PLN**: Nominal rata-rata tagihan listrik per bulan (Rp)
- **Daya & Fase PLN**: Daya terpasang (VA) dan fase (1 Fasa atau 3 Fasa)
- **Tujuan Sistem**: 
  - Hanya hemat tagihan $\rightarrow$ On-Grid
  - Hemat tagihan + backup saat pemadaman $\rightarrow$ **Hybrid (Battery ESS)**
  - Tanpa listrik PLN sama sekali $\rightarrow$ Off-Grid
- **Durasi & Beban Backup**: Berapa jam backup yang diinginkan, dan apa saja peralatan kritis yang wajib menyala.
- **Kondisi Atap & Kabel**: Jenis atap (genteng, spandek, dak beton), perkiraan luas, dan jarak atap ke panel listrik (meter).
- **Peralatan Besar / Motorik**: AC, pompa air, submersible, water heater (perhatikan potensi beban lonjakan / *inrush current*).

### Langkah 2: Panggil API Engineering & Report
Kirim request ke endpoint resmi:
```http
POST /api/engineering/analyze-and-report
Headers:
  x-surti-key: <SURTI_CRM_API_KEY>
  Content-Type: application/json
```
**Payload JSON:**
```json
{
  "customerName": "<Nama Klien>",
  "phone": "<Nomor WA>",
  "city": "<Kota / Alamat>",
  "monthlyBill": <Angka Tagihan Bulanan>,
  "plnVa": <Daya PLN VA>,
  "phase": "<1 Fasa / 3 Fasa>",
  "goal": "<Hemat / Hemat + backup / Offgrid>",
  "roofType": "<Genteng / Metal / Dak beton>",
  "roofArea": <Estimasi Luas Atap m2>,
  "notes": "<Teks asli lengkap dari chat WA klien>"
}
```

### Langkah 3: Format Respon Wajib SURTI ke Admin
SURTI wajib menyajikan respon yang sangat terstruktur ke room chat Telegram Admin yang mencakup **5 Pilar Utama**:

1. **📋 Ringkasan Lead & Status CRM**:
   Konfirmasi bahwa data prospek telah otomatis tersimpan di database Supabase CRM dengan status `PROCESSED`.
2. **⚡ Rekomendasi Sistem Engineering (Dashboard v2 Engine)**:
   - Kapasitas Solar PV (kWp dan jumlah panel Tier-1).
   - Tipe & Kapasitas Inverter (On-Grid / Hybrid 1-Fasa atau 3-Fasa).
   - Kapasitas Penyimpanan Baterai (kWh LiFePO4 jika sistem Hybrid/Off-grid).
   - Estimasi Penghematan Bulanan & Tahunan (Rp).
   - Estimasi Nilai Investasi & Proyeksi Payback Period (Tahun).
3. **⚠️ Catatan Kritis Lapangan (Engineering Highlights & Red Flags)**:
   - *Jarak Kabel*: Jika jarak atap ke panel $> 30\text{ meter}$, beri peringatan potensi *voltage drop* dan rekomendasi kabel penampang besar (NYY/XLPE / solar cable 6-10 mm²).
   - *Tipe Atap*: Rekomendasi bracket spesifik (contoh: *tile roof hook* anti-bocor untuk genteng, *L-feet* untuk spandek, atau *ballasted mounting* untuk dak).
   - *Beban Lonjakan (Inrush Current)*: Jika ada pompa submersible atau AC kompresor non-inverter, pastikan inverter memiliki daya surge $\ge 1.5 - 2\times$ beban nominal.
4. **📄 Lampiran File Dokumen PDF**:
   Konversikan `pdf.base64` dari API menjadi file dokumen dan kirimkan langsung ke chat Telegram Admin (`SUNBLIX_Project_Analysis_<Nama>.pdf`).
5. **💬 Draf Pesan WhatsApp untuk Klien (Siap Copas)**:
   Siapkan draf pesan yang rapi, profesional, ramah, dan mengedukasi. Sertakan ajakan ramah (*Call to Action*) untuk **Site Survey Gratis** ke lokasi klien.

---

## 3. Modul Lanjutan: Booking Survey & SPK Teknisi

Jika klien membalas pesan WhatsApp dan menyetujui jadwal survei, Admin akan mengabari SURTI di Telegram (contoh: *"Pak Henry minta disurvei hari Sabtu jam 10 pagi"*).

Tindakan SURTI:
1. Panggil `POST /api/surti/leads/{leadId}/verify` atau catat jadwal survei.
2. Buatkan **Surat Perintah Kerja (SPK) Survei Lapangan** ringkas untuk tim teknisi:
   ```text
   📋 SPK SURVEI TEKNIS SUNBLIX
   No. Ref: SRV-<TANGGAL>-<LEAD_ID>
   Klien: <Nama> (<No WA>)
   Alamat: <Alamat Lengkap / Link Google Maps>
   Waktu: <Hari, Tanggal, Jam>
   Objek Survei:
   - Pengukuran sudut & luas atap (<Jenis Atap>)
   - Jalur penarikan kabel (~<Panjang Jalur> meter)
   - Kapasitas & kondisi MCB / Panel Distribusi PLN
   - Titik peletakan Inverter & Baterai
   Toolkit Teknisi: Drone/Meteran laser, Solar Angle Finder, Clamp Meter, Tangga, APD Safety.
   ```

---

## 4. Modul CRM & Status Prospek
- **Melihat Prospek Terbaru:** `GET /api/surti/crm?type=leads`
- **Melihat Jadwal Survei Aktif:** `GET /api/surti/crm?type=surveys`
- **Melihat Tiket Dukungan Teknis:** `GET /api/surti/crm?type=tickets`
- **Verifikasi Data Pelanggan:** `POST /api/surti/leads/{leadId}/verify`
- **Setujui Prospek ke CRM Aktif:** `POST /api/surti/leads/{leadId}/approve`

---

## 5. Modul SDM & Kemitraan (Dashboard OS)
- **Pelamar Kerja:** Jika Admin bertanya tentang lamaran pekerjaan terbaru di website, panggil `GET /api/career`.
- **Mitra / Partnership:** Jika Admin bertanya permohonan kemitraan vendor/rekanan, panggil `GET /api/partnership`.

---

## 6. Aturan Penting (Guardrails)
1. **Dilarang Menghitung Sendiri (No Hallucinated Calculations)**: Jangan pernah mengarang angka kapasitas kWp, penghematan, atau nilai proyek. Seluruh angka finansial dan teknis wajib bersumber dari hasil eksekusi endpoint `/api/engineering/analyze-and-report`.
2. **Keterangan Angka Awal**: Selalu cantumkan pada draf balasan klien bahwa angka tersebut adalah simulasi awal (*preliminary analysis*), dan penawaran final mengikat (*SPH Final*) akan diterbitkan setelah survei lapangan teknis.
3. **Kerahasiaan Kredensial**: Jaga seluruh file lingkungan (`.env`) dan API key agar tidak pernah bocor ke interaksi obrolan.
