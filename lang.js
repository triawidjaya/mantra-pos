// ============================================================
// LANG MANAGER — EN/ID translations for all UI strings
// Usage: LangManager.t('key') or shorthand t('key')
// Switch: LangManager.toggle() or LangManager.set('en'|'id')
// ============================================================

const STRINGS = {
  en: {
    historyShift:'Report',appTitle:'MANTRA POS APP',
    newTransaction:'New Transaction',exportExcel:'Export Excel',
    hideAll:'Hide All',showAll:'Show All',closeShift:'Close Shift',
    cashBalance:'Cash',cardBalance:'Card',transferBalance:'Transfer',qrisBalance:'QRIS',otherBalance:'Other',
    search:'Search',searchPlaceholder:'Description, category, staff...',
    reportSearchPlaceholder:'Staff, note, plate, description...',
    noSearchResults:'No matching rows',
    pagePrev:'Previous',pageNext:'Next',
    pageStatus: ({ start, end, total, page, pages }) => `${start}–${end} of ${total} · ${page}/${pages}`,
    filterType:'Type',filterToggle:'Filter',filterAll:'All',filterIncome:'Income',filterOutgoing:'Outgoing',
    filterCategory:'Category',filterMethod:'Method',filterDateFrom:'From date',filterDateTo:'To date',applyFilter:'Apply Filter',resetFilter:'Reset',
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
    closeShiftTitle:'Close Shift',closeShiftHint:'Count the cash in the till. Card, QRIS and Transfer come from the bank figures below.',
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
    dateRange:'Date',dateAll:'All',dateToday:'Today',dateWeek:'This Week',dateMonth:'This Month',dateLastMonth:'Last Month',dateCustom:'Custom...',
    sumCount:'Qty',bankReasonLabel:'Note (optional)',bankReasonPh:'What is it for?',menuHide:'Hide menu',menuShow:'Show menu',switchLang:'Switch language',accountTitle:'Account',themeToggle:'Toggle theme',dateFromTitle:'From',dateToTitle:'To',adminPinPh:'Admin PIN',brandPh:'e.g. Warung Pak Budi',closeCutoff:'Period end date',closeCutoffHint:'Transactions after this date stay in the next shift.',closeBankTitle:'Bank: Card + QRIS + Transfer',closeBankExpected:'Expected after fees',closeBankReceived:'Received in bank',closeBankDiff:'Difference (days already filled)',closeBankWaiting:({ days }) => `Waiting for bank (${days} day(s))`,closeBankNone:'No Card, QRIS or Transfer up to this date.',closeBankSource:'These amounts come from Report > Bank and cannot be typed here.',closeBankReceivedRow:'Bank (in)',closeBankWaitingRow:'Bank (waiting)',closeBankPendingNote:({ days }) => `${days} day(s) of Card/QRIS/Transfer are still waiting for the bank. Fill them later in Report > Bank.`,closeWaitingBank:'Waiting for bank',closeCarryOver:({ n, date }) => `${n} transaction(s) dated after ${date} stay in the next shift.`,shiftBankPending:({ days, amount }) => `Waiting for bank: ${days} day(s), ${amount}. Fill the amounts in Report > Bank.`,shiftBankDone:'Bank reconciliation complete',tabBank:'Bank reconciliation',recTitle:'Bank reconciliation: Card, QRIS and Transfer',recIntro:'Each row is one transaction day. Card and QRIS taken that day are paid into the bank account after the EDC settlement, usually the next day. Type the amount that arrived for that day\'s settlement (from the bank statement). If a settlement was forgotten and two days arrive together, type the total on one day: the cumulative column stays correct.',recColOut:'Taken from bank',recWithdrawn:'Taken from the bank this period (information, not in the difference)',recColApp:'Expected after fees',recRateSurcharge:'Card fee added for the renter (%)',recRateCardMdr:'Bank cut on Card (%)',recRateQris:'Bank cut on QRIS (%)',recFormula:'Expected in bank',recRatesSaved:'Rates saved',recColActual:'Received in bank',recColDiff:'Difference',recColCum:'Cumulative',recKpiApp:'Expected in bank',recKpiActual:'Entered from bank',recKpiDiff:'Still missing',recAhead:'More than expected',recMatched:'Matches',recNone:'No Card, QRIS or Transfer transactions in this period.',recAdminOnly:'Only an admin can enter the bank amounts.',recSaveFail:'Could not save the bank amount',recExport:'Download Excel',recSheet:'Bank reconciliation',recUnit:'Amounts in Rupiah',recNeg:'negative = not received yet',tabSummary:'Summary',tabShifts:'Shifts',sumCategoryTitle:'Summary by category',sumNonRevenueTitle:'Not counted as revenue',sumNonRevenueNote:'Cash movements that are not sales or costs. They change the balance but stay out of the totals above.',sumMethodTitle:'Movement by method',sumMovement:'Net movement',sumDailyTitle:'Daily summary',
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
  <li><b>Admin</b> can manage settings, users, edit/delete transactions, delete shift history, and type the bank amounts in the Bank reconciliation.</li>
  <li><b>Cashier</b> can create and edit transactions, close the shift, and export. No settings, no delete, no bank amounts.</li>
  <li>Cashiers without a PIN can log in by just selecting their name. Admin can set PINs later via <b>Manage Users</b>.</li>
  <li>Switch user via the user button in the header (top right) → Sign Out.</li>
</ul>

<h3><i class="fas fa-play-circle"></i> The month</h3>
<ol>
  <li>The counter runs <b>one shift for the whole month</b>. There is no daily open and close.</li>
  <li><b>Start Shift</b> once, at the start of the books: enter the cash in the till. It is saved as START BALANCE.</li>
  <li><b>Add transactions</b> as they happen. Pick Income or Outgoing, fill amount + category + payment method.</li>
  <li><b>Close Shift</b> once, at month end (on the last day or in the first days of the next month). Pick the <b>Period end date</b>; rows after it stay in the next shift. Enter the counted cash. Card, Transfer and QRIS are not typed: they are read from Report &gt; Bank, with the part still <b>waiting for bank</b> shown separately (not a shortage). Fill those amounts in Report &gt; Bank as the money arrives.</li>
  <li>The shift is saved to <b>Report</b> (the last 50 closed shifts are kept) and a CSV is downloaded.</li>
</ol>

<h3><i class="fas fa-hand-holding-usd"></i> TarikTunai &amp; PETTY-CASH</h3>
<ul>
  <li><b>TarikTunai</b> (guest cash-out): the guest pays on the EDC, the counter hands over cash. Enter the <b>amount given to the guest</b>, not the EDC amount. Two rows are saved: Card/QRIS in, Cash out. It is not a sale.</li>
  <li><b>PETTY-CASH</b>: cash taken from the bank into the cashbox. Card out, Cash in. The <b>Note</b> is optional; write what it is for.</li>
  <li>Never record cash from the bank as a plain income: the bank side would be missing.</li>
</ul>

<h3><i class="fas fa-filter"></i> Finding and correcting a transaction</h3>
<ul>
  <li>Tap the <b>funnel</b> icon. Fields: Search, Type, Category, Method, From date, To date.</li>
  <li>Search and dates apply as you type or pick. <b>Reset</b> clears everything.</li>
  <li>To correct something, filter to that day, find the row, and use its edit button.</li>
</ul>

<h3><i class="fas fa-chart-column"></i> Report</h3>
<ul>
  <li>The <b>chart</b> icon opens Report. Pick a period at the top (All, Today, This Week, This Month, Last Month, Custom). It applies to all tabs.</li>
  <li><b>Summary:</b> totals by category, cash movements that are not revenue, movement by method, and a day-by-day table. Tap a category or day to open the list filtered.</li>
  <li><b>Bank:</b> compares what the app expects to reach the bank (Card, QRIS, Transfer after fees) with what actually arrived. An admin types the amount from the bank statement for each day; the difference and the cumulative difference show if anything is missing.</li>
  <li><b>Shifts:</b> closed shifts, with search and export.</li>
</ul>

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
  <li>The EN/ID button switches the whole app, including dates and times.</li>
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
    historyShift:'Laporan',appTitle:'MANTRA POS APP',
    newTransaction:'Transaksi Baru',exportExcel:'Export Excel',
    hideAll:'Sembunyikan',showAll:'Tampilkan',closeShift:'Tutup Shift',
    cashBalance:'Cash',cardBalance:'Card',transferBalance:'Transfer',qrisBalance:'QRIS',otherBalance:'Lainnya',
    search:'Cari',searchPlaceholder:'Deskripsi, kategori, staff...',
    reportSearchPlaceholder:'Staff, catatan, plat, deskripsi...',
    noSearchResults:'Tidak ada yang cocok',
    pagePrev:'Sebelumnya',pageNext:'Berikutnya',
    pageStatus: ({ start, end, total, page, pages }) => `${start}–${end} dari ${total} · ${page}/${pages}`,
    filterType:'Jenis',filterToggle:'Filter',filterAll:'Semua',filterIncome:'Pemasukan',filterOutgoing:'Pengeluaran',
    filterCategory:'Kategori',filterMethod:'Metode',filterDateFrom:'Dari tanggal',filterDateTo:'Sampai tanggal',applyFilter:'Terapkan Filter',resetFilter:'Reset',
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
    resetDefault:'Kembalikan Default',
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
    closeShiftTitle:'Tutup Shift',closeShiftHint:'Hitung kas di laci. Card, QRIS, dan Transfer diambil dari angka bank di bawah.',
    actualCash:'Aktual Cash',actualCard:'Aktual Card',actualTransfer:'Aktual Transfer',actualQris:'Aktual QRIS',
    closingNote:'Catatan Penutupan',closingNoteOptional:'Opsional — tambahkan catatan jika diperlukan.',
    closingNoteRequired:'Wajib — mohon jelaskan alasan selisih.',
    alertNoteRequired:'Mohon berikan catatan alasan selisih sebelum menutup shift.',
    back:'Kembali',viewSummary:'Lihat Summary',confirmClose:'Tutup Shift',
    shiftSummary:'📊 Summary Penutupan Shift',method:'Metode',
    expected:'Seharusnya',actual:'Aktual',difference:'Selisih',
    exact:'✓ Pas',over:'(lebih)',short:'(kurang)',
    totalExpected:'Total Seharusnya:',
    balanceReset:'* Saldo akan direset ke 0 setelah shift ditutup',
    confirmDefault:'Apakah Anda yakin?',yes:'Ya',
    confirmResetDefault:'Reset brand & kategori ke default? Masukkan PIN admin Anda untuk konfirmasi.',resetPinWrong:'PIN admin salah. Reset dibatalkan.',
    historyTitle:'Laporan',selectAll:'Pilih Semua',
    deleteSelected:'Hapus Terpilih',noHistory:'Belum ada laporan.',
    deletePinLabel:'PIN admin',
    deletePinWrong:'PIN admin salah. Tidak ada yang dihapus.',
    noHistoryHint:'Histori akan muncul setelah shift pertama ditutup.',
    transactions:'transaksi',cashExpected:'Cash (Seharusnya)',
    cardExpected:'Card (Seharusnya)',transferExpected:'Transfer (Seharusnya)',qrisExpected:'QRIS (Seharusnya)',totalSaldo:'Total Seharusnya',
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
    setEmail:'Atur email',
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
    username:'Nama Pengguna',role:'Peran',pin:'PIN',
    confirmDeleteUser:(n) => `Hapus pengguna "${n}"? Tindakan ini tidak bisa dibatalkan.`,
    userDeleted:'Pengguna dihapus',userCreated:'Pengguna ditambahkan',userUpdated:'Pengguna diperbarui',
    // Settings UI polish
    staffViewOnly:'Staff (dikelola via Manage Users — tampilan saja)',
    dateRange:'Tanggal',dateAll:'Semua',dateToday:'Hari Ini',dateWeek:'Minggu Ini',dateMonth:'Bulan Ini',dateLastMonth:'Bulan Lalu',dateCustom:'Kustom...',
    sumCount:'Jml',bankReasonLabel:'Catatan (opsional)',bankReasonPh:'Untuk apa?',menuHide:'Sembunyikan menu',menuShow:'Tampilkan menu',switchLang:'Ganti bahasa',accountTitle:'Akun',themeToggle:'Ganti tema',dateFromTitle:'Dari',dateToTitle:'Sampai',adminPinPh:'PIN Admin',brandPh:'mis. Warung Pak Budi',closeCutoff:'Sampai tanggal',closeCutoffHint:'Transaksi setelah tanggal ini tetap di shift berikutnya.',closeBankTitle:'Bank: Card + QRIS + Transfer',closeBankExpected:'Seharusnya (setelah potongan)',closeBankReceived:'Sudah masuk rekening',closeBankDiff:'Selisih (hari yang sudah diisi)',closeBankWaiting:({ days }) => `Menunggu bank (${days} hari)`,closeBankNone:'Tidak ada Card, QRIS, atau Transfer sampai tanggal ini.',closeBankSource:'Angka ini berasal dari Laporan > Rekonsiliasi Bank dan tidak bisa diketik di sini.',closeBankReceivedRow:'Bank (masuk)',closeBankWaitingRow:'Bank (menunggu)',closeBankPendingNote:({ days }) => `${days} hari Card/QRIS/Transfer masih menunggu bank. Isi nanti di Laporan > Rekonsiliasi Bank.`,closeWaitingBank:'Menunggu bank',closeCarryOver:({ n, date }) => `${n} transaksi bertanggal setelah ${date} tetap di shift berikutnya.`,shiftBankPending:({ days, amount }) => `Menunggu bank: ${days} hari, ${amount}. Isi jumlahnya di Laporan > Rekonsiliasi Bank.`,shiftBankDone:'Rekonsiliasi bank selesai',tabBank:'Rekonsiliasi Bank',recTitle:'Rekonsiliasi bank: Card, QRIS dan Transfer',recIntro:'Satu baris = satu hari transaksi. Card dan QRIS hari itu masuk ke rekening setelah settlement EDC, biasanya keesokan harinya. Isi jumlah yang masuk untuk settlement hari itu (dari mutasi rekening). Kalau settlement terlupa dan uang dua hari masuk sekaligus, isi totalnya di salah satu hari: kolom kumulatif tetap benar.',recColOut:'Ditarik dari bank',recWithdrawn:'Ditarik dari bank pada periode ini (informasi, tidak masuk selisih)',recColApp:'Seharusnya (setelah potongan)',recRateSurcharge:'Biaya kartu ditambah ke penyewa (%)',recRateCardMdr:'Potongan bank untuk Card (%)',recRateQris:'Potongan bank untuk QRIS (%)',recFormula:'Seharusnya masuk',recRatesSaved:'Tarif tersimpan',recColActual:'Masuk di rekening',recColDiff:'Selisih',recColCum:'Kumulatif',recKpiApp:'Seharusnya masuk',recKpiActual:'Diisi dari rekening',recKpiDiff:'Belum masuk',recAhead:'Lebih dari seharusnya',recMatched:'Cocok',recNone:'Tidak ada transaksi Card, QRIS atau Transfer pada periode ini.',recAdminOnly:'Hanya admin yang bisa mengisi jumlah di rekening.',recSaveFail:'Jumlah di rekening gagal disimpan',recExport:'Download Excel',recSheet:'Rekonsiliasi bank',recUnit:'Jumlah dalam Rupiah',recNeg:'negatif = belum masuk',tabSummary:'Ringkasan',tabShifts:'Daftar Shift',sumCategoryTitle:'Ringkasan per kategori',sumNonRevenueTitle:'Tidak dihitung sebagai omzet',sumNonRevenueNote:'Perpindahan kas yang bukan penjualan atau biaya. Mengubah saldo, tetapi tidak masuk total di atas.',sumMethodTitle:'Pergerakan per metode',sumMovement:'Pergerakan bersih',sumDailyTitle:'Ringkasan harian',
    chartTitle:'Pergerakan kas harian',chartIncome:'Pemasukan',chartOutgoing:'Pengeluaran',chartNoData:'Belum ada transaksi',
    chartNet:'Net',chartCommission:'Komisi',chartAvgDay:'Rata-rata net / hari',chartEndBalance:'Saldo akhir',chartBalance:'Saldo (akhir hari)',
    chartScopeAll:'Semua metode',chartScopeCash:'Cash saja',
    chartExport:'Download Excel',xlDaily:'Harian',xlMethodSheet:'Pergerakan metode',xlSummary:'Ringkasan',xlTransactions:'Transaksi',xlDate:'Tanggal',xlDay:'Hari',xlTxCount:'Jumlah transaksi',xlTotal:'Total',xlPeriod:'Periode',xlScope:'Metode',xlOpening:'Saldo awal',xlDays:'Jumlah hari',xlDateTime:'Tanggal/Waktu (WITA)',xlType:'Jenis',xlCategory:'Kategori',xlNonRevenue:'Non-omzet',xlYes:'Ya',xlNo:'Tidak',xlDesc:'Deskripsi',xlAmount:'Jumlah',xlMethod:'Metode',xlNote:'Catatan',xlStaff:'Staff',
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

<h3><i class="fas fa-user-lock"></i> Login &amp; peran</h3>
<ul>
  <li><b>Admin</b> bisa kelola pengaturan, pengguna, edit/hapus transaksi, hapus histori shift, dan mengisi jumlah rekening di Rekonsiliasi Bank.</li>
  <li><b>Kasir</b> bisa membuat dan mengedit transaksi, tutup shift, dan ekspor. Tidak bisa pengaturan, hapus, atau mengisi jumlah rekening.</li>
  <li>Kasir tanpa PIN bisa login hanya dengan pilih nama. Admin bisa set PIN nanti via <b>Kelola Pengguna</b>.</li>
  <li>Ganti pengguna lewat tombol pengguna di header (kanan atas) → Keluar.</li>
</ul>

<h3><i class="fas fa-play-circle"></i> Satu bulan</h3>
<ol>
  <li>Konter menjalankan <b>satu shift untuk satu bulan penuh</b>. Tidak ada buka dan tutup shift setiap hari.</li>
  <li><b>Mulai Shift</b> sekali, di awal pembukuan: isi jumlah cash di laci. Tersimpan sebagai START BALANCE.</li>
  <li><b>Tambah transaksi</b> tiap kali terjadi. Pilih Pemasukan atau Pengeluaran, isi nominal + kategori + metode pembayaran.</li>
  <li><b>Tutup Shift</b> sekali, di akhir bulan (pada tanggal terakhir atau di awal bulan berikutnya). Pilih <b>Sampai tanggal</b>; transaksi setelahnya tetap di shift berikutnya. Isi hitungan cash. Card, Transfer dan QRIS tidak diketik: dibaca dari Laporan &gt; Rekonsiliasi Bank, dan yang masih <b>menunggu bank</b> ditampilkan terpisah (bukan kurang). Isi jumlahnya di Laporan &gt; Rekonsiliasi Bank saat uangnya tiba.</li>
  <li>Shift tersimpan ke <b>Laporan</b> (50 shift terakhir disimpan) dan CSV otomatis terunduh.</li>
</ol>

<h3><i class="fas fa-hand-holding-usd"></i> TarikTunai &amp; PETTY-CASH</h3>
<ul>
  <li><b>TarikTunai</b> (tamu menarik tunai): tamu membayar di EDC, konter memberi cash. Isi <b>nominal yang diberikan ke tamu</b>, bukan nominal EDC. Dua baris tersimpan: Card/QRIS masuk, Cash keluar. Ini bukan penjualan.</li>
  <li><b>PETTY-CASH</b>: uang diambil dari bank ke cashbox. Card keluar, Cash masuk. <b>Catatan</b> boleh diisi, tulis untuk apa.</li>
  <li>Jangan catat uang dari bank sebagai pemasukan biasa: sisi banknya tidak tercatat.</li>
</ul>

<h3><i class="fas fa-filter"></i> Mencari dan mengoreksi transaksi</h3>
<ul>
  <li>Ketuk ikon <b>corong</b>. Isiannya: Cari, Jenis, Kategori, Metode, Dari tanggal, Sampai tanggal.</li>
  <li>Pencarian dan tanggal langsung berlaku saat diketik atau dipilih. <b>Reset</b> mengosongkan semuanya.</li>
  <li>Untuk mengoreksi, saring ke hari itu, cari barisnya, lalu pakai tombol edit.</li>
</ul>

<h3><i class="fas fa-chart-column"></i> Laporan</h3>
<ul>
  <li>Ikon <b>grafik</b> membuka Laporan. Pilih periode di atas (Semua, Hari Ini, Minggu Ini, Bulan Ini, Bulan Lalu, Kustom). Berlaku untuk semua tab.</li>
  <li><b>Ringkasan:</b> total per kategori, perpindahan kas yang bukan omzet, pergerakan per metode, dan tabel harian. Ketuk kategori atau hari untuk membuka daftar yang tersaring.</li>
  <li><b>Rekonsiliasi Bank:</b> mencocokkan uang yang seharusnya masuk ke bank (Card, QRIS, Transfer setelah potongan) dengan yang benar-benar masuk. Admin mengisi jumlah dari mutasi rekening tiap hari; selisih dan kumulatif menunjukkan kalau ada yang kurang.</li>
  <li><b>Daftar Shift:</b> shift yang sudah tertutup, dengan pencarian dan ekspor.</li>
</ul>

<h3><i class="fas fa-users-cog"></i> Mengelola pengguna</h3>
<ul>
  <li>Buka <b>Pengaturan</b> (ikon gear) → <b>Kelola Pengguna</b>.</li>
  <li>Tambah pengguna: nama + peran + email + PIN opsional. Email admin wajib. Kasir boleh tanpa email.</li>
  <li>Ikon pena = ganti nama. Amplop = email. Ikon kunci = set/reset PIN. Tong sampah = hapus.</li>
  <li>Tidak bisa hapus atau menurunkan admin terakhir. Tidak bisa hapus diri sendiri.</li>
</ul>

<h3><i class="fas fa-tags"></i> Mengelola kategori</h3>
<ul>
  <li>Buka <b>Pengaturan</b> → kategori tampil sebagai daftar kartu.</li>
  <li>Seret pegangan di kiri untuk mengurutkan. Klik pena untuk ganti nama, X untuk hapus.</li>
  <li><b>START BALANCE</b> terkunci — diperlukan logika shift, tidak bisa dihapus.</li>
</ul>

<h3><i class="fas fa-shield-alt"></i> Catatan penting</h3>
<ul>
  <li>Mantra Lombok selalu terhubung ke database cloud. 50 shift terakhir yang ditutup yang disimpan.</li>
  <li><b>Lupa PIN?</b> Di layar masuk pilih orangnya. Kalau ada email, tautan reset dikirim ke alamat itu. Kasir tanpa email minta admin untuk set PIN.</li>
  <li>Saat offline, transaksi baru, edit, hapus, dan tutup shift tetap di perangkat ini dan tersinkron saat koneksi kembali.</li>
  <li>Tombol EN/ID mengganti seluruh aplikasi, termasuk tanggal dan jam.</li>
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
    shiftRevenue:'Pendapatan',
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
    rentalTitle:'Pembayaran Sewa',
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
    rentalOwnerField:'Pemilik',
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

// Dates and times follow the language chosen in the app, not the device language.
function appLocale() { return LangManager.current === 'id' ? 'id-ID' : 'en-US'; }
function fmtDateTime(value) {
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString(appLocale());
}

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

function bankReason(raw) {
  const link = typeof parseBankNote === 'function' ? parseBankNote(raw) : null;
  return link?.note || '';
}

function cashoutReason(raw) {
  const link = typeof parseCashoutNote === 'function' ? parseCashoutNote(raw) : null;
  return link?.note || '';
}

function ledgerNote(raw) {
  const cashout = cashoutNoteDisplay(raw);
  if (cashout) return [cashout, cashoutReason(raw)].filter(Boolean).join(' · ');
  const bank = bankNoteDisplay(raw);
  if (bank) return [bank, bankReason(raw)].filter(Boolean).join(' · ');
  return rentalNoteDisplay(raw);
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
  if (bankNoteDisplay(raw)) return bankReason(raw);
  const link = typeof parseRentalNote === 'function' ? parseRentalNote(raw) : null;
  if (link) {
    return [
      link.guest ? `${t('rentalGuestName')}: ${link.guest}` : '',
      link.owner ? `${t('rentalOwnerField')}: ${link.owner}` : '',
    ].filter(Boolean).join(' · ');
  }
  return String(raw ?? '');
}
