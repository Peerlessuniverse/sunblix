# SURTI Telegram Bot 🌞

Bot Telegram resmi **SURTI** — Konsultan Panel Surya Virtual PT SUNBLIX ENERGI INDONESIA.

## Arsitektur

```
Telegram @SurtiSunblixBot
   │ (long-polling, tanpa webhook/domain)
   ▼
src/bot.js — grammY
   ├─ src/typesafeGate.js  → Jev (TypeSafe): in-scope? greeting? off-topic → diam
   ├─ src/surtiBrain.js    → Nous Portal (minimax-m3.1-flash) + persona natural
   └─ src/supabase.js      → PostgREST: customers, conversations, messages
```

- **Out-of-scope = SURTI diam total** (gate Jev dengan threshold di kode, fallback keyword bila API error — pesan pelanggan tidak pernah ditelan karena API down)
- **Persona identik web** `/surti`: natural murni, tanpa template; ejaan titik (P.T., P.L.N., V.A.)
- **Katalog PDF** dibagikan otomatis saat diminta
- **Data masuk Supabase** (tabel sama dengan web) → muncul di CRM

## Environment Variables

| Var | Wajib | Keterangan |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | ✅ | dari @BotFather |
| `NOUS_API_KEY` | ✅ | Nous Portal (inference API) |
| `SUPABASE_URL` | opsional | persistence off bila kosong |
| `SUPABASE_SERVICE_ROLE_KEY` | opsional | idem |
| `TYPESAFE_API_KEY` | opsional | gate Jev; fallback keyword bila kosong |
| `NOUS_MODEL` | opsional | default `minimax/minimax-m3.1-flash` |

## Menjalankan

```bash
npm install
TELEGRAM_BOT_TOKEN=... NOUS_API_KEY=... npm start
```

## Deploy di Coolify

1. Buat repo / upload folder ini (atau dockerize)
2. Coolify → Add Resource → Docker Image / Git
3. Set env vars di atas → Deploy (long-polling jalan di port berapa pun, tidak perlu port exposure)
