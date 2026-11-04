# Supabase — Mantra Lombok

One shop, one project, always cloud. The app talks only to the Mantra Lombok project (`https://ohcnosdjgkkctripdzlj.supabase.co`). Do not create a second project and do not point this app at another shop.

The browser stores the publishable key once per device. That key can read and write every row, so it is not committed.

## Six tables

| Table | Holds |
|-------|--------|
| `pos_users` | Admin and cashier. PIN hash, role, email. |
| `pos_categories` | Category names, including the locked `START BALANCE`. |
| `pos_transactions` | Rows for the **open** shift only. |
| `pos_shifts` | Closed shifts. The client keeps the **latest 50** and deletes the rest. |
| `pos_settings` | Brand, language, whether a shift is open, category flags, logo. |
| `pos_session` | Old single-row table. Sign-in is stored on each device, not in this row. |

Roles are only `admin` and `cashier`.

## Existing project — add email

Run this once in the SQL editor. User rows already exist; this adds the address used for PIN reset.

```sql
ALTER TABLE pos_users ADD COLUMN IF NOT EXISTS email TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS pos_users_email_lower_idx
  ON pos_users (lower(email))
  WHERE email IS NOT NULL AND email <> '';
```

Until this column exists, saving a user with an email fails. Admins need an email before Forgot PIN can reach them. Add it in Manage Users while the admin still knows the PIN.

## PIN reset email

Forgot PIN calls Supabase Auth `signInWithOtp` and sends the message to **that user's own email**. The link uses the implicit flow so it can be opened in a new tab. The same email's code can be typed on the reset screen. There is no shared reset code.

In Authentication → URL configuration, allow the addresses the shop actually opens, including:

- `https://triawidjaya.github.io/mantra-pos/`
- `https://triawidjaya.github.io/mantra-pos/index.html`
- `http://localhost:8080/` if you try the app on this machine

The Email provider must be on. The app does not have its own mail sender. If Auth refuses the redirect, the screen shows that error and does not fall back to a shared code.

## Offline queue

New transactions, edits, deletes, and shift close are kept in `mantra:pos_offline_queue` when the network fails, then sent in order when the browser is online again or the realtime channel reconnects.

Shift close is one queued step: insert the shift, delete only that shift's transaction ids, set `shift_active` to false. A retry that finds the shift already inserted does not create a second row. The close stays in the queue if the server rejects it. The screen stays closed until that write lands, including after a reload once the app can read the database again.

## Fresh schema

Only for an empty database. Do not run this against the live Mantra Lombok project.

```sql
CREATE TABLE pos_users (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  username    TEXT        UNIQUE NOT NULL,
  pin_hash    TEXT,
  role        TEXT        NOT NULL CHECK (role IN ('admin','cashier')),
  email       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX pos_users_email_lower_idx
  ON pos_users (lower(email))
  WHERE email IS NOT NULL AND email <> '';

CREATE TABLE pos_categories (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        UNIQUE NOT NULL,
  sort_order  INT         NOT NULL DEFAULT 0,
  is_system   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pos_transactions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  jenis           TEXT        NOT NULL CHECK (jenis IN ('INCOME','OUTGOING')),
  kategori        TEXT        NOT NULL,
  deskripsi       TEXT        NOT NULL,
  jumlah          NUMERIC     NOT NULL,
  metode          TEXT        NOT NULL CHECK (metode IN ('Cash','Card','Transfer','Qris')),
  keterangan      TEXT,
  staff           TEXT        NOT NULL,
  tanggal_waktu   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pos_shifts (
  id              TEXT        PRIMARY KEY,
  started_at      TIMESTAMPTZ,
  closed_at       TIMESTAMPTZ NOT NULL,
  staff           JSONB       NOT NULL,
  summary         JSONB       NOT NULL,
  transactions    JSONB       NOT NULL
);

CREATE TABLE pos_settings (
  key     TEXT  PRIMARY KEY,
  value   JSONB
);

CREATE TABLE pos_session (
  id           INT         PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  user_id      UUID        REFERENCES pos_users(id) ON DELETE SET NULL,
  login_at     TIMESTAMPTZ
);

INSERT INTO pos_categories (name, sort_order, is_system) VALUES
  ('START BALANCE', 0, TRUE),
  ('RENTAL PAYMENT', 1, FALSE),
  ('TRANSPORT SERVICES', 2, FALSE),
  ('FEE', 3, FALSE),
  ('PAY TO OWNER', 4, FALSE),
  ('PAY TO DRIVER', 5, FALSE),
  ('Oprasional', 6, FALSE),
  ('CashBon', 7, FALSE),
  ('TarikTunai', 8, FALSE),
  ('PETTY-CASH', 9, FALSE);

INSERT INTO pos_settings (key, value) VALUES
  ('brand', '"My Business"'::jsonb),
  ('lang', '"en"'::jsonb),
  ('shift_active', 'false'::jsonb);

INSERT INTO pos_session (id) VALUES (1);

ALTER TABLE pos_users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_shifts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_session      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon full access" ON pos_users        FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon full access" ON pos_categories   FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon full access" ON pos_transactions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon full access" ON pos_shifts       FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon full access" ON pos_settings     FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon full access" ON pos_session      FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE pos_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE pos_session;
ALTER PUBLICATION supabase_realtime ADD TABLE pos_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE pos_users;
ALTER PUBLICATION supabase_realtime ADD TABLE pos_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE pos_shifts;
```

On close, the client deletes shifts beyond the newest 50. Report never shows more than those 50.
