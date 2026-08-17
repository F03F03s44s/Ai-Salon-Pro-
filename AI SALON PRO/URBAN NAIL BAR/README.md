# Urban Nail Bar — AI Salon Pro

Folder layout:

```
AI SALON PRO/
  URBAN NAIL BAR/    ← you are here (all app files)
```

Works on **macOS Sierra**, **High Sierra**, **Big Sur**, and **Windows 10/11**.

---

## Start here

| Guide | Open this |
|---|---|
| **How to start** | [`HOW-TO-START.md`](HOW-TO-START.md) |
| **How to use** | [`HOW-TO-USE.md`](HOW-TO-USE.md) |
| Full manual | [`docs/README.md`](docs/README.md) |

## One-click launch

| Your computer | Double-click |
|---|---|
| macOS Big Sur 11.7.10+ | `scripts/EVERYTHING-MACOS-BIG-SUR-11.7.10.command` |
| macOS High Sierra 10.13 | `scripts/EVERYTHING-MACOS-HIGH-SIERRA-10.13.command` |
| macOS Sierra 10.12.6 | `scripts/EVERYTHING-MACOS-SIERRA-10.12.6.command` |
| Windows 10 / 11 | `scripts/EVERYTHING-WINDOWS-11.bat` (or `scripts/START-SALON.bat`) |

- Staff: http://localhost:3001/index.html  
- Booking: http://localhost:3002/

**Node versions:** Big Sur → Node **18** · High Sierra → Node **14 or 16** · Sierra → Node **14.21.3 only** · Windows → Node **18+**

---

## Notes

- Keep **one** computer as the live server (do not run two servers against different data stores).
- Permanent custom domain is easiest from **Windows** with Caddy (see `docs/GO-ONLINE-FREE.md`).
- Secrets (`server/.env`, `dnsexit.env`, live `data-store.json`) stay local and are gitignored.
