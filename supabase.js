// ============================================================
// SUPABASE INTEGRATION — single source of truth for remote data
// + realtime subscriptions.
//
// Load order (in HTML):
//   1. vendor/supabase.min.js   (provides global `supabase`)
//   2. supabase.js              (this file)
//   3. lang.js
//   4. script.js (or history.html inline)
//
// Architecture:
//   - SupabaseConfig: URL + publishable key persisted in localStorage
//   - getSupabase(): singleton client
//   - DataStore: in-memory cache, hydrated on app start, kept fresh via realtime
//   - Storage / AuthStorage: legacy-compatible facades over DataStore + localStorage
// ============================================================

// mantra-pos is served from triawidjaya.github.io, the same origin as the older
// chill-poss app, so both share one localStorage. Every key is prefixed so
// neither app ever reads the other's mode, Supabase project, session or data.
const STORAGE_PREFIX = 'mantra:';
const appStorage = {
  get(key)        { return localStorage.getItem(STORAGE_PREFIX + key); },
  set(key, value) { localStorage.setItem(STORAGE_PREFIX + key, value); },
  remove(key)     { localStorage.removeItem(STORAGE_PREFIX + key); },
};

// Category names follow the shop's own cashbook (October 2026 export).
const RENTAL_GUEST_CATEGORY = 'RENTAL PAYMENT';
const RENTAL_OWNER_CATEGORY = 'PAY TO OWNER';
const CASHOUT_CATEGORY = 'TarikTunai';
const BANK_CATEGORY = 'PETTY-CASH';
// Money moving between methods, never a sale or an expense, even if Settings unchecks them.
const SYSTEM_NON_REVENUE = [CASHOUT_CATEGORY, BANK_CATEGORY];

// New-shop setup for a scooter rental, taken from the October 2026 cashbook.
// types: which side of the toggle a category belongs to; missing = both sides.
const RENTAL_SHOP_DEFAULTS = {
  categories: [
    'START BALANCE',
    RENTAL_GUEST_CATEGORY,
    'TRANSPORT SERVICES',
    'FEE',
    RENTAL_OWNER_CATEGORY,
    'PAY TO DRIVER',
    'Oprasional',
    'CashBon',
    CASHOUT_CATEGORY,
    BANK_CATEGORY,
  ],
  types: {
    [RENTAL_GUEST_CATEGORY]: 'INCOME',
    'TRANSPORT SERVICES':    'INCOME',
    'FEE':                   'INCOME',
    [RENTAL_OWNER_CATEGORY]: 'OUTGOING',
    'PAY TO DRIVER':         'OUTGOING',
    'Oprasional':            'OUTGOING',
    'CashBon':               'OUTGOING',
  },
  nonRevenue: ['START BALANCE', CASHOUT_CATEGORY, BANK_CATEGORY, 'CashBon'],
};

function normalizeCategoryTypes(raw) {
  const out = {};
  if (!raw || typeof raw !== 'object') return out;
  Object.entries(raw).forEach(([name, type]) => {
    if (type === 'INCOME' || type === 'OUTGOING') out[name] = type;
  });
  return out;
}

// Pair link for one rental. Lives inside keterangan so it round-trips through
// the existing column. The cashbook never prints this string; it prints
// rentalNoteDisplay() instead.
function packRentalNote({ id, guest, plate, days, owner }) {
  const payload = [guest, plate, String(days), owner]
    .map(v => encodeURIComponent(String(v ?? ''))).join('|');
  return `[sewa:${id}|${payload}]`;
}

function _decodeRentalPart(value) {
  try { return decodeURIComponent(value); } catch { return value; }
}

function parseRentalNote(raw) {
  const text = String(raw ?? '').trim();
  if (!text) return null;
  const uuid = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
  const packed = text.match(new RegExp(`^\\[sewa:(${uuid})\\|([^\\]]*)\\]$`, 'i'));
  if (packed) {
    const parts = packed[2].split('|').map(_decodeRentalPart);
    const days = parseInt(parts[2], 10);
    return {
      id: packed[1],
      guest: parts[0] || '',
      plate: parts[1] || '',
      days: Number.isFinite(days) ? days : 0,
      owner: parts.length > 4 ? parts.slice(3).join('|') : (parts[3] || ''),
    };
  }
  const legacy = text.match(new RegExp(`\\[sewa:(${uuid})\\]\\s*$`, 'i'));
  if (!legacy) return null;
  const body = text.replace(new RegExp(`\\s*\\[sewa:${uuid}\\]\\s*$`, 'i'), '').trim();
  const bits = body.split(' · ');
  const stripLabel = (value, labels) => {
    let out = String(value || '').trim();
    labels.forEach(label => {
      const re = new RegExp('^' + label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s+', 'i');
      if (re.test(out)) out = out.replace(re, '').trim();
    });
    return out;
  };
  const dayMatch = String(bits[2] || '').match(/(\d+)/);
  return {
    id: legacy[1],
    guest: stripLabel(bits[0], ['Guest name', 'Nama tamu']),
    plate: stripLabel(bits[1], ['Motorcycle plate', 'Plat motor']),
    days: dayMatch ? parseInt(dayMatch[1], 10) : 0,
    owner: stripLabel(bits.slice(3).join(' · '), ['Owner', 'Pemilik']),
  };
}

// Pair link for one cash-out (tarik tunai). Same keterangan column, different tag
// from a rental, so the cashbook can hide the id and show a short note.
function packCashoutNote({ id, method, note }) {
  const parts = [method, note].map(v => encodeURIComponent(String(v ?? '').trim()));
  return `[tunai:${id}|${parts.join('|')}]`;
}

function parseCashoutNote(raw) {
  const text = String(raw ?? '').trim();
  if (!text) return null;
  const uuid = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
  const packed = text.match(new RegExp(`^\\[tunai:(${uuid})\\|([^\\]]*)\\]$`, 'i'));
  if (!packed) return null;
  const decode = (v) => { try { return decodeURIComponent(v ?? ''); } catch { return v ?? ''; } };
  const [method, note] = packed[2].split('|').map(decode);
  return { id: packed[1], method, note: note || '' };
}

// Card settlement moved into the cash box. Not a sale and not tarik tunai.
// Methods are fixed (Card out, Cash in), so the tag only keeps the pair id.
function packBankNote({ id }) {
  return `[bank:${id}]`;
}

function parseBankNote(raw) {
  const text = String(raw ?? '').trim();
  if (!text) return null;
  const uuid = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
  const packed = text.match(new RegExp(`^\\[bank:(${uuid})\\]$`, 'i'));
  if (!packed) return null;
  return { id: packed[1] };
}

// ── Config storage ──
const SB_CONFIG_KEY = 'pos_sb_config';
// mantra-pos only ever talks to the Mantra Lombok POS project. The URL is not
// secret; the publishable key is, because RLS lets that key read and write
// everything, so it is pasted once per device and never committed.
const MANTRA_SUPABASE_URL = 'https://ohcnosdjgkkctripdzlj.supabase.co';

const SupabaseConfig = {
  load() {
    try {
      const raw = appStorage.get(SB_CONFIG_KEY);
      const cfg = raw ? JSON.parse(raw) : null;
      return cfg && cfg.url === MANTRA_SUPABASE_URL && cfg.key ? cfg : null;
    } catch { return null; }
  },
  save(url, key) {
    const cleanUrl = this._normalizeUrl(url || MANTRA_SUPABASE_URL);
    const cleanKey = String(key || '').trim();
    if (cleanUrl !== MANTRA_SUPABASE_URL) throw new Error('invalidSupabaseUrl');
    if (!this.isValidUrl(cleanUrl)) throw new Error('invalidSupabaseUrl');
    if (!this.isValidKey(cleanKey)) throw new Error('invalidSupabaseKey');
    appStorage.set(SB_CONFIG_KEY, JSON.stringify({ url: cleanUrl, key: cleanKey }));
    _client = null; // force re-init next getSupabase()
    _resetAuth = null;
  },
  clear() {
    appStorage.remove(SB_CONFIG_KEY);
    _client = null;
    _resetAuth = null;
  },
  // Strip common copy-paste cruft: trailing slashes, REST path, whitespace.
  // Accepts e.g. "https://xxx.supabase.co/rest/v1/" → "https://xxx.supabase.co".
  _normalizeUrl(url) {
    return String(url || '').trim()
      .replace(/\/rest\/v\d+\/?$/i, '')
      .replace(/\/+$/, '');
  },
  isValidUrl(url) {
    return /^https:\/\/[a-z0-9]+\.supabase\.co$/i.test(this._normalizeUrl(url));
  },
  isValidKey(key) {
    const k = String(key || '').trim();
    return k.startsWith('sb_publishable_') || k.startsWith('eyJ');
  },
};

// ── Client singleton ──
let _client = null;
let _resetAuth = null;
function _requireSupabaseConfig() {
  const cfg = SupabaseConfig.load();
  if (!cfg) throw new Error('Supabase not configured');
  if (typeof supabase === 'undefined' || !supabase.createClient) {
    throw new Error('Supabase SDK not loaded');
  }
  return cfg;
}
function getSupabase() {
  if (_client) return _client;
  const cfg = _requireSupabaseConfig();
  // Shop rows are readable by the anon key only (RLS policy "anon full access").
  // A user JWT from a PIN-reset link would make every select return no rows,
  // so the till looks empty and the brand falls back to "My Business".
  // accessToken null keeps the publishable key on data and realtime requests.
  _client = supabase.createClient(cfg.url, cfg.key, {
    accessToken: async () => null,
    realtime: { params: { eventsPerSecond: 10 } },
  });
  return _client;
}
// Separate Auth client. Its session must never authorize shop queries.
function getResetAuth() {
  if (_resetAuth) return _resetAuth;
  const cfg = _requireSupabaseConfig();
  _resetAuth = supabase.createClient(cfg.url, cfg.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: true,
      flowType: 'implicit',
      storageKey: 'mantra-pin-reset',
    },
  });
  return _resetAuth;
}

// ── Translators: snake_case (DB) ↔ camelCase (app) ──
const toAppUser = (r) => ({
  id:        r.id,
  username:  r.username,
  pinHash:   r.pin_hash,
  role:      r.role,
  email:     r.email ? String(r.email).trim().toLowerCase() : null,
  createdAt: r.created_at,
});
const toDbUser = (u) => ({
  id:         u.id,
  username:   u.username,
  pin_hash:   u.pinHash,
  role:       u.role,
  email:      u.email ? String(u.email).trim().toLowerCase() : null,
  created_at: u.createdAt || new Date().toISOString(),
});

const toAppTx = (r) => ({
  id:           r.id,
  jenis:        r.jenis,
  kategori:     r.kategori,
  deskripsi:    r.deskripsi,
  jumlah:       Number(r.jumlah),
  metode:       r.metode,
  keterangan:   r.keterangan || '',
  staff:        r.staff,
  tanggalWaktu: r.tanggal_waktu,
});
const toDbTx = (t) => ({
  id:            t.id,
  jenis:         t.jenis,
  kategori:      t.kategori,
  deskripsi:     t.deskripsi,
  jumlah:        t.jumlah,
  metode:        t.metode,
  keterangan:    t.keterangan || null,
  staff:         t.staff,
  tanggal_waktu: t.tanggalWaktu,
});

const toAppShift = (r) => ({
  id:           r.id,
  startedAt:    r.started_at,
  closedAt:     r.closed_at,
  staff:        r.staff,
  summary:      r.summary,
  transactions: r.transactions,
});
const toDbShift = (s) => ({
  id:           s.id,
  started_at:   s.startedAt,
  closed_at:    s.closedAt,
  staff:        s.staff,
  summary:      s.summary,
  transactions: s.transactions,
});

// ============================================================
// DataStore — in-memory cache + realtime + CRUD
//
// All arrays MUST be mutated in place (push, splice, length=0).
// External callers may hold references to these arrays (e.g.
// `this.transactions = DataStore.transactions`), so reassignment
// would break the shared reference and silently desync the UI.
// ============================================================

// Every Mantra device shares the one Mantra Lombok Supabase project.
const DataStore = {
  hydrated: false,

  setMode() {},
  clearMode() {},
  loadMode() { return 'cloud'; },
  isCloud() { return true; },

  transactions: [],
  shifts:       [],
  categories:   [],            // array of name strings
  users:        [],
  session:      null,          // { userId, loginAt } | null
  settings: {
    brand:           'My Business',
    lang:            'en',
    shiftActive:     false,
    adminCategories: [],   // category names that require admin PIN to record
    nonRevenueCategories: [], // category names excluded from revenue/expense totals (transfer, receivable, opening balance)
    categoryTypes:   {},   // { name: 'INCOME' | 'OUTGOING' }; missing = usable on both sides
    logoData:        null, // base64 PNG of custom logo (cloud only); null = use static logo.png
  },

  _listeners: {
    transactions: [], shifts: [], categories: [],
    users: [], session: [], settings: [],
  },

  on(entity, cb) {
    if (!this._listeners[entity]) this._listeners[entity] = [];
    this._listeners[entity].push(cb);
  },
  _fire(entity) {
    (this._listeners[entity] || []).forEach(cb => {
      try { cb(); } catch (e) { console.error('[DataStore]', entity, 'listener error:', e); }
    });
  },

  // Empty all caches — useful on Supabase reconfig
  _resetCache() {
    this.transactions.length = 0;
    this.shifts.length       = 0;
    this.categories.length   = 0;
    this.users.length        = 0;
    this.session             = null;
    this.settings.brand           = 'My Business';
    this.settings.lang            = 'en';
    this.settings.shiftActive     = false;
    this.settings.adminCategories = [];
    this.settings.nonRevenueCategories = [];
    this.settings.categoryTypes   = {};
    this.settings.templateApplied = false;
    this.settings.logoData        = null;
    this.hydrated = false;
  },

  async hydrate() {
    await this._hydrateCloud();
    try {
      await this._renameLegacyCategories();
    } catch (e) {
      console.error('[DataStore] legacy category cleanup failed:', e);
    }
    // Queued writes are the source of truth until they reach the server.
    // Replaying them keeps the screen (especially an open vs closed shift)
    // aligned with what the cashier already confirmed.
    try {
      if (window.OfflineQueue) OfflineQueue.replayOntoCache();
    } catch (e) {
      console.error('[DataStore] offline replay failed:', e);
    }
  },

  // Shops set up before the scooter-rental defaults still carry the old
  // category names. Old names are rewritten everywhere they are stored; the
  // old starter placeholders are dropped only if no transaction uses them.
  async _renameLegacyCategories() {
    const RENAMED = {
      'Sewa':            RENTAL_GUEST_CATEGORY,
      'SCOOTER RENTALS': RENTAL_GUEST_CATEGORY,
      'Bagian pemilik':  RENTAL_OWNER_CATEGORY,
      'Tarik tunai':     CASHOUT_CATEGORY,
      'Kas dari bank':   BANK_CATEGORY,
    };
    const OLD_PLACEHOLDERS = ['Sales', 'Refund', 'Expense', 'Other'];
    const rename = (name) => RENAMED[name] || name;

    const used = new Set(this.transactions.map(t => t.kategori));
    this.shifts.forEach(s => (s.transactions || []).forEach(t => used.add(t.kategori)));

    let nextCats = [];
    this.categories.forEach(name => {
      if (OLD_PLACEHOLDERS.includes(name) && !used.has(name)) return;
      const next = rename(name);
      if (!nextCats.includes(next)) nextCats.push(next);
    });
    // A shop set up before the rental template has no category sides at all:
    // give it the template's categories once; its own extra categories stay.
    // template_applied keeps an owner's later "In & out everywhere" choice.
    const hasTypes = Object.keys(this.settings.categoryTypes || {}).length > 0;
    const adoptTemplate = !this.settings.templateApplied && !hasTypes && this.categories.length > 0;
    if (adoptTemplate) {
      const extras = nextCats.filter(n => !RENTAL_SHOP_DEFAULTS.categories.includes(n));
      nextCats = [...RENTAL_SHOP_DEFAULTS.categories, ...extras];
    }
    if (nextCats.join('\n') !== this.categories.join('\n')) await this.saveCategories(nextCats);

    for (const tx of this.transactions.filter(t => RENAMED[t.kategori])) {
      await this.updateTransaction({ ...tx, kategori: rename(tx.kategori) });
    }

    const oldShifts = this.shifts.filter(s => (s.transactions || []).some(t => RENAMED[t.kategori]));
    for (const shift of oldShifts) {
      shift.transactions = shift.transactions.map(t => ({ ...t, kategori: rename(t.kategori) }));
      const { error } = await getSupabase().from('pos_shifts')
        .update({ transactions: shift.transactions }).eq('id', shift.id);
      if (error) throw error;
    }

    const renameList = (list) => {
      const out = [];
      (list || []).forEach(name => { const n = rename(name); if (!out.includes(n)) out.push(n); });
      return out;
    };
    const s = this.settings;
    const changed = (a, b) => JSON.stringify(a) !== JSON.stringify(b);

    const admin = renameList(s.adminCategories).filter(n => nextCats.includes(n));
    if (changed(admin, s.adminCategories)) await this.saveSetting('admin_categories', admin);

    const nonRevenue = renameList([
      ...(s.nonRevenueCategories || []),
      ...(adoptTemplate ? RENTAL_SHOP_DEFAULTS.nonRevenue : []),
    ]).filter(n => nextCats.includes(n));
    if (changed(nonRevenue, s.nonRevenueCategories)) await this.saveSetting('non_revenue_categories', nonRevenue);

    const types = {};
    if (adoptTemplate) Object.assign(types, RENTAL_SHOP_DEFAULTS.types);
    Object.entries(s.categoryTypes || {}).forEach(([name, type]) => {
      const n = rename(name);
      if (nextCats.includes(n) && !types[n]) types[n] = type;
    });
    if (adoptTemplate || changed(types, s.categoryTypes)) await this.saveSetting('category_types', types);
    if (!s.templateApplied && (adoptTemplate || hasTypes)) await this.saveSetting('template_applied', true);
  },

  async _hydrateCloud() {
    const sb = getSupabase();
    const [txRes, shiftRes, catRes, userRes, sessRes, setRes] = await Promise.all([
      sb.from('pos_transactions').select('*').order('tanggal_waktu', { ascending: false }),
      sb.from('pos_shifts').select('*').order('closed_at', { ascending: false }).limit(50),
      sb.from('pos_categories').select('*').order('sort_order', { ascending: true }),
      sb.from('pos_users').select('*').order('created_at', { ascending: true }),
      sb.from('pos_session').select('*').eq('id', 1).maybeSingle(),
      sb.from('pos_settings').select('*'),
    ]);
    for (const r of [txRes, shiftRes, catRes, userRes, sessRes, setRes]) {
      if (r.error) throw new Error(`Hydrate failed: ${r.error.message}`);
    }

    // Replace contents in place
    this.transactions.length = 0;
    (txRes.data || []).forEach(r => this.transactions.push(toAppTx(r)));

    this.shifts.length = 0;
    (shiftRes.data || []).forEach(r => this.shifts.push(toAppShift(r)));

    this.categories.length = 0;
    (catRes.data || []).forEach(c => this.categories.push(c.name));

    this.users.length = 0;
    (userRes.data || []).forEach(r => this.users.push(toAppUser(r)));

    const s = sessRes.data;
    this.session = (s && s.user_id) ? { userId: s.user_id, loginAt: s.login_at } : null;

    const map = {};
    (setRes.data || []).forEach(row => { map[row.key] = row.value; });
    this.settings.brand           = map.brand            ?? 'My Business';
    this.settings.lang            = map.lang             ?? 'en';
    this.settings.shiftActive     = map.shift_active     ?? false;
    this.settings.adminCategories = map.admin_categories ?? [];
    this.settings.nonRevenueCategories = map.non_revenue_categories ?? [];
    this.settings.categoryTypes   = normalizeCategoryTypes(map.category_types);
    this.settings.templateApplied = map.template_applied === true;
    this.settings.logoData        = map.logo_data        ?? null;

    this.hydrated = true;
  },

  // ── Realtime ──
  subscribeRealtime() {
    const sb = getSupabase();
    sb.channel('pos-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pos_transactions' }, (p) => this._onTxChange(p))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pos_shifts'       }, (p) => this._onShiftChange(p))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pos_categories'   }, (p) => this._onCategoryChange(p))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pos_users'        }, (p) => this._onUserChange(p))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pos_session'      }, (p) => this._onSessionChange(p))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pos_settings'     }, (p) => this._onSettingsChange(p))
      .subscribe((status) => {
        // 'SUBSCRIBED' fires on initial connect AND on every reconnect after
        // network drop / device sleep. Use it as the cue to drain any queued
        // offline writes that piled up while disconnected.
        if (status === 'SUBSCRIBED') OfflineQueue.flush();
      });
  },

  _onTxChange(p) {
    const id = p.eventType === 'DELETE' ? p.old.id : p.new.id;
    // Keep optimistic edits and deletes on screen until the queue flushes.
    if (p.eventType !== 'DELETE' && window.OfflineQueue && OfflineQueue.blocksRemoteTx(id)) return;
    if (p.eventType === 'INSERT') {
      if (!this.transactions.some(t => t.id === p.new.id)) this.transactions.unshift(toAppTx(p.new));
    } else if (p.eventType === 'UPDATE') {
      const idx = this.transactions.findIndex(t => t.id === p.new.id);
      const tx  = toAppTx(p.new);
      if (idx !== -1) this.transactions[idx] = tx; else this.transactions.unshift(tx);
    } else if (p.eventType === 'DELETE') {
      const idx = this.transactions.findIndex(t => t.id === p.old.id);
      if (idx !== -1) this.transactions.splice(idx, 1);
    }
    this._fire('transactions');
  },

  _onShiftChange(p) {
    if (p.eventType === 'INSERT') {
      if (!this.shifts.some(x => x.id === p.new.id)) this.shifts.unshift(toAppShift(p.new));
      if (this.shifts.length > 50) this.shifts.splice(50);
    } else if (p.eventType === 'UPDATE') {
      const idx = this.shifts.findIndex(x => x.id === p.new.id);
      if (idx !== -1) this.shifts[idx] = toAppShift(p.new);
    } else if (p.eventType === 'DELETE') {
      const idx = this.shifts.findIndex(x => x.id === p.old.id);
      if (idx !== -1) this.shifts.splice(idx, 1);
    }
    this._fire('shifts');
  },

  _onCategoryChange(_p) {
    // Refetch the whole list — keeps sort_order semantics consistent
    getSupabase().from('pos_categories').select('*').order('sort_order')
      .then(({ data }) => {
        this.categories.length = 0;
        (data || []).forEach(c => this.categories.push(c.name));
        this._fire('categories');
      })
      .catch(e => console.error('[DataStore] category refetch failed:', e));
  },

  _onUserChange(p) {
    if (p.eventType === 'INSERT') {
      if (!this.users.some(x => x.id === p.new.id)) this.users.push(toAppUser(p.new));
    } else if (p.eventType === 'UPDATE') {
      const idx = this.users.findIndex(x => x.id === p.new.id);
      if (idx !== -1) this.users[idx] = toAppUser(p.new);
    } else if (p.eventType === 'DELETE') {
      const idx = this.users.findIndex(x => x.id === p.old.id);
      if (idx !== -1) this.users.splice(idx, 1);
    }
    this._fire('users');
  },

  _onSessionChange(p) {
    if (p.eventType === 'DELETE') {
      this.session = null;
    } else {
      const s = p.new;
      this.session = (s && s.user_id) ? { userId: s.user_id, loginAt: s.login_at } : null;
    }
    this._fire('session');
  },

  _onSettingsChange(p) {
    if (p.eventType === 'DELETE') return;
    const { key, value } = p.new;
    if      (key === 'brand')            this.settings.brand           = value;
    else if (key === 'lang')             this.settings.lang            = value;
    else if (key === 'shift_active') {
      // A queued close or a queued shift flag is the cashier's latest choice.
      // Ignore the server copy until that write lands, or the till flips back open.
      if (window.OfflineQueue && OfflineQueue.holdsShiftFlag()) return;
      this.settings.shiftActive = value;
    }
    else if (key === 'admin_categories') this.settings.adminCategories = value;
    else if (key === 'non_revenue_categories') this.settings.nonRevenueCategories = value;
    else if (key === 'category_types')   this.settings.categoryTypes   = normalizeCategoryTypes(value);
    else if (key === 'template_applied') this.settings.templateApplied = value === true;
    else if (key === 'logo_data')        this.settings.logoData        = value;
    this._fire('settings');
  },

  _rememberTransaction(tx) {
    const idx = this.transactions.findIndex(t => t.id === tx.id);
    if (idx === -1) this.transactions.unshift({ ...tx });
    else this.transactions[idx] = { ...tx };
    this._fire('transactions');
  },

  _dropTransaction(id) {
    const idx = this.transactions.findIndex(t => t.id === id);
    if (idx !== -1) this.transactions.splice(idx, 1);
    this._fire('transactions');
  },

  _applySettingLocal(key, value) {
    if      (key === 'brand')            this.settings.brand           = value;
    else if (key === 'lang')             this.settings.lang            = value;
    else if (key === 'shift_active')     this.settings.shiftActive     = value === true;
    else if (key === 'admin_categories') this.settings.adminCategories = value;
    else if (key === 'non_revenue_categories') this.settings.nonRevenueCategories = value;
    else if (key === 'category_types')   this.settings.categoryTypes   = normalizeCategoryTypes(value);
    else if (key === 'template_applied') this.settings.templateApplied = value === true;
    else if (key === 'logo_data')        this.settings.logoData        = value;
    this._fire('settings');
  },

  // Screen copy of a close. The same steps run again on reload via the queue
  // replay, so a refresh does not show the shift as still open.
  _applyCloseLocal(payload) {
    const ids = new Set(payload.transactionIds || []);
    for (let i = this.transactions.length - 1; i >= 0; i--) {
      if (ids.has(this.transactions[i].id)) this.transactions.splice(i, 1);
    }
    if (payload.shift && !this.shifts.some(s => s.id === payload.shift.id)) {
      this.shifts.unshift({ ...payload.shift });
    }
    if (this.shifts.length > 50) this.shifts.splice(50);
    this.settings.shiftActive = false;
    this._fire('transactions');
    this._fire('shifts');
    this._fire('settings');
  },

  // Idempotent server close: a retry after a dropped connection must not
  // create a second history row or delete a later shift's transactions.
  async _commitCloseShift(payload) {
    const sb = getSupabase();
    const { error: shiftErr } = await sb.from('pos_shifts').insert([toDbShift(payload.shift)]);
    if (shiftErr && !isDuplicateError(shiftErr)) throw shiftErr;
    const ids = payload.transactionIds || [];
    if (ids.length) {
      const { error } = await sb.from('pos_transactions').delete().in('id', ids);
      if (error) throw error;
    }
    const { error: setErr } = await sb.from('pos_settings').upsert({ key: 'shift_active', value: false });
    if (setErr) throw setErr;
    const { data, error } = await sb.from('pos_shifts').select('id').order('closed_at', { ascending: false });
    if (error) throw error;
    if (data && data.length > 50) {
      const extra = data.slice(50).map(row => row.id);
      const { error: trimErr } = await sb.from('pos_shifts').delete().in('id', extra);
      if (trimErr) console.error('[DataStore] shift trim failed:', trimErr);
    }
  },

  // One queued operation. The screen closes only together with the queue
  // entry, and the queue is not dropped on a permanent error.
  async closeShift(payload) {
    if (this._closing || OfflineQueue.load().some(item => item.op === 'closeShift')) {
      const err = new Error('shiftClosePending');
      err.code = 'shiftClosePending';
      throw err;
    }
    this._closing = true;
    try {
      await this._commitCloseShift(payload);
      this._applyCloseLocal(payload);
    } catch (e) {
      if (!isNetworkError(e)) throw e;
      OfflineQueue.enqueue('closeShift', {
        shift: payload.shift,
        transactionIds: [...(payload.transactionIds || [])],
      });
      this._applyCloseLocal(payload);
    } finally {
      this._closing = false;
    }
  },

  // ── Transaction CRUD ──
  async insertTransaction(tx) {
    const write = async () => {
      const { error } = await getSupabase().from('pos_transactions').insert([toDbTx(tx)]);
      if (error && !isDuplicateError(error)) throw error;
    };
    // A close still waiting in the queue must run first, or this row could
    // land and then be left behind a shift the cashier already finished.
    if (OfflineQueue.load().some(item => item.op === 'closeShift')) {
      OfflineQueue.enqueue('insertTransaction', tx);
      this._rememberTransaction(tx);
      return;
    }
    try {
      await write();
      this._rememberTransaction(tx);
    } catch (e) {
      if (!isNetworkError(e)) throw e;
      OfflineQueue.enqueue('insertTransaction', tx);
      this._rememberTransaction(tx);
    }
  },

  async updateTransaction(tx) {
    const write = async () => {
      const { error } = await getSupabase().from('pos_transactions').update(toDbTx(tx)).eq('id', tx.id);
      if (error) throw error;
    };
    if (OfflineQueue.load().some(item => item.op === 'closeShift')) {
      OfflineQueue.enqueue('updateTransaction', tx);
      this._rememberTransaction(tx);
      return;
    }
    try {
      await write();
      this._rememberTransaction(tx);
    } catch (e) {
      if (!isNetworkError(e)) throw e;
      OfflineQueue.enqueue('updateTransaction', tx);
      this._rememberTransaction(tx);
    }
  },

  async deleteTransaction(id) {
    const write = async () => {
      const { error } = await getSupabase().from('pos_transactions').delete().eq('id', id);
      if (error) throw error;
    };
    if (OfflineQueue.load().some(item => item.op === 'closeShift')) {
      OfflineQueue.enqueue('deleteTransaction', id);
      this._dropTransaction(id);
      return;
    }
    try {
      await write();
      this._dropTransaction(id);
    } catch (e) {
      if (!isNetworkError(e)) throw e;
      OfflineQueue.enqueue('deleteTransaction', id);
      this._dropTransaction(id);
    }
  },

  async clearTransactions() {
    // .delete() requires a filter clause — neq an impossible UUID matches all rows.
    const { error } = await getSupabase().from('pos_transactions')
      .delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) throw error;
    this.transactions.length = 0;
  },

  // ── Shift CRUD ──
  async insertShift(shift) {
    const { error } = await getSupabase().from('pos_shifts').insert([toDbShift(shift)]);
    if (error && !isDuplicateError(error)) throw error;
    if (!this.shifts.some(s => s.id === shift.id)) this.shifts.unshift({ ...shift });
    if (this.shifts.length > 50) {
      const toRemove = this.shifts.splice(50);
      const ids = toRemove.map(s => s.id);
      await getSupabase().from('pos_shifts').delete().in('id', ids).then(({ error: trimErr }) => {
        if (trimErr) console.error('[DataStore] shift trim failed:', trimErr);
      });
    }
  },

  async deleteShifts(ids) {
    if (!ids || ids.length === 0) return;
    const { error } = await getSupabase().from('pos_shifts').delete().in('id', ids);
    if (error) throw error;
    const set = new Set(ids);
    for (let i = this.shifts.length - 1; i >= 0; i--) {
      if (set.has(this.shifts[i].id)) this.shifts.splice(i, 1);
    }
  },

  // ── Category CRUD (full sync of name array) ──
  async saveCategories(categories) {
    // Defensive copy: callers (e.g. saveSettings) pass `this.categories` by
    // reference. Since we later reset the cache with `this.categories.length = 0`,
    // iterating the original `categories` arg would walk an emptied array and
    // wipe the local list. Snapshot first.
    const input = [...categories];

    const sb = getSupabase();
    const { data: existing, error: e1 } = await sb.from('pos_categories').select('id,name,sort_order,is_system');
    if (e1) throw e1;
    const existingByName = new Map((existing || []).map(c => [c.name, c]));
    const newNames = new Set(input);

    // Delete categories no longer in the list (skip system ones)
    const toDelete = (existing || []).filter(c => !newNames.has(c.name) && !c.is_system);
    if (toDelete.length > 0) {
      const { error } = await sb.from('pos_categories').delete().in('id', toDelete.map(c => c.id));
      if (error) throw error;
    }

    // Insert new + update sort_order for moved ones
    const toInsert = [];
    const toUpdate = [];
    input.forEach((name, idx) => {
      const ex = existingByName.get(name);
      if (!ex) {
        toInsert.push({ name, sort_order: idx, is_system: name === 'START BALANCE' });
      } else if (ex.sort_order !== idx) {
        toUpdate.push({ id: ex.id, sort_order: idx });
      }
    });
    if (toInsert.length > 0) {
      const { error } = await sb.from('pos_categories').insert(toInsert);
      if (error) throw error;
    }
    for (const u of toUpdate) {
      const { error } = await sb.from('pos_categories').update({ sort_order: u.sort_order }).eq('id', u.id);
      if (error) throw error;
    }

    this.categories.length = 0;
    input.forEach(n => this.categories.push(n));
  },

  // ── User CRUD ──
  async insertUser(user) {
    const { data, error } = await getSupabase().from('pos_users').insert([toDbUser(user)]).select().single();
    if (error) throw error;
    const created = toAppUser(data);
    if (!this.users.some(u => u.id === created.id)) this.users.push(created);
    return created;
  },

  async updateUser(userId, updates) {
    const dbUpdates = {};
    if ('username' in updates) dbUpdates.username = updates.username;
    if ('pinHash'  in updates) dbUpdates.pin_hash = updates.pinHash;
    if ('role'     in updates) dbUpdates.role     = updates.role;
    if ('email'    in updates) dbUpdates.email    = updates.email ? String(updates.email).trim().toLowerCase() : null;
    const { data, error } = await getSupabase().from('pos_users').update(dbUpdates).eq('id', userId).select().single();
    if (error) throw error;
    const u = toAppUser(data);
    const idx = this.users.findIndex(x => x.id === userId);
    if (idx !== -1) this.users[idx] = u;
    return u;
  },

  async deleteUser(userId) {
    const { error } = await getSupabase().from('pos_users').delete().eq('id', userId);
    if (error) throw error;
    const idx = this.users.findIndex(u => u.id === userId);
    if (idx !== -1) this.users.splice(idx, 1);
  },

  // ── Session (single row id=1) ──
  async saveSession(session) {
    const { error } = await getSupabase().from('pos_session')
      .update({ user_id: session.userId, login_at: session.loginAt }).eq('id', 1);
    if (error) throw error;
    this.session = { ...session };
  },

  async clearSession() {
    const { error } = await getSupabase().from('pos_session')
      .update({ user_id: null, login_at: null }).eq('id', 1);
    if (error) throw error;
    this.session = null;
  },

  // ── Settings ──
  async saveSetting(key, value) {
    const queuedClose = OfflineQueue.load().some(item => item.op === 'closeShift');
    if (key === 'shift_active' && queuedClose) {
      OfflineQueue.enqueue('saveSetting', { key, value });
      this._applySettingLocal(key, value);
      return;
    }
    try {
      const { error } = await getSupabase().from('pos_settings').upsert({ key, value });
      if (error) throw error;
      this._applySettingLocal(key, value);
    } catch (e) {
      if (key === 'shift_active' && isNetworkError(e)) {
        OfflineQueue.enqueue('saveSetting', { key, value });
        this._applySettingLocal(key, value);
        return;
      }
      throw e;
    }
  },
};

// ============================================================
// Storage shim — legacy API kept for backward compat.
//
// Reads: synchronous, from DataStore cache (hydrated on init).
// Writes: synchronous to cache, fire-and-forget to Supabase.
//
// UI-only keys (theme, header_hidden, access_granted, sb_config,
// lang, migrated_v1) remain in localStorage and never touch DataStore.
// ============================================================
const LOCAL_ONLY_KEYS = new Set([
  'theme',
  'pos_lang',
  'pos_header_hidden',
  'pos_filter_visible',
  'pos_access_granted',
  'pos_staff',          // derived from users; cached locally for legacy callers
  'pos_migrated_v1',
  'pos_session',          // per-device session — see AuthStorage below
  SB_CONFIG_KEY,
]);

const _lsGet = (key, fallback) => {
  try {
    const raw = appStorage.get(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch { return fallback; }
};
const _lsSet = (key, value) => {
  try { appStorage.set(key, JSON.stringify(value)); return true; }
  catch (e) { return (e?.name === 'QuotaExceededError') ? 'quota' : false; }
};

const Storage = {
  get(key, fallback = null) {
    if (LOCAL_ONLY_KEYS.has(key)) return _lsGet(key, fallback);
    switch (key) {
      case 'pos_transactions':  return DataStore.transactions;
      case 'pos_shift_history': return DataStore.shifts;
      case 'pos_categories':    return DataStore.categories;
      case 'pos_brand':         return DataStore.settings.brand;
      case 'pos_shift_active':  return DataStore.settings.shiftActive;
      default:                  return _lsGet(key, fallback);
    }
  },

  set(key, value) {
    if (LOCAL_ONLY_KEYS.has(key)) return _lsSet(key, value);
    const fireAsync = (p) => { p.catch(e => console.error(`[Storage] async write "${key}" failed:`, e)); };
    switch (key) {
      case 'pos_brand':
        DataStore.settings.brand = value;
        fireAsync(DataStore.saveSetting('brand', value));
        return true;
      case 'pos_shift_active':
        DataStore.settings.shiftActive = value;
        fireAsync(DataStore.saveSetting('shift_active', value));
        return true;
      case 'pos_categories':
        fireAsync(DataStore.saveCategories(value));
        return true;
      case 'pos_transactions':
      case 'pos_shift_history':
        // Bulk array overwrites are not supported in Supabase mode.
        // Callers should use DataStore.* methods directly.
        console.warn(`[Storage] bulk "${key}" set is a no-op; use DataStore CRUD.`);
        return true;
      default:
        return _lsSet(key, value);
    }
  },

  remove(key) {
    if (LOCAL_ONLY_KEYS.has(key)) {
      try { appStorage.remove(key); } catch {}
      return;
    }
    switch (key) {
      case 'pos_transactions':
        DataStore.clearTransactions().catch(e => console.error('[Storage] clearTransactions failed:', e));
        break;
      case 'pos_shift_active':
        Storage.set('pos_shift_active', false);
        break;
      default:
        try { appStorage.remove(key); } catch {}
    }
  },
};

// ============================================================
// AuthStorage — Supabase-backed user/session adapter.
// Identical API surface to legacy AuthStorage so Auth callers don't change.
// ============================================================
const AuthStorage = {
  async getUsers() {
    // Return a shallow copy — callers may mutate the array but should not affect cache.
    return DataStore.users.map(u => ({ ...u }));
  },

  // Legacy bulk save — diff against cache, apply CRUD individually.
  // Prefer DataStore.insertUser / updateUser / deleteUser for clarity.
  async saveUsers(users) {
    const newById      = new Map(users.map(u => [u.id, u]));
    const existingById = new Map(DataStore.users.map(u => [u.id, u]));

    // Delete users removed from the list
    for (const id of existingById.keys()) {
      if (!newById.has(id)) await DataStore.deleteUser(id);
    }
    // Insert new + update changed
    for (const u of users) {
      const ex = existingById.get(u.id);
      if (!ex) {
        await DataStore.insertUser(u);
      } else if (ex.username !== u.username || ex.pinHash !== u.pinHash || ex.role !== u.role || (ex.email || null) !== (u.email || null)) {
        await DataStore.updateUser(u.id, {
          username: u.username, pinHash: u.pinHash, role: u.role, email: u.email || null,
        });
      }
    }
    return true;
  },

  // Per-device session: stored in localStorage (NOT in Supabase pos_session
  // table). This lets cashier D log in on Computer A while admin A logs in on
  // Computer B simultaneously, each device managing its own session.
  // The legacy single-row pos_session table is now vestigial — safe to ignore
  // or drop later.
  async getSession() {
    return _lsGet('pos_session', null);
  },

  async saveSession(s) {
    _lsSet('pos_session', s);
    return true;
  },

  async clearSession() {
    _lsSet('pos_session', null);
  },
};

// ============================================================
// Offline queue — inserts, edits, deletes, and shift close.
// ============================================================
function isDuplicateError(error) {
  if (!error) return false;
  if (error.code === '23505') return true;
  const msg = String(error.message || error.details || '').toLowerCase();
  return msg.includes('duplicate key') || msg.includes('already exists');
}

// ============================================================
// OfflineQueue — buffer for writes that did not reach Supabase.
//
// Queued: new transactions, edits, deletes, shift close, and the
// shift-open flag when it has to stay ordered behind a close.
// A shift close is kept until it succeeds. Other ops are dropped
// only when the server rejects them for a reason that will not
// change on retry (constraint, RLS).
// ============================================================
const OFFLINE_QUEUE_KEY = 'pos_offline_queue';

function isNetworkError(err) {
  if (!err) return false;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
  const msg = String(err.message || err.msg || err).toLowerCase();
  if (msg.includes('failed to fetch')) return true;
  if (msg.includes('networkerror'))    return true;
  if (msg.includes('load failed'))     return true;   // Safari
  if (msg.includes('network request')) return true;
  return err.name === 'TypeError';
}

const OfflineQueue = {
  _flushing: false,
  _blocked: null,
  _listeners: [],

  load() {
    try { return JSON.parse(appStorage.get(OFFLINE_QUEUE_KEY)) || []; }
    catch { return []; }
  },
  _persist(q) {
    try { appStorage.set(OFFLINE_QUEUE_KEY, JSON.stringify(q)); }
    catch (e) { console.error('[OfflineQueue] persist failed:', e); }
  },
  size() { return this.load().length; },
  blocked() { return this._blocked; },

  holdsShiftFlag() {
    return this.load().some(item =>
      item.op === 'closeShift' ||
      (item.op === 'saveSetting' && item.payload && item.payload.key === 'shift_active')
    );
  },

  blocksRemoteTx(id) {
    return this.load().some(item => {
      if (!item || !item.payload) return false;
      if (item.op === 'insertTransaction' || item.op === 'updateTransaction') return item.payload.id === id;
      if (item.op === 'deleteTransaction') return item.payload === id;
      if (item.op === 'closeShift') return (item.payload.transactionIds || []).includes(id);
      return false;
    });
  },

  enqueue(op, payload) {
    const q = this.load();
    q.push({
      qid:       (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random()),
      op,
      payload,
      createdAt: new Date().toISOString(),
      retries:   0,
    });
    this._persist(q);
    this._blocked = null;
    this._fire();
  },

  // Re-apply queued intent onto the cache after a server hydrate.
  replayOntoCache() {
    const removed = new Set();
    this.load().forEach(item => {
      if (item.op === 'closeShift') {
        (item.payload.transactionIds || []).forEach(id => removed.add(id));
        DataStore._applyCloseLocal(item.payload);
      } else if (item.op === 'deleteTransaction') {
        removed.add(item.payload);
        DataStore._dropTransaction(item.payload);
      } else if (item.op === 'insertTransaction') {
        removed.delete(item.payload.id);
        DataStore._rememberTransaction(item.payload);
      } else if (item.op === 'updateTransaction') {
        if (removed.has(item.payload.id)) return;
        DataStore._rememberTransaction(item.payload);
      } else if (item.op === 'saveSetting') {
        DataStore._applySettingLocal(item.payload.key, item.payload.value);
      }
    });
  },

  async _run(item) {
    const sb = getSupabase();
    if (item.op === 'insertTransaction') {
      const { error } = await sb.from('pos_transactions').insert([toDbTx(item.payload)]);
      if (error && !isDuplicateError(error)) throw error;
      return;
    }
    if (item.op === 'updateTransaction') {
      const { error } = await sb.from('pos_transactions').update(toDbTx(item.payload)).eq('id', item.payload.id);
      if (error) throw error;
      return;
    }
    if (item.op === 'deleteTransaction') {
      const { error } = await sb.from('pos_transactions').delete().eq('id', item.payload);
      if (error) throw error;
      return;
    }
    if (item.op === 'closeShift') {
      await DataStore._commitCloseShift(item.payload);
      return;
    }
    if (item.op === 'saveSetting') {
      const { error } = await sb.from('pos_settings').upsert({
        key: item.payload.key,
        value: item.payload.value,
      });
      if (error) throw error;
      return;
    }
    const unknown = new Error('unknown op ' + item.op);
    unknown.permanent = true;
    throw unknown;
  },

  async flush() {
    if (this._flushing) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

    this._flushing = true;
    this._fire();
    try {
      let q = this.load();
      while (q.length > 0) {
        const item = q[0];
        let drop = false;
        try {
          await this._run(item);
          this._blocked = null;
        } catch (e) {
          if (isNetworkError(e)) break;
          if (item.op === 'closeShift') {
            this._blocked = e;
            console.error('[OfflineQueue] shift close failed, keeping it queued:', e);
            break;
          }
          console.error('[OfflineQueue] permanent error, dropping item:', e, item);
          drop = true;
        }
        if (this._blocked && !drop) break;
        q.shift();
        this._persist(q);
        this._fire();
      }
    } finally {
      this._flushing = false;
      this._fire();
    }
  },

  on(cb) { this._listeners.push(cb); },
  _fire() {
    const state = {
      size: this.size(),
      flushing: this._flushing,
      online: typeof navigator === 'undefined' || navigator.onLine !== false,
      blocked: !!this._blocked,
    };
    this._listeners.forEach(cb => {
      try { cb(state); }
      catch (e) { console.error('[OfflineQueue] listener error:', e); }
    });
  },
};

if (typeof window !== 'undefined') {
  window.addEventListener('online',  () => OfflineQueue.flush());
  window.addEventListener('offline', () => OfflineQueue._fire());
}

window.DataStore           = DataStore;
window.SupabaseConfig      = SupabaseConfig;
window.getSupabase         = getSupabase;
window.getResetAuth        = getResetAuth;
window.Storage             = Storage;
window.AuthStorage         = AuthStorage;
window.OfflineQueue        = OfflineQueue;
window.isNetworkError      = isNetworkError;
