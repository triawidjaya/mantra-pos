// ============================================================
// STORAGE & AUTH STORAGE — provided globally by supabase.js
// (Storage, AuthStorage, DataStore, SupabaseConfig, getSupabase)
//
// Reads are synchronous from DataStore's in-memory cache.
// Writes route to Supabase via DataStore CRUD methods.
// UI-only keys (theme, header, access gate, lang, sb config)
// still hit localStorage directly.
// ============================================================

// ============================================================
// VALIDATOR — defensive checks on cached data structure.
// Supabase CHECK constraints already enforce most invariants;
// kept for any client-only data path.
// ============================================================
const Validator = {
  VALID_JENIS:  ['INCOME', 'OUTGOING'],
  VALID_METODE: ['Cash', 'Card', 'Transfer', 'Qris'],

  isValidTransaction(t) {
    return (
      t && typeof t === 'object' &&
      typeof t.id           === 'string' && t.id.trim() !== '' &&
      this.VALID_JENIS.includes(t.jenis) &&
      typeof t.kategori     === 'string' && t.kategori.trim() !== '' &&
      typeof t.deskripsi    === 'string' && t.deskripsi.trim() !== '' &&
      typeof t.jumlah       === 'number' && isFinite(t.jumlah) &&
      this.VALID_METODE.includes(t.metode) &&
      typeof t.staff        === 'string' && t.staff.trim() !== '' &&
      typeof t.tanggalWaktu === 'string' && !isNaN(Date.parse(t.tanggalWaktu))
    );
  },

  sanitizeTransactions(raw) {
    if (!Array.isArray(raw)) return [];
    const valid   = raw.filter(t => this.isValidTransaction(t));
    const invalid = raw.length - valid.length;
    if (invalid > 0) console.warn(`[Validator] ${invalid} invalid transaction(s) ignored.`);
    return valid;
  },

  sanitizeStringList(raw, fallback) {
    if (!Array.isArray(raw)) return fallback;
    const clean = raw.filter(s => typeof s === 'string' && s.trim() !== '');
    return clean.length > 0 ? clean : fallback;
  }
};

// ============================================================
// DEFAULT DATA
// ============================================================
// Generic defaults — template starts white-label.
// `START BALANCE` is required by shift-start logic, do not remove.
const DEFAULT_CATEGORIES = RENTAL_SHOP_DEFAULTS.categories;
const DEFAULT_STAFF      = ['Staff 1'];
const DEFAULT_BRAND      = 'My Business';

// Resize an uploaded image to fit maxW×maxH (aspect preserved) and return a
// base64 PNG data URL. Runs entirely in-browser via Canvas — no upload needed.
function resizeLogoToBase64(file, maxW = 300, maxH = 150) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width, maxH / img.height);
      const canvas = document.createElement('canvas');
      canvas.width  = Math.max(1, Math.round(img.width  * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Invalid image file')); };
    img.src = url;
  });
}

// Browser access gate — unlocks this browser only. It is not a PIN reset.
const APP_ACCESS_CODE       = 'smallbutspicy_v2';
const APP_CODE_VERSION      = 2;  // Increment this when changing APP_ACCESS_CODE
const STORAGE_KEY_ACCESS    = 'pos_access_granted';
const STORAGE_KEY_CODE_VER  = 'pos_code_version';
const AccessGate = {
  async verify(code) {
    if (code === APP_ACCESS_CODE) {
      Storage.set(STORAGE_KEY_CODE_VER, APP_CODE_VERSION);
      return true;
    }
    return false;
  },
  isCodeVersionValid() {
    return Storage.get(STORAGE_KEY_CODE_VER, 0) === APP_CODE_VERSION;
  },
};
// Categories required by app logic — cannot be deleted via UI
const SYSTEM_CATEGORIES  = ['START BALANCE'];
const CASHOUT_IN_METHODS = ['Card', 'Transfer', 'Qris'];

// ============================================================
// AUTH — local-first, async-ready, single source of truth.
// Designed for Opsi 2 migration: swap AuthStorage body to API calls,
// keep Auth API surface identical. All callers already `await`.
// ============================================================

const PERMISSIONS = {
  MANAGE_SETTINGS:    'manage_settings',
  MANAGE_USERS:       'manage_users',
  DELETE_HISTORY:     'delete_history',
  EDIT_TRANSACTION:   'edit_transaction',
  DELETE_TRANSACTION: 'delete_transaction',
  EXPORT_DATA:        'export_data',
  CLOSE_SHIFT:        'close_shift',
  CREATE_TRANSACTION: 'create_transaction',
};

const ROLE_PERMISSIONS = {
  admin:   '*',
  cashier: [
    PERMISSIONS.CREATE_TRANSACTION,
    PERMISSIONS.EDIT_TRANSACTION,   // cashier can fix typos in their own work
    PERMISSIONS.CLOSE_SHIFT,
    PERMISSIONS.EXPORT_DATA,
  ],
};

// AuthStorage is provided globally by supabase.js (Supabase-backed adapter).
// API surface: getUsers(), saveUsers(users), getSession(), saveSession(s), clearSession().

const Auth = {
  _currentUser: null,

  async _hashPIN(pin, salt) {
    const data = new TextEncoder().encode(salt + pin);
    const buf  = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
  },

  async _generateSalt() {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return btoa(String.fromCharCode(...arr));
  },

  async _buildPinHash(pin) {
    if (!pin) return null;
    const salt = await this._generateSalt();
    const hash = await this._hashPIN(pin, salt);
    return `sha256:${salt}:${hash}`;
  },

  _normalizeEmail(email) {
    const value = String(email || '').trim().toLowerCase();
    if (!value) return null;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new Error('invalidEmail');
    return value;
  },

  async createUser({ username, pin, role, email }) {
    const users = await AuthStorage.getUsers();
    const cleanEmail = this._normalizeEmail(email);
    if (role === 'admin' && !cleanEmail) throw new Error('adminEmailRequired');
    if (users.some(u => u.username === username)) {
      throw new Error('userExists');
    }
    if (cleanEmail && users.some(u => (u.email || '') === cleanEmail)) {
      throw new Error('emailInUse');
    }
    // Raw UUID — must match pos_users.id UUID column on Supabase.
    const user = {
      id:        crypto.randomUUID(),
      username,
      pinHash:   await this._buildPinHash(pin),
      role,
      email:     cleanEmail,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    await AuthStorage.saveUsers(users);
    return user;
  },

  async login(username, pin) {
    const users = await AuthStorage.getUsers();
    const user  = users.find(u => u.username === username);
    if (!user) return { ok: false, reason: 'not_found' };
    if (user.pinHash) {
      if (!pin) return { ok: false, reason: 'pin_required' };
      if (!(await this.verifyPin(user, pin))) return { ok: false, reason: 'wrong_pin' };
    }
    const session = { userId: user.id, loginAt: new Date().toISOString() };
    await AuthStorage.saveSession(session);
    this._currentUser = user;
    return { ok: true, user };
  },

  async verifyPin(user, pin) {
    if (!user?.pinHash || !pin) return false;
    const [, salt, expected] = user.pinHash.split(':');
    const got = await this._hashPIN(pin, salt);
    return got === expected;
  },

  async logout() {
    await AuthStorage.clearSession();
    this._currentUser = null;
  },

  async restoreSession() {
    const s = await AuthStorage.getSession();
    if (!s) return null;
    const users = await AuthStorage.getUsers();
    const user  = users.find(u => u.id === s.userId);
    if (!user) { await this.logout(); return null; }
    this._currentUser = user;
    return user;
  },

  currentUser() { return this._currentUser; },
  hasRole(role) { return this._currentUser?.role === role; },

  can(permission) {
    const u = this._currentUser;
    if (!u) return false;
    const perms = ROLE_PERMISSIONS[u.role];
    return perms === '*' || (Array.isArray(perms) && perms.includes(permission));
  },

  async setUsername(userId, newUsername) {
    const newName = (newUsername || '').trim();
    if (!newName) throw new Error('userNotFound');
    const users = await AuthStorage.getUsers();
    if (users.some(u => u.id !== userId && u.username === newName)) {
      throw new Error('userExists');
    }
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('userNotFound');
    users[idx].username = newName;
    await AuthStorage.saveUsers(users);
  },

  async setUserPIN(userId, newPin) {
    const users = await AuthStorage.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('userNotFound');
    users[idx].pinHash = await this._buildPinHash(newPin);
    await AuthStorage.saveUsers(users);
    if (this._currentUser?.id === userId) this._currentUser.pinHash = users[idx].pinHash;
  },

  async setUserEmail(userId, email) {
    const users = await AuthStorage.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('userNotFound');
    const cleanEmail = this._normalizeEmail(email);
    if (users[idx].role === 'admin' && !cleanEmail) throw new Error('adminEmailRequired');
    if (cleanEmail && users.some(u => u.id !== userId && (u.email || '') === cleanEmail)) {
      throw new Error('emailInUse');
    }
    users[idx].email = cleanEmail;
    await AuthStorage.saveUsers(users);
    if (this._currentUser?.id === userId) this._currentUser.email = cleanEmail;
  },

  async setUserRole(userId, role) {
    const users = await AuthStorage.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('userNotFound');
    if (users[idx].role === 'admin' && role !== 'admin') {
      const adminCount = users.filter(u => u.role === 'admin').length;
      if (adminCount <= 1) throw new Error('cannotDemoteLastAdmin');
    }
    if (role === 'admin' && !users[idx].email) throw new Error('adminEmailRequired');
    users[idx].role = role;
    await AuthStorage.saveUsers(users);
  },

  async deleteUser(userId) {
    const users = await AuthStorage.getUsers();
    const target = users.find(u => u.id === userId);
    if (!target) return false;
    if (target.role === 'admin') {
      const adminCount = users.filter(u => u.role === 'admin').length;
      if (adminCount <= 1) throw new Error('cannotDeleteLastAdmin');
    }
    await AuthStorage.saveUsers(users.filter(u => u.id !== userId));
    return true;
  },
};

// `t()` shorthand is defined globally in lang.js (loaded before this file)

class ChillPOS {
  constructor() {
    // Defaults — real values bind to DataStore after hydrate() in bootstrap().
    this.transactions = [];
    this.categories   = [...DEFAULT_CATEGORIES];
    this.staffList    = Validator.sanitizeStringList(
      Storage.get('pos_staff', null), DEFAULT_STAFF
    );
    this.brandName    = DEFAULT_BRAND;
    this.shiftActive  = false;

    this.currentEditId = null;
    this.confirmAction = null;
    this.sortState     = { kolom: 'tanggalWaktu', arah: 'desc' };
    this.filterState   = { type: '', category: '', method: '', query: '' };
    this.txPage        = 1;

    this.initElements();
    this.initEventListeners();
    this.initTheme();
    this.initLang();
    this.renderAll();

    // Async bootstrap: access gate → Supabase config → hydrate → realtime → auth.
    this.bootstrap();
  }

  // ============================================================
  // BOOTSTRAP — orchestrates the cold-start sequence.
  // 1. Access gate (local secret)
  // 2. Supabase config check (first-run wizard if missing)
  // 3. Hydrate cache from Supabase (error modal on failure)
  // 4. Subscribe realtime + register UI listeners
  // 5. Hand off to bootstrapAuth (existing wizard / login flow)
  // ============================================================

  async bootstrap() {
    if (!Storage.get(STORAGE_KEY_ACCESS, false) || !AccessGate.isCodeVersionValid()) {
      this.showAccessGate();
      return;
    }
    DataStore.setMode('cloud');
    this._bindOfflineQueueBanner();

    if (!SupabaseConfig.load()) {
      this.showSupabaseSetupModal();
      return;
    }
    try {
      await DataStore.hydrate();
    } catch (e) {
      this._showSupabaseError(e);
      return;
    }
    this._bindDataStore();
    DataStore.subscribeRealtime();
    this._registerRealtimeListeners();
    // Paint the loaded shop before Auth runs. A reset-link session must not
    // block the rows that were just read.
    this.renderAll();
    let pinReset = false;
    try { pinReset = await this._preparePinResetFromEmail(); }
    catch (e) { console.error('[Auth] PIN reset link failed:', e); }
    if (pinReset) return;
    await this.bootstrapAuth();
  }

  // One-time wiring: OfflineQueue + browser online/offline events both
  // trigger the same banner re-render. Idempotent — safe to call repeatedly,
  // but bootstrap only calls it once per page load.
  _bindOfflineQueueBanner() {
    if (this._offlineBannerBound) return;
    this._offlineBannerBound = true;
    const rerender = () => this._renderOfflineBanner();
    if (window.OfflineQueue) OfflineQueue.on((state) => this._renderOfflineBanner(state));
    window.addEventListener('online',  rerender);
    window.addEventListener('offline', rerender);
    this._renderOfflineBanner();
  }

  // Render the offline / sync-queue banner. Hidden unless we're offline,
  // a close is stuck, or there are queued writes. Bound to OfflineQueue.
  _renderOfflineBanner(state) {
    const el   = document.getElementById('offline-banner');
    const icon = document.getElementById('offline-banner-icon');
    const text = document.getElementById('offline-banner-text');
    if (!el || !icon || !text) return;
    const size     = state ? state.size     : (window.OfflineQueue ? OfflineQueue.size() : 0);
    const flushing = state ? state.flushing : false;
    const online   = state ? state.online   : (navigator.onLine !== false);

    const blocked = state ? !!state.blocked : !!(window.OfflineQueue && OfflineQueue.blocked());
    if (blocked) {
      el.style.display = 'block';
      el.style.background  = '#fee2e2';
      el.style.color       = '#7f1d1d';
      el.style.borderColor = '#fca5a5';
      icon.className       = 'fas fa-exclamation-triangle';
      text.textContent     = t('syncCloseFailed');
      return;
    }

    if (online && size === 0) { el.style.display = 'none'; return; }

    el.style.display = 'block';
    if (!online && size === 0) {
      el.style.background  = '#fee2e2';
      el.style.color       = '#7f1d1d';
      el.style.borderColor = '#fca5a5';
      icon.className       = 'fas fa-wifi';
      text.textContent     = t('offlineBanner');
    } else if (!online && size > 0) {
      el.style.background  = '#fee2e2';
      el.style.color       = '#7f1d1d';
      el.style.borderColor = '#fca5a5';
      icon.className       = 'fas fa-cloud-upload-alt';
      text.textContent     = t('offlineQueued').replace('{n}', String(size));
    } else {
      // Online with non-empty queue — flushing or about to.
      el.style.background  = '#dbeafe';
      el.style.color       = '#1e3a8a';
      el.style.borderColor = '#93c5fd';
      icon.className       = flushing ? 'fas fa-spinner fa-spin' : 'fas fa-cloud-upload-alt';
      text.textContent     = t('syncingQueued').replace('{n}', String(size));
    }
  }

  // Pair this device with the Mantra Lombok POS project: only the publishable
  // key is asked for (the URL is fixed). On submit: save config, hydrate, then
  // continue to the first-run wizard or login.
  showSupabaseSetupModal() {
    const modal = document.getElementById('sb-setup-modal');
    const form  = document.getElementById('sb-setup-form');
    const btn   = document.getElementById('sb-setup-submit');
    document.getElementById('sb-setup-key').value = '';
    modal.style.display = 'flex';
    setTimeout(() => document.getElementById('sb-setup-key').focus(), 50);

    form.onsubmit = async (e) => {
      e.preventDefault();
      const url = MANTRA_SUPABASE_URL;
      const key = document.getElementById('sb-setup-key').value;
      if (!SupabaseConfig.isValidKey(key)) { this.showAlert(t('invalidSupabaseKey'), 'error'); return; }
      const originalHTML = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      try {
        SupabaseConfig.save(url, key);
        await DataStore.hydrate();
      } catch (err) {
        SupabaseConfig.clear();
        btn.disabled = false;
        btn.innerHTML = originalHTML;
        this.showAlert(`${t('sbErrorHint')} (${err?.message || err})`, 'error');
        return;
      }
      this._bindDataStore();
      DataStore.subscribeRealtime();
      this._registerRealtimeListeners();
      modal.style.display = 'none';
      btn.disabled = false;
      btn.innerHTML = originalHTML;
      this.renderAll();
      await this.bootstrapAuth();
    };
  }

  // Bind in-memory references to DataStore arrays so they stay in sync
  // with realtime updates. Caller MUST NOT reassign these arrays — use
  // splice/push/length=0 or DataStore CRUD methods instead.
  _bindDataStore() {
    this.transactions = DataStore.transactions;
    this.categories   = DataStore.categories;
    this.brandName    = DataStore.settings.brand;
    this.shiftActive  = DataStore.settings.shiftActive;
  }

  // Wire DataStore realtime events to UI re-render hooks.
  _registerRealtimeListeners() {
    DataStore.on('transactions', () => this.renderAll());

    DataStore.on('categories', () => {
      // Refresh open Settings categories list (if open)
      if (this.elements.settingsModal?.style.display === 'flex') {
        this.renderCategoriesList();
      }
    });

    DataStore.on('users', () => {
      this._syncStaffFromUsers().then(() => {
        if (document.getElementById('users-modal')?.style.display === 'flex') {
          this.renderUsersList();
        }
      });
    });

    // Sessions are per-device (stored in localStorage), so we deliberately do
    // NOT subscribe to remote session changes — logout on one device must not
    // kick another device out.

    DataStore.on('settings', () => {
      this.brandName   = DataStore.settings.brand;
      this.shiftActive = DataStore.settings.shiftActive;
      this.renderBrandName();
      this.updateShiftUI();
    });

    DataStore.on('shifts', () => {
      // Main page only needs this for the "use last shift cash" prefill.
      if (this.elements.mulaiShiftModal?.style.display === 'flex') {
        this._renderLastShiftButton();
      }
    });
  }

  // Show the cloud-connection error modal with retry / reset actions.
  _showSupabaseError(err) {
    const modal  = document.getElementById('sb-error-modal');
    const detail = document.getElementById('sb-error-detail');
    detail.textContent = err?.message || String(err);
    modal.style.display = 'flex';
    document.getElementById('sb-error-retry').onclick = () => {
      modal.style.display = 'none';
      this.bootstrap();
    };
    document.getElementById('sb-error-reset').onclick = () => {
      if (!confirm(t('confirmResetSupabase'))) return;
      SupabaseConfig.clear();
      window.location.reload();
    };
  }

  // ============================================================
  // AUTH BOOTSTRAP & UI
  // ============================================================

  async bootstrapAuth() {
    if (!Storage.get(STORAGE_KEY_ACCESS, false) || !AccessGate.isCodeVersionValid()) {
      this.showAccessGate();
      return;
    }
    const users = await AuthStorage.getUsers();
    if (this.isFirstRun()) {
      this.showFirstRunWizard();
      return;
    }
    if (users.length === 0) {
      this.showSetupAdminModal();   // existing data, no users yet
      return;
    }
    const restored = await Auth.restoreSession();
    if (restored) {
      await this._syncStaffFromUsers();
      this.onLoginSuccess(restored);
      return;
    }
    this.showLoginModal();
  }

  showAccessGate() {
    const modal = document.getElementById('access-gate-modal');
    const form  = document.getElementById('access-gate-form');
    const err   = document.getElementById('access-gate-error');
    modal.style.display = 'flex';
    document.getElementById('access-code-input').focus();
    form.onsubmit = async (e) => {
      e.preventDefault();
      const input = document.getElementById('access-code-input').value;
      if (await AccessGate.verify(input)) {
        Storage.set(STORAGE_KEY_ACCESS, true);
        modal.style.display = 'none';
        this.bootstrap();
      } else {
        err.style.display = 'block';
        document.getElementById('access-code-input').value = '';
        document.getElementById('access-code-input').focus();
      }
    };
  }

  // Forgot PIN sends a Supabase Auth email to that user's own address.
  // The link (or the code in the same email) proves they own the inbox,
  // then this screen asks for a new PIN. A cashier with no email is reset
  // by an admin from Manage Users. There is no shared access code.
  async showResetPinModal() {
    this._pinResetUser = null;
    const sel = document.getElementById('rp-user');
    sel.innerHTML = '';
    const users = await AuthStorage.getUsers();
    users.forEach(u => {
      const opt = document.createElement('option');
      opt.value = u.id;
      opt.textContent = `${u.username} (${t(u.role === 'admin' ? 'roleAdmin' : 'roleCashier')})`;
      sel.appendChild(opt);
    });
    document.getElementById('reset-pin-form').reset();
    document.getElementById('rp-code').value = '';
    this._showResetPinStep('request');
    document.getElementById('login-modal').style.display = 'none';
    document.getElementById('reset-pin-modal').style.display = 'flex';
    this._refreshResetPinHint();
  }

  _showResetPinStep(step) {
    this._pinResetStep = step;
    const request = step === 'request';
    const choose  = step === 'choose';
    document.getElementById('rp-user-group').style.display = request ? '' : 'none';
    document.getElementById('rp-code-group').style.display = request ? '' : 'none';
    document.getElementById('rp-new-pin-group').style.display = choose ? '' : 'none';
    const submit = document.getElementById('rp-submit');
    const label = submit.querySelector('span');
    if (label) label.textContent = choose ? t('resetPinBtn') : t('sendResetLink');
    document.getElementById('rp-hint').textContent = choose
      ? t('resetPinChooseHint', this._pinResetUser?.username || '')
      : t('resetPinHint');
    if (request) this._refreshResetPinHint();
  }

  async _refreshResetPinHint() {
    if (this._pinResetStep !== 'request') return;
    const users = await AuthStorage.getUsers();
    const user = users.find(u => u.id === document.getElementById('rp-user').value);
    const note = document.getElementById('rp-no-email');
    const submit = document.getElementById('rp-submit');
    const codeGroup = document.getElementById('rp-code-group');
    if (!user || !user.email) {
      note.style.display = '';
      note.textContent = !user ? ''
        : (user.role === 'admin' ? t('resetPinNoEmailAdmin') : t('resetPinNoEmailCashier'));
      submit.style.display = 'none';
      codeGroup.style.display = 'none';
      return;
    }
    note.style.display = 'none';
    submit.style.display = '';
    codeGroup.style.display = '';
  }

  hideResetPinModal() {
    document.getElementById('reset-pin-modal').style.display = 'none';
    this._pinResetUser = null;
    this.showLoginModal();
  }

  async _preparePinResetFromEmail() {
    let sb;
    try { sb = getResetAuth(); } catch { return false; }
    const { data } = await sb.auth.getSession();
    const email = data?.session?.user?.email;
    if (!email) return false;
    try { await sb.auth.signOut(); } catch {}
    if (window.location.hash || /[?&]code=/.test(window.location.search)) {
      history.replaceState(null, '', window.location.pathname + window.location.search.replace(/([?&])code=[^&]*&?/, '$1').replace(/[?&]$/, ''));
    }
    const user = DataStore.users.find(u => (u.email || '') === String(email).trim().toLowerCase());
    if (!user) {
      this.showAlert(t('resetPinEmailMismatch'), 'error');
      return false;
    }
    this._pinResetUser = user;
    document.getElementById('login-modal').style.display = 'none';
    document.getElementById('reset-pin-modal').style.display = 'flex';
    this._showResetPinStep('choose');
    return true;
  }

  async handleResetPin() {
    if (this._pinResetStep === 'choose') {
      await this._saveResetPin(this._pinResetUser && this._pinResetUser.id);
      return;
    }
    const users = await AuthStorage.getUsers();
    const user = users.find(u => u.id === document.getElementById('rp-user').value);
    if (!user) { this.showAlert(t('userNotFound'), 'error'); return; }
    if (!user.email) {
      this.showAlert(user.role === 'admin' ? t('resetPinNoEmailAdmin') : t('resetPinNoEmailCashier'), 'error');
      return;
    }
    const code = document.getElementById('rp-code').value.trim();
    if (code) {
      await this._verifyResetCode(user, code);
      return;
    }
    const btn = document.getElementById('rp-submit');
    const original = btn.innerHTML;
    btn.disabled = true;
    try {
      const redirect = window.location.origin + window.location.pathname;
      const { error } = await getResetAuth().auth.signInWithOtp({
        email: user.email,
        options: { emailRedirectTo: redirect, shouldCreateUser: true },
      });
      if (error) throw error;
      this._pinResetUser = user;
      this.showAlert(t('resetPinSent', user.email), 'success');
      document.getElementById('rp-hint').textContent = t('resetPinSentHint');
    } catch (e) {
      this.showAlert(t('resetPinSendFailed') + (e?.message ? ` (${e.message})` : ''), 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = original;
    }
  }

  async _verifyResetCode(user, code) {
    try {
      const { data, error } = await getResetAuth().auth.verifyOtp({
        email: user.email,
        token: code,
        type: 'email',
      });
      if (error) throw error;
      const email = data?.user?.email || data?.session?.user?.email;
      if (!email || email.toLowerCase() !== user.email) throw new Error('resetPinEmailMismatch');
      try { await getResetAuth().auth.signOut(); } catch {}
      this._pinResetUser = user;
      document.getElementById('rp-code').value = '';
      this._showResetPinStep('choose');
    } catch (e) {
      this.showAlert(t(e.message) === e.message ? t('resetPinCodeWrong') : (t(e.message) || e.message), 'error');
    }
  }

  async _saveResetPin(userId) {
    const newPin  = document.getElementById('rp-new-pin').value;
    const confirm = document.getElementById('rp-confirm-pin').value;
    if (!/^\d{4,6}$/.test(newPin)) { this.showAlert(t('pinTooShort'), 'error'); return; }
    if (newPin !== confirm)        { this.showAlert(t('pinMismatch'),  'error'); return; }
    if (!userId) { this.showAlert(t('userNotFound'), 'error'); return; }
    try {
      await Auth.setUserPIN(userId, newPin);
      document.getElementById('reset-pin-modal').style.display = 'none';
      this._pinResetUser = null;
      this.showAlert(t('alertPinReset'), 'success');
      this.showLoginModal();
    } catch (e) {
      this.showAlert(t(e.message) || e.message, 'error');
    }
  }

  onLoginSuccess(user) {
    this.applyAuthUI();
    this.checkShiftStatus();
  }

  applyAuthUI() {
    const u = Auth.currentUser();
    const userMenuBtn = document.getElementById('user-menu');
    if (u) {
      document.getElementById('user-label').textContent = u.username;
      document.getElementById('user-menu-name').textContent = u.username;
      document.getElementById('user-menu-role').textContent = t(u.role === 'admin' ? 'roleAdmin' : 'roleCashier');
      userMenuBtn.style.display = '';
    } else {
      userMenuBtn.style.display = 'none';
    }
    // Apply role guards on UI elements
    document.getElementById('open-settings').style.display = Auth.can(PERMISSIONS.MANAGE_SETTINGS) ? '' : 'none';
    // Re-render table so per-row edit/delete buttons reflect role
    this.renderTransaksiTable();
  }

  showLoginModal() {
    const sel = document.getElementById('login-user');
    sel.innerHTML = '';
    DataStore.users.forEach(u => {
      const opt = document.createElement('option');
      opt.value = u.username;
      opt.textContent = u.username;
      opt.dataset.hasPin = u.pinHash ? '1' : '0';
      sel.appendChild(opt);
    });
    this._togglePinFieldVisibility();
    document.getElementById('login-pin').value = '';
    document.getElementById('login-modal').style.display = 'flex';
  }

  _togglePinFieldVisibility() {
    const sel = document.getElementById('login-user');
    const opt = sel.options[sel.selectedIndex];
    const needsPin = opt && opt.dataset.hasPin === '1';
    const pinGroup = document.getElementById('login-pin-group');
    pinGroup.style.display = needsPin ? '' : 'none';
    document.getElementById('login-pin').required = !!needsPin;
  }

  async handleLogin() {
    const username = document.getElementById('login-user').value;
    const pin      = document.getElementById('login-pin').value;
    const result   = await Auth.login(username, pin);
    if (!result.ok) {
      const msg = result.reason === 'wrong_pin' ? t('wrongPin')
                : result.reason === 'not_found' ? t('userNotFound')
                : t('pinTooShort');
      this.showAlert(msg, 'error');
      return;
    }
    document.getElementById('login-modal').style.display = 'none';
    await this._syncStaffFromUsers();
    this.onLoginSuccess(result.user);
  }

  async handleLogout() {
    await Auth.logout();
    document.getElementById('user-menu-popup').style.display = 'none';
    // Close any modal that should not survive a logout
    this.elements.mulaiShiftModal.style.display = 'none';
    this.showLoginModal();
  }

  // Setup-admin modal — for installs with existing data but no users yet
  showSetupAdminModal() {
    const sel = document.getElementById('sa-admin-name');
    sel.innerHTML = '';
    this.staffList.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s; opt.textContent = s;
      sel.appendChild(opt);
    });
    document.getElementById('sa-admin-email').value = '';
    document.getElementById('sa-admin-pin').value  = '';
    document.getElementById('sa-admin-pin2').value = '';
    document.getElementById('setup-admin-modal').style.display = 'flex';
  }

  async saveSetupAdmin() {
    const name = document.getElementById('sa-admin-name').value;
    const email = document.getElementById('sa-admin-email').value;
    const pin  = document.getElementById('sa-admin-pin').value;
    const pin2 = document.getElementById('sa-admin-pin2').value;
    if (!/^\d{4,6}$/.test(pin))   { this.showAlert(t('pinTooShort'), 'error'); return; }
    if (pin !== pin2)             { this.showAlert(t('pinMismatch'), 'error'); return; }
    try {
      // Create the chosen admin (with PIN), and others as cashier (no PIN)
      for (const s of this.staffList) {
        await Auth.createUser({
          username: s,
          pin: s === name ? pin : null,
          role: s === name ? 'admin' : 'cashier',
          email: s === name ? email : null,
        });
      }
      const result = await Auth.login(name, pin);
      if (!result.ok) { this.showAlert(t('userNotFound'), 'error'); return; }
      document.getElementById('setup-admin-modal').style.display = 'none';
      await this._syncStaffFromUsers();
      this.onLoginSuccess(result.user);
    } catch (e) {
      this.showAlert(t(e.message) || e.message, 'error');
    }
  }

  // ============================================================
  // STAFF SYNC — single source of truth = pos_users
  // ============================================================

  async _syncStaffFromUsers() {
    const users = await AuthStorage.getUsers();
    this.staffList = users.map(u => u.username);
    Storage.set('pos_staff', this.staffList);
    // Reflect in Settings list if it's open
    if (this.elements.settingsModal.style.display === 'flex') {
      this.renderStaffList();
    }
  }

  // Renders the read-only staff list (card style, parallels renderCategoriesList).
  // Source of truth = DataStore.users so role badges stay correct without
  // an extra lookup. "Manage Users" remains the only mutation entrypoint.
  renderStaffList() {
    const list = this.elements.settingsStaffList;
    if (!list) return;
    list.innerHTML = '';
    const cur = Auth.currentUser();
    DataStore.users.forEach(u => {
      const isSelf = cur?.id === u.id;
      const row = document.createElement('div');
      row.className = 'cat-row';
      row.style.cursor = 'default';
      row.innerHTML = `
        <i class="fas fa-user cat-lock" title="${this.escapeHtml(t('staffViewOnly'))}"></i>
        <span class="cat-name">${this.escapeHtml(u.username)}${isSelf ? ' <small style="color:var(--gray);font-weight:400">(you)</small>' : ''}</span>
        <span class="role-badge role-${u.role}" style="font-size:0.7rem;padding:2px 8px;border-radius:10px;font-weight:600">${this.escapeHtml(t(u.role === 'admin' ? 'roleAdmin' : 'roleCashier'))}</span>
      `;
      list.appendChild(row);
    });
  }

  // ============================================================
  // CATEGORIES CARD UI (Settings)
  // ============================================================

  renderCategoriesList() {
    const list = document.getElementById('settings-categories-list');
    list.innerHTML = '';
    this.categories.forEach((cat, idx) => {
      const isSystem = SYSTEM_CATEGORIES.includes(cat);
      const row = document.createElement('div');
      row.className = 'cat-row' + (isSystem ? ' cat-system' : '');
      if (!isSystem) row.draggable = true;
      row.dataset.idx = idx;
      row.innerHTML = isSystem
        ? `
          <i class="fas fa-lock cat-lock"  title="System category"></i>
          <span class="cat-name">${this.escapeHtml(cat)}</span>
          <span class="cat-badge" data-i18n="systemBadge">${t('systemBadge')}</span>
        `
        : `
          <i class="fas fa-grip-vertical cat-drag" title="Drag to reorder"></i>
          <span class="cat-name">${this.escapeHtml(cat)}</span>
          ${this._categoryTypeSelect(cat, idx)}
          <button type="button" class="cat-btn cat-edit"   data-idx="${idx}" title="Rename"><i class="fas fa-pen"></i></button>
          <button type="button" class="cat-btn cat-delete" data-idx="${idx}" title="Delete"><i class="fas fa-times"></i></button>
        `;
      list.appendChild(row);
    });
    // Dependent checkbox lists must stay in sync with the master categories list.
    if (document.getElementById('settings-admin-cats'))      this.renderAdminCategoriesList();
    if (document.getElementById('settings-nonrevenue-cats')) this.renderNonRevenueCategoriesList();
  }

  _categoryTypesDraftOrSaved() {
    if (!this._categoryTypesDraft) {
      this._categoryTypesDraft = { ...(DataStore.settings.categoryTypes || {}) };
    }
    return this._categoryTypesDraft;
  }

  // Paired categories (TarikTunai, PETTY-CASH) always write one row on each side.
  _categoryTypeSelect(cat, idx) {
    if (SYSTEM_NON_REVENUE.includes(cat)) return '';
    const type = this._categoryTypesDraftOrSaved()[cat] || '';
    const option = (value, key) =>
      `<option value="${value}"${type === value ? ' selected' : ''}>${this.escapeHtml(t(key))}</option>`;
    return `
      <select class="cat-type" data-idx="${idx}" title="${this.escapeHtml(t('catTypeLabel'))}">
        ${option('', 'catTypeBoth')}
        ${option('INCOME', 'catTypeIncome')}
        ${option('OUTGOING', 'catTypeOutgoing')}
      </select>`;
  }

  setCategoryType(idx, type) {
    const cat = this.categories[idx];
    if (!cat) return;
    const draft = this._categoryTypesDraftOrSaved();
    if (type === 'INCOME' || type === 'OUTGOING') draft[cat] = type;
    else delete draft[cat];
  }

  addCategoryFlow() {
    const name = (prompt(t('addCategoryPrompt'), '') || '').trim();
    if (!name) return;
    if (this.categories.includes(name)) {
      this.showAlert(t('categoryExists'), 'error'); return;
    }
    this.categories.push(name);
    this.renderCategoriesList();
  }

  editCategoryFlow(idx) {
    const old = this.categories[idx];
    if (!old || SYSTEM_CATEGORIES.includes(old)) return;
    const name = (prompt(t('renameCategoryPrompt'), old) || '').trim();
    if (!name || name === old) return;
    if (this.categories.includes(name)) {
      this.showAlert(t('categoryExists'), 'error'); return;
    }
    this.categories[idx] = name;
    const draft = this._categoryTypesDraftOrSaved();
    if (draft[old]) { draft[name] = draft[old]; delete draft[old]; }
    this.renderCategoriesList();
  }

  deleteCategoryFlow(idx) {
    const cat = this.categories[idx];
    if (!cat || SYSTEM_CATEGORIES.includes(cat)) return;
    this.categories.splice(idx, 1);
    delete this._categoryTypesDraftOrSaved()[cat];
    this.renderCategoriesList();
  }

  _initCategoryDnD() {
    const list = document.getElementById('settings-categories-list');
    let dragIdx = null;
    list.addEventListener('dragstart', (e) => {
      const row = e.target.closest('.cat-row[draggable="true"]');
      if (!row) return;
      dragIdx = parseInt(row.dataset.idx, 10);
      row.classList.add('dragging');
    });
    list.addEventListener('dragend', () => {
      list.querySelectorAll('.dragging').forEach(r => r.classList.remove('dragging'));
      dragIdx = null;
    });
    list.addEventListener('dragover', (e) => {
      e.preventDefault();
      const target = e.target.closest('.cat-row');
      if (!target || dragIdx === null) return;
      const overIdx = parseInt(target.dataset.idx, 10);
      if (overIdx === dragIdx) return;
      // Don't allow dropping into a system row's slot
      if (SYSTEM_CATEGORIES.includes(this.categories[overIdx])) return;
      const moved = this.categories.splice(dragIdx, 1)[0];
      this.categories.splice(overIdx, 0, moved);
      dragIdx = overIdx;
      this.renderCategoriesList();
    });
  }

  // ============================================================
  // USER MANAGEMENT (admin only)
  // ============================================================

  async showUsersModal() {
    if (!Auth.can(PERMISSIONS.MANAGE_USERS)) {
      this.showAlert(t('noPermission'), 'error'); return;
    }
    await this.renderUsersList();
    document.getElementById('add-user-form').reset();
    document.getElementById('users-modal').style.display = 'flex';
  }

  async renderUsersList() {
    const users = await AuthStorage.getUsers();
    const cur   = Auth.currentUser();
    const list  = document.getElementById('users-list');
    list.innerHTML = '';
    users.forEach(u => {
      const isSelf = cur && cur.id === u.id;
      const row = document.createElement('div');
      row.className = 'user-row';
      row.innerHTML = `
        <div class="user-row-info">
          <div class="user-row-name">${this.escapeHtml(u.username)}${isSelf ? ' <small>(you)</small>' : ''}</div>
          <div class="user-row-meta">
            <span class="role-badge role-${u.role}">${t(u.role === 'admin' ? 'roleAdmin' : 'roleCashier')}</span>
            <span class="pin-badge ${u.pinHash ? 'has-pin' : 'no-pin'}">${t(u.pinHash ? 'pinSet' : 'pinNone')}</span>
            <span class="pin-badge ${u.email ? 'has-pin' : 'no-pin'}">${this.escapeHtml(u.email || t('emailNone'))}</span>
          </div>
        </div>
        <div class="user-row-actions">
          <select class="user-role-select" data-id="${u.id}">
            <option value="cashier" ${u.role === 'cashier' ? 'selected' : ''}>${t('roleCashier')}</option>
            <option value="admin"   ${u.role === 'admin'   ? 'selected' : ''}>${t('roleAdmin')}</option>
          </select>
          <button class="btn small user-edit-name" data-id="${u.id}" data-name="${this.escapeHtml(u.username)}" title="Rename">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn small user-set-email" data-id="${u.id}" data-email="${this.escapeHtml(u.email || '')}" title="${this.escapeHtml(t('setEmail'))}">
            <i class="fas fa-envelope"></i>
          </button>
          <button class="btn small user-set-pin" data-id="${u.id}" data-name="${this.escapeHtml(u.username)}" title="Set/Reset PIN">
            <i class="fas fa-key"></i>
          </button>
          <button class="btn small danger user-delete" data-id="${u.id}" data-name="${this.escapeHtml(u.username)}" ${isSelf ? 'disabled' : ''} title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      list.appendChild(row);
    });
  }

  async addUserFromForm() {
    const username = document.getElementById('new-username').value.trim();
    const role     = document.getElementById('new-user-role').value;
    const pin      = document.getElementById('new-user-pin').value;
    const email    = document.getElementById('new-user-email').value;
    if (!username) return;
    if (pin && !/^\d{4,6}$/.test(pin)) { this.showAlert(t('pinTooShort'), 'error'); return; }
    try {
      await Auth.createUser({ username, pin: pin || null, role, email });
      document.getElementById('add-user-form').reset();
      await this._syncStaffFromUsers();
      await this.renderUsersList();
      this.showAlert(t('userCreated'), 'success');
    } catch (e) {
      this.showAlert(t(e.message) || e.message, 'error');
    }
  }

  async handleUserListClick(e) {
    const editNameBtn = e.target.closest('.user-edit-name');
    const setEmailBtn = e.target.closest('.user-set-email');
    const setPinBtn   = e.target.closest('.user-set-pin');
    const delBtn      = e.target.closest('.user-delete');
    if (editNameBtn) {
      const oldName = editNameBtn.dataset.name;
      const newName = (prompt(t('renameUserPrompt'), oldName) || '').trim();
      if (!newName || newName === oldName) return;
      try {
        await Auth.setUsername(editNameBtn.dataset.id, newName);
        // If the renamed user IS me, refresh the header badge
        if (Auth.currentUser()?.id === editNameBtn.dataset.id) {
          Auth.currentUser().username = newName;
          this.applyAuthUI();
        }
        await this._syncStaffFromUsers();
        await this.renderUsersList();
        this.showAlert(t('userUpdated'), 'success');
      } catch (e) { this.showAlert(t(e.message) || e.message, 'error'); }
    }
    if (setEmailBtn) {
      const next = prompt(t('emailPrompt'), setEmailBtn.dataset.email || '');
      if (next === null) return;
      try {
        await Auth.setUserEmail(setEmailBtn.dataset.id, next);
        await this.renderUsersList();
        this.showAlert(t('userUpdated'), 'success');
      } catch (e) { this.showAlert(t(e.message) || e.message, 'error'); }
    }
    if (setPinBtn) {
      const newPin = prompt(t('setPin') + ' (4-6 digits, empty to remove):', '');
      if (newPin === null) return;
      if (newPin && !/^\d{4,6}$/.test(newPin)) { this.showAlert(t('pinTooShort'), 'error'); return; }
      try {
        await Auth.setUserPIN(setPinBtn.dataset.id, newPin || null);
        await this.renderUsersList();
        this.showAlert(t('userUpdated'), 'success');
      } catch (e) { this.showAlert(t(e.message) || e.message, 'error'); }
    }
    if (delBtn) {
      const name = delBtn.dataset.name;
      this.showConfirm(t('confirmDeleteUser', name), async () => {
        try {
          await Auth.deleteUser(delBtn.dataset.id);
          await this._syncStaffFromUsers();
          await this.renderUsersList();
          this.showAlert(t('userDeleted'), 'success');
        } catch (e) { this.showAlert(t(e.message) || e.message, 'error'); }
      });
    }
  }

  async handleUserRoleChange(e) {
    const sel = e.target.closest('.user-role-select');
    if (!sel) return;
    try {
      await Auth.setUserRole(sel.dataset.id, sel.value);
      await this.renderUsersList();
    } catch (e) { this.showAlert(t(e.message) || e.message, 'error'); await this.renderUsersList(); }
  }

  // ============================================================
  // FIRST RUN WIZARD
  // ============================================================

  isFirstRun() {
    // Staff accounts mean the shop is already set up, even if the stored
    // brand is still the default "My Business".
    return this.brandName === DEFAULT_BRAND && DataStore.users.length === 0;
  }

  showFirstRunWizard() {
    document.getElementById('fr-brand').value      = '';
    document.getElementById('fr-admin-name').value = '';
    document.getElementById('fr-admin-email').value = '';
    document.getElementById('fr-admin-pin').value  = '';
    document.getElementById('fr-admin-pin2').value = '';
    document.getElementById('first-run-modal').style.display = 'flex';
  }

  // Category sides and non-revenue flags from the rental template, limited to
  // the names the owner kept. Categories the owner typed in stay untyped.
  async _applyShopDefaults(cats) {
    const keep = new Set(cats);
    const types = {};
    Object.entries(RENTAL_SHOP_DEFAULTS.types).forEach(([name, type]) => {
      if (keep.has(name)) types[name] = type;
    });
    await DataStore.saveSetting('category_types', types);
    await DataStore.saveSetting('non_revenue_categories',
      RENTAL_SHOP_DEFAULTS.nonRevenue.filter(name => keep.has(name)));
    await DataStore.saveSetting('template_applied', true);
  }

  async saveFirstRunWizard() {
    const brand = document.getElementById('fr-brand').value.trim();
    const adminName = document.getElementById('fr-admin-name').value.trim();
    const adminEmail = document.getElementById('fr-admin-email').value;
    const pin       = document.getElementById('fr-admin-pin').value;
    const pin2      = document.getElementById('fr-admin-pin2').value;
    // Categories come from the rental template and other staff are added in
    // Manage Users, so setup only needs the brand and the first admin.
    const cats  = [...DEFAULT_CATEGORIES];
    const staff = [adminName];

    if (!brand || !adminName) {
      this.showAlert(t('frFillBrandAdmin'), 'error'); return;
    }
    if (!/^\d{4,6}$/.test(pin)) { this.showAlert(t('pinTooShort'), 'error'); return; }
    if (pin !== pin2)           { this.showAlert(t('pinMismatch'), 'error'); return; }

    // Persist business setup. Brand + categories awaited so we know they're
    // durable before creating users (which is the point of no return).
    try {
      await DataStore.saveSetting('brand', brand);
      await DataStore.saveCategories(cats);
      await this._applyShopDefaults(cats);
    } catch (e) {
      this.showAlert(`${t('sbErrorHint')} (${e?.message || e})`, 'error');
      return;
    }
    this.brandName = brand;
    this.staffList = staff;
    Storage.set('pos_staff', staff);   // local cache for offline UI fallback

    try {
      await Auth.createUser({ username: adminName, pin, role: 'admin', email: adminEmail });
      const result = await Auth.login(adminName, pin);
      if (!result.ok) { this.showAlert(t('userNotFound'), 'error'); return; }
    } catch (e) {
      this.showAlert(t(e.message) || e.message, 'error'); return;
    }

    document.getElementById('first-run-modal').style.display = 'none';
    await this._syncStaffFromUsers();
    this.renderAll();
    this.onLoginSuccess(Auth.currentUser());
  }

  // ============================================================
  // INITIALIZATION
  // ============================================================

  initElements() {
    this.elements = {
      dashboard:          document.getElementById('dashboard'),
      transaksiTable:     document.getElementById('transaksi-table').querySelector('tbody'),
      newTransaksiBtn:    document.getElementById('new-transaksi'),
      downloadExcelBtn:   document.getElementById('download-excel'),
      tutupShiftBtn:      document.getElementById('tutup-shift'),
      openSettingsBtn:    document.getElementById('open-settings'),
      themeToggleBtn:     document.getElementById('theme-toggle'),
      langToggleBtn:      document.getElementById('lang-toggle'),
      langLabel:          document.getElementById('lang-label'),
      formModal:          document.getElementById('form-modal'),
      confirmModal:       document.getElementById('confirm-modal'),
      settingsModal:      document.getElementById('settings-modal'),
      transaksiForm:      document.getElementById('transaksi-form'),
      currentDate:        document.getElementById('current-date'),
      alertContainer:     document.getElementById('alert-container'),
      // Transaction form fields
      fKategori:    document.getElementById('f-kategori'),
      fMetode:      document.getElementById('f-metode'),
      fStaff:       document.getElementById('f-staff'),
      fDeskripsi:   document.getElementById('f-deskripsi'),
      fJumlah:      document.getElementById('f-jumlah'),
      fJumlahPrev:  document.getElementById('f-jumlah-preview'),
      fKeterangan:  document.getElementById('f-keterangan'),
      // Settings fields (categories handled via card UI, not a single textarea)
      settingsBrand:      document.getElementById('settings-brand'),
      settingsStaffList:  document.getElementById('settings-staff-list'),
      // Start Shift modal
      mulaiShiftModal: document.getElementById('mulai-shift-modal'),
      mulaiShiftForm:  document.getElementById('mulai-shift-form'),
      msStaff:         document.getElementById('ms-staff'),
      msCash:          document.getElementById('ms-cash'),
      msCashPreview:   document.getElementById('ms-cash-preview'),
      msPin:           document.getElementById('ms-pin'),
      msPinHint:       document.getElementById('ms-pin-hint'),
      msLogout:        document.getElementById('ms-logout'),
      msSubtitle:      document.getElementById('ms-subtitle'),
      msUseLast:       document.getElementById('ms-use-last'),
      msAmountChips:   document.getElementById('ms-amount-chips'),
      // Close Shift modal
      tutupShiftModal:     document.getElementById('tutup-shift-modal'),
      tsStepInput:         document.getElementById('ts-step-input'),
      tsStepSummary:       document.getElementById('ts-step-summary'),
      tsActualCash:            document.getElementById('ts-actual-cash'),
      tsActualCashPreview:     document.getElementById('ts-actual-cash-preview'),
      tsActualCard:            document.getElementById('ts-actual-card'),
      tsActualCardPreview:     document.getElementById('ts-actual-card-preview'),
      tsActualTransfer:        document.getElementById('ts-actual-transfer'),
      tsActualTransferPreview: document.getElementById('ts-actual-transfer-preview'),
      tsActualQris:            document.getElementById('ts-actual-qris'),
      tsActualQrisPreview:     document.getElementById('ts-actual-qris-preview'),
      tsSummaryContent:        document.getElementById('ts-summary-content'),
    };
  }

  initEventListeners() {
    // Help modal — triggered from Welcome Wizard + Settings (removed from header)
    document.getElementById('wizard-help').addEventListener('click',   () => this.showHelp());
    document.getElementById('settings-help').addEventListener('click', () => this.showHelp());
    document.getElementById('close-help').addEventListener('click',    () => this.hideHelp());

    // Chili icon — hides/shows the menu icons row AND the filter panel together
    // as one unit. Single listener, no competing toggles.
    const toggleBtn = document.getElementById('toggle-header');
    const filterPanel = document.getElementById('filter-panel');
    const setHeaderHidden = (hidden) => {
      document.body.classList.toggle('header-hidden', hidden);
      Storage.set('pos_header_hidden', hidden);
      if (filterPanel) filterPanel.style.display = hidden ? 'none' : 'block';
      toggleBtn.querySelector('.pepper-icon').classList.toggle('flipped', hidden);
      const menuLabel = hidden ? 'Show menu' : 'Hide menu';
      toggleBtn.title = menuLabel;
      toggleBtn.setAttribute('aria-label', menuLabel);
      toggleBtn.setAttribute('aria-expanded', hidden ? 'false' : 'true');
    };
    toggleBtn.addEventListener('click', () => {
      setHeaderHidden(!document.body.classList.contains('header-hidden'));
    });
    // Default: both visible (matches the normal app appearance).
    setHeaderHidden(Storage.get('pos_header_hidden', false));

    // Action bar
    this.elements.newTransaksiBtn.addEventListener('click', () => {
      if (!this.shiftActive) { this.showMulaiShiftModal(); return; }
      this.showForm();
    });
    document.getElementById('open-sewa').addEventListener('click', () => {
      this.hideForm();
      this.showRentalForm();
    });
    document.getElementById('open-cashout').addEventListener('click', () => {
      this.hideForm();
      this.showCashoutForm();
    });
    document.getElementById('open-bank').addEventListener('click', () => {
      this.hideForm();
      this.showBankForm();
    });
    document.getElementById('close-bank').addEventListener('click', () => this.hideBankForm());
    document.getElementById('bank-batal').addEventListener('click', () => this.hideBankForm());
    document.getElementById('bank-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.simpanBank();
    });
    document.getElementById('bank-amount').addEventListener('input', () => {
      this._formatMoneyField(document.getElementById('bank-amount'));
    });
    document.getElementById('close-cashout').addEventListener('click', () => this.hideCashoutForm());
    document.getElementById('cashout-batal').addEventListener('click', () => this.hideCashoutForm());
    document.getElementById('cashout-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.simpanCashout();
    });
    document.getElementById('cashout-method').addEventListener('change', () => this._renderFixedFlows());
    document.getElementById('cashout-amount').addEventListener('input', () => {
      this._formatMoneyField(document.getElementById('cashout-amount'));
    });
    this.elements.downloadExcelBtn.addEventListener('click', () => this.exportToExcel());
    this.elements.tutupShiftBtn.addEventListener('click',   () => this.confirmTutupShift());
    this.elements.openSettingsBtn.addEventListener('click', () => this.showSettings());
    this.elements.themeToggleBtn.addEventListener('click',  () => this.toggleTheme());
    this.elements.langToggleBtn.addEventListener('click',   () => this.toggleLang());

    // History page navigation
    document.getElementById('btn-histori').addEventListener('click', () => {
      window.location.href = 'history.html';
    });

    // Modal close buttons
    document.getElementById('close-form').addEventListener('click',     () => this.hideForm());
    document.getElementById('close-rental').addEventListener('click',   () => this.hideRentalForm());
    document.getElementById('rental-batal').addEventListener('click',   () => this.hideRentalForm());
    document.getElementById('rental-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.simpanSewa();
    });
    document.getElementById('rental-guest').addEventListener('input', () => this._formatMoneyField(document.getElementById('rental-guest')));
    document.getElementById('rental-owner-share').addEventListener('input', () => this._formatMoneyField(document.getElementById('rental-owner-share')));

    document.getElementById('close-settings').addEventListener('click', () => this.hideSettings());
    document.getElementById('confirm-cancel').addEventListener('click', () => this.hideConfirm());
    document.getElementById('confirm-ok').addEventListener('click',     () => this.executeConfirm());

    // Transaction form submit + type toggle + cancel
    this.elements.transaksiForm.addEventListener('submit', async (e) => { e.preventDefault(); await this.simpanTransaksi(); });
    // Show/hide admin approval section when the picked category changes.
    this.elements.fKategori.addEventListener('change', () => this._updateAdminAuthVisibility());
    this.elements.transaksiForm.querySelectorAll('.type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setActiveType(btn.dataset.type);
        this._renderCategoryOptions(btn.dataset.type === 'outgoing' ? 'OUTGOING' : 'INCOME', this._editKategori);
        this._updateAdminAuthVisibility();
      });
    });
    document.getElementById('form-batal').addEventListener('click', () => this.hideForm());

    // Amount field — format number on input
    this.elements.fJumlah.addEventListener('input', () => {
      const raw = this.elements.fJumlah.value.replace(/\D/g, '');
      this.elements.fJumlah.dataset.raw     = raw;
      this.elements.fJumlah.value           = raw ? this.formatNumber(Number(raw)) : '';
      this.elements.fJumlahPrev.textContent = raw ? this.formatCurrency(Number(raw)) : '';
    });

    // Settings
    document.getElementById('settings-save').addEventListener('click',  () => this.saveSettings());
    document.getElementById('settings-reset').addEventListener('click', () => this.resetSettings());

    // Live preview of the resized logo when a file is picked.
    document.getElementById('settings-logo').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      const preview = document.getElementById('settings-logo-preview');
      if (!file) { preview.style.display = 'none'; return; }
      try {
        preview.src = await resizeLogoToBase64(file);
        preview.style.display = 'block';
      } catch {
        this.showAlert(t('alertInvalidImage'), 'error');
        e.target.value = '';
        preview.style.display = 'none';
      }
    });

    // Categories card UI: Add button + delegated edit/delete + drag-and-drop
    document.getElementById('add-category-btn').addEventListener('click', () => this.addCategoryFlow());
    document.getElementById('settings-categories-list').addEventListener('click', (e) => {
      const editBtn = e.target.closest('.cat-edit');
      const delBtn  = e.target.closest('.cat-delete');
      if (editBtn) this.editCategoryFlow(parseInt(editBtn.dataset.idx, 10));
      if (delBtn)  this.deleteCategoryFlow(parseInt(delBtn.dataset.idx, 10));
    });
    document.getElementById('settings-categories-list').addEventListener('change', (e) => {
      const sel = e.target.closest('.cat-type');
      if (sel) this.setCategoryType(parseInt(sel.dataset.idx, 10), sel.value);
    });
    this._initCategoryDnD();

    // Start Shift modal — format cash on input
    this.elements.msCash.addEventListener('input', () => {
      const raw = this.elements.msCash.value.replace(/\D/g, '');
      this.elements.msCash.dataset.raw       = raw;
      this.elements.msCash.value             = raw ? this.formatNumber(Number(raw)) : '';
      this.elements.msCashPreview.textContent = raw ? this.formatCurrency(Number(raw)) : '';
    });
    this.elements.mulaiShiftForm.addEventListener('submit', (e) => { e.preventDefault(); this.mulaiShift(); });
    // Refresh PIN hint when Staff on Duty changes (admin scenario)
    this.elements.msStaff.addEventListener('change', () => this._refreshShiftPinHint());
    // Logout escape hatch — esp. for cashier whose PIN isn't set yet
    this.elements.msLogout.addEventListener('click', () => this.handleLogout());
    // Quick-fill: use last shift's closing cash
    this.elements.msUseLast.addEventListener('click', () => {
      const amt = parseInt(this.elements.msUseLast.dataset.amount || '0', 10);
      if (amt > 0) this._fillCashInput(amt);
    });
    // Amount chips — common preset amounts
    this.elements.msAmountChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.amount-chip');
      if (chip) this._fillCashInput(parseInt(chip.dataset.amount, 10));
    });

    // Close Shift modal — format actual amounts
    const fmtInput = (inputEl, previewEl) => {
      inputEl.addEventListener('input', () => {
        const raw = inputEl.value.replace(/\D/g, '');
        inputEl.dataset.raw   = raw;
        inputEl.value         = raw ? this.formatNumber(Number(raw)) : '';
        previewEl.textContent = raw ? this.formatCurrency(Number(raw)) : '';
      });
    };
    fmtInput(this.elements.tsActualCash,     this.elements.tsActualCashPreview);
    fmtInput(this.elements.tsActualCard,     this.elements.tsActualCardPreview);
    fmtInput(this.elements.tsActualTransfer, this.elements.tsActualTransferPreview);
    fmtInput(this.elements.tsActualQris,     this.elements.tsActualQrisPreview);

    document.getElementById('ts-next').addEventListener('click',         () => this.showTutupShiftSummary());
    document.getElementById('ts-back').addEventListener('click',         () => {
      this.elements.tsStepInput.style.display   = '';
      this.elements.tsStepSummary.style.display = 'none';
    });
    document.getElementById('ts-batal-input').addEventListener('click',  () => {
      this.elements.tutupShiftModal.style.display = 'none';
    });
    document.getElementById('ts-confirm-close').addEventListener('click', async () => { await this.eksekusiTutupShift(); });

    // Sort — click or keyboard on a column header
    const sortFromHeader = (th) => {
      const kolom = th.dataset.kolom;
      this.sortState.arah = this.sortState.kolom === kolom
        ? (this.sortState.arah === 'asc' ? 'desc' : 'asc')
        : 'asc';
      this.sortState.kolom = kolom;
      this.renderTransaksiTable();
    };
    const transaksiHead = document.getElementById('transaksi-table').querySelector('thead');
    transaksiHead.addEventListener('click', (e) => {
      const th = e.target.closest('th[data-kolom]');
      if (!th) return;
      sortFromHeader(th);
    });
    transaksiHead.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const th = e.target.closest('th[data-kolom]');
      if (!th) return;
      e.preventDefault();
      sortFromHeader(th);
    });

    // Filter — Apply button
    document.getElementById('apply-filter').addEventListener('click', () => {
      this.filterState.type = document.getElementById('filter-type').value;
      this.filterState.category = document.getElementById('filter-category').value;
      this.filterState.method = document.getElementById('filter-method').value;
      this.filterState.query = document.getElementById('filter-search').value;
      this.txPage = 1;
      this.renderTransaksiTable();
    });
    document.getElementById('filter-search').addEventListener('input', (e) => {
      this.filterState.query = e.target.value;
      this.txPage = 1;
      this.renderTransaksiTable();
    });

    // Filter — Reset button
    document.getElementById('reset-filter').addEventListener('click', () => {
      document.getElementById('filter-type').value = '';
      document.getElementById('filter-category').value = '';
      document.getElementById('filter-method').value = '';
      document.getElementById('filter-search').value = '';
      this.filterState.type = '';
      this.filterState.category = '';
      this.filterState.method = '';
      this.filterState.query = '';
      this.txPage = 1;
      this.renderTransaksiTable();
    });
    document.getElementById('tx-pager').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-page]');
      if (!btn || btn.disabled) return;
      this.txPage += btn.dataset.page === 'next' ? 1 : -1;
      this.renderTransaksiTable();
    });

    // Event delegation for edit/delete — works for both table rows AND cards
    const txClickHandler = (e) => {
      const editBtn  = e.target.closest('.btn-edit');
      const hapusBtn = e.target.closest('.btn-hapus');
      if (editBtn)  this.showForm(editBtn.dataset.id);
      if (hapusBtn) this.hapusTransaksi(hapusBtn.dataset.id);
    };
    this.elements.transaksiTable.addEventListener('click', txClickHandler);
    document.getElementById('transaksi-cards').addEventListener('click', txClickHandler);

    // Re-render on viewport breakpoint crossing (debounced 150ms)
    let resizeTimer;
    let lastIsMobile = window.innerWidth < 769;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const isMobile = window.innerWidth < 769;
        if (isMobile !== lastIsMobile) {
          lastIsMobile = isMobile;
          this.renderTransaksiTable();
        }
      }, 150);
    });

    // First-run wizard submit + admin name dropdown sync
    document.getElementById('first-run-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveFirstRunWizard();
    });

    // Setup-admin (existing-data fallback) submit
    document.getElementById('setup-admin-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveSetupAdmin();
    });

    // Login form
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });
    document.getElementById('login-user').addEventListener('change', () => this._togglePinFieldVisibility());

    // PIN reset flow
    document.getElementById('open-reset-pin').addEventListener('click', () => this.showResetPinModal());
    document.getElementById('rp-cancel').addEventListener('click',     () => this.hideResetPinModal());
    document.getElementById('rp-user').addEventListener('change',      () => this._refreshResetPinHint());
    document.getElementById('reset-pin-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleResetPin();
    });

    // Header user-menu toggle + logout
    document.getElementById('user-menu').addEventListener('click', (e) => {
      e.stopPropagation();
      const popup = document.getElementById('user-menu-popup');
      popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
    });
    document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());

    // Users management modal
    document.getElementById('open-users').addEventListener('click', () => {
      this.hideSettings();
      this.showUsersModal();
    });
    document.getElementById('close-users').addEventListener('click', () => {
      document.getElementById('users-modal').style.display = 'none';
    });
    document.getElementById('add-user-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addUserFromForm();
    });
    document.getElementById('users-list').addEventListener('click',  (e) => this.handleUserListClick(e));
    document.getElementById('users-list').addEventListener('change', (e) => this.handleUserRoleChange(e));

    // Close user-menu popup when clicking outside
    document.addEventListener('click', (e) => {
      const popup = document.getElementById('user-menu-popup');
      if (popup.style.display === 'block' && !e.target.closest('#user-menu') && !e.target.closest('#user-menu-popup')) {
        popup.style.display = 'none';
      }
    });

    // Click outside modal to close. The New Transaction form is intentionally
    // excluded — it can only be dismissed via Cancel or the X to avoid losing
    // half-entered data on a stray click.
    window.addEventListener('click', (e) => {
      if (e.target === this.elements.confirmModal)    this.hideConfirm();
      if (e.target === this.elements.settingsModal)   this.hideSettings();
      if (e.target === this.elements.tutupShiftModal) this.elements.tutupShiftModal.style.display = 'none';
      if (e.target === document.getElementById('help-modal'))  this.hideHelp();
      if (e.target === document.getElementById('users-modal')) document.getElementById('users-modal').style.display = 'none';
    });

    // Escape key to close active modal
    window.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      // New Transaction form excluded — only Cancel / X dismisses it.
      if (this.elements.confirmModal.style.display    === 'flex') this.hideConfirm();
      if (this.elements.settingsModal.style.display   === 'flex') this.hideSettings();
      if (this.elements.tutupShiftModal.style.display === 'flex') this.elements.tutupShiftModal.style.display = 'none';
      const rental = document.getElementById('rental-modal');
      if (rental?.style.display === 'flex') this.hideRentalForm();
      const cashout = document.getElementById('cashout-modal');
      if (cashout?.style.display === 'flex') this.hideCashoutForm();
      const bank = document.getElementById('bank-modal');
      if (bank?.style.display === 'flex') this.hideBankForm();
      const help = document.getElementById('help-modal');
      if (help.style.display === 'flex') this.hideHelp();
      const users = document.getElementById('users-modal');
      if (users.style.display === 'flex') users.style.display = 'none';
    });
  }

  initTheme() {
    const saved = Storage.get('theme') || 'light';
    document.body.className = `${saved}-theme`;
    this.updateThemeIcon(saved);
  }

  // ============================================================
  // LANGUAGE
  // ============================================================

  initLang() {
    this.applyLang();
  }

  toggleLang() {
    LangManager.toggle();
    this.applyLang();
  }

  applyLang() {
    const lang = LangManager.current;
    // Update toggle button label — show the OTHER language to indicate what clicking will switch to
    this.elements.langLabel.textContent = lang === 'en' ? 'ID' : 'EN';
    document.documentElement.lang = lang;

    // Update all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const str = t(key);
      if (typeof str === 'string') el.textContent = str;
    });

    // Update placeholder attributes
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      el.placeholder = t(el.dataset.i18nPh);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.title = t(el.dataset.i18nTitle);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const str = t(el.dataset.i18nAria);
      if (typeof str === 'string') el.setAttribute('aria-label', str);
    });

    // Re-render dynamic parts that contain translated strings
    this.renderDashboard();
    this.renderTransaksiTable();
    this._renderOfflineBanner();
    this._renderFixedFlows();
  }

  // ============================================================
  // SHIFT STATUS
  // ============================================================

  checkShiftStatus() {
    // Cashier must start shift before doing anything; admin can browse freely
    // and start a shift voluntarily by clicking "New Transaksi".
    if (!this.shiftActive && Auth.hasRole('cashier')) this.showMulaiShiftModal();
    this.updateShiftUI();
  }

  showMulaiShiftModal() {
    this.elements.msStaff.innerHTML = '';
    this.staffList.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s; opt.textContent = s;
      this.elements.msStaff.appendChild(opt);
    });
    // Default to current user; cashier locked to themselves
    const cur = Auth.currentUser();
    if (cur) this.elements.msStaff.value = cur.username;
    this.elements.msStaff.disabled = !!cur && cur.role === 'cashier';
    this.elements.msCash.value              = '';
    this.elements.msCash.dataset.raw        = '';
    this.elements.msCashPreview.textContent = '';
    this.elements.msPin.value               = '';
    this._renderShiftSubtitle();
    this._renderLastShiftButton();
    this._refreshShiftPinHint();
    this.elements.mulaiShiftModal.style.display = 'flex';
  }

  // Show current date/time as audit context — what day/time this shift opens.
  _renderShiftSubtitle() {
    const lang = LangManager.current === 'id' ? 'id-ID' : 'en-US';
    const now  = new Date();
    const dateStr = now.toLocaleDateString(lang, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
    this.elements.msSubtitle.innerHTML = `<i class="far fa-calendar-alt"></i> ${dateStr} • ${timeStr}`;
  }

  // If previous shift exists, surface its closing cash as a one-click fill.
  _renderLastShiftButton() {
    const history = Storage.get('pos_shift_history', []);
    const last    = history?.[0]; // saveShiftHistory prepends, so [0] = most recent
    const lastCash = last?.summary?.actualCash ?? last?.summary?.cash ?? null;
    const btn = this.elements.msUseLast;
    if (lastCash !== null && lastCash > 0) {
      btn.dataset.amount = String(lastCash);
      btn.innerHTML = `<i class="fas fa-history"></i> ${t('useLastShiftCash', this.formatCurrency(lastCash))}`;
      btn.style.display = '';
    } else {
      btn.style.display = 'none';
    }
  }

  // Single point to programmatically set cash input (used by quick-fill + chips).
  _fillCashInput(amount) {
    const raw = String(Math.max(0, parseInt(amount, 10) || 0));
    this.elements.msCash.dataset.raw       = raw;
    this.elements.msCash.value             = this.formatNumber(Number(raw));
    this.elements.msCashPreview.textContent = this.formatCurrency(Number(raw));
  }

  // Updates the PIN hint text based on currently selected Staff on Duty.
  // Three states: target has PIN, target has no PIN (admin can override),
  // target has no PIN AND current user isn't admin (blocked).
  async _refreshShiftPinHint() {
    const staffName = this.elements.msStaff.value;
    const cur       = Auth.currentUser();
    const users     = await AuthStorage.getUsers();
    const target    = users.find(u => u.username === staffName);
    const isAdmin   = cur?.role === 'admin';
    const hintEl    = this.elements.msPinHint;
    if (!target?.pinHash) {
      // No PIN on target. Admin can still proceed using own PIN; cashier cannot.
      hintEl.textContent = isAdmin ? t('shiftPinNoPinAdmin') : t('shiftPinNoPin', staffName);
      hintEl.style.color = 'var(--danger)';
    } else {
      hintEl.textContent = isAdmin && cur.username !== staffName
        ? t('shiftPinHintAdmin', staffName)
        : t('shiftPinHint', staffName);
      hintEl.style.color = 'var(--gray)';
    }
  }

  async mulaiShift() {
    const staff   = this.elements.msStaff.value;
    const rawCash = parseFloat(this.elements.msCash.dataset.raw || '0') || 0;
    const pin     = (this.elements.msPin.value || '').trim();

    // PIN validation: try target staff's PIN first; admin can override with own PIN.
    const cur     = Auth.currentUser();
    const isAdmin = cur?.role === 'admin';
    const users   = await AuthStorage.getUsers();
    const target  = users.find(u => u.username === staff);

    if (!pin) {
      this.showAlert(t('alertShiftPinRequired'), 'error');
      this.elements.msPin.focus();
      return;
    }

    // Non-admin attempting to start shift for a user with no PIN → blocked.
    if (!target?.pinHash && !isAdmin) {
      this.showAlert(t('alertShiftPinNoPin'), 'error');
      return;
    }

    let pinOk = false;
    if (target?.pinHash) pinOk = await Auth.verifyPin(target, pin);
    // Admin override: when admin starts shift for someone else, OR target has no PIN,
    // admin's own PIN is also accepted (authorizes the till opening).
    if (!pinOk && isAdmin && (cur.username !== staff || !target?.pinHash)) {
      pinOk = await Auth.verifyPin(cur, pin);
    }

    if (!pinOk) {
      this.showAlert(t('alertShiftPinWrong'), 'error');
      this.elements.msPin.value = '';
      this.elements.msPin.focus();
      return;
    }

    // Save initial cash as a START BALANCE INCOME transaction
    const startTx = {
      id:           crypto.randomUUID(),
      jenis:        'INCOME',
      kategori:     'START BALANCE',
      deskripsi:    'Initial Cash Balance',
      jumlah:       rawCash,
      metode:       'Cash',
      keterangan:   '',
      staff,
      tanggalWaktu: new Date().toISOString()
    };

    try {
      await DataStore.insertTransaction(startTx);
      this.shiftActive = true;
      await DataStore.saveSetting('shift_active', true);
    } catch (e) {
      this.showAlert(`${t('alertShiftPinWrong')} (${e?.message || e})`, 'error');
      return;
    }
    this.elements.mulaiShiftModal.style.display = 'none';
    this.renderAll();
    this.updateShiftUI();
    this.showAlert(`${t('alertShiftStarted')} ${this.formatCurrency(rawCash)}`, 'success');
  }

  updateShiftUI() {
    const active  = this.shiftActive;
    const isAdmin = Auth.hasRole('admin');
    // Admin can click "New Transaksi" without an active shift — it opens the
    // start-shift modal instead of erroring. Close-shift stays gated on active.
    this.elements.newTransaksiBtn.disabled      = !active && !isAdmin;
    this.elements.tutupShiftBtn.disabled        = !active;
    this.elements.newTransaksiBtn.style.opacity = (active || isAdmin) ? '1' : '0.45';
    this.elements.tutupShiftBtn.style.opacity   = active ? '1' : '0.45';
  }

  // ============================================================
  // EXCEL HELPERS
  // ============================================================

  // Prevent Excel/CSV injection: prefix dangerous leading chars with apostrophe
  sanitizeForExcel(value) {
    const str = String(value ?? '');
    if (/^[=+\-@\t\r]/.test(str)) return `'${str}`;
    return str;
  }

  buildExcelData() {
    return this.transactions.map(t => ({
      'Date/Time':  this.sanitizeForExcel(new Date(t.tanggalWaktu).toLocaleString()),
      'Type':       this.sanitizeForExcel(t.jenis),
      'Category':   this.sanitizeForExcel(t.kategori),
      'Description':this.sanitizeForExcel(rentalDeskripsiDisplay(t)),
      'Amount':     t.jenis === 'INCOME' ? t.jumlah : -t.jumlah,
      'Method':     this.sanitizeForExcel(t.metode),
      'Note':       this.sanitizeForExcel(ledgerNote(t.keterangan) || ''),
      'Staff':      this.sanitizeForExcel(t.staff)
    }));
  }

  // ============================================================
  // RENDER
  // ============================================================

  renderAll() {
    this.renderCurrentDate();
    this.renderBrandName();
    this.renderDashboard();
    this.renderTransaksiTable();
    this.populateCategoryFilter();
    this.updateDownloadButton();
    if (typeof this.updateShiftUI === 'function') this.updateShiftUI();
  }

  renderCurrentDate() {
    const lang = LangManager.current === 'id' ? 'id-ID' : 'en-US';
    const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    this.elements.currentDate.textContent = new Date().toLocaleDateString(lang, opts);
  }

  renderBrandName() {
    const el = document.getElementById('brand-name');
    if (el) el.textContent = this.brandName;
    this.renderLogo();
  }

  renderLogo() {
    // Header shows the business logo: custom (Premium only) if set, else the
    // default logo.png. Footer logo is the static developer branding.
    const img = document.getElementById('header-logo');
    if (!img) return;
    const custom = DataStore.settings.logoData;
    img.src = custom || 'logo.png';
  }

  renderDashboard() {
    const saldoCash     = this.calculateSaldo('Cash');
    const saldoCard     = this.calculateSaldo('Card');
    const saldoTransfer = this.calculateSaldo('Transfer');
    const saldoQris     = this.calculateSaldo('Qris');

    this.elements.dashboard.innerHTML = `
      <div class="card">
        <h3><i class="fas fa-money-bill-wave"></i> ${t('cashBalance')}</h3>
        <div class="amount">${this.formatCurrency(saldoCash)}</div>
      </div>
      <div class="card">
        <h3><i class="fas fa-credit-card"></i> ${t('cardBalance')}</h3>
        <div class="amount">${this.formatCurrency(saldoCard)}</div>
      </div>
      <div class="card">
        <h3><i class="fas fa-exchange-alt"></i> ${t('transferBalance')}</h3>
        <div class="amount">${this.formatCurrency(saldoTransfer)}</div>
      </div>
      <div class="card">
        <h3><i class="fas fa-qrcode"></i> ${t('qrisBalance')}</h3>
        <div class="amount">${this.formatCurrency(saldoQris)}</div>
      </div>
    `;
  }

  getVisibleTransactions() {
    let txs = this.transactions;

    // Apply filters
    if (this.filterState.type) {
      txs = txs.filter(tx => tx.jenis === this.filterState.type);
    }
    if (this.filterState.category) {
      txs = txs.filter(tx => tx.kategori === this.filterState.category);
    }
    if (this.filterState.method) {
      txs = txs.filter(tx => tx.metode === this.filterState.method);
    }
    const q = (this.filterState.query || '').trim().toLowerCase();
    if (q) {
      txs = txs.filter(tx => this._txSearchText(tx).includes(q));
    }

    const { kolom, arah } = this.sortState;
    return txs.slice().sort((a, b) => {
      let va = a[kolom], vb = b[kolom];
      if (kolom === 'tanggalWaktu') { va = new Date(va); vb = new Date(vb); }
      else if (kolom === 'jumlah')  { va = Math.abs(va); vb = Math.abs(vb); }
      else { va = String(va ?? '').toLowerCase(); vb = String(vb ?? '').toLowerCase(); }
      if (va < vb) return arah === 'asc' ? -1 :  1;
      if (va > vb) return arah === 'asc' ?  1 : -1;
      return (new Date(b.tanggalWaktu) - new Date(a.tanggalWaktu)) || ledgerTypeOrder(a, b);
    });
  }

  _txSearchText(tx) {
    return [
      ledgerDescription(tx),
      ledgerNoteShort(tx),
      tx.deskripsi,
      tx.kategori,
      tx.staff,
      tx.metode,
      tx.jenis,
    ].join(' ').toLowerCase();
  }

  // Populate category dropdown with ONLY categories that exist in current transactions
  populateCategoryFilter() {
    const select = document.getElementById('filter-category');
    if (!select) return;
    const currentValue = select.value;

    // Get unique categories from current transactions
    const categoriesInData = [...new Set(this.transactions.map(tx => tx.kategori))].sort();

    select.innerHTML = '<option value="">-- All --</option>';
    categoriesInData.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      select.appendChild(option);
    });
    select.value = currentValue;
  }

  // Dispatcher: pick table or card layout based on viewport.
  // Both renderers use the same getVisibleTransactions() pipeline.
  renderTransaksiTable() {
    const all = this.getVisibleTransactions();
    const pageSize = 25;
    const pages = Math.max(1, Math.ceil(all.length / pageSize));
    if (this.txPage > pages) this.txPage = pages;
    if (this.txPage < 1) this.txPage = 1;
    const start = (this.txPage - 1) * pageSize;
    const transactions = all.slice(start, start + pageSize);
    this._renderTxPager(all.length, pages, pageSize);
    const { kolom, arah } = this.sortState;

    // Update sort icons (always — table header may be hidden but DOM intact)
    document.querySelectorAll('th[data-kolom]').forEach(th => {
      const active = th.dataset.kolom === kolom;
      th.setAttribute('aria-sort', active ? (arah === 'asc' ? 'ascending' : 'descending') : 'none');
      const icon = th.querySelector('.sort-icon');
      if (!icon) return;
      icon.className = active
        ? `sort-icon fas fa-sort-${arah === 'asc' ? 'up' : 'down'}`
        : 'sort-icon fas fa-sort';
    });

    if (window.innerWidth < 769) {
      this._renderCards(transactions);
    } else {
      this._renderTableRows(transactions);
    }
  }

  _emptyTxMessage() {
    const filtered = this.filterState.query || this.filterState.type || this.filterState.category || this.filterState.method;
    return (filtered && this.transactions.length) ? t('noSearchResults') : t('noTransactionsTable');
  }

  _renderTxPager(total, pages, pageSize) {
    const pager = document.getElementById('tx-pager');
    if (!pager) return;
    if (total === 0) { pager.hidden = true; pager.innerHTML = ''; return; }
    const start = (this.txPage - 1) * pageSize + 1;
    const end = Math.min(total, this.txPage * pageSize);
    pager.hidden = false;
    pager.innerHTML = `
      <button type="button" class="btn small" data-page="prev" ${this.txPage <= 1 ? 'disabled' : ''}>${t('pagePrev')}</button>
      <span class="pager-status">${t('pageStatus', { page: this.txPage, pages, start, end, total })}</span>
      <button type="button" class="btn small" data-page="next" ${this.txPage >= pages ? 'disabled' : ''}>${t('pageNext')}</button>
    `;
  }

  _renderTableRows(transactions) {
    this.elements.transaksiTable.innerHTML = '';
    if (transactions.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 9; td.style.textAlign = 'center';
      td.textContent = this._emptyTxMessage();
      tr.appendChild(td);
      this.elements.transaksiTable.appendChild(tr);
      return;
    }
    const canEdit = Auth.can(PERMISSIONS.EDIT_TRANSACTION);
    const canDel  = Auth.can(PERMISSIONS.DELETE_TRANSACTION);
    transactions.forEach(tx => {
      const row      = document.createElement('tr');
      const date     = new Date(tx.tanggalWaktu);
      const isIncome = tx.jenis === 'INCOME';
      const badgeClass = this.isNonRevenue(tx.kategori)
        ? 'nonrevenue-badge'
        : (isIncome ? 'income-badge' : 'outgoing-badge');
      row.innerHTML = `
        <td class="cell-nowrap">${this.escapeHtml(date.toLocaleString())}</td>
        <td><span class="${badgeClass}">${this.escapeHtml(tx.jenis)}</span></td>
        <td>${this.escapeHtml(tx.kategori)}</td>
        <td>${this.escapeHtml(ledgerDescription(tx))}</td>
        <td class="cell-nowrap" style="color:${isIncome ? 'var(--success)' : 'var(--danger)'};font-weight:500">
          ${isIncome ? '+' : '-'}&nbsp;${this.formatCurrency(Math.abs(tx.jumlah))}
        </td>
        <td>${this.escapeHtml(tx.metode)}</td>
        <td>${this.escapeHtml(ledgerNoteShort(tx) || '-')}</td>
        <td>${this.escapeHtml(tx.staff)}</td>
        <td><div class="actions-cell">
          ${canEdit ? `<button class="btn small btn-edit"  data-id="${tx.id}"><i class="fas fa-edit"></i></button>` : ''}
          ${canDel  ? `<button class="btn small danger btn-hapus" data-id="${tx.id}"><i class="fas fa-trash"></i></button>` : ''}
        </div></td>
      `;
      this.elements.transaksiTable.appendChild(row);
    });
  }

  _renderCards(transactions) {
    const container = document.getElementById('transaksi-cards');
    container.innerHTML = '';
    if (transactions.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-card';
      empty.textContent = this._emptyTxMessage();
      container.appendChild(empty);
      return;
    }
    const canEdit = Auth.can(PERMISSIONS.EDIT_TRANSACTION);
    const canDel  = Auth.can(PERMISSIONS.DELETE_TRANSACTION);
    transactions.forEach(tx => {
      const isIncome = tx.jenis === 'INCOME';
      const badgeClass = this.isNonRevenue(tx.kategori)
        ? 'nonrevenue-badge'
        : (isIncome ? 'income-badge' : 'outgoing-badge');
      const card = document.createElement('div');
      card.className = `tx-card ${isIncome ? 'income' : 'outgoing'}`;
      card.innerHTML = `
        <div class="tx-card-header">
          <span class="tx-card-date">${this.escapeHtml(new Date(tx.tanggalWaktu).toLocaleString())}</span>
          <span class="${badgeClass}">${this.escapeHtml(tx.jenis)}</span>
        </div>
        <div class="tx-card-meta">${this.escapeHtml(tx.kategori)} &middot; ${this.escapeHtml(tx.metode)}</div>
        <div class="tx-card-desc">${this.escapeHtml(ledgerDescription(tx))}</div>
        <div class="tx-card-amount ${isIncome ? 'pos' : 'neg'}">${isIncome ? '+' : '-'}&nbsp;${this.formatCurrency(Math.abs(tx.jumlah))}</div>
        ${ledgerNoteShort(tx) ? `<div class="tx-card-note"><i class="fas fa-sticky-note"></i> ${this.escapeHtml(ledgerNoteShort(tx))}</div>` : ''}
        <div class="tx-card-staff"><i class="fas fa-user"></i> ${this.escapeHtml(tx.staff)}</div>
        ${(canEdit || canDel) ? `
        <div class="tx-card-actions">
          ${canEdit ? `<button class="btn btn-edit"  data-id="${tx.id}"><i class="fas fa-edit"></i> Edit</button>` : ''}
          ${canDel  ? `<button class="btn danger btn-hapus" data-id="${tx.id}"><i class="fas fa-trash"></i> Delete</button>` : ''}
        </div>` : ''}
      `;
      container.appendChild(card);
    });
  }

  // Category dropdown for the normal Income/Outgoing form. Rental, cash-out and
  // bank categories are left out: their own buttons write both rows. A category typed
  // INCOME or OUTGOING in Settings only shows on that side; untyped ones show on
  // both. The row being edited always keeps its own category, even if it was
  // since deleted or retyped, so saving never moves it silently.
  _renderCategoryOptions(jenis, keep = null) {
    const select = this.elements.fKategori;
    const previous = select.value;
    select.innerHTML = '';
    select.disabled = false;

    if (keep && SYSTEM_CATEGORIES.includes(keep)) {
      const opt = document.createElement('option');
      opt.value = keep; opt.textContent = keep; opt.selected = true;
      select.appendChild(opt);
      select.disabled = true;
      return;
    }

    const types = DataStore.settings.categoryTypes || {};
    const viaRentalButton = [RENTAL_GUEST_CATEGORY, RENTAL_OWNER_CATEGORY];
    const names = this.categories.filter(cat =>
      !SYSTEM_CATEGORIES.includes(cat)
      && !SYSTEM_NON_REVENUE.includes(cat)
      && !viaRentalButton.includes(cat)
      && (!jenis || !types[cat] || types[cat] === jenis));
    if (keep && keep !== '_other' && !names.includes(keep)) names.unshift(keep);

    names.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat; opt.textContent = cat;
      select.appendChild(opt);
    });
    const otherOpt = document.createElement('option');
    otherOpt.value = '_other'; otherOpt.textContent = t('other');
    select.appendChild(otherOpt);

    const values = [...select.options].map(o => o.value);
    const wanted = [previous, keep].find(v => v && values.includes(v));
    if (wanted) select.value = wanted;
  }

  // Populate form fields from existing transaction (edit) or reset (new)
  populateForm(transaksi = null) {
    const isEdit = transaksi !== null;

    document.getElementById('modal-title').textContent = isEdit
      ? t('editTransactionTitle') : t('newTransactionTitle');
    ['open-sewa', 'open-cashout', 'open-bank'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.style.display = isEdit ? 'none' : '';
    });

    // New transactions start with no type selected so staff must consciously
    // pick Income or Outgoing. Edits keep the existing type.
    this.setActiveType(isEdit ? (transaksi.jenis === 'OUTGOING' ? 'outgoing' : 'income') : null);

    // Populate category dropdown — exclude system categories (e.g. START BALANCE
    // is only inserted automatically at shift start, never picked manually).
    // Exception: when editing a system-category tx, inject it as the sole
    // option and lock the dropdown so the category can't be drifted.
    this._editKategori = isEdit ? transaksi.kategori : null;
    this.elements.fKategori.innerHTML = '';
    this._renderCategoryOptions(isEdit ? transaksi.jenis : null, this._editKategori);

    const cur = Auth.currentUser();
    const staffName = (isEdit && transaksi.staff) ? transaksi.staff : (cur?.username || '');
    this.elements.fStaff.value = staffName;
    const staffLabel = document.getElementById('tx-staff-name');
    if (staffLabel) staffLabel.textContent = staffName;

    this.elements.fMetode.value     = isEdit ? transaksi.metode     : 'Cash';
    this.elements.fDeskripsi.value  = isEdit ? transaksi.deskripsi  : '';
    this.elements.fKeterangan.value = isEdit ? (transaksi.keterangan || '') : '';

    const rawJumlah = isEdit ? Math.abs(transaksi.jumlah) : 0;
    this.elements.fJumlah.dataset.raw     = rawJumlah || '';
    this.elements.fJumlah.value           = rawJumlah ? this.formatNumber(rawJumlah) : '';
    this.elements.fJumlahPrev.textContent = rawJumlah ? this.formatCurrency(rawJumlah) : '';

    // Reset admin auth fields + apply visibility based on current category + user role.
    document.getElementById('f-auth-pin').value = '';
    this._updateAdminAuthVisibility();
  }

  // Returns true when the current form state requires an admin PIN, in two cases:
  //   1. The picked category is in admin_categories.
  //   2. Editing a transaction whose original note carries an "[approved by ...]"
  //      tag — so cashiers can't bypass approval by switching the category or
  //      tweaking the amount after the fact.
  // Admin users never see the prompt (they authenticated at login).
  _txNeedsApproval(category, editId) {
    if (Auth.currentUser()?.role === 'admin') return false;
    const adminCats = DataStore.settings.adminCategories || [];
    if (adminCats.includes(category)) return true;
    if (editId) {
      const orig = this.transactions.find(t => t.id === editId);
      if (orig) {
        // Edits to a system-category tx (e.g. START BALANCE — the opening cash
        // row created at shift start) always require admin PIN, regardless of
        // the new category chosen. Closes the loophole where a cashier could
        // alter the opening balance to mask a cash shortfall.
        if (SYSTEM_CATEGORIES.includes(orig.kategori)) return true;
        if (/\[approved by /i.test(orig.keterangan || '')) return true;
      }
    }
    return false;
  }

  _updateAdminAuthVisibility() {
    const section = document.getElementById('f-admin-auth');
    if (!section) return;
    const needsApproval = this._txNeedsApproval(this.elements.fKategori?.value, this.currentEditId);
    section.style.display = needsApproval ? '' : 'none';

    const adminSel = document.getElementById('f-auth-admin');
    const pinIn    = document.getElementById('f-auth-pin');
    adminSel.required = needsApproval;
    pinIn.required    = needsApproval;

    if (needsApproval) {
      // Refresh admin dropdown — only admins with a PIN set can authorize.
      adminSel.innerHTML = '';
      DataStore.users
        .filter(u => u.role === 'admin' && u.pinHash)
        .forEach(u => {
          const opt = document.createElement('option');
          opt.value = u.id; opt.textContent = u.username;
          adminSel.appendChild(opt);
        });
    }
  }

  // ============================================================
  // UTILITIES
  // ============================================================

  // Escape HTML special characters to prevent XSS
  escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  // Format number with thousand separators: 1000000 → "1.000.000"
  formatNumber(amount) {
    return new Intl.NumberFormat('id-ID').format(amount);
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(amount);
  }

  calculateSaldo(metode) {
    return this.transactions
      .filter(tx => tx.metode === metode)
      .reduce((sum, tx) => sum + tx.jumlah, 0);
  }

  // Categories flagged in Settings as cash movements (transfer, receivable, opening
  // balance) — excluded from revenue/expense totals but still affect cash drawer balance.
  isNonRevenue(kategori) {
    if (SYSTEM_NON_REVENUE.includes(kategori)) return true;
    const list = DataStore.settings.nonRevenueCategories || [];
    return list.includes(kategori);
  }

  updateDownloadButton() {
    this.elements.downloadExcelBtn.disabled = this.transactions.length === 0;
  }

  generateShiftId() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}_${Date.now()}`;
  }

  // ============================================================
  // APP FUNCTIONS
  // ============================================================

  toggleTheme() {
    const current = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    const next    = current === 'light' ? 'dark' : 'light';
    document.body.classList.replace(`${current}-theme`, `${next}-theme`);
    Storage.set('theme', next);
    this.updateThemeIcon(next);
  }

  updateThemeIcon(theme) {
    this.elements.themeToggleBtn.querySelector('i').className =
      theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
  }

  showForm(transaksiId = null) {
    if (transaksiId) {
      const tx = this.transactions.find(t => t.id === transaksiId);
      if (tx && parseBankNote(tx.keterangan)) {
        this.showBankForm(tx);
        return;
      }
      if (tx && parseCashoutNote(tx.keterangan)) {
        this.showCashoutForm(tx);
        return;
      }
      if (tx && parseRentalNote(tx.keterangan)) {
        this.showRentalForm(tx);
        return;
      }
      if (tx) { this.currentEditId = transaksiId; this.populateForm(tx); }
    } else {
      this.currentEditId = null;
      this.populateForm();
    }
    this.elements.formModal.style.display = 'flex';
  }

  hideForm() { this.elements.formModal.style.display = 'none'; }

  showHelp() {
    // Translated help body is HTML — insert via innerHTML (content is hardcoded in lang.js, no user data)
    document.getElementById('help-content').innerHTML = t('helpBody');
    document.getElementById('help-modal').style.display = 'flex';
  }
  hideHelp() { document.getElementById('help-modal').style.display = 'none'; }

  // ============================================================
  // SETTINGS
  // ============================================================

  showSettings() {
    if (!Auth.can(PERMISSIONS.MANAGE_SETTINGS)) {
      this.showAlert(t('noPermission'), 'error'); return;
    }
    document.getElementById('open-users').style.display = Auth.can(PERMISSIONS.MANAGE_USERS) ? '' : 'none';
    const logoGroup = document.getElementById('settings-logo-group');
    if (logoGroup) {
      logoGroup.style.display = '';
      const fileInput = document.getElementById('settings-logo');
      const preview   = document.getElementById('settings-logo-preview');
      if (fileInput) fileInput.value = '';
      if (preview) {
        if (DataStore.settings.logoData) { preview.src = DataStore.settings.logoData; preview.style.display = 'block'; }
        else { preview.removeAttribute('src'); preview.style.display = 'none'; }
      }
    }
    this._categoryTypesDraft = null;
    this.renderCategoriesList();
    this.renderAdminCategoriesList();
    this.renderNonRevenueCategoriesList();
    this.renderStaffList();
    this.elements.settingsBrand.value = this.brandName;
    this.elements.settingsModal.style.display = 'flex';
  }

  // Render checkboxes for each non-system category. Checked = requires admin PIN
  // when a cashier picks it in the transaction form.
  renderAdminCategoriesList() {
    const list = document.getElementById('settings-admin-cats');
    list.innerHTML = '';
    const checked = new Set(DataStore.settings.adminCategories || []);
    this.categories.filter(c => !SYSTEM_CATEGORIES.includes(c)).forEach(cat => {
      const row = document.createElement('label');
      row.className = 'cat-row';
      row.style.cursor = 'pointer';
      row.innerHTML = `
        <input type="checkbox" class="admin-cat-toggle" value="${this.escapeHtml(cat)}"
               ${checked.has(cat) ? 'checked' : ''} style="margin-right:8px;width:16px;height:16px;cursor:pointer;accent-color:#f59e0b">
        <span class="cat-name">${this.escapeHtml(cat)}</span>
      `;
      list.appendChild(row);
    });
  }

  // Render checkboxes for each category (including system). Checked = treated as
  // cash movement / receivable / opening balance — excluded from revenue totals.
  renderNonRevenueCategoriesList() {
    const list = document.getElementById('settings-nonrevenue-cats');
    list.innerHTML = '';
    const checked = new Set(DataStore.settings.nonRevenueCategories || []);
    this.categories.forEach(cat => {
      const row = document.createElement('label');
      row.className = 'cat-row';
      row.style.cursor = 'pointer';
      row.innerHTML = `
        <input type="checkbox" class="nonrevenue-cat-toggle" value="${this.escapeHtml(cat)}"
               ${checked.has(cat) ? 'checked' : ''} style="margin-right:8px;width:16px;height:16px;cursor:pointer;accent-color:#6b7280">
        <span class="cat-name">${this.escapeHtml(cat)}</span>
      `;
      list.appendChild(row);
    });
  }

  hideSettings() { this.elements.settingsModal.style.display = 'none'; }

  // Reset only resets brand & categories. Staff/users are NEVER touched here
  // — that would orphan all auth + lose all logins. Use Manage Users for users.
  resetSettings() {
    // Destructive: wipes brand + categories back to defaults. Gate behind the
    // logged-in admin's PIN so a stray click can't blow away the config.
    this.showConfirm(t('confirmResetDefault'), () => {
      this.brandName = DEFAULT_BRAND;
      // Mutate categories in place to preserve shared reference with DataStore.categories.
      this.categories.length = 0;
      DEFAULT_CATEGORIES.forEach(c => this.categories.push(c));
      Storage.set('pos_brand',      this.brandName);
      Storage.set('pos_categories', this.categories);
      this._categoryTypesDraft = null;
      this._applyShopDefaults(this.categories).catch(e =>
        console.error('[Settings] default category setup failed:', e));
      this.renderBrandName();
      this.renderCategoriesList();
      this.hideSettings();
      this.showAlert(t('alertSettingsReset'), 'info');
    }, false, true);
  }

  saveSettings() {
    const brand = this.elements.settingsBrand.value.trim();
    // categories already mutated in-place by card UI; staff is read-only (sourced from Users)
    if (this.categories.length === 0) {
      this.showAlert(t('alertCategoryEmpty'), 'error'); return;
    }
    // Defensive: ensure system categories present
    SYSTEM_CATEGORIES.forEach(c => { if (!this.categories.includes(c)) this.categories.unshift(c); });
    this.brandName = brand || DEFAULT_BRAND;

    // Capture checkbox state BEFORE any Storage.set call. Storage.set fires a
    // categories listener that re-renders the dependent checkbox lists, which
    // would otherwise wipe the user's selections from the DOM before we read them.
    const adminCats = [...document.querySelectorAll('.admin-cat-toggle:checked')]
      .map(el => el.value);
    const nonRevenueCats = [...document.querySelectorAll('.nonrevenue-cat-toggle:checked')]
      .map(el => el.value);

    Storage.set('pos_brand',      this.brandName);
    Storage.set('pos_categories', this.categories);

    DataStore.saveSetting('admin_categories', adminCats).catch(e =>
      console.error('[Settings] admin_categories save failed:', e));
    DataStore.saveSetting('non_revenue_categories', nonRevenueCats).catch(e =>
      console.error('[Settings] non_revenue_categories save failed:', e));
    const draftTypes = this._categoryTypesDraftOrSaved();
    const categoryTypes = {};
    this.categories.forEach(cat => { if (draftTypes[cat]) categoryTypes[cat] = draftTypes[cat]; });
    this._categoryTypesDraft = null;
    DataStore.saveSetting('category_types', categoryTypes).catch(e =>
      console.error('[Settings] category_types save failed:', e));

    // Logo upload (Cloud only). Resize + convert to PNG, then persist as base64.
    const logoFile = document.getElementById('settings-logo')
      ? document.getElementById('settings-logo').files[0] : null;
    if (logoFile) {
      resizeLogoToBase64(logoFile)
        .then(base64 => DataStore.saveSetting('logo_data', base64))
        .then(() => this.renderLogo())
        .catch(e => console.error('[Settings] logo save failed:', e));
    }

    this.renderBrandName();
    this.hideSettings();
    this.showAlert(t('alertSettingsSaved'), 'success');
  }

  setActiveType(type) {
    document.querySelectorAll('#transaksi-form .type-btn').forEach(btn => btn.classList.remove('active'));
    // type === null leaves both deselected, forcing an explicit choice on new transactions.
    if (type) document.querySelector(`#transaksi-form .type-btn.${type}`)?.classList.add('active');
    const fields = document.getElementById('tx-fields');
    if (fields) fields.hidden = !type;
  }

  // ============================================================
  // RENTAL — bike rate + owner share, one save, two ledger rows
  // ============================================================

  _moneyFromInput(el) {
    if (!el) return 0;
    const source = el.dataset.raw != null ? el.dataset.raw : el.value;
    const digits = String(source).replace(/\D/g, '');
    return digits ? parseInt(digits, 10) : 0;
  }

  _setMoneyInput(el, amount) {
    if (!el) return 0;
    const n = Math.max(0, Math.round(Number(amount) || 0));
    el.dataset.raw = n ? String(n) : '';
    el.value = n ? this.formatNumber(n) : '';
    return n;
  }

  _formatMoneyField(el) {
    const raw = String(el.value || '').replace(/\D/g, '');
    el.dataset.raw = raw;
    el.value = raw ? this.formatNumber(Number(raw)) : '';
  }

  _formatRentalMoney(inputId, previewId) {
    const el = document.getElementById(inputId);
    this._formatMoneyField(el);
    const n = this._moneyFromInput(el);
    const preview = document.getElementById(previewId);
    if (preview) preview.textContent = n ? this.formatCurrency(n) : '';
  }

  _rentalPair(tx) {
    const link = parseRentalNote(tx?.keterangan);
    if (!link?.id) return null;
    const rows = this.transactions.filter(row => parseRentalNote(row.keterangan)?.id === link.id);
    return {
      sewaId: link.id,
      link,
      rows,
      income: rows.find(row => row.jenis === 'INCOME') || null,
      outgoing: rows.find(row => row.jenis === 'OUTGOING') || null,
    };
  }

  _setRentalTitle(editing) {
    const title = document.querySelector('#rental-modal h2 [data-i18n]');
    if (!title) return;
    title.dataset.i18n = editing ? 'rentalEditTitle' : 'rentalTitle';
    title.textContent = t(title.dataset.i18n);
  }

  _rentalMethodOptions() {
    const fromForm = [...document.querySelectorAll('#f-metode option')].map(opt => opt.value).filter(Boolean);
    return fromForm.length ? fromForm : Validator.VALID_METODE;
  }

  _setRentalMethod(select, value) {
    if (!select) return '';
    const options = this._rentalMethodOptions();
    select.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.disabled = true;
    placeholder.dataset.i18n = 'rentalPickMethod';
    placeholder.textContent = t('rentalPickMethod');
    select.appendChild(placeholder);
    options.forEach(method => {
      const opt = document.createElement('option');
      opt.value = method;
      opt.textContent = method;
      select.appendChild(opt);
    });
    const chosen = options.includes(value) ? value : '';
    select.value = chosen;
    return chosen;
  }

  showRentalForm(existingTx = null) {
    const editing = !!(existingTx && existingTx.id);
    const perm = editing ? PERMISSIONS.EDIT_TRANSACTION : PERMISSIONS.CREATE_TRANSACTION;
    if (!Auth.can(perm)) {
      this.showAlert(t('noPermission'), 'error'); return;
    }
    if (!editing && !this.shiftActive) { this.showMulaiShiftModal(); return; }

    this._rentalEdit = null;
    this._setRentalTitle(editing);
    const guestEl = document.getElementById('rental-guest-name');
    const plateEl = document.getElementById('rental-plate');
    const ownerEl = document.getElementById('rental-owner-name');
    const daysEl = document.getElementById('rental-days');

    if (editing) {
      const pair = this._rentalPair(existingTx);
      this._rentalEdit = pair;
      const link = pair?.link || {};
      guestEl.value = link.guest || '';
      plateEl.value = link.plate || '';
      ownerEl.value = link.owner || '';
      daysEl.value = link.days || '';
      const guestAmt = pair?.income
        ? Math.abs(pair.income.jumlah)
        : (existingTx.jenis === 'INCOME' ? Math.abs(existingTx.jumlah) : 0);
      const ownerAmt = pair?.outgoing
        ? Math.abs(pair.outgoing.jumlah)
        : (existingTx.jenis === 'OUTGOING' ? Math.abs(existingTx.jumlah) : 0);
      this._setMoneyInput(document.getElementById('rental-guest'), guestAmt);
      this._setMoneyInput(document.getElementById('rental-owner-share'), ownerAmt);
      const guestMethod = pair?.income?.metode
        || (existingTx.jenis === 'INCOME' ? existingTx.metode : '');
      const ownerMethod = pair?.outgoing?.metode
        || (existingTx.jenis === 'OUTGOING' ? existingTx.metode : '');
      this._setRentalMethod(document.getElementById('rental-guest-method'), guestMethod);
      this._setRentalMethod(document.getElementById('rental-owner-method'), ownerMethod);
    } else {
      guestEl.value = '';
      plateEl.value = '';
      ownerEl.value = '';
      daysEl.value = '';
      this._setMoneyInput(document.getElementById('rental-guest'), 0);
      this._setMoneyInput(document.getElementById('rental-owner-share'), 0);
      this._setRentalMethod(document.getElementById('rental-guest-method'), '');
      this._setRentalMethod(document.getElementById('rental-owner-method'), '');
    }
    document.getElementById('rental-modal').style.display = 'flex';
    guestEl.focus();
  }

  hideRentalForm() {
    this._rentalEdit = null;
    this._setRentalTitle(false);
    document.getElementById('rental-modal').style.display = 'none';
  }

  _rentalDays() {
    const raw = String(document.getElementById('rental-days').value || '').trim();
    if (!/^\d+$/.test(raw)) return 0;
    const n = parseInt(raw, 10);
    return n >= 1 && n <= 999 ? n : 0;
  }

  async simpanSewa() {
    const ownerName = document.getElementById('rental-owner-name').value.trim();
    const plate = document.getElementById('rental-plate').value.trim();
    const guestName = document.getElementById('rental-guest-name').value.trim();
    const days = this._rentalDays();
    const guest = this._moneyFromInput(document.getElementById('rental-guest'));
    const share = this._moneyFromInput(document.getElementById('rental-owner-share'));
    const guestMethod = document.getElementById('rental-guest-method').value;
    const ownerMethod = document.getElementById('rental-owner-method').value;
    const staff = Auth.currentUser()?.username || '';
    const methods = this._rentalMethodOptions();

    // Owner share 0 = guest pays with no owner payout (extra key, extension, own bike).
    if (!ownerName || !plate || !guestName || !days || guest <= 0 || share < 0 || !staff
        || !methods.includes(guestMethod) || (share > 0 && !methods.includes(ownerMethod))) {
      this.showAlert(t('rentalFillForm'), 'error'); return;
    }

    const submitBtn = document.getElementById('rental-save');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    const editing = this._rentalEdit;
    const sewaId = editing?.sewaId || crypto.randomUUID();
    const deskripsi = `${plate} · ${rentalDayPhrase(days)}`;
    const keterangan = packRentalNote({ id: sewaId, guest: guestName, plate, days, owner: ownerName });
    const tanggalWaktu = new Date().toISOString();
    const incomeBase = editing?.income || null;
    const outgoingBase = editing?.outgoing || null;
    const incomeSnap = incomeBase ? { ...incomeBase } : null;
    const income = {
      id: incomeBase?.id || crypto.randomUUID(),
      jenis: 'INCOME',
      kategori: incomeBase?.kategori || RENTAL_GUEST_CATEGORY,
      deskripsi,
      jumlah: guest,
      metode: guestMethod,
      keterangan,
      staff: incomeBase?.staff || staff,
      tanggalWaktu: incomeBase?.tanggalWaktu || tanggalWaktu,
    };
    const outgoing = {
      id: outgoingBase?.id || crypto.randomUUID(),
      jenis: 'OUTGOING',
      kategori: outgoingBase?.kategori || RENTAL_OWNER_CATEGORY,
      deskripsi,
      jumlah: -share,
      metode: ownerMethod,
      keterangan,
      staff: outgoingBase?.staff || staff,
      tanggalWaktu: outgoingBase?.tanggalWaktu || income.tanggalWaktu,
    };

    try {
      await this._ensureRentalCategories(income.kategori, share > 0 ? outgoing.kategori : null);
      if (incomeBase) await DataStore.updateTransaction(income);
      else await DataStore.insertTransaction(income);
      try {
        if (share === 0) {
          if (outgoingBase) await DataStore.deleteTransaction(outgoingBase.id);
        } else if (outgoingBase) await DataStore.updateTransaction(outgoing);
        else await DataStore.insertTransaction(outgoing);
      } catch (err) {
        if (incomeSnap) await DataStore.updateTransaction(incomeSnap);
        else await DataStore.deleteTransaction(income.id);
        throw err;
      }
      this.renderAll();
      this.hideRentalForm();
      this.showAlert(t(editing ? 'rentalUpdated' : 'rentalSaved'), 'success');
    } catch (e) {
      this.showAlert(`${t('rentalFillForm')} (${e?.message || e})`, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
    }
  }

  async _ensureRentalCategories(...names) {
    let added = false;
    names.filter(Boolean).forEach(name => {
      if (!this.categories.includes(name)) {
        this.categories.push(name);
        added = true;
      }
    });
    if (added) await DataStore.saveCategories(this.categories);
  }

  async _ensureNonRevenue(name) {
    const list = DataStore.settings.nonRevenueCategories || [];
    if (!name || list.includes(name)) return;
    await DataStore.saveSetting('non_revenue_categories', [...list, name]);
  }

  _cashoutPair(tx) {
    const link = parseCashoutNote(tx?.keterangan);
    if (!link?.id) return null;
    const rows = this.transactions.filter(row => parseCashoutNote(row.keterangan)?.id === link.id);
    return {
      id: link.id,
      link,
      rows,
      income: rows.find(row => row.jenis === 'INCOME') || null,
      outgoing: rows.find(row => row.jenis === 'OUTGOING') || null,
    };
  }

  _setCashoutMethod(value) {
    const select = document.getElementById('cashout-method');
    select.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.disabled = true;
    placeholder.dataset.i18n = 'rentalPickMethod';
    placeholder.textContent = t('rentalPickMethod');
    select.appendChild(placeholder);
    CASHOUT_IN_METHODS.forEach(method => {
      const opt = document.createElement('option');
      opt.value = method;
      opt.textContent = method;
      select.appendChild(opt);
    });
    select.value = CASHOUT_IN_METHODS.includes(value) ? value : '';
  }

  // Fixed sides of TarikTunai and PETTY-CASH are shown as one line, not as locked inputs.
  _renderFixedFlows() {
    const b = (v) => `<strong>${this.escapeHtml(v)}</strong>`;
    const recorded = (cat) => `${this.escapeHtml(t('recordedAs'))} ${b(cat)}`;
    const cashout = document.getElementById('cashout-flow');
    if (cashout) {
      const method = document.getElementById('cashout-method')?.value;
      const flow = `${method ? b(method) : this.escapeHtml(t('cashoutPickedMethod'))} → ${b('Cash')}`;
      cashout.innerHTML = `<i class="fas fa-circle-info"></i> ${flow} · ${recorded(CASHOUT_CATEGORY)}`;
    }
    const bank = document.getElementById('bank-flow');
    if (bank) bank.innerHTML = `<i class="fas fa-circle-info"></i> ${b('Card')} → ${b('Cash')} · ${recorded(BANK_CATEGORY)}`;
  }

  _setCashoutTitle(editing) {
    const title = document.querySelector('#cashout-modal h2 [data-i18n]');
    if (!title) return;
    title.dataset.i18n = editing ? 'cashoutEditTitle' : 'cashoutTitle';
    title.textContent = t(title.dataset.i18n);
  }

  showCashoutForm(existingTx = null) {
    const editing = !!(existingTx && existingTx.id);
    const perm = editing ? PERMISSIONS.EDIT_TRANSACTION : PERMISSIONS.CREATE_TRANSACTION;
    if (!Auth.can(perm)) {
      this.showAlert(t('noPermission'), 'error'); return;
    }
    if (!editing && !this.shiftActive) { this.showMulaiShiftModal(); return; }

    this._cashoutEdit = null;
    this._setCashoutTitle(editing);
    const amountEl = document.getElementById('cashout-amount');

    if (editing) {
      const pair = this._cashoutPair(existingTx);
      this._cashoutEdit = pair;
      const amount = pair?.income
        ? Math.abs(pair.income.jumlah)
        : Math.abs(existingTx.jumlah || 0);
      this._setMoneyInput(amountEl, amount);
      const method = pair?.income?.metode
        || (existingTx.jenis === 'INCOME' ? existingTx.metode : pair?.link?.method || '');
      this._setCashoutMethod(method);
      document.getElementById('cashout-note').value = parseCashoutNote(existingTx.keterangan)?.note || '';
    } else {
      this._setMoneyInput(amountEl, 0);
      this._setCashoutMethod('');
      document.getElementById('cashout-note').value = '';
    }
    this._renderFixedFlows();
    document.getElementById('cashout-modal').style.display = 'flex';
    amountEl.focus();
  }

  hideCashoutForm() {
    this._cashoutEdit = null;
    this._setCashoutTitle(false);
    document.getElementById('cashout-modal').style.display = 'none';
  }

  async simpanCashout() {
    const amount = this._moneyFromInput(document.getElementById('cashout-amount'));
    const method = document.getElementById('cashout-method').value;
    const note = document.getElementById('cashout-note').value.trim();
    const staff = Auth.currentUser()?.username || '';
    if (amount <= 0 || !CASHOUT_IN_METHODS.includes(method) || !note || !staff) {
      this.showAlert(t('cashoutFill'), 'error'); return;
    }

    const submitBtn = document.getElementById('cashout-save');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    const editing = this._cashoutEdit;
    const cashoutId = editing?.id || crypto.randomUUID();
    const keterangan = packCashoutNote({ id: cashoutId, method, note });
    const deskripsi = CASHOUT_CATEGORY;
    const tanggalWaktu = new Date().toISOString();
    const incomeBase = editing?.income || null;
    const outgoingBase = editing?.outgoing || null;
    const incomeSnap = incomeBase ? { ...incomeBase } : null;
    const income = {
      id: incomeBase?.id || crypto.randomUUID(),
      jenis: 'INCOME',
      kategori: CASHOUT_CATEGORY,
      deskripsi,
      jumlah: amount,
      metode: method,
      keterangan,
      staff: incomeBase?.staff || staff,
      tanggalWaktu: incomeBase?.tanggalWaktu || tanggalWaktu,
    };
    const outgoing = {
      id: outgoingBase?.id || crypto.randomUUID(),
      jenis: 'OUTGOING',
      kategori: CASHOUT_CATEGORY,
      deskripsi,
      jumlah: -amount,
      metode: 'Cash',
      keterangan,
      staff: outgoingBase?.staff || staff,
      tanggalWaktu: outgoingBase?.tanggalWaktu || income.tanggalWaktu,
    };

    try {
      await this._ensureRentalCategories(CASHOUT_CATEGORY);
      await this._ensureNonRevenue(CASHOUT_CATEGORY);
      if (incomeBase) await DataStore.updateTransaction(income);
      else await DataStore.insertTransaction(income);
      try {
        if (outgoingBase) await DataStore.updateTransaction(outgoing);
        else await DataStore.insertTransaction(outgoing);
      } catch (err) {
        if (incomeSnap) await DataStore.updateTransaction(incomeSnap);
        else await DataStore.deleteTransaction(income.id);
        throw err;
      }
      this.renderAll();
      this.hideCashoutForm();
      this.showAlert(t(editing ? 'cashoutUpdated' : 'cashoutSaved'), 'success');
    } catch (e) {
      this.showAlert(`${t('cashoutFill')} (${e?.message || e})`, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
    }
  }

  _bankPair(tx) {
    const link = parseBankNote(tx?.keterangan);
    if (!link?.id) return null;
    const rows = this.transactions.filter(row => parseBankNote(row.keterangan)?.id === link.id);
    return {
      id: link.id,
      rows,
      income: rows.find(row => row.jenis === 'INCOME') || null,
      outgoing: rows.find(row => row.jenis === 'OUTGOING') || null,
    };
  }

  _setBankTitle(editing) {
    const title = document.querySelector('#bank-modal h2 [data-i18n]');
    if (!title) return;
    title.dataset.i18n = editing ? 'bankEditTitle' : 'bankTitle';
    title.textContent = t(title.dataset.i18n);
  }

  showBankForm(existingTx = null) {
    const editing = !!(existingTx && existingTx.id);
    const perm = editing ? PERMISSIONS.EDIT_TRANSACTION : PERMISSIONS.CREATE_TRANSACTION;
    if (!Auth.can(perm)) {
      this.showAlert(t('noPermission'), 'error'); return;
    }
    if (!editing && !this.shiftActive) { this.showMulaiShiftModal(); return; }

    this._bankEdit = null;
    this._setBankTitle(editing);
    const amountEl = document.getElementById('bank-amount');

    if (editing) {
      const pair = this._bankPair(existingTx);
      this._bankEdit = pair;
      const amount = pair?.income
        ? Math.abs(pair.income.jumlah)
        : Math.abs(existingTx.jumlah || 0);
      this._setMoneyInput(amountEl, amount);
    } else {
      this._setMoneyInput(amountEl, 0);
    }
    this._renderFixedFlows();
    document.getElementById('bank-modal').style.display = 'flex';
    amountEl.focus();
  }

  hideBankForm() {
    this._bankEdit = null;
    this._setBankTitle(false);
    document.getElementById('bank-modal').style.display = 'none';
  }

  async simpanBank() {
    const amount = this._moneyFromInput(document.getElementById('bank-amount'));
    const staff = Auth.currentUser()?.username || '';
    if (amount <= 0 || !staff) {
      this.showAlert(t('bankFill'), 'error'); return;
    }

    const submitBtn = document.getElementById('bank-save');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    const editing = this._bankEdit;
    const bankId = editing?.id || crypto.randomUUID();
    const keterangan = packBankNote({ id: bankId });
    const deskripsi = BANK_CATEGORY;
    const tanggalWaktu = new Date().toISOString();
    const incomeBase = editing?.income || null;
    const outgoingBase = editing?.outgoing || null;
    const outgoingSnap = outgoingBase ? { ...outgoingBase } : null;
    const outgoing = {
      id: outgoingBase?.id || crypto.randomUUID(),
      jenis: 'OUTGOING',
      kategori: BANK_CATEGORY,
      deskripsi,
      jumlah: -amount,
      metode: 'Card',
      keterangan,
      staff: outgoingBase?.staff || staff,
      tanggalWaktu: outgoingBase?.tanggalWaktu || tanggalWaktu,
    };
    const income = {
      id: incomeBase?.id || crypto.randomUUID(),
      jenis: 'INCOME',
      kategori: BANK_CATEGORY,
      deskripsi,
      jumlah: amount,
      metode: 'Cash',
      keterangan,
      staff: incomeBase?.staff || staff,
      tanggalWaktu: incomeBase?.tanggalWaktu || outgoing.tanggalWaktu,
    };

    try {
      await this._ensureRentalCategories(BANK_CATEGORY);
      await this._ensureNonRevenue(BANK_CATEGORY);
      if (outgoingBase) await DataStore.updateTransaction(outgoing);
      else await DataStore.insertTransaction(outgoing);
      try {
        if (incomeBase) await DataStore.updateTransaction(income);
        else await DataStore.insertTransaction(income);
      } catch (err) {
        if (outgoingSnap) await DataStore.updateTransaction(outgoingSnap);
        else await DataStore.deleteTransaction(outgoing.id);
        throw err;
      }
      this.renderAll();
      this.hideBankForm();
      this.showAlert(t(editing ? 'bankUpdated' : 'bankSaved'), 'success');
    } catch (e) {
      this.showAlert(`${t('bankFill')} (${e?.message || e})`, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
    }
  }

  // ============================================================
  // TRANSACTION CRUD
  // ============================================================

  async simpanTransaksi() {
    const jenis = document.querySelector('.type-btn.income.active')   ? 'INCOME'
                : document.querySelector('.type-btn.outgoing.active') ? 'OUTGOING' : null;

    if (!jenis) { this.showAlert(t('alertSelectType'), 'error'); return; }

    const kategori   = this.elements.fKategori.value;
    const deskripsi  = this.elements.fDeskripsi.value.trim();
    let jumlah       = parseFloat(this.elements.fJumlah.dataset.raw || this.elements.fJumlah.value.replace(/\D/g, ''));
    const metode     = this.elements.fMetode.value;
    // Strip any existing "[approved by ...]" tag from the note so we don't
    // accumulate stamps over repeated edits — we'll re-stamp below if needed.
    let   keterangan = this.elements.fKeterangan.value.trim()
                         .replace(/\[approved by [^\]]+\]\s*/gi, '').trim();
    const staff      = this.elements.fStaff.value;

    if (!deskripsi || isNaN(jumlah) || jumlah <= 0) {
      this.showAlert(t('alertFillForm'), 'error'); return;
    }

    // Admin-approval gate. _txNeedsApproval also flags edits of
    // previously-approved transactions, so cashiers can't bypass by switching
    // the category to a non-sensitive one or tweaking the amount.
    if (this._txNeedsApproval(kategori, this.currentEditId)) {
      const adminId  = document.getElementById('f-auth-admin').value;
      const adminPin = document.getElementById('f-auth-pin').value;
      const admin    = DataStore.users.find(u => u.id === adminId && u.role === 'admin');
      if (!admin || !(await Auth.verifyPin(admin, adminPin))) {
        this.showAlert(t('wrongAdminPin'), 'error');
        document.getElementById('f-auth-pin').value = '';
        document.getElementById('f-auth-pin').focus();
        return;
      }
      const stamp = `[approved by ${admin.username}]`;
      keterangan = keterangan ? `${stamp} ${keterangan}` : stamp;
    }

    // Loading state — disable save button, show spinner
    const submitBtn     = this.elements.transaksiForm.querySelector('[type="submit"]');
    const originalHTML  = submitBtn.innerHTML;
    submitBtn.disabled  = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    try {
      if (jenis === 'OUTGOING') jumlah = -jumlah;

      const isEdit       = !!this.currentEditId;
      const originalDate = isEdit
        ? this.transactions.find(tx => tx.id === this.currentEditId)?.tanggalWaktu
        : null;

      const txData = {
        id:           this.currentEditId || crypto.randomUUID(),
        jenis, kategori, deskripsi, jumlah, metode, keterangan, staff,
        tanggalWaktu: originalDate || new Date().toISOString()
      };

      if (isEdit) await DataStore.updateTransaction(txData);
      else        await DataStore.insertTransaction(txData);

      this.renderAll();
      this.hideForm();
      this.showAlert(t(isEdit ? 'alertUpdated' : 'alertSaved'), 'success');
    } catch (e) {
      this.showAlert(`${t('alertFillForm')} (${e?.message || e})`, 'error');
    } finally {
      submitBtn.disabled  = false;
      submitBtn.innerHTML = originalHTML;
    }
  }

  hapusTransaksi(id) {
    if (!Auth.can(PERMISSIONS.DELETE_TRANSACTION)) {
      this.showAlert(t('noPermission'), 'error'); return;
    }
    const tx = this.transactions.find(row => row.id === id);
    const bankPair = tx ? this._bankPair(tx) : null;
    const cashPair = !bankPair && tx ? this._cashoutPair(tx) : null;
    const rentalPair = !bankPair && !cashPair && tx ? this._rentalPair(tx) : null;
    const pair = bankPair || cashPair || rentalPair;
    const ids = pair?.rows?.length ? pair.rows.map(row => row.id) : [id];
    const both = ids.length > 1;
    const confirmKey = !both ? 'confirmDefault'
      : (bankPair ? 'confirmDeleteBank' : cashPair ? 'confirmDeleteCashout' : 'confirmDeleteRental');
    const doneKey = !both ? 'alertDeleted'
      : (bankPair ? 'bankDeleted' : cashPair ? 'cashoutDeleted' : 'rentalDeleted');
    this.showConfirm(t(confirmKey), async () => {
      try {
        for (const rowId of ids) await DataStore.deleteTransaction(rowId);
        this.renderAll();
        this.showAlert(t(doneKey), 'success');
      } catch (e) {
        this.showAlert(`${t('alertDeleted')} ${e?.message || e}`, 'error');
      }
    });
  }

  exportToExcel() {
    if (this.transactions.length === 0) {
      this.showAlert(t('alertNoTransactions'), 'error'); return;
    }
    this.showConfirm(t('exportExcel') + '?', () => {
      try {
        const ws = XLSX.utils.json_to_sheet(this.buildExcelData());
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
        XLSX.writeFile(wb, `transactions_${new Date().toISOString().split('T')[0]}.xlsx`);
        this.showAlert(t('alertExcelOk'), 'success');
      } catch (e) {
        console.error(e);
        this.showAlert(t('alertExcelFail'), 'error');
      }
    });
  }

  saveToCSV(rows = this.transactions) {
    try {
      if (!rows || rows.length === 0) return;
      const csv  = Papa.unparse(rows);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const d    = new Date();
      const ds   = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      link.href     = URL.createObjectURL(blob);
      link.download = `SHIFT_CLOSE_${ds}_${this.generateShiftId()}.csv`;
      link.click();
    } catch (e) {
      console.error(e);
    }
  }

  // ============================================================
  // CLOSE SHIFT — 2 steps: input actual → summary → confirm
  // ============================================================

  confirmTutupShift() {
    if (this.transactions.length === 0) {
      this.showAlert(t('alertNoShift'), 'error'); return;
    }
    // Reset to step 1 — clear all four actual inputs
    const resetField = (input, preview) => {
      input.value         = '';
      input.dataset.raw   = '';
      preview.textContent = '';
    };
    resetField(this.elements.tsActualCash,     this.elements.tsActualCashPreview);
    resetField(this.elements.tsActualCard,     this.elements.tsActualCardPreview);
    resetField(this.elements.tsActualTransfer, this.elements.tsActualTransferPreview);
    resetField(this.elements.tsActualQris,     this.elements.tsActualQrisPreview);
    this.elements.tsStepInput.style.display     = '';
    this.elements.tsStepSummary.style.display   = 'none';
    this.elements.tutupShiftModal.style.display = 'flex';
  }

  showTutupShiftSummary() {
    const actualCash     = parseFloat(this.elements.tsActualCash.dataset.raw     || '0') || 0;
    const actualCard     = parseFloat(this.elements.tsActualCard.dataset.raw     || '0') || 0;
    const actualTransfer = parseFloat(this.elements.tsActualTransfer.dataset.raw || '0') || 0;
    const actualQris     = parseFloat(this.elements.tsActualQris.dataset.raw     || '0') || 0;

    const expectedCash     = this.calculateSaldo('Cash');
    const expectedCard     = this.calculateSaldo('Card');
    const expectedTransfer = this.calculateSaldo('Transfer');
    const expectedQris     = this.calculateSaldo('Qris');

    const selisihCash     = actualCash     - expectedCash;
    const selisihCard     = actualCard     - expectedCard;
    const selisihTransfer = actualTransfer - expectedTransfer;
    const selisihQris     = actualQris     - expectedQris;

    const fmtSelisih = (val) => {
      if (val === 0) return `<span class="ts-diff-exact">${t('exact')}</span>`;
      const sign  = val > 0 ? '+' : '';
      const cls   = val > 0 ? 'ts-diff-over' : 'ts-diff-short';
      const label = val > 0 ? t('over') : t('short');
      // Two lines: amount on top, label below — keeps Difference column narrow.
      return `<span class="${cls}"><span class="diff-amt">${sign}${this.formatCurrency(val)}</span><span class="diff-label">${label}</span></span>`;
    };

    const hasSelisih = selisihCash !== 0 || selisihCard !== 0 ||
                       selisihTransfer !== 0 || selisihQris !== 0;

    this._pendingActual = { actualCash, actualCard, actualTransfer, actualQris, hasSelisih };

    const row = (icon, label, expected, actual, selisih) => `
      <tr>
        <td><i class="fas ${icon}"></i> ${label}</td>
        <td>${this.formatCurrency(expected)}</td>
        <td class="actual-cell">${this.formatCurrency(actual)}</td>
        <td>${fmtSelisih(selisih)}</td>
      </tr>`;

    const noteHintClass = hasSelisih ? 'note-hint required' : 'note-hint';
    const noteHintText  = hasSelisih ? t('closingNoteRequired') : t('closingNoteOptional');

    // Revenue breakdown — split raw income/outgoing into business revenue vs cash movements.
    const totalNonRevenueIn  = this.transactions.filter(tx => tx.jenis === 'INCOME'   &&  this.isNonRevenue(tx.kategori)).reduce((s, tx) => s + tx.jumlah, 0);
    const totalNonRevenueOut = this.transactions.filter(tx => tx.jenis === 'OUTGOING' &&  this.isNonRevenue(tx.kategori)).reduce((s, tx) => s + tx.jumlah, 0);
    const totalIncomeAll     = this.transactions.filter(tx => tx.jenis === 'INCOME'  ).reduce((s, tx) => s + tx.jumlah, 0);
    const totalOutgoingAll   = this.transactions.filter(tx => tx.jenis === 'OUTGOING').reduce((s, tx) => s + tx.jumlah, 0);
    const revenue            = totalIncomeAll   - totalNonRevenueIn;
    const operatingExpense   = totalOutgoingAll - totalNonRevenueOut; // negative
    const netRevenue         = revenue + operatingExpense;
    const hasNonRevenue      = totalNonRevenueIn !== 0 || totalNonRevenueOut !== 0;
    const nonRevenueNet      = totalNonRevenueIn + totalNonRevenueOut;

    const breakdownRow = (label, value, cls = '') => `
      <tr class="${cls}">
        <td>${label}</td>
        <td style="text-align:right;font-weight:500">${this.formatCurrency(value)}</td>
      </tr>`;

    const revenueBreakdownSection = `
      <div class="ts-table-wrap" style="margin-bottom:12px">
        <table class="ts-summary-table">
          <thead>
            <tr><th colspan="2">${t('revenueBreakdown')}</th></tr>
          </thead>
          <tbody>
            ${breakdownRow(t('shiftRevenue'),          revenue)}
            ${breakdownRow(t('shiftOperatingExpense'), operatingExpense)}
            ${breakdownRow(`<strong>${t('shiftNetRevenue')}</strong>`, netRevenue, 'ts-net-row')}
            ${hasNonRevenue ? breakdownRow(
              `<span style="color:#9a3412">${t('shiftNonRevenue')}</span>`,
              nonRevenueNet,
              'ts-nonrev-row'
            ) : ''}
          </tbody>
        </table>
      </div>`;

    this.elements.tsSummaryContent.innerHTML = `
      <div class="shift-summary">
        <h4>${t('shiftSummary')}</h4>
        ${revenueBreakdownSection}
        <div class="ts-table-wrap">
          <table class="ts-summary-table">
            <thead>
              <tr>
                <th>${t('method')}</th>
                <th>${t('expected')}</th>
                <th>${t('actual')}</th>
                <th>${t('difference')}</th>
              </tr>
            </thead>
            <tbody>
              ${row('fa-money-bill-wave', 'Cash',     expectedCash,     actualCash,     selisihCash)}
              ${row('fa-credit-card',     'Card',     expectedCard,     actualCard,     selisihCard)}
              ${row('fa-exchange-alt',    'Transfer', expectedTransfer, actualTransfer, selisihTransfer)}
              ${row('fa-qrcode',          'QRIS',     expectedQris,     actualQris,     selisihQris)}
            </tbody>
          </table>
        </div>
        <div class="total-summary">
          <span>${t('totalExpected')}</span>
          <span class="total-amount">${this.formatCurrency(expectedCash + expectedCard + expectedTransfer + expectedQris)}</span>
        </div>
        <div class="form-group ts-note-group">
          <label for="ts-closing-note">${t('closingNote')}${hasSelisih ? ' <span class="req-marker">*</span>' : ''}</label>
          <textarea id="ts-closing-note" rows="2" maxlength="500"></textarea>
          <small class="${noteHintClass}">${noteHintText}</small>
        </div>
        <p class="summary-info">${t('balanceReset')}</p>
      </div>
    `;

    this.elements.tsStepInput.style.display   = 'none';
    this.elements.tsStepSummary.style.display = '';
  }

  async eksekusiTutupShift() {
    const { actualCash, actualCard, actualTransfer, actualQris, hasSelisih } =
      this._pendingActual || { actualCash: 0, actualCard: 0, actualTransfer: 0, actualQris: 0, hasSelisih: false };

    // Note is mandatory when there's a difference — staff must explain why.
    const noteEl = document.getElementById('ts-closing-note');
    const note   = (noteEl?.value || '').trim();
    if (hasSelisih && !note) {
      this.showAlert(t('alertNoteRequired'), 'error');
      noteEl?.focus();
      return;
    }

    const expectedCash     = this.calculateSaldo('Cash');
    const expectedCard     = this.calculateSaldo('Card');
    const expectedTransfer = this.calculateSaldo('Transfer');
    const expectedQris     = this.calculateSaldo('Qris');

    this._actualForHistory = {
      actualCash, actualCard, actualTransfer, actualQris,
      selisihCash:     actualCash     - expectedCash,
      selisihCard:     actualCard     - expectedCard,
      selisihTransfer: actualTransfer - expectedTransfer,
      selisihQris:     actualQris     - expectedQris,
      closingNote:     note,
    };

    const confirmBtn = document.getElementById('ts-confirm-close');
    if (confirmBtn) confirmBtn.disabled = true;
    try {
      const shiftRecord = this.buildShiftRecord();
      await DataStore.closeShift({
        shift: shiftRecord,
        transactionIds: shiftRecord.transactions.map(tx => tx.id),
      });
      this.saveToCSV(shiftRecord.transactions);
      this.shiftActive = false;
    } catch (e) {
      const pending = e?.code === 'shiftClosePending' || e?.message === 'shiftClosePending';
      this.showAlert(pending ? t('shiftClosePending') : (e?.message || String(e)), 'error');
      return;
    } finally {
      if (confirmBtn) confirmBtn.disabled = false;
    }
    this._pendingActual    = null;
    this._actualForHistory = null;
    this.elements.tutupShiftModal.style.display = 'none';
    this.renderAll();
    this.updateShiftUI();
    this.showMulaiShiftModal();
    this.showAlert(t('alertShiftClosed'), 'success');
  }

  // ============================================================
  // SHIFT HISTORY — snapshot saved before clearing transactions
  // Max 50 shifts — oldest is auto-removed
  // ============================================================

  buildShiftRecord() {
    const staff    = [...new Set(this.transactions.map(tx => tx.staff))];
    const cash     = this.calculateSaldo('Cash');
    const card     = this.calculateSaldo('Card');
    const transfer = this.calculateSaldo('Transfer');
    const qris     = this.calculateSaldo('Qris');

    // startedAt sourced from the START BALANCE tx — it's always inserted at shift start.
    const startedAt = this.transactions.find(tx => tx.kategori === 'START BALANCE')?.tanggalWaktu ?? null;

    // Revenue breakdown — splits raw INCOME/OUTGOING into business revenue vs
    // non-revenue (transfers, receivables, opening balance). totalIncome/totalOutgoing
    // are kept for backward compat with shifts closed before this feature shipped.
    const totalIncome      = this.transactions.filter(tx => tx.jenis === 'INCOME').reduce((s, tx) => s + tx.jumlah, 0);
    const totalOutgoing    = this.transactions.filter(tx => tx.jenis === 'OUTGOING').reduce((s, tx) => s + tx.jumlah, 0);
    const totalNonRevenueIn  = this.transactions.filter(tx => tx.jenis === 'INCOME'   &&  this.isNonRevenue(tx.kategori)).reduce((s, tx) => s + tx.jumlah, 0);
    const totalNonRevenueOut = this.transactions.filter(tx => tx.jenis === 'OUTGOING' &&  this.isNonRevenue(tx.kategori)).reduce((s, tx) => s + tx.jumlah, 0);
    const totalRevenue          = totalIncome   - totalNonRevenueIn;
    const totalOperatingExpense = totalOutgoing - totalNonRevenueOut;

    const shiftRecord = {
      id:        `shift_${Date.now()}`,
      startedAt,
      closedAt:  new Date().toISOString(),
      staff,
      summary: {
        cash, card, transfer, qris,
        total:            cash + card + transfer + qris,
        totalIncome,
        totalOutgoing,
        totalRevenue,
        totalOperatingExpense,
        totalNonRevenueIn,
        totalNonRevenueOut,
        jumlahTransaksi:  this.transactions.length,
        actualCash:      this._actualForHistory?.actualCash      ?? null,
        actualCard:      this._actualForHistory?.actualCard      ?? null,
        actualTransfer:  this._actualForHistory?.actualTransfer  ?? null,
        actualQris:      this._actualForHistory?.actualQris      ?? null,
        selisihCash:     this._actualForHistory?.selisihCash     ?? null,
        selisihCard:     this._actualForHistory?.selisihCard     ?? null,
        selisihTransfer: this._actualForHistory?.selisihTransfer ?? null,
        selisihQris:     this._actualForHistory?.selisihQris     ?? null,
        closingNote:     this._actualForHistory?.closingNote     ?? '',
      },
      transactions: this.transactions.map(tx => ({ ...tx }))
    };

    return shiftRecord;
  }

  // ============================================================
  // MODALS
  // ============================================================

  showConfirm(message, callback, isHtml = false, requirePin = false) {
    const el = document.getElementById('confirm-message');
    isHtml ? (el.innerHTML = message) : (el.textContent = message);
    this.confirmRequirePin = requirePin;
    const pinWrap  = document.getElementById('confirm-pin-wrap');
    const pinInput = document.getElementById('confirm-pin');
    if (pinWrap)  pinWrap.style.display = requirePin ? 'block' : 'none';
    if (pinInput) pinInput.value = '';
    this.elements.confirmModal.style.display = 'flex';
    this.confirmAction = callback;
    if (requirePin) setTimeout(() => pinInput?.focus(), 50);
  }

  hideConfirm() {
    this.elements.confirmModal.style.display = 'none';
    this.confirmAction = null;
    this.confirmRequirePin = false;
    const pinWrap = document.getElementById('confirm-pin-wrap');
    if (pinWrap) pinWrap.style.display = 'none';
  }

  async executeConfirm() {
    // PIN-gated confirms (e.g. Reset Default) require the logged-in admin's PIN.
    if (this.confirmRequirePin) {
      const pin  = document.getElementById('confirm-pin').value;
      const user = Auth.currentUser();
      if (!user || user.role !== 'admin' || !(await Auth.verifyPin(user, pin))) {
        this.showAlert(t('resetPinWrong'), 'error');
        const inp = document.getElementById('confirm-pin');
        inp.value = ''; inp.focus();
        return; // keep modal open
      }
    }
    const action = this.confirmAction;
    this.hideConfirm();
    if (action) await action();
  }

  showAlert(message, type = 'info') {
    const div = document.createElement('div');
    div.className = `alert ${type}`;
    const p       = document.createElement('p');
    p.textContent = message;
    const closeBtn       = document.createElement('span');
    closeBtn.className   = 'close-alert';
    closeBtn.textContent = '×';
    div.appendChild(p);
    div.appendChild(closeBtn);
    this.elements.alertContainer.appendChild(div);
    setTimeout(() => div.classList.add('show'), 10);
    const hide = () => { div.classList.remove('show'); setTimeout(() => div.remove(), 300); };
    setTimeout(hide, 5000);
    closeBtn.addEventListener('click', hide);
  }
}

const app = new ChillPOS();
