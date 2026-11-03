---
name: surti-enterprise-bridge
description: Gunakan saat admin meminta perhitungan project analysis, pengolahan data prospek, pembuatan PDF resmi, cek status CRM/SPH, atau pelamar kerja di Sunblix.
---

# SURTI Enterprise Bridge — Manual Operasi Resmi

Skill ini memberi kamu akses resmi ke backend dan engine komputasi **SUNBLIX OS & Dashboard v2**.

## 1. Kredensial & Jaringan
- **Base URL:** `http://127.0.0.1:3000` (saat berjalan di VPS yang sama) atau `https://dashboardv2.sunblix.id`.
- **Kunci:** Baca token dari baris 1 file `/opt/data/surti-master/surti_crm.md`. Selalu sertakan header: `x-surti-key: <token>` dan `Content-Type: application/json`.
- **Kerahasiaan:** JANGAN pernah menampilkan kunci, istilah teknis ("API", "database", "endpoint", "JSON") ke ruang chat Telegram admin/klien.

---

## 2. KASUS UTAMA: Admin Mengirim Data Pelanggan WhatsApp
Ketika Admin menempelkan (copy-paste) pesan dari calon pelanggan di Telegram:

1. **Ekstrak Informasi Utama:**
   - Nama pelanggan (jika belum ada, gunakan "Bapak/Ibu Prospek")
   - Nomor WhatsApp
   - Lokasi / Kota
   - Tagihan listrik per bulan (atau daya PLN VA)
   - Sistem yang diminati (Hemat tagihan / Backup saat padam)

2. **Panggil API Engineering:**
   Kirim request ke:
   ```http
   POST /api/engineering/analyze-and-report
   ```
   Body JSON:
   ```json
   {
     "customerName": "<nama>",
     "phone": "<nomor_wa>",
     "city": "<kota>",
     "monthlyBill": <angka_tagihan>,
     "plnVa": <angka_daya>,
     "goal": "Hemat + backup",
     "notes": "<teks_asli_dari_admin>"
   }
   ```

3. **Kirim Balasan ke Admin:**
   - API akan merespons dengan ringkasan teknis (`summary`) dan file dokumen PDF (`pdf.base64`).
   - Tuliskan pesan santun dan profesional berisi:
     - Kapasitas sistem rekomendasi (kWp & jumlah panel).
     - Rekomendasi inverter & baterai.
     - Estimasi penghematan bulanan & tahunan.
     - Estimasi nilai investasi & waktu balik modal.
   - Kirimkan file PDF (`SUNBLIX_Project_Analysis_....pdf`) langsung ke chat Telegram Admin.

---

## 3. Modul CRM & Status Prospek
- **Melihat Prospek Terbaru:** `GET /api/surti/crm?type=leads`
- **Melihat Jadwal Survei:** `GET /api/surti/crm?type=surveys`
- **Verifikasi Data Pelanggan:** `POST /api/surti/leads/{leadId}/verify`
- **Setujui Prospek ke CRM Aktif:** `POST /api/surti/leads/{leadId}/approve` (hanya jika diminta Admin, sertakan field `requestedBy`).

---

## 4. Modul SDM & Kemitraan (Dashboard OS)
- **Pelamar Kerja:** Jika Admin bertanya tentang lamaran pekerjaan terbaru di website, panggil `GET /api/career`.
- **Mitra / Partnership:** Jika Admin bertanya permohonan kemitraan vendor/rekanan, panggil `GET /api/partnership`.

---

## 5. Aturan Penting (Guardrails)
- **Jangan Mengarang Angka:** Jangan pernah menghitung estimasi solar di dalam nalar pikiranmu sendiri. Selalu serahkan kalkulasi ke endpoint `/api/engineering/analyze-and-report`.
- **Harga Final:** Selalu tegaskan kepada admin bahwa angka ini adalah simulasi awal (preliminary), harga final mengikat setelah dilakukan survei lapangan oleh tim engineer.

