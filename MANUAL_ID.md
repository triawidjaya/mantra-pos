# Mantra POS — Buku Panduan (Indonesia)

Buku kas untuk **satu konter: Mantra Lombok**. Aplikasi selalu terhubung ke database cloud. Tidak ada mode lokal, dan tidak ada usaha kedua yang harus disiapkan.

## Apa ini

Buku kas sewa motor di browser. Staf mencatat uang masuk dan uang keluar, menjalankan shift, dan melihat shift yang sudah ditutup. Ini bukan sistem stok, tidak mencetak struk, dan tidak menghitung pajak.

Dua peran:

| Peran | Bisa |
|------|------|
| Admin | Pengaturan, pengguna, edit dan hapus transaksi, hapus riwayat shift, tutup shift, ekspor |
| Kasir | Catat dan edit transaksi, tutup shift, ekspor |

## Pertama kali di satu perangkat

1. Buka aplikasi dan masukkan kode akses. Kode itu hanya membuka browser ini. Kode itu tidak mereset PIN.
2. Tempel publishable key proyek Mantra Lombok. Alamat proyeknya sudah tetap. Satu key, satu konter.
3. Kalau konter belum disiapkan, isi nama brand, nama admin, **email admin**, dan PIN 4–6 digit.

Kategori sewa motor sudah disiapkan. Staf lain ditambah nanti di Kelola Pengguna.

## Satu shift

1. **Mulai shift.** Pilih yang bertugas, isi kas di laci, dan masukkan PIN orang itu (admin boleh memakai PIN sendiri).
2. **Catat** pemasukan dan pengeluaran saat terjadi. Sewa, TarikTunai, dan PETTY-CASH punya tombol sendiri dan menulis kedua barisnya sekaligus.
3. **Tutup shift** (sekali, di akhir bulan: pada tanggal terakhir atau di awal bulan berikutnya). Pilih **Sampai tanggal** (bawaannya hari ini); transaksi setelah tanggal itu tetap di shift berikutnya. Isi hitungan cash. Untuk Card, Transfer, dan QRIS, **kosongkan kolomnya** jika uangnya belum masuk rekening: ditandai **menunggu bank** dan bukan kurang. Isi jumlah dari bank nanti di Laporan > Rekonsiliasi Bank; shift yang sudah tertutup menampilkan banner sampai semua hari terisi. Kalau ada selisih pada jumlah yang dihitung, catatan wajib diisi. Setelah dikonfirmasi, shift tersimpan dan transaksi yang ditutup keluar dari daftar yang terbuka.

Konter menjalankan **satu shift untuk satu bulan penuh**, dari awal pembukuan sampai akhir bulan (28, 29, 30 atau 31 hari). Tidak ada buka dan tutup shift setiap hari. Shift ditutup sekali, di akhir bulan.

Layar dan database sepakat apakah shift masih terbuka. Kalau koneksi putus saat menutup, shift tetap tertutup di layar ini dan penutupan dikirim lagi saat koneksi kembali.

## TarikTunai dan PETTY-CASH

**TarikTunai (tamu menarik tunai).** Tamu membayar di EDC (nominal + 3% untuk Card) dan konter memberi cash dari cashbox. Isi **nominal yang diberikan ke tamu**, bukan nominal di EDC. Aplikasi menulis dua baris: Card (atau QRIS) masuk dan Cash keluar. Ini bukan penjualan. Uangnya masuk ke rekening keesokan harinya.

**PETTY-CASH (kas dari bank).** Dipakai saat uang diambil dari bank ke cashbox. Aplikasi menulis Card keluar dan Cash masuk sekaligus. **Catatan** boleh diisi, tulis untuk apa uang itu. Jangan dicatat sebagai pemasukan biasa: sisi banknya tidak tercatat dan saldo bank jadi salah.

## Transaksi di shift yang berjalan

Buka filter dengan ikon corong. Urutan isiannya: **Cari**, Jenis, Kategori, Metode, Dari tanggal, Sampai tanggal. Kotak cari mencocokkan deskripsi, kategori, staf, metode, dan catatan (termasuk nama tamu dan plat pada sewa). Pencarian dan tanggal langsung berlaku saat diketik atau dipilih. **Reset** mengosongkan semuanya. Daftar menampilkan **25 baris per halaman**.

Tanggal memakai hari yang tampil di tabel. Untuk mengoreksi sesuatu, saring ke hari itu, cari barisnya, lalu pakai tombol edit.

## Pengguna dan PIN

Admin wajib punya email. Kasir boleh punya email; kalau tidak, admin yang mengatur PIN-nya di Kelola Pengguna.

**Lupa PIN**

1. Di layar masuk, pilih Lupa PIN lalu pilih orangnya.
2. Kalau ada email, aplikasi mengirim tautan reset ke **alamat orang itu** (email Supabase Auth). Buka tautannya, atau ketik kode dari email yang sama, lalu buat PIN baru.
3. Kalau kasir tidak punya email, admin yang mengatur PIN. Tidak ada kode reset bersama.

## Laporan

Ikon grafik membuka Laporan. Pilih periode di bagian atas (Semua, Hari Ini, Minggu Ini, Bulan Ini, **Bulan Lalu**, atau Kustom). Pilihan itu berlaku untuk ketiga tab.

**Ringkasan** (tampil pertama)
- Grafik harian dengan pemasukan, pengeluaran, komisi dan saldo akhir. Tombol Download Excel ada di sini.
- **Ringkasan per kategori:** jumlah transaksi, masuk, keluar dan bersih untuk tiap kategori.
- **Tidak dihitung sebagai omzet:** START BALANCE, TarikTunai dan PETTY-CASH. Ini menggerakkan kas tetapi bukan penjualan atau biaya.
- **Pergerakan per metode** dan **ringkasan harian** lengkap dengan total.
- Ketuk kategori atau tanggal untuk membuka daftar di halaman utama yang sudah tersaring.

**Rekonsiliasi Bank** (mencocokkan Card, QRIS dan Transfer)
- Card, QRIS dan Transfer masuk ke bank setelah settlement EDC, biasanya **keesokan harinya**. Satu baris = satu **hari transaksi**.
- **Seharusnya (setelah potongan)** adalah uang yang seharusnya dibayar bank untuk hari itu: Card + biaya 3% yang ditagih ke penyewa, dikurangi potongan bank (1,8%); QRIS dikurangi potongan bank (0,7%); Transfer apa adanya. Tarifnya tampil di atas tabel dan bisa diubah admin.
- **Admin** mengisi **Masuk di rekening** tiap hari dari mutasi rekening. Baris menampilkan **Selisih**, dengan tanda centang hijau kalau cocok.
- Kalau settlement terlupa dan uang dua hari masuk sekaligus, isi totalnya di salah satu hari. Kolom **Kumulatif** tetap benar. Negatif berarti uang belum masuk.
- **Ditarik dari bank** (PETTY-CASH) hanya sebagai informasi. Itu penarikan di hari yang sama dan tidak masuk selisih.

**Daftar Shift**
- **50 shift terakhir yang ditutup**. Shift yang lebih lama dihapus. Cari menurut staf, catatan, plat, atau deskripsi, dan pindah halaman **10 shift per halaman**. Admin menghapus shift hanya setelah memasukkan PIN-nya.

## Bahasa dan tanggal

Tombol EN/ID mengganti seluruh aplikasi, termasuk tanggal dan jam di daftar dan di file Excel.

## Offline

Saat browser offline, transaksi baru, edit, hapus, dan tutup shift disimpan di perangkat ini dan dikirim saat koneksi kembali. Spanduk menunjukkan berapa perubahan yang menunggu.

## Ekspor

Ekspor Excel pada shift yang berjalan, ekspor satu shift tertutup dari Laporan, atau unduh tabel Ringkasan dan Rekonsiliasi Bank dari tab masing-masing. Menutup shift juga mengunduh CSV shift itu.
