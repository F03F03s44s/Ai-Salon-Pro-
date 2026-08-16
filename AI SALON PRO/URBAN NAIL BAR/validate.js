/**
 * AI Salon Pro - Full System Validator
 * =====================================
 * Double-click VALIDATE.bat (or run: node validate.js) to check the whole system:
 *   1. Syntax of every shared script and every page's inline JavaScript
 *   2. Every button/handler (onclick, onchange, ...) resolves to a defined function
 *   3. Every getElementById target exists (known-safe legacy refs are suppressed)
 *   4. Commission split math: closeout vs payroll vs tax summary must agree
 *   5. Demo day engine loads and removes cleanly without touching real data
 *
 * Exit code 0 = all green, 1 = something needs attention.
 */

const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const PAGES_DIR = path.join(ROOT, 'pages');
const SHARED_DIR = path.join(ROOT, 'shared');

const SHARED_FILES = ['data-manager.js', 'utils.js', 'auth.js', 'site-content.js', 'app-nav.js'];
const PAGE_FILES = ['admin.html', 'manager.html', 'scheduler.html', 'staff.html',
    'booking.html', 'public-booking.html', 'my-schedule.html', 'website.html', '../index.html'];

// getElementById references verified as guarded legacy code in the Scheduler
// (notification tabs, optional settings inputs, calendar stats from older layouts)
const KNOWN_SAFE_IDS = new Set([
    'statLate', 'statQueued', 'statWaiting', 'statCheckout', 'statComplete',
    'calStatTotal', 'calStatLate', 'calStatQueued', 'calStatUpNext', 'calStatCheckout', 'calStatComplete',
    'addServicesListModal', 'checkoutServicesListModal', 'settingManagerPin', 'settingCommission',
    'clientServicesSectionModal', 'clientServicesListModal', 'checkoutTipInput',
    'staffNotifTab', 'clientNotifTab', 'staffNotifs', 'clientNotifs',
    'headerNotifClientTab', 'headerNotifStaffTab', 'headerClientNotifsList', 'headerStaffNotifsList', 'headerNotifDropdown',
    'sidebarNotifStaffTab', 'sidebarNotifClientTab', 'sidebarStaffNotifs', 'sidebarClientNotifs',
    'sidebarNotifBadge', 'sidebarStaffNotifCount', 'sidebarClientNotifCount',
    'staffList', 'liveTimeLine', 'aiChatToggle',
    // scheduler: admin lock UI removed; refs still null-checked
    'adminUnlockBtn', 'adminLockBtn',
    // scheduler: guarded stat-box refs from older layouts (if (statTotal) / if (dd))
    'statTotal', 'allApptsDropdown',
    // public-booking: guarded fallback chain (qbName || qbNotes), element renamed in redesign
    'qbName',
    // scheduler: header staff filter select is optional (if (!sel) return)
    'headerStaffFilter',
    // scheduler: role UI is checkbox group (staffRoles / modalStaffRoles); legacy select ids retired
    'staffRole', 'modalStaffRole'
]);

const KNOWN_GLOBALS = new Set(['alert', 'confirm', 'prompt', 'setTimeout', 'setInterval', 'clearInterval', 'clearTimeout',
    'parseInt', 'parseFloat', 'isNaN', 'Number', 'String', 'Date', 'Math', 'JSON', 'Object', 'Array',
    'encodeURIComponent', 'open', 'print', 'fetch', 'event', 'if', 'void']);

let pass = 0, fail = 0;
const ok = msg => { pass++; console.log('  ✓ ' + msg); };
const bad = msg => { fail++; console.log('  ✗ ' + msg); };

function extractScripts(html) {
    const out = [];
    const re = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
    let m;
    while ((m = re.exec(html)) !== null) out.push(m[1]);
    return out;
}

console.log('\n========================================');
console.log('  AI SALON PRO - SYSTEM VALIDATION');
console.log('========================================\n[1/5] Shared script syntax');

const sharedFns = new Set();
for (const sf of SHARED_FILES) {
    const p = path.join(SHARED_DIR, sf);
    if (!fs.existsSync(p)) { bad(`${sf}: MISSING`); continue; }
    const code = fs.readFileSync(p, 'utf8');
    try { new Function(code); ok(`${sf}`); }
    catch (e) { bad(`${sf}: ${e.message}`); }
    for (const m of code.matchAll(/function\s+([a-zA-Z_$][\w$]*)\s*\(/g)) sharedFns.add(m[1]);
}

console.log('\n[2/5] Page script syntax');
const pageData = {};
for (const page of PAGE_FILES) {
    const file = path.join(PAGES_DIR, page);
    if (!fs.existsSync(file)) { bad(`${page}: NOT FOUND`); continue; }
    const html = fs.readFileSync(file, 'utf8');
    const scripts = extractScripts(html);
    pageData[page] = { html, code: scripts.join('\n') };
    let pageOk = true;
    scripts.forEach((code, i) => {
        try { new Function(code); }
        catch (e) { bad(`${page} script#${i}: ${e.message}`); pageOk = false; }
    });
    if (pageOk) ok(`${page} (${scripts.length} block(s))`);
}

console.log('\n[3/5] Button & event handlers');
for (const page of Object.keys(pageData)) {
    const { html, code } = pageData[page];
    const defined = new Set(sharedFns);
    for (const mm of code.matchAll(/function\s+([a-zA-Z_$][\w$]*)\s*\(/g)) defined.add(mm[1]);
    for (const mm of code.matchAll(/(?:const|let|var)\s+([a-zA-Z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[a-zA-Z_$][\w$]*)\s*=>/g)) defined.add(mm[1]);
    const missing = new Set();
    const collect = re => {
        for (const mm of (page === '__code__' ? [] : html.matchAll(re))) {
            if (!defined.has(mm[1]) && !KNOWN_GLOBALS.has(mm[1])) missing.add(mm[1]);
        }
    };
    collect(/on(?:click|change|input|keypress|keydown|keyup|submit|mouseenter|mouseleave|mouseover|mouseout)=["']\s*(?:return\s+)?([a-zA-Z_$][\w$]*)\s*\(/g);
    for (const mm of code.matchAll(/on(?:click|change|input)=\\?["']\s*(?:return\s+)?([a-zA-Z_$][\w$]*)\s*\(/g)) {
        if (!defined.has(mm[1]) && !KNOWN_GLOBALS.has(mm[1])) missing.add(mm[1]);
    }
    for (const mm of code.matchAll(/onclick=&#39;\s*([a-zA-Z_$][\w$]*)\s*\(/g)) {
        if (!defined.has(mm[1]) && !KNOWN_GLOBALS.has(mm[1])) missing.add(mm[1]);
    }
    if (missing.size) bad(`${page}: missing handlers -> ${[...missing].join(', ')}`);
    else ok(`${page}`);
}

console.log('\n[4/5] Element ID references');
for (const page of Object.keys(pageData)) {
    const { html, code } = pageData[page];
    const ids = new Set();
    for (const mm of html.matchAll(/id="([^"]+)"/g)) ids.add(mm[1]);
    for (const mm of code.matchAll(/id=\\?["']([a-zA-Z][\w-]*)\\?["']/g)) ids.add(mm[1]);
    for (const mm of code.matchAll(/\.id\s*=\s*['"]([\w-]+)['"]/g)) ids.add(mm[1]);
    const missing = new Set();
    for (const mm of code.matchAll(/getElementById\(\s*['"]([\w-]+)['"]\s*\)/g)) {
        if (!ids.has(mm[1]) && !KNOWN_SAFE_IDS.has(mm[1])) missing.add(mm[1]);
    }
    if (missing.size) bad(`${page}: unresolved getElementById -> ${[...missing].join(', ')}`);
    else ok(`${page}`);
}

console.log('\n[5/5] Commission split math + demo engine');
(function () {
    const ls = {};
    const localStorage = { getItem: k => ls[k] ?? null, setItem: (k, v) => { ls[k] = String(v); }, removeItem: k => { delete ls[k]; } };
    const window = {};
    const confirm = () => true;
    try {
        const code = fs.readFileSync(path.join(SHARED_DIR, 'data-manager.js'), 'utf8')
            .replace('this.pullFromServer();', '')
            .replace('this.watchStorage();', '');
        eval(code);
        const DM = window.DataManager;
        DM.stopSync();
        const today = new Date().toISOString().split('T')[0];
        DM.data.staff = [
            { id: 1, name: 'Lisa Park', role: 'nail tech', commission: 50, status: 'active' },
            { id: 2, name: 'Mike Chen', role: 'nail tech', commission: 60, status: 'active' }
        ];
        DM.data.appointments = [
            { id: 1, clientId: null, clientName: 'Amy', staffId: 1, date: today, time: '10:00', price: 85, status: 'complete',
              services: [{ name: 'Gel Manicure', price: 35, staffId: 1, staffName: 'Lisa Park' },
                         { name: 'Spa Pedicure', price: 50, staffId: 2, staffName: 'Mike Chen' }],
              splits: [{ staffId: 1, staffName: 'Lisa Park', amount: 35 }, { staffId: 2, staffName: 'Mike Chen', amount: 50 }] },
            { id: 2, clientId: null, clientName: 'Bob', staffId: 2, date: today, time: '11:00', price: 40, status: 'complete', serviceId: 1 }
        ];
        const near = (a, b) => Math.abs(a - b) < 0.005;
        const bd = DM.getStaffBreakdownForDate(today);
        const run = DM.getPayrollRun(today, today);
        const tax = DM.getStaffTaxSummary(2026);
        near(bd.find(b => b.name === 'Lisa Park').estimatedPay, 17.5) ? ok('closeout split (Lisa $35 -> $17.50)') : bad('closeout split mismatch');
        near(bd.find(b => b.name === 'Mike Chen').estimatedPay, 54) ? ok('closeout split (Mike $90 -> $54.00)') : bad('closeout split mismatch');
        near(run.totalGross, 125) && near(run.totalPay, 71.5) && near(run.totalSalonCut, 53.5)
            ? ok('payroll matches closeout ($125 = $71.50 + $53.50)') : bad('payroll mismatch');
        near(tax.find(t => t.name === 'Mike Chen').grossSales, 90) ? ok('tax summary matches payroll') : bad('tax summary mismatch');

        const before = DM.data.appointments.length;
        DM.loadDemoDay();
        const loaded = DM.data.appointments.length === before + 6;
        DM.removeDemoData();
        const removed = DM.data.appointments.length === before && DM.data.reviews.length === 0;
        loaded && removed ? ok('demo day loads + removes cleanly') : bad('demo engine mismatch');
    } catch (e) {
        bad('split math test crashed: ' + e.message);
    }
})();

console.log('\n[6/6] Critical assets & launch tools');
const ASSET_CHECKS = [
    ['assets/pwa/icon-192.png', 'PWA icon (my-schedule)'],
    ['assets/pwa/booking-icon-192.png', 'PWA icon (booking)'],
    ['assets/gallery/nail-1.jpg', 'Gallery photo 1'],
    ['assets/gallery/thumbs/nail-1.jpg', 'Gallery thumb 1'],
    ['assets/brand/logo.png', 'Brand logo'],
    ['assets/brand/hero-1.png', 'Brand hero image'],
    ['assets/gallery/brand/logo.png', 'Public brand logo (gallery mirror)'],
    ['server/caddy.exe', 'Caddy (permanent domain HTTPS)'],
    ['server/Caddyfile', 'Caddy reverse-proxy config'],
    ['server/dnsexit.env.example', 'DNS Exit env example'],
    ['marketing/ig-booking-post.png', 'Instagram booking post'],
    ['print/booking-qr-sign.pdf', 'Counter QR sign PDF'],
    ['DEMO-SCRIPT.md', 'Demo presentation script'],
    ['DEMO-CHEAT-SHEET.pdf', 'Demo cheat sheet PDF']
];
for (const [rel, label] of ASSET_CHECKS) {
    fs.existsSync(path.join(ROOT, rel)) ? ok(label) : bad(`${label} missing (${rel})`);
}

console.log('\n========================================');
if (fail === 0) {
    console.log(`  ALL GREEN - ${pass} checks passed. System is healthy.`);
} else {
    console.log(`  ${fail} ISSUE(S) FOUND (${pass} passed). Review the ✗ lines above.`);
}
console.log('========================================\n');
process.exit(fail === 0 ? 0 : 1);
