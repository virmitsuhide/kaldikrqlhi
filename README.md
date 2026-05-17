# Kaldik RQ LHI 🕌

**Kalender Akademik Rumah Qur'an — SIT Lukman Hakim Internasional Yogyakarta**

## Stack
- **Frontend**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS
- **Deploy**: Vercel

## Setup Lokal

### 1. Install dependencies
```bash
npm install
```

### 2. Environment variables
Salin `.env.local.example` ke `.env.local` dan isi:
```bash
cp .env.local.example .env.local
```

Isi nilai berikut dari Supabase Dashboard → Settings → API:
```
NEXT_PUBLIC_SUPABASE_URL=https://zjepegrykatcedecqdxu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon/publishable key dari Supabase>
```

### 3. Jalankan development server
```bash
npm run dev
```
Buka http://localhost:3000

## Deploy ke Vercel

1. Push ke GitHub
2. Buka vercel.com → Import project dari GitHub
3. Tambahkan Environment Variables di Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## API Endpoint

```
GET /api/calendar?year=2026
GET /api/calendar?year=2026&unit=SMP
GET /api/calendar?year=2026&unit=RQ,SD&month=3
```

Parameter:
- `year` (wajib): 2025–2028
- `unit` (opsional): SD | SMP | RQ | NASIONAL | all
- `month` (opsional): 1–12

## Tambah Admin User

Di Supabase Dashboard → Authentication → Users → Invite user
Setelah user dibuat, tambah ke tabel `profiles`:
```sql
INSERT INTO profiles (id, name, role, unit)
VALUES ('<user-uuid>', 'Nama Admin', 'admin', 'ALL');
```

## Struktur Folder

```
app/
├── page.tsx          # Kalender publik
├── login/page.tsx    # Halaman login
├── admin/page.tsx    # Dashboard admin
└── api/calendar/     # REST API endpoint

components/
├── Header.tsx        # Navigasi + login button
├── MonthCard.tsx     # Grid kalender per bulan
├── YearNav.tsx       # Navigasi tahun
├── UnitFilter.tsx    # Filter SD/SMP/RQ
└── EventModal.tsx    # Modal tambah agenda (admin)

lib/
└── supabase.ts       # Supabase client

types/
└── index.ts          # TypeScript types + helpers
```
