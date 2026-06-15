# Review Situs Undangan — Erzal & Dhea

**URL:** https://erzal-dhea-wedding.vercel.app  
**Tanggal review:** 15 Juni 2026  
**Reviewer:** Tim pengembangan

---

## Skor Kategori (1–10)

| Kategori | Skor | Catatan |
|----------|------|---------|
| Visual design & tema | **9** | Tema Masjidil Haram + aksen Sunda harmonis; gold frames, glass morphism, ornamen Islami konsisten |
| Mobile experience | **8** | Responsif baik; autoscroll & musik berfungsi; beberapa animasi 3D dinonaktifkan di layar kecil (disengaja) |
| Kelengkapan konten | **8** | Nama, orang tua, timeline cinta, jadwal akad/resepsi, lokasi lengkap; beberapa teks placeholder (RSVP/share) masih Lorem ipsum |
| Fitur (musik, autoscroll, 3D, RSVP, ucapan, admin) | **9** | Semua fitur inti aktif; Supabase terhubung (bukan demo); admin dashboard tersedia |
| Performa | **7** | CDN untuk library berat (Three.js, GSAP); 6 foto strategis (bukan galeri penuh) menjaga beban wajar |

**Skor rata-rata: 8.2 / 10**

---

## Yang Sudah Berfungsi dengan Baik

- **Envelope opening** — animasi 3D + gesture buka undangan memicu musik (iOS-safe)
- **Musik latar** — YouTube IFrame API, mulai di detik **24** (`START_SECONDS = 24`)
- **Autoscroll sinematik** — gulir otomatis per section dengan ring countdown; ketuk = lanjut ke section berikutnya; tahan = matikan/nyalakan
- **Beat sync** — ornamen & partikel mengikuti BPM 75
- **Countdown** — menuju Akad 13 Juli 2026 (Makkah, UTC+3)
- **Mempelai** — Erzal Maulana Sandrya & **Dhea Fadillah Ramlan** (ejaan benar); data orang tua tampil jelas dengan kontras teks diperbaiki
- **Love Story** — teks klien ditampilkan persis (2022 / 2024 / 2026) dengan foto childhood + milestone
- **Acara** — Akad 13 Juli 2026 Makkah; Resepsi 22 Juli 2026 Maxi's Resto Bandung 15:30–18:30 WIB
- **RSVP & Ucapan** — terhubung Supabase (`bebdiinqomsclynxvpbm.supabase.co`)
- **Admin** — `/admin/` untuk laporan tamu setelah login Auth
- **Lokasi** — Google Maps embed + link langsung
- **Share** — salin link & WhatsApp

---

## Yang Masih Kurang / Bisa Ditingkatkan

1. **Teks placeholder** — deskripsi RSVP, share, dan beberapa placeholder form masih "Lorem ipsum"
2. **Instagram mempelai** — link `#` belum diisi username asli
3. **Galeri penuh** — sengaja tidak diaktifkan; 6 foto tersebar di hero, couple, story, resepsi (lebih ringan)
4. **Foto profesional** — foto klien casual; disarankan sesi pre-wedding untuk hero/OG image
5. **RSVP deadline** — "15 Juli 2026" disebutkan tapi belum ada validasi tanggal di form
6. **Bahasa** — timeline cinta dalam bahasa Inggris (sesuai teks klien); bisa ditambah terjemahan ID jika diinginkan
7. **OG image** — masih menggunakan background Masjidil Haram, bukan foto pasangan

---

## Rekomendasi Sebelum Serah ke Klien

1. Ganti semua teks Lorem ipsum dengan copy final bahasa Indonesia/Inggris
2. Isi link Instagram Erzal & Dhea
3. Konfirmasi ejaan **Fadillah** (bukan Fadhillah) di semua materi cetak
4. Uji RSVP & ucapan dari 2–3 perangkat tamu nyata
5. Bagikan kredensial admin Supabase secara aman ke pasangan
6. Pertimbangkan foto `og.jpg` untuk share WhatsApp yang lebih personal
7. Brief tamu: ketuk tombol film (kiri bawah) untuk lanjut cepat; tahan untuk matikan autoscroll

---

## Verifikasi Teknis

| Item | Status |
|------|--------|
| Supabase (bukan demo) | ✅ URL & anon key di `js/config.js` |
| Musik start 24s | ✅ `START_SECONDS = 24` di `js/main.js` |
| Nama mempelai | ✅ Dhea **Fadillah** Ramlan |
| Tanggal akad | ✅ Senin, 13 Juli 2026 — Makkah |
| Tanggal resepsi | ✅ Rabu, 22 Juli 2026 — Maxi's Resto |
| Foto aktif | ✅ `PHOTOS_ENABLED: true` — 6 foto strategis |

---

*Dokumen ini dibuat otomatis sebagai bagian dari update deployment terbaru.*
