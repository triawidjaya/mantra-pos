// ============================================================
// LANG MANAGER — EN/ID translations for all UI strings
// Usage: LangManager.t('key') or shorthand t('key')
// Switch: LangManager.toggle() or LangManager.set('en'|'id')
// ============================================================

const STRINGS = {
  en: {
    historyShift:'Report',appTitle:'CHILL POS APP',
    newTransaction:'New Transaction',exportExcel:'Export Excel',
    hideAll:'Hide All',showAll:'Show All',closeShift:'Close Shift',
    cashBalance:'Cash',cardBalance:'Card',transferBalance:'Transfer',qrisBalance:'QRIS',otherBalance:'Other',
    search:'Search',searchPlaceholder:'Description, category, staff...',
    reportSearchPlaceholder:'Staff, note, plate, description...',
    noSearchResults:'No matching rows',
    pagePrev:'Previous',pageNext:'Next',
    pageStatus: ({ start, end, total, page, pages }) => `${start}–${end} of ${total} · ${page}/${pages}`,
    filterType:'Type',filterAll:'All',filterIncome:'Income',filterOutgoing:'Outgoing',
    filterCategory:'Category',filterMethod:'Method',applyFilter:'Apply Filter',resetFilter:'Reset',
    colDateTime:'Date/Time',colType:'Type',colCategory:'Category',
    colDescription:'Description',colAmount:'Amount',colMethod:'Method',
    colNote:'Note',colStaff:'Staff',colAction:'Action',
    newTransactionTitle:'New Transaction',editTransactionTitle:'Edit Transaction',
    transactionType:'Transaction Type',income:'Income',outgoing:'Outgoing',
    category:'Category',other:'Other...',paymentMethod:'Payment Method',
    staff:'Staff',description:'Description',amount:'Amount',
    note:'Note (Optional)',cancel:'Cancel',close:'Close',save:'Save',saving:'Saving...',
    settings:'Settings',brandName:'Brand Name',brandLogo:'Business Logo',brandLogoHint:'Auto-converted to PNG',
    categoriesPerLine:'Categories',staffPerLine:'Staff',
    resetDefault:'Reset Default',
    startShift:'Start Shift',staffOnDuty:'Staff on Duty',
    initialCashBalance:'Initial Cash Balance',startShiftBtn:'Start Shift',
    cashHint:'Physical cash currently in the till.',
    cashPlaceholder:'e.g. 500.000',
    accessGateTitle:'Restricted Access',
    accessGateHint:'Enter the access code to continue.',
    accessGateCode:'Access Code',
    accessGateError:'Wrong code. Try again.',
    accessGateSubmit:'Enter',
    useLastShiftCash:(amt) => `Use last shift's cash (${amt})`,
    commonAmounts:'Quick fill',
    shiftPinHint:(name) => `Enter PIN for ${name} to start the shift.`,
    shiftPinHintAdmin:(name) => `Enter PIN for ${name}, or your admin PIN to override.`,
    shiftPinNoPin:(name) => `${name} has no PIN set. Ask an admin to set a PIN first.`,
    shiftPinNoPinAdmin:'Target user has no PIN. Enter your admin PIN to start anyway.',
    alertShiftPinRequired:'PIN is required to start the shift.',
    alertShiftPinWrong:'Wrong PIN.',
    alertShiftPinNoPin:'This staff has no PIN set. An admin must set their PIN before they can start a shift.',
    closeShiftTitle:'Close Shift',closeShiftHint:'Verify the actual balance for each payment method.',
    actualCash:'Actual Cash',actualCard:'Actual Card',actualTransfer:'Actual Transfer',actualQris:'Actual QRIS',
    closingNote:'Closing Note',closingNoteOptional:'Optional — add a note if needed.',
    closingNoteRequired:'Required — please explain the difference.',
    alertNoteRequired:'Please provide a note explaining the difference before closing the shift.',
    back:'Back',viewSummary:'View Summary',confirmClose:'Close Shift',
    shiftSummary:'📊 Shift Closing Summary',method:'Method',
    expected:'Expected',actual:'Actual',difference:'Difference',
    exact:'✓ Exact',over:'(over)',short:'(short)',
    totalExpected:'Total Expected:',
    balanceReset:'* Balance will be reset to 0 after shift is closed',
    confirmDefault:'Are you sure?',yes:'Yes',
    confirmResetDefault:'Reset brand and categories to default? Enter your admin PIN to confirm.',resetPinWrong:'Wrong admin PIN. Reset cancelled.',
    historyTitle:'Report',selectAll:'Select All',
    deleteSelected:'Delete Selected',noHistory:'Nothing to report yet.',
    deletePinLabel:'Admin PIN',
    deletePinWrong:'Wrong admin PIN. Nothing was deleted.',
    noHistoryHint:'History will appear after the first shift is closed.',
    transactions:'transactions',cashExpected:'Cash (Expected)',
    cardExpected:'Card (Expected)',transferExpected:'Transfer (Expected)',qrisExpected:'QRIS (Expected)',totalSaldo:'Total Expected',
    exportExcelBtn:'Export Excel',exportCsvBtn:'Export CSV',
    noTransactions:'No transactions',
    alertStartShiftFirst:'Please start a shift first!',
    alertShiftStarted:'Shift started! Initial cash:',
    alertShiftClosed:'Shift closed and history saved.',
    alertNoShift:'No transactions to close!',
    alertNoTransactions:'No transactions to export!',
    alertSelectType:'Please select a transaction type!',
    alertFillForm:'Description and Amount are required!',
    alertStorageFull:'⚠️ Storage full! Close shift to free up space.',
    alertSaved:'Transaction saved!',alertUpdated:'Transaction updated!',
    alertDeleted:'Transaction deleted!',alertExcelOk:'Excel export successful!',
    alertExcelFail:'Excel export failed!',alertSettingsSaved:'Settings saved.',alertInvalidImage:'Invalid image file.',
    alertSettingsReset:'Settings reset to default.',
    alertCategoryEmpty:'Categories and staff cannot be empty!',
    alertDeleteShift:(n) => `Delete ${n} selected shift(s)? This cannot be undone.`,
    alertShiftsDeleted:'Selected shifts deleted.',
    confirmDeleteShiftSingle:(date) => `Delete this shift (closed ${date})? This cannot be undone.`,
    deleteShift:'Delete Shift',
    noTransactionsTable:'No transactions',
    noResults:(q) => `No results for "${q}"`,
    kembali:'Back',
    welcomeTitle:"Welcome! Let's set up your POS",
    welcomeHint:'Scooter-rental categories are ready. Add staff and change categories later in Settings.',
    frAdminName:'Admin name',frFillBrandAdmin:'Fill in the brand name and admin name.',
    finishSetup:'Finish Setup',
    // Auth
    loginTitle:'Sign In',signIn:'Sign In',selectUser:'Select User',enterPin:'Enter PIN',
    forgotPin:'Forgot PIN?',
    resetPinTitle:'Reset PIN',
    resetPinHint:'We email a reset link to that person. Open the link, or type the code from the same email.',
    resetPinChooseHint:(name) => `Choose a new PIN for ${name}.`,
    resetPinSent:(email) => `Reset email sent to ${email}.`,
    resetPinSentHint:'Open the link in the email, or type the code from that email below and press the button again.',
    sendResetLink:'Send reset link',
    resetPinCode:'Code from the email (optional)',
    resetPinCodeWrong:'That code is not valid. Send a new link and try again.',
    resetPinSendFailed:'Could not send the reset email.',
    resetPinEmailMismatch:'That email is not on a staff account.',
    resetPinNoEmailAdmin:'This admin has no email yet. Another admin must add one in Manage Users.',
    resetPinNoEmailCashier:'This cashier has no email. An admin sets the PIN in Manage Users.',
    newPin:'New PIN (4-6 digits)',
    resetPinBtn:'Reset PIN',
    email:'Email',
    emailHint:'Required for an admin. A cashier can leave this empty; an admin then sets their PIN.',
    emailNone:'No email',
    setEmail:'Set email',
    emailPrompt:'Email address (leave empty to clear a cashier):',
    invalidEmail:'Enter a valid email address.',
    adminEmailRequired:'An admin needs an email address.',
    emailInUse:'That email is already used by another user.',
    syncCloseFailed:'Shift close has not reached the server yet. It stays closed here and will keep retrying.',
    shiftClosePending:'A shift close is already waiting to sync. Wait for it before closing again.',
    wrongAccessCode:'Wrong access code.',
    alertPinReset:'PIN reset successfully. Please sign in.',
    adminUser:'Admin User (from staff list above)',adminPin:'Admin PIN (4-6 digits)',
    confirmPin:'Confirm PIN',pinMismatch:'PIN does not match',pinTooShort:'PIN must be 4-6 digits',
    usersTitle:'Manage Users',addUser:'Add User',userExists:'Username already exists',
    cannotDeleteLastAdmin:'Cannot delete the last admin user',
    cannotDemoteLastAdmin:'Cannot change role — at least one admin is required',
    roleAdmin:'Admin',roleCashier:'Cashier',pinSet:'PIN set',pinNone:'No PIN',
    setPin:'Set PIN',resetPin:'Reset PIN',removePin:'Remove PIN',
    logout:'Sign Out',loggedInAs:'Signed in as',noPermission:'You do not have permission for this action',
    wrongPin:'Wrong PIN',userNotFound:'User not found',
    setupAdminTitle:'Set Up Admin Account',
    setupAdminHint:'Existing data found. Please choose an admin user and set a PIN to continue.',
    username:'Username',role:'Role',pin:'PIN',
    confirmDeleteUser:(n) => `Delete user "${n}"? This cannot be undone.`,
    userDeleted:'User deleted',userCreated:'User created',userUpdated:'User updated',
    // Settings UI polish
    staffViewOnly:'Staff (managed via Manage Users — view only)',
    dateRange:'Date',dateAll:'All',dateToday:'Today',dateWeek:'This Week',dateMonth:'This Month',dateCustom:'Custom...',
    chartTitle:'Daily cash flow',chartIncome:'Income',chartOutgoing:'Outgoing',chartNoData:'No transactions yet',
    chartNet:'Net',chartCommission:'Commission',chartAvgDay:'Avg net / day',chartEndBalance:'Ending balance',chartBalance:'Balance (end of day)',
    chartScopeAll:'All methods',chartScopeCash:'Cash only',
    chartExport:'Download Excel',xlDaily:'Daily',xlMethodSheet:'Method movement',xlSummary:'Summary',xlTransactions:'Transactions',xlDate:'Date',xlDay:'Day',xlTxCount:'Transactions',xlTotal:'Total',xlPeriod:'Period',xlScope:'Methods',xlOpening:'Opening balance',xlDays:'Days',xlDateTime:'Date/Time (WITA)',xlType:'Type',xlCategory:'Category',xlNonRevenue:'Non-revenue',xlYes:'Yes',xlNo:'No',xlDesc:'Description',xlAmount:'Amount',xlMethod:'Method',xlNote:'Note',xlStaff:'Staff',
    xlNoteSummary:'Income and outgoing leave out non-revenue categories (START BALANCE, TarikTunai, PETTY-CASH, CashBon). Ending balance = opening balance + net + non-revenue movements.',
    chartNote:'Income and outgoing leave out non-revenue categories (START BALANCE, TarikTunai, PETTY-CASH, CashBon). The balance line includes them, because they move money. Hover a day for details.',
    noResultsRange:'No shifts in this date range',
    helpTitle:'Quick Start Guide',
    helpReadFirst:'Read Quick Start Guide first',
    helpBody:`
<h3><i class="fas fa-rocket"></i> First-time setup</h3>
<ol>
  <li>When you first open the app, the <b>Welcome wizard</b> appears.</li>
  <li>Fill in your <b>brand name</b>, the <b>admin name</b>, the <b>admin email</b>, then set a <b>4-6 digit PIN</b>.</li>
  <li>Scooter-rental categories are set up for you. Add other staff later in <b>Manage Users</b>.</li>
  <li>Click <b>Finish Setup</b>. You'll be auto-logged in as Admin and the Start Shift screen appears.</li>
</ol>

<h3><i class="fas fa-user-lock"></i> Login &amp; roles</h3>
<ul>
  <li><b>Admin</b> can manage settings, users, edit/delete transactions, delete shift history.</li>
  <li><b>Cashier</b> can only create transactions, close shift, and export. No settings, no edit/delete.</li>
  <li>Cashiers without a PIN can log in by just selecting their name. Admin can set PINs later via <b>Manage Users</b>.</li>
  <li>Switch user via the user button in the header (top right) → Sign Out.</li>
</ul>

<h3><i class="fas fa-play-circle"></i> Daily flow</h3>
<ol>
  <li><b>Start Shift:</b> enter the actual cash you start with. Saved as a START BALANCE transaction.</li>
  <li><b>Add transactions</b> as they happen. Pick Income or Outgoing, fill amount + category + payment method.</li>
  <li><b>Close Shift</b> at the end: enter actual cash &amp; card → see expected vs actual → confirm.</li>
  <li>Shift is auto-saved to <b>history</b> (max 50 shifts kept). CSV is auto-downloaded.</li>
</ol>

<h3><i class="fas fa-users-cog"></i> Managing users</h3>
<ul>
  <li>Open <b>Settings</b> (gear icon) → <b>Manage Users</b>.</li>
  <li>Add new user: username + role + email + optional PIN. Admin email is required. A cashier can have no email.</li>
  <li>Pen icon = rename. Envelope = email. Key icon = set/reset PIN. Trash = delete.</li>
  <li>You can't delete or demote the last admin. You can't delete yourself.</li>
</ul>

<h3><i class="fas fa-tags"></i> Managing categories</h3>
<ul>
  <li>Open <b>Settings</b> → categories shown as a card list.</li>
  <li>Drag the handle on the left to reorder. Click pen to rename, X to delete.</li>
  <li><b>START BALANCE</b> is locked — required by the shift logic, can't be deleted.</li>
</ul>

<h3><i class="fas fa-shield-alt"></i> Important notes</h3>
<ul>
  <li>Mantra Lombok is always connected to its cloud database. The last 50 closed shifts are kept.</li>
  <li><b>Forgot PIN?</b> On the login screen choose the person. If they have an email, we send a reset link to that address. A cashier with no email asks an admin to set the PIN.</li>
  <li>While offline, new transactions, edits, deletes, and closing the shift stay on this device and sync when the connection returns.</li>
  <li>Open <code>history.html</code> to see closed shifts and re-export their data.</li>
</ul>
`,
    addCategory:'Add Category',
    addCategoryPrompt:'Enter new category name:',
    renameCategoryPrompt:'Rename category:',
    categoryExists:'Category already exists',
    systemBadge:'system',
    catTypeLabel:'Shows under Income, Outgoing, or both',
    catTypeBoth:'In & out',
    catTypeIncome:'Income',
    catTypeOutgoing:'Outgoing',
    renameUserPrompt:'New username:',
    offlineBanner:'Offline — connection lost. New transactions, edits, deletes, and shift close stay on this device and sync when you reconnect.',
    offlineQueued:'Offline — {n} change(s) waiting to sync.',
    syncingQueued:'Syncing {n} change(s)…',
    // ── Admin approval categories ──
    adminApprovalRequired:'Admin approval required',
    adminApprovalHint:'This category requires an admin to approve. Pick an admin and enter their PIN.',
    adminCategoriesLabel:'Categories that require admin approval',
    adminCategoriesHint:'Cashier must enter an admin PIN to record transactions in checked categories.',
    wrongAdminPin:'Wrong admin PIN. Transaction not saved.',
    // ── Non-revenue categories ──
    nonRevenueCategoriesLabel:'Non-Revenue Categories',
    nonRevenueCategoriesHint:'Checked categories are excluded from revenue totals. Use for cash transfers, employee loans, or opening balance.',
    revenueBreakdown:'Revenue Breakdown',
    shiftRevenue:'Revenue',
    shiftOperatingExpense:'Operating Expense',
    shiftNetRevenue:'Net Revenue',
    shiftNonRevenue:'Non-Revenue (Cash Movements)',
    // ── Supabase / cloud sync ──
    sbSetupTitle:'Connect to Cloud',
    sbSetupHint:'Paste the Publishable Key of the Mantra Lombok POS project. Needed once per device.',
    sbKeyWhere:'Supabase → Mantra Lombok POS → Project Settings → API Keys.',
    sbSetupConnect:'Connect',
    noSupabaseUseBasic:'',
    supabaseSection:'Cloud Backend (Supabase)',
    supabaseHint:'Get these from your Supabase project: Settings → Data API (URL) and API Keys (Publishable key).',
    supabaseUrl:'Supabase Project URL',
    supabaseKey:'Publishable Key',
    invalidSupabaseUrl:'Invalid Supabase URL. Expected format: https://xxxx.supabase.co',
    invalidSupabaseKey:'Invalid publishable key. Expected to start with "sb_publishable_" or "eyJ".',
    sbErrorTitle:'Cloud Connection Error',
    sbErrorHint:'Could not connect to Supabase. Check your internet connection and the Publishable Key.',
    sbErrorRetry:'Retry',
    sbErrorReset:'Reset & Reconfigure',
    confirmResetSupabase:'Reset Supabase config and reload? You will be asked to enter the URL + key again.',
    remoteLogout:'Signed out from another device.',
    newRental:'Rental',
    cashoutBtn:'TarikTunai',
    cashoutTitle:'TarikTunai',
    cashoutEditTitle:'Edit TarikTunai',
    cashoutAmount:'Amount',
    cashoutIn:'Money in',
    cashoutPickedMethod:'Method',
    recordedAs:'category',
    cashoutSaved:'Cash out saved. The incoming payment and the cash paid out were recorded together.',
    cashoutUpdated:'Cash out updated. Both rows were saved.',
    cashoutDeleted:'Cash out deleted. The incoming payment and the cash paid out were both removed.',
    confirmDeleteCashout:'Delete this cash out? The incoming payment and the cash paid out are both removed.',
    cashoutFill:'Enter the amount, choose how the money comes in, and write a note.',
    cashoutNote:'Note',
    cashoutNotePh:'Why is cash withdrawn? e.g. change for a guest',
    bankBtn:'Cash from bank',
    bankTitle:'Cash from bank',
    bankEditTitle:'Edit cash from bank',
    bankAmount:'Amount',
    bankSaved:'Cash from bank saved. The card balance went down and the cash box went up by the same amount.',
    bankUpdated:'Cash from bank updated. Both rows were saved.',
    bankDeleted:'Cash from bank deleted. The card decrease and the cash increase were both removed.',
    confirmDeleteBank:'Delete this cash from bank? The card decrease and the cash increase are both removed.',
    bankFill:'Enter the amount.',
    bankNote:'Card → Cash box',
    rentalTitle:'Rental Payment',
    rentalEditTitle:'Edit rental',
    rentalDayOne:'day',
    rentalDayMany:'days',
    confirmDeleteRental:'Delete this rental? The guest income and the owner share are removed together.',
    rentalDeleted:'Rental deleted. Guest income and owner share were both removed.',
    rentalUpdated:'Rental updated. Both rows were saved.',
    rentalDuration:'Duration',
    rentalHours:'Hours',
    rentalDays:'Days',
    rentalQty:'How many',
    rentalGuestPrice:'Guest price',
    rentalGuestMethod:'Guest payment',
    rentalOwnerCashHint:'One save writes the guest income and the owner share. The note includes guest name, plate, days, and owner.',
    rentalPayAmount:'Amount guest pays',
    rentalMethod:'Method',
    rentalPickMethod:'Choose method',
    rentalDayCount:'Number of days',
    rentalOwnerField:'Owner',
    rentalOwnerReceives:'Amount the owner receives',
    rentalPlate:'Motorcycle plate',
    rentalGuestName:'Guest name',
    rentalSaved:'Rental saved. Guest income and owner share were recorded together.',
    rentalSavedNoShare:'Rental saved. Owner share is 0, so only the guest income was recorded.',
    rentalFillForm:'Enter guest name, amount paid, a payment method, plate, number of days, owner, the amount the owner receives (0 if nothing goes to the owner), and the owner payment method.',
    rentalPerHour:'/ hour',
    rentalPerDay:'/ day',
    rentalShareEach:'each',
  },
  id: {
    historyShift:'Laporan',appTitle:'CHILL POS APP',
    newTransaction:'Transaksi Baru',exportExcel:'Export Excel',
    hideAll:'Sembunyikan',showAll:'Tampilkan',closeShift:'Tutup Shift',
    cashBalance:'Cash',cardBalance:'Card',transferBalance:'Transfer',qrisBalance:'QRIS',otherBalance:'Lainnya',
    search:'Cari',searchPlaceholder:'Deskripsi, kategori, staff...',
    reportSearchPlaceholder:'Staff, catatan, plat, deskripsi...',
    noSearchResults:'Tidak ada yang cocok',
    pagePrev:'Sebelumnya',pageNext:'Berikutnya',
    pageStatus: ({ start, end, total, page, pages }) => `${start}–${end} dari ${total} · ${page}/${pages}`,
    filterType:'Jenis',filterAll:'Semua',filterIncome:'Pemasukan',filterOutgoing:'Pengeluaran',
    filterCategory:'Kategori',filterMethod:'Metode',applyFilter:'Terapkan Filter',resetFilter:'Reset',
    colDateTime:'Tanggal/Waktu',colType:'Jenis',colCategory:'Kategori',
    colDescription:'Deskripsi',colAmount:'Jumlah',colMethod:'Metode',
    colNote:'Keterangan',colStaff:'Staff',colAction:'Aksi',
    newTransactionTitle:'Transaksi Baru',editTransactionTitle:'Edit Transaksi',
    transactionType:'Jenis Transaksi',income:'Pemasukan',outgoing:'Pengeluaran',
    category:'Kategori',other:'Lainnya...',paymentMethod:'Metode Pembayaran',
    staff:'Staff',description:'Deskripsi',amount:'Jumlah',
    note:'Keterangan (Opsional)',cancel:'Batal',close:'Tutup',save:'Simpan',saving:'Menyimpan...',
    settings:'Pengaturan',brandName:'Nama Brand',brandLogo:'Logo Usaha',brandLogoHint:'Otomatis diubah ke PNG',
    categoriesPerLine:'Kategori',staffPerLine:'Staff',
    resetDefault:'Reset Default',
    startShift:'Mulai Shift',staffOnDuty:'Staff Bertugas',
    initialCashBalance:'Saldo Cash Awal',startShiftBtn:'Mulai Shift',
    cashHint:'Jumlah uang fisik di laci saat ini.',
    cashPlaceholder:'Misal: 500.000',
    accessGateTitle:'Akses Terbatas',
    accessGateHint:'Masukkan kode akses untuk melanjutkan.',
    accessGateCode:'Kode Akses',
    accessGateError:'Kode salah. Coba lagi.',
    accessGateSubmit:'Masuk',
    useLastShiftCash:(amt) => `Gunakan saldo akhir shift lalu (${amt})`,
    commonAmounts:'Pilih cepat',
    shiftPinHint:(name) => `Masukkan PIN ${name} untuk memulai shift.`,
    shiftPinHintAdmin:(name) => `Masukkan PIN ${name}, atau PIN admin Anda untuk override.`,
    shiftPinNoPin:(name) => `${name} belum punya PIN. Minta admin untuk set PIN terlebih dahulu.`,
    shiftPinNoPinAdmin:'User target belum punya PIN. Masukkan PIN admin Anda untuk tetap memulai.',
    alertShiftPinRequired:'PIN wajib diisi untuk memulai shift.',
    alertShiftPinWrong:'PIN salah.',
    alertShiftPinNoPin:'Staff ini belum punya PIN. Admin harus set PIN dulu sebelum bisa mulai shift.',
    closeShiftTitle:'Tutup Shift',closeShiftHint:'Verifikasi saldo aktual untuk setiap metode pembayaran.',
    actualCash:'Aktual Cash',actualCard:'Aktual Card',actualTransfer:'Aktual Transfer',actualQris:'Aktual QRIS',
    closingNote:'Catatan Penutupan',closingNoteOptional:'Opsional — tambahkan catatan jika diperlukan.',
    closingNoteRequired:'Wajib — mohon jelaskan alasan selisih.',
    alertNoteRequired:'Mohon berikan catatan alasan selisih sebelum menutup shift.',
    back:'Kembali',viewSummary:'Lihat Summary',confirmClose:'Tutup Shift',
    shiftSummary:'📊 Summary Penutupan Shift',method:'Metode',
    expected:'Expected',actual:'Aktual',difference:'Selisih',
    exact:'✓ Pas',over:'(lebih)',short:'(kurang)',
    totalExpected:'Total Expected:',
    balanceReset:'* Saldo akan direset ke 0 setelah shift ditutup',
    confirmDefault:'Apakah Anda yakin?',yes:'Ya',
    confirmResetDefault:'Reset brand & kategori ke default? Masukkan PIN admin Anda untuk konfirmasi.',resetPinWrong:'PIN admin salah. Reset dibatalkan.',
    historyTitle:'Laporan',selectAll:'Pilih Semua',
    deleteSelected:'Hapus Terpilih',noHistory:'Belum ada laporan.',
    deletePinLabel:'PIN admin',
    deletePinWrong:'PIN admin salah. Tidak ada yang dihapus.',
    noHistoryHint:'Histori akan muncul setelah shift pertama ditutup.',
    transactions:'transaksi',cashExpected:'Cash (Expected)',
    cardExpected:'Card (Expected)',transferExpected:'Transfer (Expected)',qrisExpected:'QRIS (Expected)',totalSaldo:'Total Expected',
    exportExcelBtn:'Export Excel',exportCsvBtn:'Export CSV',
    noTransactions:'Tidak ada transaksi',
    alertStartShiftFirst:'Mulai shift terlebih dahulu!',
    alertShiftStarted:'Shift dimulai! Saldo cash awal:',
    alertShiftClosed:'Shift ditutup dan histori disimpan.',
    alertNoShift:'Tidak ada transaksi untuk ditutup!',
    alertNoTransactions:'Tidak ada transaksi untuk diekspor!',
    alertSelectType:'Pilih jenis transaksi!',
    alertFillForm:'Deskripsi dan Jumlah harus diisi!',
    alertStorageFull:'⚠️ Penyimpanan penuh! Tutup shift untuk mengosongkan.',
    alertSaved:'Transaksi berhasil disimpan!',alertUpdated:'Transaksi berhasil diperbarui!',
    alertDeleted:'Transaksi berhasil dihapus!',alertExcelOk:'Export Excel berhasil!',
    alertExcelFail:'Gagal export Excel!',alertSettingsSaved:'Pengaturan berhasil disimpan.',alertInvalidImage:'File gambar tidak valid.',
    alertSettingsReset:'Pengaturan direset ke default.',
    alertCategoryEmpty:'Kategori dan staff tidak boleh kosong!',
    alertDeleteShift:(n) => `Hapus ${n} shift terpilih? Tindakan ini tidak bisa dibatalkan.`,
    alertShiftsDeleted:'Shift terpilih berhasil dihapus.',
    confirmDeleteShiftSingle:(date) => `Hapus shift ini (ditutup ${date})? Tindakan ini tidak bisa dibatalkan.`,
    deleteShift:'Hapus Shift',
    noTransactionsTable:'Tidak ada transaksi',
    noResults:(q) => `Tidak ada hasil untuk "${q}"`,
    kembali:'Kembali',
    welcomeTitle:'Selamat Datang! Atur POS Anda',
    welcomeHint:'Kategori penyewaan motor sudah disiapkan. Staf dan kategori bisa diubah nanti di Pengaturan.',
    frAdminName:'Nama admin',frFillBrandAdmin:'Isi nama brand dan nama admin.',
    finishSetup:'Selesai',
    // Auth
    loginTitle:'Masuk',signIn:'Masuk',selectUser:'Pilih Pengguna',enterPin:'Masukkan PIN',
    forgotPin:'Lupa PIN?',
    resetPinTitle:'Reset PIN',
    resetPinHint:'Kami mengirim tautan reset ke email orang itu. Buka tautannya, atau ketik kode dari email yang sama.',
    resetPinChooseHint:(name) => `Pilih PIN baru untuk ${name}.`,
    resetPinSent:(email) => `Email reset terkirim ke ${email}.`,
    resetPinSentHint:'Buka tautan di email, atau ketik kode dari email itu di bawah lalu tekan tombol lagi.',
    sendResetLink:'Kirim tautan reset',
    resetPinCode:'Kode dari email (opsional)',
    resetPinCodeWrong:'Kode itu tidak valid. Kirim tautan baru lalu coba lagi.',
    resetPinSendFailed:'Email reset tidak terkirim.',
    resetPinEmailMismatch:'Email itu tidak terdaftar di akun staf.',
    resetPinNoEmailAdmin:'Admin ini belum punya email. Admin lain harus menambahkannya di Kelola Pengguna.',
    resetPinNoEmailCashier:'Kasir ini tidak punya email. Admin yang mengatur PIN-nya di Kelola Pengguna.',
    newPin:'PIN Baru (4-6 digit)',
    resetPinBtn:'Reset PIN',
    email:'Email',
    emailHint:'Wajib untuk admin. Kasir boleh dikosongkan; PIN-nya diatur admin.',
    emailNone:'Tanpa email',
    setEmail:'Set email',
    emailPrompt:'Alamat email (kosongkan untuk menghapus email kasir):',
    invalidEmail:'Masukkan alamat email yang valid.',
    adminEmailRequired:'Admin wajib punya alamat email.',
    emailInUse:'Email itu sudah dipakai pengguna lain.',
    syncCloseFailed:'Tutup shift belum sampai ke server. Di layar ini shift tetap tertutup dan akan dicoba lagi.',
    shiftClosePending:'Tutup shift sebelumnya masih menunggu sync. Tunggu sampai selesai sebelum menutup lagi.',
    wrongAccessCode:'Kode akses salah.',
    alertPinReset:'PIN berhasil direset. Silakan login.',
    adminUser:'Pengguna Admin (dari daftar staff di atas)',adminPin:'PIN Admin (4-6 digit)',
    confirmPin:'Konfirmasi PIN',pinMismatch:'PIN tidak cocok',pinTooShort:'PIN harus 4-6 digit',
    usersTitle:'Kelola Pengguna',addUser:'Tambah Pengguna',userExists:'Nama pengguna sudah ada',
    cannotDeleteLastAdmin:'Tidak bisa menghapus admin terakhir',
    cannotDemoteLastAdmin:'Tidak bisa mengubah role — minimal harus ada 1 admin',
    roleAdmin:'Admin',roleCashier:'Kasir',pinSet:'PIN aktif',pinNone:'Tanpa PIN',
    setPin:'Set PIN',resetPin:'Reset PIN',removePin:'Hapus PIN',
    logout:'Keluar',loggedInAs:'Masuk sebagai',noPermission:'Anda tidak memiliki izin untuk tindakan ini',
    wrongPin:'PIN salah',userNotFound:'Pengguna tidak ditemukan',
    setupAdminTitle:'Setup Akun Admin',
    setupAdminHint:'Data yang ada terdeteksi. Pilih admin dan set PIN untuk melanjutkan.',
    username:'Nama Pengguna',role:'Role',pin:'PIN',
    confirmDeleteUser:(n) => `Hapus pengguna "${n}"? Tindakan ini tidak bisa dibatalkan.`,
    userDeleted:'Pengguna dihapus',userCreated:'Pengguna ditambahkan',userUpdated:'Pengguna diperbarui',
    // Settings UI polish
    staffViewOnly:'Staff (dikelola via Manage Users — tampilan saja)',
    dateRange:'Tanggal',dateAll:'Semua',dateToday:'Hari Ini',dateWeek:'Minggu Ini',dateMonth:'Bulan Ini',dateCustom:'Custom...',
    chartTitle:'Pergerakan kas harian',chartIncome:'Pemasukan',chartOutgoing:'Pengeluaran',chartNoData:'Belum ada transaksi',
    chartNet:'Net',chartCommission:'Komisi',chartAvgDay:'Rata-rata net / hari',chartEndBalance:'Saldo akhir',chartBalance:'Saldo (akhir hari)',
    chartScopeAll:'Semua metode',chartScopeCash:'Cash saja',
    chartExport:'Download Excel',xlDaily:'Harian',xlMethodSheet:'Pergerakan metode',xlSummary:'Ringkasan',xlTransactions:'Transaksi',xlDate:'Tanggal',xlDay:'Hari',xlTxCount:'Jumlah transaksi',xlTotal:'Total',xlPeriod:'Periode',xlScope:'Metode',xlOpening:'Saldo awal',xlDays:'Jumlah hari',xlDateTime:'Tanggal/Waktu (WITA)',xlType:'Jenis',xlCategory:'Kategori',xlNonRevenue:'Non-revenue',xlYes:'Ya',xlNo:'Tidak',xlDesc:'Deskripsi',xlAmount:'Jumlah',xlMethod:'Metode',xlNote:'Catatan',xlStaff:'Staff',
    xlNoteSummary:'Pemasukan dan pengeluaran tidak menghitung kategori non-revenue (START BALANCE, TarikTunai, PETTY-CASH, CashBon). Saldo akhir = saldo awal + net + pergerakan non-revenue.',
    chartNote:'Pemasukan dan pengeluaran tidak menghitung kategori non-revenue (START BALANCE, TarikTunai, PETTY-CASH, CashBon). Garis saldo tetap menghitungnya karena memindahkan uang. Arahkan kursor ke satu hari untuk rinciannya.',
    noResultsRange:'Tidak ada shift di rentang tanggal ini',
    helpTitle:'Panduan Singkat',
    helpReadFirst:'Lihat Panduan Singkat dulu',
    helpBody:`
<h3><i class="fas fa-rocket"></i> Setup pertama kali</h3>
<ol>
  <li>Saat pertama buka app, <b>Welcome wizard</b> akan muncul.</li>
  <li>Isi <b>nama brand</b>, <b>nama admin</b>, <b>email admin</b>, lalu set <b>PIN 4-6 digit</b>.</li>
  <li>Kategori penyewaan motor sudah disiapkan. Staf lain ditambahkan nanti lewat <b>Kelola Pengguna</b>.</li>
  <li>Klik <b>Selesai</b>. Anda otomatis login sebagai Admin dan layar Mulai Shift muncul.</li>
</ol>

<h3><i class="fas fa-user-lock"></i> Login &amp; role</h3>
<ul>
  <li><b>Admin</b> bisa kelola pengaturan, users, edit/hapus transaksi, hapus histori shift.</li>
  <li><b>Kasir</b> hanya bisa buat transaksi, tutup shift, dan export. Tidak bisa pengaturan, edit/hapus.</li>
  <li>Kasir tanpa PIN bisa login hanya dengan pilih nama. Admin bisa set PIN nanti via <b>Kelola Pengguna</b>.</li>
  <li>Ganti user lewat tombol user di header (kanan atas) → Keluar.</li>
</ul>

<h3><i class="fas fa-play-circle"></i> Alur harian</h3>
<ol>
  <li><b>Mulai Shift:</b> isi jumlah cash yang ada di laci. Tersimpan sebagai transaksi START BALANCE.</li>
  <li><b>Tambah transaksi</b> tiap kali ada penjualan. Pilih Pemasukan atau Pengeluaran, isi nominal + kategori + metode pembayaran.</li>
  <li><b>Tutup Shift</b> di akhir hari: input cash &amp; card aktual → lihat expected vs aktual → konfirmasi.</li>
  <li>Shift otomatis tersimpan ke <b>histori</b> (max 50 shift). CSV otomatis terdownload.</li>
</ol>

<h3><i class="fas fa-users-cog"></i> Mengelola pengguna</h3>
<ul>
  <li>Buka <b>Pengaturan</b> (ikon gear) → <b>Kelola Pengguna</b>.</li>
  <li>Tambah user: nama + role + email + PIN opsional. Email admin wajib. Kasir boleh tanpa email.</li>
  <li>Ikon pena = ganti nama. Amplop = email. Ikon kunci = set/reset PIN. Tong sampah = hapus.</li>
  <li>Tidak bisa hapus atau demote admin terakhir. Tidak bisa hapus diri sendiri.</li>
</ul>

<h3><i class="fas fa-tags"></i> Mengelola kategori</h3>
<ul>
  <li>Buka <b>Pengaturan</b> → kategori tampil sebagai card list.</li>
  <li>Drag handle di kiri untuk reorder. Klik pena untuk ganti nama, X untuk hapus.</li>
  <li><b>START BALANCE</b> terkunci — diperlukan logika shift, tidak bisa dihapus.</li>
</ul>

<h3><i class="fas fa-shield-alt"></i> Catatan penting</h3>
<ul>
  <li>Mantra Lombok selalu terhubung ke database cloud. 50 shift terakhir yang ditutup yang disimpan.</li>
  <li><b>Lupa PIN?</b> Di layar masuk pilih orangnya. Kalau ada email, tautan reset dikirim ke alamat itu. Kasir tanpa email minta admin untuk set PIN.</li>
  <li>Saat offline, transaksi baru, edit, hapus, dan tutup shift tetap di perangkat ini dan tersinkron saat koneksi kembali.</li>
  <li>Buka <code>history.html</code> untuk lihat shift yang sudah tertutup dan export ulang datanya.</li>
</ul>
`,
    addCategory:'Tambah Kategori',
    addCategoryPrompt:'Masukkan nama kategori baru:',
    renameCategoryPrompt:'Ubah nama kategori:',
    categoryExists:'Kategori sudah ada',
    systemBadge:'sistem',
    catTypeLabel:'Muncul di Pemasukan, Pengeluaran, atau keduanya',
    catTypeBoth:'Masuk & keluar',
    catTypeIncome:'Pemasukan',
    catTypeOutgoing:'Pengeluaran',
    renameUserPrompt:'Nama pengguna baru:',
    offlineBanner:'Offline — koneksi terputus. Transaksi baru, edit, hapus, dan tutup shift tetap di perangkat ini dan tersinkron saat online kembali.',
    offlineQueued:'Offline — {n} perubahan menunggu sync.',
    syncingQueued:'Mengirim {n} perubahan…',
    // ── Admin approval categories ──
    adminApprovalRequired:'Butuh persetujuan admin',
    adminApprovalHint:'Kategori ini butuh approval admin. Pilih admin dan masukkan PIN-nya.',
    adminCategoriesLabel:'Kategori yang butuh persetujuan admin',
    adminCategoriesHint:'Kasir harus masukkan PIN admin untuk catat transaksi di kategori yang dicentang.',
    wrongAdminPin:'PIN admin salah. Transaksi tidak disimpan.',
    // ── Non-revenue categories ──
    nonRevenueCategoriesLabel:'Kategori Non-Revenue',
    nonRevenueCategoriesHint:'Kategori yang dicentang tidak dihitung sebagai revenue. Pakai untuk transfer kas, cashbon karyawan, atau saldo awal.',
    revenueBreakdown:'Rincian Revenue',
    shiftRevenue:'Revenue',
    shiftOperatingExpense:'Pengeluaran Operasional',
    shiftNetRevenue:'Revenue Bersih',
    shiftNonRevenue:'Non-Revenue (Pergerakan Kas)',
    // ── Supabase / cloud sync ──
    sbSetupTitle:'Hubungkan ke Cloud',
    sbSetupHint:'Tempel Publishable Key project Mantra Lombok POS. Cukup sekali per perangkat.',
    sbKeyWhere:'Supabase → Mantra Lombok POS → Project Settings → API Keys.',
    sbSetupConnect:'Hubungkan',
    noSupabaseUseBasic:'',
    supabaseSection:'Backend Cloud (Supabase)',
    supabaseHint:'Ambil dari project Supabase: Settings → Data API (URL) dan API Keys (Publishable key).',
    supabaseUrl:'URL Project Supabase',
    supabaseKey:'Publishable Key',
    invalidSupabaseUrl:'URL Supabase tidak valid. Format yang benar: https://xxxx.supabase.co',
    invalidSupabaseKey:'Publishable key tidak valid. Harus diawali "sb_publishable_" atau "eyJ".',
    sbErrorTitle:'Gagal Konek ke Cloud',
    sbErrorHint:'Tidak bisa terhubung ke Supabase. Cek koneksi internet dan Publishable Key.',
    sbErrorRetry:'Coba Lagi',
    sbErrorReset:'Reset & Setup Ulang',
    confirmResetSupabase:'Reset konfigurasi Supabase dan reload? Anda akan diminta memasukkan URL + key lagi.',
    remoteLogout:'Logout dari device lain.',
    newRental:'Sewa',
    cashoutBtn:'TarikTunai',
    cashoutTitle:'TarikTunai',
    cashoutEditTitle:'Edit TarikTunai',
    cashoutAmount:'Nominal',
    cashoutIn:'Uang masuk',
    cashoutPickedMethod:'Metode',
    recordedAs:'kategori',
    cashoutSaved:'Tarik tunai tersimpan. Uang masuk dan uang keluar tunai dicatat bersamaan.',
    cashoutUpdated:'Tarik tunai diperbarui. Kedua baris ikut tersimpan.',
    cashoutDeleted:'Tarik tunai dihapus. Uang masuk dan uang keluar tunai ikut terhapus.',
    confirmDeleteCashout:'Hapus tarik tunai ini? Uang masuk dan uang keluar tunai ikut terhapus.',
    cashoutFill:'Isi nominal, pilih metode uang masuk, dan tulis catatan.',
    cashoutNote:'Catatan',
    cashoutNotePh:'Kenapa tarik tunai? contoh: uang kembalian tamu',
    bankBtn:'Kas dari bank',
    bankTitle:'Kas dari bank',
    bankEditTitle:'Edit kas dari bank',
    bankAmount:'Nominal',
    bankSaved:'Kas dari bank tersimpan. Saldo kartu turun dan kas naik dengan nominal yang sama.',
    bankUpdated:'Kas dari bank diperbarui. Kedua baris ikut tersimpan.',
    bankDeleted:'Kas dari bank dihapus. Penurunan kartu dan kenaikan kas ikut terhapus.',
    confirmDeleteBank:'Hapus kas dari bank ini? Penurunan kartu dan kenaikan kas ikut terhapus.',
    bankFill:'Isi nominal.',
    bankNote:'Card → Kas',
    rentalTitle:'Rental Payment',
    rentalEditTitle:'Edit sewa',
    rentalDayOne:'hari',
    rentalDayMany:'hari',
    confirmDeleteRental:'Hapus sewa ini? Pemasukan tamu dan bagian pemilik ikut terhapus.',
    rentalDeleted:'Sewa dihapus. Pemasukan tamu dan bagian pemilik ikut terhapus.',
    rentalUpdated:'Sewa diperbarui. Kedua baris ikut tersimpan.',
    rentalDuration:'Durasi',
    rentalHours:'Jam',
    rentalDays:'Hari',
    rentalQty:'Jumlah',
    rentalGuestPrice:'Harga tamu',
    rentalGuestMethod:'Bayar tamu',
    rentalOwnerCashHint:'Sekali simpan: pemasukan tamu dan bagian pemilik. Keterangan memuat nama tamu, plat, hari, dan owner.',
    rentalPayAmount:'Nominal bayar',
    rentalMethod:'Metode',
    rentalPickMethod:'Pilih metode',
    rentalDayCount:'Jumlah hari',
    rentalOwnerField:'Owner',
    rentalOwnerReceives:'Jumlah yang diterima owner',
    rentalPlate:'Plat motor',
    rentalGuestName:'Nama tamu',
    rentalSaved:'Sewa tersimpan. Pemasukan tamu dan bagian pemilik dicatat bersamaan.',
    rentalSavedNoShare:'Sewa tersimpan. Bagian pemilik 0, jadi hanya pemasukan tamu yang dicatat.',
    rentalFillForm:'Isi nama tamu, nominal bayar, metode tamu, plat, jumlah hari, owner, jumlah yang diterima owner (0 kalau tidak ada bagian owner), dan metode owner.',
    rentalPerHour:'/ jam',
    rentalPerDay:'/ hari',
    rentalShareEach:'per jam/hari',
  }
};

// Read directly from localStorage — the Storage service in script.js
// isn't defined yet at this point (script.js loads after lang.js).
function _readLangFromStorage() {
  try {
    const raw = appStorage.get('pos_lang');
    if (!raw) return 'en';
    // Migration may have moved a JSON-stringified value ("en") or raw value (en).
    try { return JSON.parse(raw); } catch { return raw; }
  } catch { return 'en'; }
}

const LangManager = {
  current: _readLangFromStorage(),

  t(key, arg) {
    const str = STRINGS[this.current]?.[key] ?? STRINGS['en']?.[key] ?? key;
    return typeof str === 'function' ? str(arg) : str;
  },

  set(lang) {
    if (!STRINGS[lang]) return;
    this.current = lang;
    try { appStorage.set('pos_lang', JSON.stringify(lang)); } catch {}
  },

  toggle() {
    this.set(this.current === 'en' ? 'id' : 'en');
  }
};

// Global shorthand — works in both index.html and history.html
const t = (key, arg) => LangManager.t(key, arg);

function rentalDayPhrase(days) {
  const n = Math.max(0, parseInt(days, 10) || 0);
  return `${n} ${n === 1 ? t('rentalDayOne') : t('rentalDayMany')}`;
}

function rentalNoteDisplay(raw) {
  const link = typeof parseRentalNote === 'function' ? parseRentalNote(raw) : null;
  if (!link) return String(raw ?? '');
  return `${link.guest} · ${link.plate} · ${rentalDayPhrase(link.days)} · ${link.owner}`;
}

function cashoutNoteDisplay(raw) {
  const link = typeof parseCashoutNote === 'function' ? parseCashoutNote(raw) : null;
  if (!link?.method) return '';
  return `${link.method} → Cash`;
}

function bankNoteDisplay(raw) {
  const link = typeof parseBankNote === 'function' ? parseBankNote(raw) : null;
  if (!link) return '';
  return t('bankNote');
}

function cashoutReason(raw) {
  const link = typeof parseCashoutNote === 'function' ? parseCashoutNote(raw) : null;
  return link?.note || '';
}

function ledgerNote(raw) {
  const cashout = cashoutNoteDisplay(raw);
  if (cashout) return [cashout, cashoutReason(raw)].filter(Boolean).join(' · ');
  return bankNoteDisplay(raw) || rentalNoteDisplay(raw);
}

function rentalDeskripsiDisplay(tx) {
  const link = typeof parseRentalNote === 'function' ? parseRentalNote(tx?.keterangan) : null;
  if (!link || !link.plate) return String(tx?.deskripsi || '');
  return `${link.plate} · ${rentalDayPhrase(link.days)}`;
}

// Paired rows share one timestamp; keep money-in above money-out in every sort direction.
function ledgerTypeOrder(a, b) {
  const rank = (tx) => (tx?.jenis === 'INCOME' ? 0 : 1);
  return rank(a) - rank(b);
}

// On-screen cashbook columns: each fact appears once. Excel keeps the full note.
function ledgerDescription(tx) {
  const transfer = bankNoteDisplay(tx?.keterangan) || cashoutNoteDisplay(tx?.keterangan);
  if (transfer) return transfer;
  return rentalDeskripsiDisplay(tx);
}

function ledgerNoteShort(tx) {
  const raw = tx?.keterangan;
  if (cashoutNoteDisplay(raw)) return cashoutReason(raw);
  if (bankNoteDisplay(raw)) return '';
  const link = typeof parseRentalNote === 'function' ? parseRentalNote(raw) : null;
  if (link) {
    return [
      link.guest ? `${t('rentalGuestName')}: ${link.guest}` : '',
      link.owner ? `${t('rentalOwnerField')}: ${link.owner}` : '',
    ].filter(Boolean).join(' · ');
  }
  return String(raw ?? '');
}
