# SUNBLIX — SURTI AI (SUNBLIX Utility Resource Technical Intelligence)

Dokumen ini adalah panduan lengkap implementasi sistem **SURTI AI**, asisten resmi kecerdasan buatan dari SUNBLIX untuk konsultasi energi surya, kalkulasi PLTS deterministik, alur kerja Surat Penawaran Harga (SPH) dengan *Human-in-the-Loop*, dan integrasi *Two-Way Voice AI*.

---

## 🌟 Struktur Modul Terisolasi

Semua kode SURTI AI diisolasi dalam folder tersendiri sehingga **tidak mengganggu atau merusak halaman/kode SUNBLIX yang sudah ada**:

```
├── lib/surti/
│   ├── solarEngine.js      # Mesin kalkulasi PLTS deterministik (kWp, panel, hemat, BEP)
│   ├── knowledgeBase.js    # Basis pengetahuan resmi (garansi, spesifikasi, termin 50/40/10)
│   ├── productCatalog.js   # Katalog produk resmi (Astronergy 585 Wp, Deye, LiFePO4 BESS)
│   ├── memorySystem.js     # Sistem memori persisten 4 lapis (Working, Episodic, Semantic, Project)
│   ├── sphService.js       # Alur kerja SPH, nomor tahan benturan, persetujuan manusia
│   ├── crmService.js       # Manajemen prospek CRM, jadwal survei lokasi, tiket layanan
│   ├── aiCoordinator.js   # Orkestrasi AI chat, salam resmi, deteksi intent, & tool calls
│   └── testRunner.mjs      # Test suite otomatis (16 acceptance tests)
│
├── app/
│   ├── surti/
│   │   ├── page.jsx        # Halaman Customer Chat & Two-Way Voice AI
│   │   ├── surti.css       # Desain mewah sinematik (Dark Luxury & Gold)
│   │   ├── admin/
│   │   │   └── page.jsx    # Admin Dashboard (Antrean SPH, CRM Leads, Survei, Tiket)
│   │   └── sph/[id]/
│   │       └── page.jsx    # Halaman Dokumen Resmi SPH Siap Cetak / Unduh PDF
│   │
│   └── api/surti/
│       ├── chat/route.js       # API endpoint percakapan SURTI & tool calling
│       ├── calculate/route.js  # API endpoint kalkulasi deterministik PLTS
│       ├── sph/route.js        # API endpoint SPH (Draf, Review, Approve, Issue)
│       ├── crm/route.js        # API endpoint Leads, Survei, & Tiket
│       └── memory/route.js     # API endpoint inspeksi & reset memori pelanggan
│
├── components/
│   └── FloatingSurtiAi.jsx # Tombol floating peluncur cepat SURTI AI di beranda
│
└── supabase/
    └── migrations/
        └── 20261018_surti_ai_schema.sql # Skema PostgreSQL Supabase & Kebijakan RLS
```

---

## 🚀 Cara Menjalankan & Menguji Secara Lokal

### 1. Jalankan Server Development
```bash
npm run dev
```
Buka browser pada:
- **Customer Chat & Voice AI**: [http://localhost:3000/surti](http://localhost:3000/surti)
- **Admin Control Center**: [http://localhost:3000/surti/admin](http://localhost:3000/surti/admin)
- **Pratinjau SPH Demo**: [http://localhost:3000/surti/sph/sph-demo-01](http://localhost:3000/surti/sph/sph-demo-01)
- **Beranda SUNBLIX**: [http://localhost:3000/](http://localhost:3000/) (dilengkapi tombol floating *Tanya SURTI AI*)

### 2. Jalankan Automated Acceptance Tests
```bash
node lib/surti/testRunner.mjs
```
*Hasil: 16 dari 16 acceptance test lolos validasi.*

---

## 🔒 Demo Mode vs Live Mode

### Demo Mode (Bawaan / Out-of-the-Box)
- Langsung aktif tanpa memerlukan API Key atau konfigurasi database eksternal.
- Dilengkapi data demo realistis berlabel jelas (*Demo Mode* watermark pada SPH).
- Mendukung dua arah suara (*Web Speech API*) langsung di browser.

### Live Mode (Opsional)
Tambahkan variabel berikut ke dalam file `.env.local`:
```env
SURTI_MODE=live
GEMINI_API_KEY=your_gemini_api_key_here
# atau
OPENAI_API_KEY=your_openai_api_key_here

# Supabase (Bila menghubungkan database produksi)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Jalankan skrip migrasi SQL di Supabase SQL Editor dari file:
`supabase/migrations/20261018_surti_ai_schema.sql`

---

## 📜 Kepatuhan Aturan Master Build Prompt

1. **Identitas & Salam Resmi**: Salam pembuka resmi wajib diucapkan pada setiap sesi baru tanpa diubah.
2. **Aturan SPH & Persetujuan Manusia**: SURTI hanya berwenang membuat **Draf SPH**. Penerbitan resmi (*ISSUED*) hanya bisa dilakukan oleh **Human Approver** melalui Admin Dashboard.
3. **Kalkulasi Determiniski**: Menggunakan spesifikasi resmi SUNBLIX (Astronergy 585 Wp & Inverter Deye) dengan PSH 4.5 dan efisiensi 75%.
4. **Memori Persisten 4 Lapis**: Working, Episodic, Semantic/Preference, dan Operational Memory dengan kontrol privasi pelanggan (*view/reset*).
