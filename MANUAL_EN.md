# Mantra POS — Handbook (English)

Cashbook for **one shop: Mantra Lombok**. The app is always online to its cloud database. There is no local mode and no second business to set up.

## What it is

A browser cashbook for scooter rentals. Staff record money in and money out, run a shift, and look back at closed shifts. It is not a stock system, it does not print receipts, and it does not calculate tax.

Two roles:

| Role | Can do |
|------|--------|
| Admin | Settings, users, edit and delete transactions, delete shift history, close a shift, export |
| Cashier | Record and edit transactions, close a shift, export |

## First time on a device

1. Open the app and enter the access code. That code only unlocks this browser. It does not reset a PIN.
2. Paste the publishable key for the Mantra Lombok project. The project address is already set. One key, one shop.
3. If the shop has not been set up, enter the brand name, the admin name, the **admin email**, and a 4–6 digit PIN.

Scooter-rental categories are created for you. Add other staff later in Manage Users.

## A shift

1. **Start shift.** Pick who is on duty, enter the cash in the till, and enter that person's PIN (an admin can use their own PIN).
2. **Record** income and outgoing as they happen. Rental, TarikTunai, and PETTY-CASH each have their own button and write the paired rows together.
3. **Close shift.** Enter the counted cash, card, transfer, and QRIS. If a count does not match, a note is required. Confirming close saves the shift and clears the open list.

The screen and the database stay on the same answer about whether the shift is open. If the connection drops during close, the shift stays closed on this screen and the close is sent again when the connection returns.

## Transactions on the open shift

Filter by type, category, and method. The search box matches description, category, staff, method, and note (including guest name and plate on a rental). The list shows **25 rows per page**.

## Users and PIN

Admins must have an email. Cashiers can have an email; if they do not, an admin sets or changes their PIN in Manage Users.

**Forgot PIN**

1. On the sign-in screen, choose Forgot PIN and pick the person.
2. If they have an email, the app sends a reset link to **that address** (Supabase Auth email). Open the link, or type the code from the same email, then choose a new PIN.
3. If a cashier has no email, an admin sets the PIN. There is no shared reset code.

## Report

The history icon opens Report. It shows the **last 50 closed shifts**. Older shifts are dropped. Filter by date, search by staff, note, plate, or description, and move through **10 shifts per page**. The chart follows the date range. Admins delete a shift only after entering their PIN.

## Offline

While the browser is offline, a new transaction, an edit, a delete, and a shift close are kept on this device and sent when the connection returns. A banner shows how many changes are waiting.

## Export

Export Excel on the open shift, or export one closed shift from Report. Closing a shift also downloads a CSV of that shift.
