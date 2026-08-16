# How to Start — AI Salon Pro / Urban Nail Bar

**This folder:** `AI SALON PRO/URBAN NAIL BAR/`  
Same folder works on Mac and Windows — pick the launcher for your OS.

Supports:

- **macOS Sierra 10.12.6**
- **macOS High Sierra 10.13.x**
- **macOS Big Sur 11.7.10** (and newer 11.x)
- **Windows 10 / Windows 11**

---

## Before you start (once)

### Big Sur 11.7.10 (or newer)

1. Install **Node.js 18 LTS**  
   - https://nodejs.org/dist/latest-v18.x/  
   - or: `brew install node@18`
2. Confirm: open Terminal → `node -v`

### High Sierra 10.13.x

1. Install **Node.js 14.21.3** (or Node 16)  
   - https://nodejs.org/download/release/v14.21.3/  
   - file: `node-v14.21.3.pkg`
2. Confirm: `node -v`

### Sierra 10.12.6

1. Install **Node.js 14.21.3 only** (newer Node will not work on Sierra)  
   - https://nodejs.org/download/release/v14.21.3/  
   - file: `node-v14.21.3.pkg`
2. Confirm: `node -v` shows `v14.21.3`

### Windows 10 / 11

1. Install **Node.js 18 LTS** (or newer) from https://nodejs.org  
2. Confirm in Command Prompt: `node -v`

### First time on Mac — allow the launcher

In Terminal:

```bash
cd "/path/to/AI SALON PRO/URBAN NAIL BAR/scripts"
chmod +x EVERYTHING-MACOS-*.command START-ALL-MACOS-*.command SYNC-BOTH-FOLDERS.command
```

If macOS blocks the file: **right-click** → **Open** → **Open**.

---

## Daily start

### Big Sur 11.7.10+

Double-click:

`scripts/EVERYTHING-MACOS-BIG-SUR-11.7.10.command`

(alias: `scripts/START-ALL-MACOS-BIG-SUR.command`)

### High Sierra 10.13

Double-click:

`scripts/EVERYTHING-MACOS-HIGH-SIERRA-10.13.command`

(alias: `scripts/START-ALL-MACOS-HIGH-SIERRA.command`)

### Sierra 10.12.6

Double-click:

`scripts/EVERYTHING-MACOS-SIERRA-10.12.6.command`

(alias: `scripts/START-ALL-MACOS-SIERRA.command`)

### Windows 10 / 11

Double-click:

`scripts/EVERYTHING-WINDOWS-11.bat`

(or `scripts/START-SALON.bat` / `scripts/EVERYTHING-WINDOWS.bat`)

Then:

1. Leave the **Terminal** server window open (**do not close it**)  
2. Browsers open:
   - **Staff Home:** http://localhost:3001/index.html  
   - **Public booking:** http://localhost:3002/
3. Optional free public tunnel: Tailscale Funnel or Pinggy (temp)

That is enough for local staff use + booking on this computer.

---

## Go online for customers

| Option | How |
|---|---|
| Temp public URL | EVERYTHING tries Tailscale Funnel (Big Sur/Windows) or Pinggy (~60 min) |
| Permanent domain `urban-nail-bar.work.gd` | Best on **Windows** with Caddy + router ports 80/443 |

Recommended for the salon: keep one **Windows 11 PC** as the always-on server + permanent domain.  
Other Macs/PCs open that server’s staff/booking URL.

---

## Useful URLs

| Who | URL |
|---|---|
| Staff / Scheduler / Admin | http://localhost:3001/index.html |
| Customers on this Mac | http://localhost:3002/ |
| Customers anywhere (permanent) | https://urban-nail-bar.work.gd/booking.html |

---

## After first start — before real customers

1. Open **Admin** → **Security**  
2. Change every default PIN (`docs/07-ROLES-AND-PINS.md`)  
3. Book a test appointment on port **3002** and confirm it on **Scheduler**  
4. Optional health check in Terminal:

```bash
cd "/path/to/AI SALON PRO/URBAN NAIL BAR"
node validate.js
```

---

## Keep copies in sync

If you keep this folder on more than one computer:

1. Run `scripts/SYNC-BOTH-FOLDERS.command` (or on Windows: `SYNC-BOTH-FOLDERS.bat`)  
2. Pick the direction so the newer/edited copy overwrites the other  

**Live salon data rule:** only **one** computer should run the Node server.  
Other Macs/PCs/phones open that server’s URL.  
Do **not** start EVERYTHING on two machines at the same time unless you intend two separate databases.

---

## Common start problems

| Problem | Fix |
|---|---|
| Double-click does nothing | `chmod +x` the `.command` file (see above) |
| “can’t be opened” | Right-click → Open |
| Wrong Node on Sierra / High Sierra | Sierra: Node **14.21.3** only · High Sierra: Node **14 or 16** |
| Browser blank / old page | Hard refresh: Cmd+Shift+R |
| Port in use | Quit old Terminal server windows |
| AI / Voice silent | Use Chrome; allow mic; stay on localhost or HTTPS |

More help: `docs/10-TROUBLESHOOTING.md`

---

## Next

**How to use the system day-to-day → [`HOW-TO-USE.md`](HOW-TO-USE.md)**  
Full manual index → [`docs/README.md`](docs/README.md)
