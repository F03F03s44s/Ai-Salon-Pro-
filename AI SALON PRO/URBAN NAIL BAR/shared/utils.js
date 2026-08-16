/**
 * AI Salon Pro - Shared Utilities
 * Common functions used across all 6 pages
 */

// ===== STAFF ROLES (technician / manager / admin / receptionist) =====
// Staff may hold multiple roles via staff.roles[]; staff.role is the primary.
const STAFF_ROLE_LABELS = {
    technician: 'Technician',
    manager: 'Manager',
    admin: 'Admin',
    receptionist: 'Receptionist'
};

// ===== SERVICE MENU CATEGORIES (shared order across every page) =====
// Order matches live Mango online booking categories
const SERVICE_CATEGORY_ORDER = [
    'Nail Enhancements',
    'Dip Powder',
    'Manicure',
    'Pedicure',
    'Waxing',
    'Lashes',
    'Fix & Removal',
    'Kid Menu'
];

// Categories shown on Edit Staff → Staff's Services (same order as menu catalog)
const STAFF_SERVICE_CATEGORY_ORDER = [
    'Nail Enhancements',
    'Dip Powder',
    'Manicure',
    'Pedicure',
    'Waxing',
    'Lashes',
    'Fix & Removal',
    'Kid Menu'
];

// Legacy combined staff pick — expand to Lashes + Fix & Removal (never a menu category)
const LEGACY_LASHES_FIX_COMBO = 'Lashes Fix and Removal';

const SERVICE_CATEGORY_ALIASES = {
    'Pedicures': 'Pedicure',
    'Fix & Removal Only': 'Fix & Removal',
    'Fix and Removal': 'Fix & Removal',
    'Kids': 'Kid Menu',
    'Kid': 'Kid Menu',
    'Acrylic': 'Nail Enhancements',
    'Acrylics': 'Nail Enhancements',
    'Gel-X': 'Nail Enhancements',
    'Gel X': 'Nail Enhancements',
    // Legacy combined staff skill → keep recognizable so getStaffServiceCategories can expand
    'Lashes Fix and removal': LEGACY_LASHES_FIX_COMBO,
    'Lashes / Fix & Removal': LEGACY_LASHES_FIX_COMBO,
    'Lash Fix and Removal': LEGACY_LASHES_FIX_COMBO,
    'Add Ons': 'Add-ons',
    'Addons': 'Add-ons',
    'Add-On': 'Add-ons',
    'Add-Ons': 'Add-ons'
};

// ===== FORMATTING UTILITIES =====

const Utils = {
    // Normalize category labels so "Pedicures" / "Fix & Removal Only" match the menu
    normalizeCategory(cat) {
        const c = String(cat || 'Other').trim();
        return SERVICE_CATEGORY_ALIASES[c] || c;
    },

    // Menu tab category — real parent category (add-ons nest under their section)
    displayCategory(s) {
        if (!s) return 'Other';
        return this.normalizeCategory(s.category);
    },

    // Ordered unique categories from a services list (unknown cats go last)
    serviceCategories(services) {
        const hidden = new Set(['Add-ons', 'Combos']);
        const present = new Set(
            (services || []).map(s => this.displayCategory(s)).filter(c => !hidden.has(c))
        );
        const ordered = SERVICE_CATEGORY_ORDER.filter(c => present.has(c));
        const extras = [...present].filter(c => !SERVICE_CATEGORY_ORDER.includes(c)).sort();
        return ordered.concat(extras);
    },

    // Group services by category in display order
    // opts.includeHidden — keep Add-ons / Combos groups (useful for search results)
    groupServicesByCategory(services, opts) {
        const groups = {};
        (services || []).forEach(s => {
            const cat = this.displayCategory(s);
            (groups[cat] = groups[cat] || []).push(s);
        });
        const includeHidden = opts && opts.includeHidden;
        let cats = this.serviceCategories(services);
        if (includeHidden) {
            const extras = Object.keys(groups).filter(c => !cats.includes(c) && c !== 'Combos');
            cats = cats.concat(extras);
        }
        return cats.map(cat => ({ category: cat, services: groups[cat] || [] })).filter(g => g.services.length);
    },

    // True for add-on style rows within a parent category (duration 0 / Add / Soak Off)
    isServiceAddon(s) {
        if (!s) return false;
        if ((s.duration || 0) === 0) return true;
        const n = String(s.name || '');
        return /^(add |soak off|extra tip|shape$)/i.test(n);
    },

    // Service menu search — all whitespace-separated tokens must match (order-independent)
    serviceMatchesQuery(s, q) {
        const raw = String(q || '').trim().toLowerCase().replace(/\s+/g, ' ');
        if (!raw) return true;
        if (!s) return false;
        const hay = [
            s.name,
            this.displayCategory(s),
            s.category,
            s.description,
            s.priceNote,
            (s.popular ? 'popular' : '')
        ].filter(Boolean).join(' ').toLowerCase();
        return raw.split(' ').every(tok => tok && hay.includes(tok));
    },

    // Party / group booking helpers — +N = additional guests beyond the primary
    partySizeOf(appt) {
        if (!appt) return 1;
        const raw = Number(appt.partySize || appt.clientCount || 0);
        if (raw > 1) return raw;
        const partyArr = Array.isArray(appt.party) ? appt.party.filter(Boolean) : [];
        if (partyArr.length > 1) return partyArr.length;
        const guests = Array.isArray(appt.guestNames) ? appt.guestNames.filter(n => String(n || '').trim()) : [];
        if (guests.length) return guests.length + 1;
        const guestList = Array.isArray(appt.guests) ? appt.guests : [];
        if (guestList.length) return guestList.length + 1;
        return Math.max(1, raw || 1);
    },

    partyExtraCount(appt) {
        return Math.max(0, this.partySizeOf(appt) - 1);
    },

    /**
     * Strip seat suffixes/prefixes for display when #N or P-badge is shown separately.
     * "Sean #2" / "Sean (P2)" / "#2 Sean" → "Sean"
     */
    partyBaseDisplayName(name) {
        let s = String(name == null ? '' : name).trim();
        if (!s) return '';
        s = s.replace(/^\?+\s*/, '');
        s = s.replace(/^\s*#\d+\s+/i, '');
        s = s.replace(/\s*\(P\d+\)\s*$/i, '');
        s = s.replace(/\s*#\d+\s*$/i, '');
        s = s.trim();
        if (!s || /^Guest\s*\d+$/i.test(s)) return '';
        return s;
    },

    /** Booker keeps base name; seats 2+ → "Sean #2", "Sean #3" (not "Guest 2"). index0Based: 0 = booker. */
    partySeatName(baseName, index0Based) {
        const base = this.partyBaseDisplayName(baseName) || String(baseName || '').trim() || 'Client';
        const idx = Number(index0Based);
        if (!idx || idx < 1 || Number.isNaN(idx)) return base;
        return base + ' #' + (idx + 1);
    },

    isGenericPartyGuestName(name) {
        return !String(name || '').trim() || /^Guest\s*\d+$/i.test(String(name).trim());
    },

    /** Prefer typed name; rewrite blank / "Guest N" / "Name (P2)" to booker-based seat labels. */
    resolvePartySeatName(baseName, index0Based, explicitName) {
        const explicit = String(explicitName || '').trim();
        const pn = explicit.match(/^(.+?)\s*\(P(\d+)\)$/i);
        if (pn) {
            const fromPn = Number(pn[2]) - 1;
            return this.partySeatName(pn[1].trim() || baseName, Number.isNaN(fromPn) ? index0Based : fromPn);
        }
        // Explicit "Sean #2" with known seat → keep as seat label for storage; callers that
        // prefix #N should use partyBaseDisplayName for UI.
        if (explicit && !this.isGenericPartyGuestName(explicit)) {
            const stripped = this.partyBaseDisplayName(explicit);
            // If explicit was only a seat suffix, fall through to generated seat name
            if (!stripped) return this.partySeatName(baseName, index0Based);
            const seatM = explicit.match(/#(\d+)\s*$/);
            if (seatM && Number(index0Based) >= 1) {
                // Normalize to "Base #N" without double suffix
                return this.partySeatName(stripped, index0Based);
            }
            return explicit.replace(/\s*\(P\d+\)\s*$/i, '').trim() || this.partySeatName(baseName, index0Based);
        }
        return this.partySeatName(baseName, index0Based);
    },

    partyBadgeHtml(appt) {
        const total = this.partySizeOf(appt);
        if (total <= 1) return '';
        // High-contrast chip: white on black (readable on dark appointment blocks)
        const chip = 'display:inline-block;vertical-align:middle;margin-left:4px;padding:2px 6px;border-radius:4px;background:#000;color:#fff;font-size:0.65rem;font-weight:800;line-height:1.35;letter-spacing:0.03em;white-space:nowrap;text-transform:none;border:1px solid #fff;box-shadow:none;';
        // Linked multi-appointment parties: show P1 / P2 / P3 by seat when known
        if (appt && appt.partyId) {
            const idx = (appt.partyIndex != null && !Number.isNaN(Number(appt.partyIndex)))
                ? (Number(appt.partyIndex) + 1)
                : total;
            return ` <span class="party-badge party-linked" title="Party of ${total} · Client ${idx}" style="${chip}">P${idx}</span>`;
        }
        const n = total - 1;
        return ` <span class="party-badge" title="Party of ${total}" style="${chip}">+${n}</span>`;
    },

    // ---- Staff roles ----
    normalizeRole(role) {
        const s = String(role || '').toLowerCase().trim();
        if (!s) return '';
        if (s === 'tech' || s === 'technician' || s === 'nail tech' || s === 'nail technician'
            || s === 'senior tech' || s === 'senior technician' || s.includes('tech')) {
            return 'technician';
        }
        if (s.includes('manager')) return 'manager';
        if (s.includes('admin')) return 'admin';
        if (s.includes('reception')) return 'receptionist';
        return s;
    },

    getStaffRoles(staff) {
        if (!staff) return [];
        const raw = [];
        if (Array.isArray(staff.roles)) raw.push(...staff.roles);
        else if (typeof staff.roles === 'string' && staff.roles.trim()) {
            raw.push(...staff.roles.split(/[,|/]/).map(x => x.trim()).filter(Boolean));
        }
        if (staff.role) raw.push(staff.role);
        return [...new Set(raw.map(r => this.normalizeRole(r)).filter(Boolean))];
    },

    // Highest-privilege role for PIN / page access
    primaryRole(staffOrRoles) {
        const roles = Array.isArray(staffOrRoles)
            ? staffOrRoles.map(r => this.normalizeRole(r))
            : this.getStaffRoles(staffOrRoles);
        for (const r of ['admin', 'manager', 'receptionist', 'technician']) {
            if (roles.includes(r)) return r;
        }
        return roles[0] || 'technician';
    },

    isTechnician(staff) {
        const roles = this.getStaffRoles(staff);
        // No role listed → treat as technician (public booking staff often ship id+name only)
        if (!roles.length) return true;
        return roles.includes('technician');
    },

    formatRoleLabel(roleOrStaff) {
        if (roleOrStaff && typeof roleOrStaff === 'object') {
            const roles = this.getStaffRoles(roleOrStaff);
            if (!roles.length) return 'Technician';
            return roles.map(r => STAFF_ROLE_LABELS[r] || r).join(' + ');
        }
        const n = this.normalizeRole(roleOrStaff);
        return STAFF_ROLE_LABELS[n] || roleOrStaff || 'Technician';
    },

    // Active staff who take clients (booking, schedule columns, up-next)
    getBookableStaff(staffList) {
        return (staffList || []).filter(s => {
            const st = String(s.status || 'active').toLowerCase();
            if (st === 'inactive' || st === 'deleted') return false;
            return this.isTechnician(s);
        });
    },

    // Expand legacy combined staff skill into separate Lashes + Fix & Removal
    expandStaffServiceCategory(cat) {
        const n = this.normalizeCategory(cat);
        if (n === LEGACY_LASHES_FIX_COMBO) return ['Lashes', 'Fix & Removal'];
        return n ? [n] : [];
    },

    // Categories a tech is trained for. Empty / missing = all menu categories.
    getStaffServiceCategories(staff) {
        if (!staff) return [];
        const raw = Array.isArray(staff.serviceCategories) ? staff.serviceCategories : [];
        const expanded = [];
        raw.forEach(c => expanded.push(...this.expandStaffServiceCategory(c)));
        return [...new Set(expanded.filter(Boolean))];
    },

    staffCanDoService(staff, serviceOrCategory) {
        const cats = this.getStaffServiceCategories(staff);
        if (!cats.length) return true; // unset = all services
        let cat = '';
        if (typeof serviceOrCategory === 'string') cat = this.normalizeCategory(serviceOrCategory);
        else if (serviceOrCategory && serviceOrCategory.category) cat = this.normalizeCategory(serviceOrCategory.category);
        if (!cat) return true;
        if (cats.includes(cat)) return true;
        // Legacy combined value (if not yet expanded) still covers both menu cats
        if (cats.includes(LEGACY_LASHES_FIX_COMBO) && (cat === 'Lashes' || cat === 'Fix & Removal')) return true;
        return false;
    },

    staffWhoCanDoService(staffList, serviceOrCategory) {
        return this.getBookableStaff(staffList).filter(s => this.staffCanDoService(s, serviceOrCategory));
    },

    formatStaffServiceLabels(staff) {
        const cats = this.getStaffServiceCategories(staff);
        if (!cats.length) return 'All Services';
        return cats.map(c => (c === 'Fix & Removal' ? 'Fix and Removal' : c)).join(', ');
    },

    // Build / fill checkbox group for service categories (edit staff modals)
    fillServiceCategoryCheckboxes(rootId, selected) {
        const root = typeof rootId === 'string' ? document.getElementById(rootId) : rootId;
        if (!root) return;
        // Expand legacy "Lashes Fix and Removal" → both Lashes and Fix & Removal checked
        const selectedSet = new Set();
        (selected || []).forEach(c => {
            this.expandStaffServiceCategory(c).forEach(x => selectedSet.add(x));
        });
        // Built-in order + any live/custom categories from the menu
        const cats = STAFF_SERVICE_CATEGORY_ORDER.slice();
        const seen = new Set(cats);
        try {
            const live = (typeof DataManager !== 'undefined' && DataManager.getServices)
                ? this.serviceCategories(DataManager.getServices()) : [];
            const custom = (typeof DataManager !== 'undefined' && DataManager.getSettings)
                ? ((DataManager.getSettings().customServiceCategories) || []) : [];
            live.concat(custom).forEach(c => {
                const n = this.normalizeCategory(c);
                if (n && !seen.has(n) && n !== 'Add-ons' && n !== 'Combos') {
                    seen.add(n);
                    cats.push(n);
                }
            });
        } catch (e) { /* ignore */ }
        root.innerHTML = cats.map(cat => {
            const id = 'svcCat_' + cat.replace(/[^a-z0-9]+/gi, '_');
            const checked = selectedSet.size === 0 ? false : selectedSet.has(cat);
            const label = cat === 'Fix & Removal' ? 'Fix and Removal' : cat;
            return `<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:0.78rem;white-space:nowrap;">
                <input type="checkbox" data-service-category="${cat}" id="${id}" ${checked ? 'checked' : ''}> ${label}
            </label>`;
        }).join('');
        // If none selected historically (= all services), leave unchecked and note in UI
        root.dataset.emptyMeansAll = selectedSet.size === 0 ? '1' : '0';
    },

    readServiceCategoryCheckboxes(rootId) {
        const root = typeof rootId === 'string' ? document.getElementById(rootId) : rootId;
        if (!root) return [];
        return Array.from(root.querySelectorAll('input[data-service-category]:checked'))
            .map(cb => this.normalizeCategory(cb.getAttribute('data-service-category')))
            .filter(Boolean);
    },

    // Build { roles, role } from checkbox / array input
    packRoles(roles) {
        const normalized = [...new Set((roles || []).map(r => this.normalizeRole(r)).filter(Boolean))];
        if (!normalized.length) normalized.push('technician');
        return { roles: normalized, role: this.primaryRole(normalized) };
    },

    readRoleCheckboxes(rootId) {
        const root = typeof rootId === 'string' ? document.getElementById(rootId) : rootId;
        if (!root) return this.packRoles(['technician']);
        const picked = [...root.querySelectorAll('input[data-role]:checked')].map(i => i.dataset.role);
        return this.packRoles(picked);
    },

    setRoleCheckboxes(rootId, staffOrRoles) {
        const root = typeof rootId === 'string' ? document.getElementById(rootId) : rootId;
        if (!root) return;
        const roles = Array.isArray(staffOrRoles)
            ? staffOrRoles.map(r => this.normalizeRole(r))
            : this.getStaffRoles(staffOrRoles);
        root.querySelectorAll('input[data-role]').forEach(i => {
            i.checked = roles.includes(i.dataset.role);
        });
    },

    roleCheckboxesHtml(rootId, hint) {
        const note = hint || 'Only Technicians appear on booking and the schedule grid.';
        return `<div class="form-group" id="${rootId}">
            <label class="form-label">Roles <span style="font-weight:500;opacity:.7;">(select all that apply)</span></label>
            <div style="display:flex;flex-wrap:wrap;gap:12px 16px;margin-top:6px;">
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:0.85rem;"><input type="checkbox" data-role="technician" checked> Technician</label>
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:0.85rem;"><input type="checkbox" data-role="manager"> Manager</label>
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:0.85rem;"><input type="checkbox" data-role="admin"> Admin</label>
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:0.85rem;"><input type="checkbox" data-role="receptionist"> Receptionist</label>
            </div>
            <div style="font-size:0.7rem;color:var(--text-secondary,#9ca3af);margin-top:6px;">${note}</div>
        </div>`;
    },

    // Format currency
    formatCurrency(amount, currency = '$') {
        if (amount === undefined || amount === null) return `${currency}0.00`;
        return `${currency}${parseFloat(amount).toFixed(2)}`;
    },
    
    // Format date
    formatDate(date, format = 'mdy') {
        if (!date) return '-';
        // Plain 'YYYY-MM-DD' strings are LOCAL calendar dates — parsing them as
        // UTC midnight (the default) shifts the display back one day in US timezones.
        const d = (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date))
            ? new Date(date + 'T00:00:00')
            : new Date(date);
        if (isNaN(d.getTime())) return date;
        
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const year = d.getFullYear();
        
        switch(format) {
            case 'mdy': return `${month}/${day}/${year}`;
            case 'dmy': return `${day}/${month}/${year}`;
            case 'ymd': return `${year}-${month}-${day}`;
            default: return `${month}/${day}/${year}`;
        }
    },
    
    // Format time
    formatTime(time, format = '12') {
        if (!time) return '-';
        const [hours, minutes] = time.split(':');
        let h = parseInt(hours);
        const m = minutes || '00';
        
        if (format === '12') {
            const ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12;
            h = h ? h : 12;
            return `${h}:${m} ${ampm}`;
        }
        return `${String(h).padStart(2, '0')}:${m}`;
    },
    
    // Digits-only phone (strips leading US country code 1). Returns '' if not 10 digits.
    phoneDigits(phone) {
        if (phone == null || phone === '') return '';
        let d = String(phone).replace(/\D/g, '');
        if (d.length === 11 && d[0] === '1') d = d.slice(1);
        return d.length === 10 ? d : '';
    },

    // Normalize for storage: 10 digits when possible, else trimmed original.
    normalizePhone(phone) {
        if (phone == null) return '';
        const trimmed = String(phone).trim();
        if (!trimmed) return '';
        const d = Utils.phoneDigits(trimmed);
        return d || trimmed;
    },

    // Format phone for display — US style (XXX) XXX-XXXX
    formatPhone(phone) {
        if (phone == null || phone === '') return '-';
        const cleaned = String(phone).replace(/\D/g, '');
        let d = cleaned;
        if (d.length === 11 && d[0] === '1') d = d.slice(1);
        if (d.length === 10) {
            return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
        }
        return String(phone);
    },

    // Alias used by display sites
    formatPhoneDisplay(phone) {
        return Utils.formatPhone(phone);
    },

    // Appointment-block service label: Fullset / Full Set → Full-<br>set (stacked).
    // Only fullset-like names that *start* with Fullset/Full Set; other names unchanged.
    formatApptServiceHtml(name) {
        if (name == null || name === '') return '';
        const raw = String(name);
        const esc = (s) => String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
        const m = raw.match(/^(full)([\s-]*)(set)(\b.*)$/i);
        if (!m) return esc(raw);
        return `<span class="appt-svc-fullset">${esc(m[1])}-<br>${esc(m[3])}${esc(m[4] || '')}</span>`;
    },
    
    // Format duration
    formatDuration(minutes) {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    },
    
    // Truncate text
    truncate(text, length = 50) {
        if (!text) return '';
        return text.length > length ? text.substring(0, length) + '...' : text;
    },
    
    // Generate ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Deep clone
    clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    // Debounce
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Get initials from name
    getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    },
    
    // Calculate time difference
    timeDiff(start, end) {
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        return (eh * 60 + em) - (sh * 60 + sm);
    },
    
    // Get today's date string
    today() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    },
    
    // Get current time string
    now() {
        const d = new Date();
        return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    },
    
    // Parse CSV
    parseCSV(text) {
        const lines = text.split(/\r?\n/);
        if (lines.length < 2) return [];
        
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
        const result = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const values = lines[i].split(',');
            const obj = {};
            headers.forEach((h, j) => {
                obj[h] = values[j] ? values[j].trim() : '';
            });
            result.push(obj);
        }
        return result;
    },
    
    // Export to CSV
    exportCSV(data, filename) {
        if (!data || data.length === 0) return;
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(h => {
                const val = row[h] || '';
                return `"${String(val).replace(/"/g, '""')}"`;
            }).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'export.csv';
        a.click();
        URL.revokeObjectURL(url);
    },
    
    // Validate email
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    
    // Validate phone
    isValidPhone(phone) {
        return phone.replace(/\D/g, '').length >= 10;
    },
    
    // Generate random color
    randomColor() {
        const colors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#ef4444'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
};

// ===== UI UTILITIES =====

const UI = {
    // Show toast notification
    toast(message, type = 'info', duration = 3000) {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        
        toast.innerHTML = `<span style="font-size:1.1rem;">${icons[type] || 'ℹ'}</span> ${message}`;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },
    
    // Show modal
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },
    
    // Hide modal
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },
    
    // Confirm dialog
    confirm(message, onConfirm, onCancel) {
        if (window.confirm(message)) {
            if (typeof onConfirm === 'function') onConfirm();
        } else {
            if (typeof onCancel === 'function') onCancel();
        }
    },
    
    // Show loading
    showLoading(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;padding:40px;"><div class="loading-spinner"></div></div>';
        }
    },
    
    // Set active nav tab
    setActiveNav(tabId) {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });
    },
    
    // Set active sidebar button
    setActiveSidebar(buttonId) {
        document.querySelectorAll('.sidebar-btn').forEach(btn => {
            // Cross-page links from AppNav use data-app-nav — leave their highlight alone
            if (btn.hasAttribute('data-app-nav')) return;
            btn.classList.toggle('active', btn.dataset.page === buttonId);
        });
    },
    
    // Animate number counter
    animateNumber(element, target, duration = 1000) {
        const start = parseInt(element.textContent) || 0;
        const range = target - start;
        const startTime = performance.now();
        
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            element.textContent = Math.round(start + range * easeProgress);
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        
        requestAnimationFrame(update);
    },
    
    // Create searchable dropdown
    createSearchDropdown(input, data, onSelect) {
        let dropdown = input.nextElementSibling;
        if (!dropdown || !dropdown.classList.contains('search-dropdown')) {
            dropdown = document.createElement('div');
            dropdown.className = 'search-dropdown';
            dropdown.style.cssText = 'position:absolute;top:100%;left:0;right:0;background:#1a1a1a;border:1px solid #333;border-radius:8px;max-height:200px;overflow-y:auto;z-index:100;display:none;margin-top:4px;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
            input.parentNode.style.position = 'relative';
            input.parentNode.appendChild(dropdown);
        }
        
        input.addEventListener('input', Utils.debounce(() => {
            const term = input.value.toLowerCase();
            if (!term) {
                dropdown.style.display = 'none';
                return;
            }
            
            const filtered = data.filter(item =>
                (item.name && item.name.toLowerCase().includes(term)) ||
                (item.phone && item.phone.includes(term))
            );
            
            if (filtered.length === 0) {
                dropdown.style.display = 'none';
                return;
            }
            
            dropdown.innerHTML = filtered.map(item => `
                <div class="search-item" style="padding:8px 12px;cursor:pointer;font-size:0.85rem;border-bottom:1px solid #2a2a2a;transition:background 0.2s;" 
                     onmouseover="this.style.background='#252525'" 
                     onmouseout="this.style.background=''"
                     data-id="${item.id}">
                    <div style="font-weight:600;color:#e5e7eb;">${item.name}</div>
                    <div style="font-size:0.75rem;color:#9ca3af;">${item.phone ? Utils.formatPhone(item.phone) : ''}</div>
                </div>
            `).join('');
            
            dropdown.querySelectorAll('.search-item').forEach(item => {
                item.addEventListener('click', () => {
                    const id = parseInt(item.dataset.id);
                    const selected = data.find(d => d.id === id);
                    if (typeof onSelect === 'function') onSelect(selected);
                    dropdown.style.display = 'none';
                });
            });
            
            dropdown.style.display = 'block';
        }, 200));
        
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    }
};

// ===== AUTH UTILITIES =====

const Auth = {
    currentUser: null,
    
    // Login with PIN
    login(pin) {
        const settings = DataManager.settings;
        
        if (pin === settings.adminPin) {
            this.currentUser = { role: 'admin', name: 'Admin', pin: pin };
            return { success: true, role: 'admin' };
        }
        if (pin === settings.managerPin) {
            this.currentUser = { role: 'manager', name: 'Manager', pin: pin };
            return { success: true, role: 'manager' };
        }
        
        // Check staff PINs
        const staff = DataManager.getStaff().find(s => s.pin === pin);
        if (staff) {
            this.currentUser = { role: staff.role, name: staff.name, pin: pin, staffId: staff.id };
            return { success: true, role: staff.role, staffId: staff.id };
        }
        
        return { success: false, message: 'Invalid PIN' };
    },
    
    // Logout
    logout() {
        this.currentUser = null;
    },
    
    // Check if logged in
    isLoggedIn() {
        return this.currentUser !== null;
    },
    
    // Check role
    hasRole(role) {
        if (!this.currentUser) return false;
        if (this.currentUser.role === 'admin') return true; // Admin can do everything
        if (role === 'manager' && this.currentUser.role === 'manager') return true;
        if (role === 'staff' && ['manager', 'nail tech', 'admin'].includes(this.currentUser.role)) return true;
        return this.currentUser.role === role;
    },
    
    // Get current user
    getUser() {
        return this.currentUser;
    },
    
    // Verify PIN for action
    verifyPin(pin, requiredRole) {
        const result = this.login(pin);
        if (!result.success) return false;
        
        if (requiredRole === 'admin') return result.role === 'admin';
        if (requiredRole === 'manager') return ['admin', 'manager'].includes(result.role);
        return true;
    }
};

// ===== CALENDAR UTILITIES =====

const CalendarUtils = {
    // Get days in month
    getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    },
    
    // Get first day of month
    getFirstDayOfMonth(year, month) {
        return new Date(year, month, 1).getDay();
    },
    
    // Get month name
    getMonthName(month) {
        const names = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return names[month];
    },
    
    // Get day name
    getDayName(day) {
        const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return names[day];
    },
    
    // Get short day name
    getShortDayName(day) {
        return this.getDayName(day).slice(0, 3);
    },
    
    // Generate time slots
    generateTimeSlots(startTime, endTime, interval = 15) {
        const slots = [];
        let [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);
        
        while (sh < eh || (sh === eh && sm < em)) {
            slots.push(`${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}`);
            sm += interval;
            if (sm >= 60) {
                sh += Math.floor(sm / 60);
                sm = sm % 60;
            }
        }
        return slots;
    },
    
    // Check if date is today
    isToday(date) {
        return date === Utils.today();
    },
    
    // Check if date is past
    isPast(date) {
        return new Date(date) < new Date(Utils.today());
    },
    
    // Get week dates
    getWeekDates(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        const week = [];
        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(d.setDate(diff + i));
            week.push(dayDate.toISOString().split('T')[0]);
        }
        return week;
    }
};

// ===== AI UTILITIES (routed through local Kimi proxy — no API keys in frontend code) =====

const GeminiAI = {
    // Same-origin by default so public booking (port 3002 / tunnel) hits /api/client-chat
    // on THIS host — never hardcode localhost:3001 (breaks phones + public tunnels).
    get proxyUrl() {
        try {
            const stored = localStorage.getItem('kimiProxyUrl');
            if (stored && String(stored).trim()) return String(stored).replace(/\/$/, '');
        } catch (e) {}
        return '';
    },
    history: [], // {role, content} — kept for multi-turn conversation

    async generateResponse(prompt, context = '') {
        try {
            const base = this.proxyUrl;
            const url = (base || '') + '/api/client-chat';
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: prompt,
                    history: this.history.slice(-20),
                    context: context
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            if (data && data.error && !data.choices) {
                throw new Error(typeof data.error === 'string' ? data.error : 'AI unavailable');
            }
            const reply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content)
                || data.reply || data.message;
            if (!reply) throw new Error('Bad response from AI server');

            this.history.push({ role: 'user', content: prompt }, { role: 'assistant', content: reply });
            return reply;
        } catch (error) {
            console.error('Kimi proxy error:', error);
            // Throw so callers can fall back to local FAQ / command parsers
            throw error;
        }
    },
    
    // Voice recognition setup
    setupVoiceRecognition(onResult, onError) {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            if (typeof onError === 'function') onError('Speech recognition not supported in this browser');
            return null;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (typeof onResult === 'function') onResult(transcript);
        };
        
        recognition.onerror = (event) => {
            if (typeof onError === 'function') onError(event.error);
        };
        
        return recognition;
    },
    
    // Text to speech
    speak(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
        }
    }
};

// Make utilities globally available
window.Utils = Utils;
window.UI = UI;
window.Auth = Auth;
window.CalendarUtils = CalendarUtils;
window.GeminiAI = GeminiAI;

// ===== SALON NAME TAG (internal pages) =====
// Shows "· <salon name>" next to the AI Salon Pro software brand on
// staff-facing pages, synced live from the shared settings so it always
// matches whatever salon name Admin has configured.
(function () {
    function applySalonNameTag() {
        if (typeof DataManager === 'undefined' || !DataManager.settings) return;
        const name = DataManager.settings.salonName || 'Urban Nail Bar';
        document.querySelectorAll('.salon-name-tag').forEach(el => { el.textContent = '· ' + name; });
        // Browser tab title on internal pages (marked by the tag element):
        // "AI Salon Pro - Manager Interface · Urban Nail Bar"
        if (document.querySelector('.salon-name-tag')) {
            const base = document.title.replace(/\s*·\s*[^·]+$/, '');
            if (document.title !== base + ' · ' + name) {
                document.title = base + ' · ' + name;
            }
        }
    }
    document.addEventListener('DOMContentLoaded', applySalonNameTag);
    if (typeof DataManager !== 'undefined' && DataManager.addListener) {
        DataManager.addListener((type) => { if (type === 'settings') applySalonNameTag(); });
    }
    window.applySalonNameTag = applySalonNameTag;
})();
