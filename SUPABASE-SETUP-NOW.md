# Setup Supabase — Undangan Erzal & Dhea

**Status sekarang:** Form RSVP & ucapan masih **mode demo** (data tidak tersimpan).  
**Yang Anda butuhkan:** 1 token Supabase (gratis), ~5 menit.

---

## Cara termudah (otomatis) — disarankan

### Langkah 1 — Login Supabase

1. Buka: **https://supabase.com/dashboard/sign-in**
2. Masuk pakai **GitHub** atau **email** (buat akun gratis jika belum punya).
3. Setelah masuk, Anda akan melihat dashboard Supabase.

> **Tampilan:** Halaman putih/hijau dengan tombol "Sign in with GitHub" atau form email.

---

### Langkah 2 — Buat Access Token

1. Buka: **https://supabase.com/dashboard/account/tokens**
2. Klik tombol **"Generate new token"** (hijau, di kanan atas).
3. Isi nama token: `wedding-erzal-dhea`
4. Klik **Generate token**.
5. **Copy** token yang muncul — dimulai dengan `sbp_` (contoh: `sbp_abc123...`).

> **Penting:** Token hanya muncul sekali. Simpan dulu di Notes jika perlu.  
> **Jangan** share token ke publik — hanya untuk setup ini.

---

### Langkah 3 — Kirim token ke Cursor

**Pilih salah satu:**

**Opsi A — Paste di chat Cursor (paling mudah)**  
Ketik di chat: `Token saya: sbp_...` (paste token lengkap).  
AI akan menjalankan setup otomatis untuk Anda.

**Opsi B — Jalankan sendiri di Terminal**  
Buka Terminal di Cursor, lalu jalankan (ganti `PASTE_DISINI` dengan token Anda):

```bash
cd /Users/acim.agwengmail.com/Projects/wedding-invitation
SUPABASE_ACCESS_TOKEN=sbp_PASTE_DISINI node scripts/supabase-autosetup.mjs
```

---

### Langkah 4 — Tunggu selesai (~1–2 menit)

Anda akan melihat pesan seperti:

```
=== Supabase auto-setup: Erzal & Dhea wedding ===
Creating project "erzal-dhea-wedding"…
Project is healthy.
Schema applied.
Test INSERT succeeded.
=== Setup complete ===
```

Jika ada error merah, screenshot dan kirim ke chat Cursor.

---

### Langkah 5 — Deploy (AI bisa bantu)

Setelah setup berhasil, config sudah terisi. Deploy ke internet:

```bash
cd /Users/acim.agwengmail.com/Projects/wedding-invitation
git add js/config.js admin/config.js
git commit -m "Configure Supabase for RSVP and wishes"
git push origin main
npx vercel --prod --yes
```

Atau minta AI di Cursor: *"deploy sekarang"*.

---

## Apa yang terjadi setelah token diproses?

| Yang dibuat | Detail |
|-------------|--------|
| Project Supabase | Nama: `erzal-dhea-wedding`, region: Singapore |
| Tabel database | `rsvp_responses` (RSVP tamu) + `wishes` (ucapan) |
| Akun admin | Email: `admin@erzal-dhea.wedding` + password acak |
| File kredensial | `supabase/ADMIN-CREDENTIALS.local.md` (hanya di komputer Anda) |
| Config website | `js/config.js` dan `admin/config.js` terisi URL + key |
| Form undangan | **Berhenti mode demo** — RSVP & ucapan tersimpan ke database |
| Login admin | https://erzal-dhea-wedding.vercel.app/admin/ |

Password admin ada di file `supabase/ADMIN-CREDENTIALS.local.md` — **jangan di-commit ke Git**.

---

## Alternatif: Setup manual (tanpa token)

Jika tidak mau pakai token otomatis:

### 1. Buat project di Supabase

1. Buka: **https://supabase.com/dashboard/new/new-project**
2. Nama: `erzal-dhea-wedding`
3. Region: **Southeast Asia (Singapore)**
4. Buat password database (simpan di Notes)
5. Klik **Create new project** — tunggu ~2 menit

### 2. Jalankan schema SQL

1. Di dashboard project → **SQL Editor** (menu kiri)
2. Klik **New query**
3. Buka file `supabase/schema.sql` di project ini, copy semua isinya
4. Paste di SQL Editor → klik **Run**

### 3. Ambil URL & anon key

1. **Settings** → **API** (menu kiri)
2. Copy **Project URL** (contoh: `https://abcdefgh.supabase.co`)
3. Copy **anon public** key (panjang, dimulai `eyJ...`)

### 4. Jalankan script interaktif

```bash
cd /Users/acim.agwengmail.com/Projects/wedding-invitation
./scripts/supabase-quick-setup.sh
```

Ikuti pertanyaan di terminal (paste URL dan anon key).  
Opsional: buat user admin dengan service_role key.

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| "Missing SUPABASE_ACCESS_TOKEN" | Token belum di-set. Ulangi Langkah 2–3. |
| "No Supabase organizations" | Buat organization dulu di dashboard (gratis). |
| Form masih "Mode demo" | Deploy belum jalan — push config + `npx vercel --prod` |
| Login admin gagal | Cek password di `supabase/ADMIN-CREDENTIALS.local.md` |
| Token expired | Buat token baru di halaman tokens |

---

## Link penting

- Login: https://supabase.com/dashboard/sign-in
- Buat token: https://supabase.com/dashboard/account/tokens
- Undangan live: https://erzal-dhea-wedding.vercel.app/
- Admin dashboard: https://erzal-dhea-wedding.vercel.app/admin/

---

**Langkah Anda sekarang:** Buka link token → buat token `wedding-erzal-dhea` → kirim `sbp_...` ke chat Cursor.
