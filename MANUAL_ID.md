# Mantra POS — Buku Panduan (Indonesia)

Buku kas untuk **satu toko: Mantra Lombok**. Aplikasi selalu terhubung ke database cloud. Tidak ada mode lokal, dan tidak ada usaha kedua yang harus disiapkan.

## Apa ini

Buku kas sewa motor di browser. Staf mencatat uang masuk dan uang keluar, menjalankan shift, dan melihat shift yang sudah ditutup. Ini bukan sistem stok, tidak mencetak struk, dan tidak menghitung pajak.

Dua peran:

| Peran | Bisa |
|------|------|
| Admin | Pengaturan, pengguna, edit dan hapus transaksi, hapus riwayat shift, tutup shift, ekspor |
| Kasir | Catat dan edit transaksi, tutup shift, ekspor |

## Pertama kali di satu perangkat

1. Buka aplikasi dan masukkan kode akses. Kode itu hanya membuka browser ini. Kode itu tidak mereset PIN.
2. Tempel publishable key proyek Mantra Lombok. Alamat proyeknya sudah tetap. Satu key, satu toko.
3. Kalau toko belum disiapkan, isi nama brand, nama admin, **email admin**, dan PIN 4–6 digit.

Kategori sewa motor sudah disiapkan. Staf lain ditambah nanti di Kelola Pengguna.

## Satu shift

1. **Mulai shift.** Pilih yang bertugas, isi kas di laci, dan masukkan PIN orang itu (admin boleh memakai PIN sendiri).
2. **Catat** pemasukan dan pengeluaran saat terjadi. Sewa, TarikTunai, dan PETTY-CASH punya tombol sendiri dan menulis kedua barisnya sekaligus.
3. **Tutup shift.** Isi hitungan kas, kartu, transfer, dan QRIS. Kalau ada selisih, catatan wajib diisi. Setelah dikonfirmasi, shift tersimpan dan daftar yang terbuka dikosongkan.

Layar dan database sepakat apakah shift masih terbuka. Kalau koneksi putus saat menutup, shift tetap tertutup di layar ini dan penutupan dikirim lagi saat koneksi kembali.

## Transaksi di shift yang berjalan

Saring menurut tipe, kategori, dan metode. Kotak cari mencocokkan deskripsi, kategori, staf, metode, dan catatan (termasuk nama tamu dan plat pada sewa). Daftar menampilkan **25 baris per halaman**.

## Pengguna dan PIN

Admin wajib punya email. Kasir boleh punya email; kalau tidak, admin yang mengatur PIN-nya di Kelola Pengguna.

**Lupa PIN**

1. Di layar masuk, pilih Lupa PIN lalu pilih orangnya.
2. Kalau ada email, aplikasi mengirim tautan reset ke **alamat orang itu** (email Supabase Auth). Buka tautannya, atau ketik kode dari email yang sama, lalu buat PIN baru.
3. Kalau kasir tidak punya email, admin yang mengatur PIN. Tidak ada kode reset bersama.

## Laporan

Ikon riwayat membuka Laporan. Yang tampil adalah **50 shift terakhir yang ditutup**. Shift yang lebih lama dihapus. Saring menurut tanggal, cari menurut staf, catatan, plat, atau deskripsi, dan pindah halaman **10 shift per halaman**. Grafik mengikuti rentang tanggal. Admin menghapus shift hanya setelah memasukkan PIN-nya.

## Offline

Saat browser offline, transaksi baru, edit, hapus, dan tutup shift disimpan di perangkat ini dan dikirim saat koneksi kembali. Spanduk menunjukkan berapa perubahan yang menunggu.

## Ekspor

Ekspor Excel pada shift yang berjalan, atau ekspor satu shift tertutup dari Laporan. Menutup shift juga mengunduh CSV shift itu.
