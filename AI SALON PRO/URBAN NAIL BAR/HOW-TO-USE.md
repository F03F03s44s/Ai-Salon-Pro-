# How to Use — Urban Nail Bar

Start the system first → [`HOW-TO-START.md`](HOW-TO-START.md)  
Then open **Staff Home:** http://localhost:3001/index.html

---

## Who uses what

| Role | PIN login on Home | Main page |
|---|---|---|
| Front desk / receptionist | Staff / Front Desk PIN | **Scheduler** + **Alert** |
| Manager | Manager PIN | **Manager** + **Scheduler** |
| Owner / admin | Admin PIN | **Admin** + everything |
| Technician | Tech PIN | **My Schedule** (not full Scheduler) |
| Customer (online) | Phone number only (no PIN) | Public booking URL |

**Change default PINs before go-live** → Admin → Security · details in `docs/07-ROLES-AND-PINS.md`

---

## Morning open

1. Start with the correct EVERYTHING launcher for your macOS version  
2. Confirm Home (3001) and booking (3002) open  
3. Leave the Terminal server window open  
4. Log in on Home with your PIN  
5. Front desk: open **Scheduler** · Techs: open **My Schedule**

---

## Front desk (Scheduler)

Typical day flow:

1. Check today’s board, waitlist, and checkout counts  
2. **New Appt** for booked clients · **Walk-In** for walk-ups  
3. Move clients through the day (arrived / in service / done)  
4. **Checkout** when finished:
   - Assign **each service** to the correct technician (needed for commission)  
   - Take payment  
5. Use **Messages** / notifications for alerts  
6. Optional: gold **✨ UNB AI ASSISTANT** to book / cancel / reschedule (confirm with yes/no)

Clients database, staff list, CSV import/export, and filters are on Scheduler’s **Clients** / **Staff** sections.

---

## Technician (My Schedule)

1. From Home, open **My Schedule**  
2. **Clock In** at start of shift  
3. View your appointments; request time off if needed  
4. **Clock Out** at end of day  

Technicians do **not** use the full multi-staff Scheduler board.

---

## Manager

1. Open **Manager**  
2. Dashboard — today’s numbers (click cards for details)  
3. Duty / leave status, inventory, reports  
4. End of day → **Closeout**
   - Cash + card must match expected  
   - Mismatch blocks submit unless **Admin PIN** overrides (audited)

---

## Admin / owner

1. **Admin → Security** — change master + staff PINs  
2. Staff / clients — hire, edit, deactivate  
3. Payroll / tax tools  
4. **Data** — Backup Now, export/import, demo load/clear  
5. Settings — salon name, hours, feature flags  

Run **Backup Now** before big changes or demos.

---

## Customer online booking

Share **only** the public booking link:

- Local: http://localhost:3002/  
- Permanent: https://urban-nail-bar.work.gd/booking.html  
- Or your Tailscale / Pinggy temp URL  

Customer steps:

1. Enter **phone**  
2. Check **SMS consent**  
3. New clients enter name  
4. Pick service → date → tech/time → confirm  

Do **not** share Scheduler or Admin links with customers.

---

## Website & marketing

- **Website** page (port 3001) — gallery, services, contact, Book Now  
- Marketing kit: `marketing/online-booking-kit.md`  
- Counter QR sign PDF: `print/booking-qr-sign.pdf`

---

## AI assistant (✨)

Available on Website, Booking, Scheduler, and more.

- Tap the gold **✨** button  
- Type a question, or tap **Voice** (allow mic in Chrome)  
- On Scheduler, try: `Book [Client] with [Tech] at 2pm for [Service]` → reply **yes**

More: `docs/09-AI-ASSISTANT.md`

---

## End of day

1. Finish all checkouts  
2. Manager **Closeout** (match the register)  
3. Optional Admin backup  
4. Close Terminal server / tunnel windows — **or** leave them open overnight if you want remote booking 24/7  

---

## Multi-computer tip

- **One** computer runs the server (usually the Windows PC with the permanent domain)  
- Other Macs and phones open that computer’s staff/booking URL  
- After file updates, sync folders with `scripts/SYNC-BOTH-FOLDERS.command`  

---

## Quick troubleshooting

| Issue | What to do |
|---|---|
| Buttons do nothing / page looks wrong | Hard refresh (Cmd+Shift+R) |
| Data not sharing between devices | Use http:// not file:// · one server only |
| Health check | `node validate.js` in this folder |
| Full troubleshooting | `docs/10-TROUBLESHOOTING.md` |

---

## More detail (optional)

| Topic | Doc |
|---|---|
| Full operator manual | `docs/05-OPERATOR-MANUAL.md` |
| Every page & button | `docs/06-PAGES-AND-BUTTONS.md` |
| Roles & PINs | `docs/07-ROLES-AND-PINS.md` |
| Booking / public | `docs/08-BOOKING-AND-PUBLIC.md` |
| Manual index | `docs/README.md` |
