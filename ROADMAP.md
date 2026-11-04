# Mantra POS — Roadmap

This is the cashbook for **Mantra Lombok**, one scooter-rental shop. It runs in the browser, always against one Supabase project. It is not a product for many businesses, and it is not a stock or receipt register.

## In place

- One shop, always cloud. Six tables: `pos_users`, `pos_categories`, `pos_transactions`, `pos_shifts`, `pos_settings`, `pos_session`.
- Two roles: admin and cashier.
- Shift open and close, rental, TarikTunai, PETTY-CASH, and ordinary in/out.
- Report of the **last 50 closed shifts**, with date filter, text search, and 10 shifts per page.
- Open-shift list: text search and 25 rows per page.
- Offline queue for a new transaction, an edit, a delete, and a shift close. The screen and the database agree on whether the shift is open once the queue has flushed.
- PIN reset by email to that person's own address. A cashier with no email is reset by an admin. The browser access code only unlocks a new browser.

## Not this product

Stock, printed receipts, and tax are not half-built features. They are a different product. If they are needed later, a simple rental receipt comes first, tax only if there is an obligation, and motorcycle stock last because a plate, an owner, and a share are not item stock.

## Left alone on purpose

- The 50-shift cap stays. Older shifts are not loaded. The handbook says so.
- The browser access code stays. It is not a way to change a PIN.
