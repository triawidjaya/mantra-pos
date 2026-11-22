# Mantra POS — Handbook (English)

Cashbook for **one counter: Mantra Lombok**. The app is always online to its cloud database. There is no local mode and no second business to set up.

## What it is

A browser cashbook for scooter rentals. Staff record money in and money out, run a shift, and look back at closed shifts. It is not a stock system, it does not print receipts, and it does not calculate tax.

Two roles:

| Role | Can do |
|------|--------|
| Admin | Settings, users, edit and delete transactions, delete shift history, close a shift, export |
| Cashier | Record and edit transactions, close a shift, export |

## First time on a device

1. Open the app and enter the access code. That code only unlocks this browser. It does not reset a PIN.
2. Paste the publishable key for the Mantra Lombok project. The project address is already set. One key, one counter.
3. If the counter has not been set up, enter the brand name, the admin name, the **admin email**, and a 4–6 digit PIN.

Scooter-rental categories are created for you. Add other staff later in Manage Users.

## A shift

1. **Start shift.** Pick who is on duty, enter the cash in the till, and enter that person's PIN (an admin can use their own PIN).
2. **Record** income and outgoing as they happen. Rental, TarikTunai, and PETTY-CASH each have their own button and write the paired rows together.
3. **Close shift** (once, at month end, on the last day or in the first days of the next month). Pick the **period end date** (today by default); rows dated after it stay in the next shift. Enter the counted cash. Card, Transfer, and QRIS are **not typed**: the dialog shows what the bank should pay (after fees), what has already arrived, and what is **waiting for bank**, all read from Report > Bank. Fill the bank amounts there as the money arrives; the closed shift shows a banner until every day is filled. If the cash, or a day already filled in the Bank tab, does not match, a note is required. Confirming close saves the shift and removes the closed rows from the open list.

The counter runs **one shift for the whole month**, from the start of the books to the end of the month (28, 29, 30 or 31 days). There is no daily open and close. Close the shift once, at month end.

The screen and the database stay on the same answer about whether the shift is open. If the connection drops during close, the shift stays closed on this screen and the close is sent again when the connection returns.

## TarikTunai and PETTY-CASH

**TarikTunai (guest cash-out).** The guest pays on the EDC (amount + 3% for Card) and the counter hands over cash from the cashbox. Enter the **amount handed to the guest**, not the amount on the EDC. The app writes two rows: Card (or QRIS) in and Cash out. It is not a sale. The money reaches the bank the next day.

**PETTY-CASH (cash from the bank).** Use it when cash is taken from the bank into the cashbox. The app writes Card out and Cash in together. The **Note** is optional; write what the cash is for. Do not record this as a plain income: the bank side would be missing and the bank balance would be wrong.

## Transactions on the open shift

Open the filter with the funnel icon. Fields, in order: **Search**, Type, Category, Method, From date, To date. The search box matches description, category, staff, method, and note (including guest name and plate on a rental). Search and dates apply as you type or pick. Use **Reset** to clear everything. The list shows **25 rows per page**.

Dates use the day shown in the table. To correct something, filter to that day, find the row, and use its edit button.

## Users and PIN

Admins must have an email. Cashiers can have an email; if they do not, an admin sets or changes their PIN in Manage Users.

**Forgot PIN**

1. On the sign-in screen, choose Forgot PIN and pick the person.
2. If they have an email, the app sends a reset link to **that address** (Supabase Auth email). Open the link, or type the code from the same email, then choose a new PIN.
3. If a cashier has no email, an admin sets the PIN. There is no shared reset code.

## Report

The chart icon opens Report. Pick a period at the top (All, Today, This Week, This Month, **Last Month**, or Custom). It applies to all three tabs.

**Summary** (opens first)
- The daily chart with income, outgoing, commission and ending balance. Download Excel is here.
- **Summary by category:** number of transactions, income, outgoing and net for each category.
- **Not counted as revenue:** START BALANCE, TarikTunai and PETTY-CASH. They move cash but are not sales or costs.
- **Movement by method** and a **daily summary** with totals.
- Tap a category or a day to open the main list already filtered to it.

**Bank** (reconciliation of Card, QRIS and Transfer)
- Card, QRIS and Transfer are paid into the bank after the EDC settlement, usually **the next day**. Each row is one **transaction day**.
- **Expected after fees** is what the bank should pay for that day: Card + 3% fee charged to the renter, minus the bank's cut (1.8%); QRIS minus the bank's cut (0.7%); Transfer as is. The rates are shown above the table and an admin can change them.
- An **admin** types **Received in bank** for each day, from the bank statement. The row shows the **Difference**, with a green tick when it matches.
- If a settlement was forgotten and two days arrive together, type the total on one of the days. The **Cumulative** column stays correct. Negative means money has not arrived yet.
- **Taken from bank** (PETTY-CASH) is shown for information. It is a same-day withdrawal and is not part of the difference.

**Shifts**
- The **last 50 closed shifts**. Older shifts are dropped. Search by staff, note, plate, or description, and move through **10 shifts per page**. Admins delete a shift only after entering their PIN.

## Language and dates

The EN/ID button switches the whole app, including dates and times in the lists and in Excel exports.

## Offline

While the browser is offline, a new transaction, an edit, a delete, and a shift close are kept on this device and sent when the connection returns. A banner shows how many changes are waiting. Next to the counter name a small label shows the connection: green **Online**, red **Offline** (with the number waiting), amber **Syncing** while queued changes are sent, amber **Reconnecting** when the internet is up but the live link to the database is not. On a phone only the coloured dot shows; tap or hover for the explanation.

## Export

Export Excel on the open shift, export one closed shift from Report, or download the Summary and Bank tables from their tabs. Closing a shift also downloads a CSV of that shift.
