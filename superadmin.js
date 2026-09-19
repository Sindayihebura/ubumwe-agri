/**
 * UBUMWE AGRI — Super Admin Dashboard (Privé)
 * Accès : rôle super_admin uniquement
 *
 * Source de données — ordre de priorité :
 *   1. Supabase (données réelles, multi-utilisateurs)
 *   2. localStorage (fallback offline ou avant configuration Supabase)
 *
 * Tables Supabase utilisées :
 *   - site_ratings  → votes des visiteurs
 *   - site_visits   → compteur journalier (via RPC record_visit)
 *   - rating_stats  → vue agrégée (avg, total, répartition)
 *   - recent_ratings → vue 20 derniers avis
 *   - ratings_by_lang → vue par langue
 *   - products, credit_requests → depuis les tables existantes
 */

/* ─── Clés localStorage (fallback) ──────────────────────── */
const SUPERADMIN_KEY = 'UBUMWE_SUPERADMIN_STATS_V2';
const RATINGS_KEY    = 'UBUMWE_RATINGS_V2';
const REVENUE_KEY    = 'UBUMWE_REVENUE_V2';
const VISITS_KEY     = 'UBUMWE_VISITS_V2';

/* ─── Helpers ────────────────────────────────────────────── */
function safeGet(key, def) {
    try { return JSON.parse(localStorage.getItem(key)) ?? def; }
    catch { return def; }
}
function safeSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) {}
}
function _getSupabase() {
    return (typeof window._ubumweSupabase !== 'undefined' && window._ubumweSupabase)
        ? window._ubumweSupabase : null;
}

/* ─── Données de démo pour les graphiques ─────────────────── */
function _generateDemoSeries(days = 30) {
    const now = new Date();
    return Array.from({ length: days }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (days - 1 - i));
        return {
            label:   d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
            users:   Math.floor(20 + Math.random() * 80  + i * 1.5),
            visits:  Math.floor(40 + Math.random() * 200 + i * 3),
            revenue: Math.floor(5000 + Math.random() * 50000),
        };
    });
}

/* ─── Module principal ───────────────────────────────────── */
const superAdmin = {
    charts: {},

    /* ── Auth check ─────────────────────────────────────── */
    isAuthorized() {
        try {
            const u = JSON.parse(localStorage.getItem('UBUMWE_AGRI_CURRENT_USER_V3'));
            return u && (u.role === 'super_admin' || u.email === 'admin@ubumwe.bi');
        } catch { return false; }
    },

    /* ── Enregistre une visite (locale + Supabase) ─────── */
    async recordVisit() {
        // Local d'abord
        const visits = safeGet(VISITS_KEY, []);
        const today  = new Date().toISOString().split('T')[0];
        const entry  = visits.find(v => v.date === today);
        if (entry) entry.count++;
        else visits.push({ date: today, count: 1 });
        while (visits.length > 90) visits.shift();
        safeSet(VISITS_KEY, visits);

        // Supabase en arrière-plan
        const sb = _getSupabase();
        if (sb && navigator.onLine) {
            try { await sb.rpc('record_visit'); } catch (_) {}
        }
    },

    /* ── Enregistre un revenu ────────────────────────────── */
    recordRevenue(amount = 0) {
        const rev   = safeGet(REVENUE_KEY, []);
        const today = new Date().toISOString().split('T')[0];
        const entry = rev.find(r => r.date === today);
        if (entry) entry.amount += amount;
        else rev.push({ date: today, amount });
        while (rev.length > 90) rev.shift();
        safeSet(REVENUE_KEY, rev);
    },

    /* ── Charge toutes les données (Supabase puis fallback) ── */
    async _fetchAllData() {
        const sb     = _getSupabase();
        const online = sb && navigator.onLine;

        /* Valeurs par défaut (localStorage) */
        const localRatings  = safeGet(RATINGS_KEY, []);
        const localVisits   = safeGet(VISITS_KEY, []);
        const localRevenue  = safeGet(REVENUE_KEY, []);
        const localProducts = safeGet('UBUMWE_AGRI_PRODUCTS_V3', []);
        const localCredits  = safeGet('UBUMWE_AGRI_CREDITS_V3', []);

        let data = {
            source:        'local',
            avgRating:     '—',
            totalRatings:  0,
            starCounts:    [0, 0, 0, 0, 0],
            byLang:        [],
            recentRatings: localRatings.slice().reverse().slice(0, 20),
            visits:        localVisits,
            visitsToday:   0,
            totalVisits:   localVisits.reduce((s, v) => s + v.count, 0),
            totalRevenue:  localRevenue.reduce((s, r) => s + r.amount, 0),
            totalUsers:    Math.max(5, localProducts.length + localCredits.length + 3),
            pendingCount:  localProducts.filter(p => p.status === 'pending').length,
            approvedCount: localProducts.filter(p => p.status === 'approved').length,
            creditsCount:  localCredits.length,
        };

        // Visits today from local
        const todayStr = new Date().toISOString().split('T')[0];
        const todayEntry = localVisits.find(v => v.date === todayStr);
        data.visitsToday = todayEntry?.count ?? 0;

        // Local avg rating
        if (localRatings.length > 0) {
            const sum = localRatings.reduce((s, r) => s + r.stars, 0);
            data.avgRating    = (sum / localRatings.length).toFixed(1);
            data.totalRatings = localRatings.length;
            data.starCounts   = [1,2,3,4,5].map(s =>
                localRatings.filter(r => r.stars === s).length
            );
        }

        if (!online) return data;

        /* ── Données Supabase ─────────────────────────── */
        data.source = 'supabase';

        try {
            // Stats de notation globales (vue rating_stats)
            const { data: rStats } = await sb
                .from('rating_stats')
                .select('*')
                .single();

            if (rStats) {
                data.avgRating    = rStats.average_stars
                    ? parseFloat(rStats.average_stars).toFixed(1) : '—';
                data.totalRatings = rStats.total_ratings ?? 0;
                data.starCounts   = [
                    rStats.stars_1 ?? 0,
                    rStats.stars_2 ?? 0,
                    rStats.stars_3 ?? 0,
                    rStats.stars_4 ?? 0,
                    rStats.stars_5 ?? 0,
                ];
            }
        } catch (_) {}

        try {
            // 20 derniers avis (vue recent_ratings)
            const { data: recent } = await sb
                .from('recent_ratings')
                .select('id, visitor_name, stars, comment, lang, created_at');

            if (recent?.length) {
                data.recentRatings = recent.map(r => ({
                    name:    r.visitor_name,
                    stars:   r.stars,
                    comment: r.comment || '',
                    lang:    r.lang,
                    date:    r.created_at,
                }));
            }
        } catch (_) {}

        try {
            // Répartition par langue (vue ratings_by_lang)
            const { data: byLang } = await sb
                .from('ratings_by_lang')
                .select('lang, total, avg_stars');
            if (byLang) data.byLang = byLang;
        } catch (_) {}

        try {
            // Visites depuis Supabase (30 derniers jours)
            const since = new Date();
            since.setDate(since.getDate() - 30);
            const { data: vRows } = await sb
                .from('site_visits')
                .select('visit_date, count')
                .gte('visit_date', since.toISOString().split('T')[0])
                .order('visit_date', { ascending: true });

            if (vRows?.length) {
                data.visits = vRows.map(v => ({ date: v.visit_date, count: v.count }));
                data.totalVisits  = vRows.reduce((s, v) => s + v.count, 0);
                const todaySB = vRows.find(v => v.visit_date === todayStr);
                data.visitsToday  = todaySB?.count ?? 0;
            }
        } catch (_) {}

        try {
            // Compteurs produits et crédits
            const [{ count: approved }, { count: pending }, { count: credits }] = await Promise.all([
                sb.from('products').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
                sb.from('products').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
                sb.from('credit_requests').select('id', { count: 'exact', head: true }),
            ]);
            data.approvedCount = approved ?? data.approvedCount;
            data.pendingCount  = pending  ?? data.pendingCount;
            data.creditsCount  = credits  ?? data.creditsCount;
            data.totalUsers    = Math.max(5, (approved ?? 0) + (credits ?? 0) + 3);
        } catch (_) {}

        return data;
    },

    /* ── Rendu principal ─────────────────────────────────── */
    async render() {
        const screen = document.getElementById('screen-superadmin');
        if (!screen) return;

        if (!this.isAuthorized()) {
            screen.innerHTML = `
            <div class="flex items-center justify-center bg-slate-900 rounded-2xl p-8 text-center min-h-64">
                <div>
                    <i class="fa-solid fa-lock text-6xl text-red-500 mb-4 block"></i>
                    <h2 class="text-2xl font-black text-white mb-2">Accès Refusé</h2>
                    <p class="text-slate-400 text-sm">Cette page est réservée aux super-administrateurs.</p>
                    <button onclick="app.showScreen('home')"
                        class="mt-6 px-6 py-2 bg-amber-400 text-slate-900 font-bold rounded-xl text-sm">
                        Retour
                    </button>
                </div>
            </div>`;
            return;
        }

        // Afficher skeleton pendant le chargement
        screen.innerHTML = this._renderSkeleton();

        const data = await this._fetchAllData();
        const demo = _generateDemoSeries(30);

        screen.innerHTML = this._renderDashboard(data);
        this._loadChartJs(() => this._drawCharts(data, demo));
        if (typeof translatePage === 'function') translatePage();
    },

    /* ── Skeleton de chargement ──────────────────────────── */
    _renderSkeleton() {
        return `
        <div class="space-y-6 pb-8 animate-pulse">
            <div class="bg-slate-800 rounded-2xl h-20"></div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                ${[1,2,3,4].map(() => '<div class="bg-slate-200 rounded-xl h-24"></div>').join('')}
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                ${[1,2,3,4].map(() => '<div class="bg-slate-200 rounded-2xl h-52"></div>').join('')}
            </div>
        </div>`;
    },

    /* ── HTML principal du dashboard ─────────────────────── */
    _renderDashboard(data) {
        const sourceBadge = data.source === 'supabase'
            ? '<span class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-300"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span> Données Supabase Live</span>'
            : '<span class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">📱 Données locales</span>';

        return `
        <div class="space-y-6 pb-8">

            <!-- En-tête -->
            <div class="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 rounded-2xl p-5 border border-amber-800">
                <div class="flex items-start justify-between flex-wrap gap-3">
                    <div>
                        <div class="flex items-center gap-2 flex-wrap mb-1">
                            <span class="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black rounded uppercase tracking-widest">🔐 ACCÈS RESTREINT</span>
                            ${sourceBadge}
                        </div>
                        <h2 class="text-2xl font-black text-white flex items-center gap-2" data-i18n="superadmin_title">
                            ⭐ Super Admin — Tableau de Bord Privé
                        </h2>
                        <p class="text-xs text-amber-300 mt-1" data-i18n="superadmin_subtitle">
                            Accès réservé aux administrateurs principaux uniquement.
                        </p>
                    </div>
                    <div class="flex gap-2 flex-wrap">
                        <button onclick="superAdmin.render()"
                            class="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition">
                            <i class="fa-solid fa-rotate-right"></i> Actualiser
                        </button>
                        <button onclick="superAdmin.exportCSV()"
                            class="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition">
                            <i class="fa-solid fa-download"></i>
                            <span data-i18n="superadmin_export">Exporter CSV</span>
                        </button>
                        <button onclick="superAdmin.resetStats()"
                            class="px-3 py-2 bg-rose-800 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition">
                            <i class="fa-solid fa-rotate-left"></i>
                            <span data-i18n="superadmin_reset">Réinitialiser local</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- KPI Cards -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                ${this._kpiCard('fa-users',    'superadmin_users_total',  data.totalUsers,   'text-blue-600',   'bg-blue-50')}
                ${this._kpiCard('fa-eye',      'superadmin_visits_today', data.visitsToday,  'text-emerald-600','bg-emerald-50')}
                ${this._kpiCard('fa-coins',    'superadmin_revenue',      new Intl.NumberFormat('fr-FR').format(data.totalRevenue) + ' BIF', 'text-amber-600','bg-amber-50')}
                ${this._kpiCard('fa-star',     'superadmin_rating',       `${data.avgRating} / 5 <span class="text-[10px] font-normal">(${data.totalRatings})</span>`, 'text-yellow-600','bg-yellow-50')}
            </div>

            <!-- Stats secondaires -->
            <div class="grid grid-cols-3 gap-3">
                ${this._miniKpi('Produits approuvés', data.approvedCount, 'text-emerald-700')}
                ${this._miniKpi('En attente validation', data.pendingCount, 'text-amber-700')}
                ${this._miniKpi('Demandes crédit', data.creditsCount, 'text-blue-700')}
            </div>

            <!-- Graphiques -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <h3 class="font-extrabold text-slate-800 text-sm mb-3 flex items-center gap-2">
                        <i class="fa-solid fa-chart-area text-emerald-500"></i>
                        <span data-i18n="superadmin_chart_visits">Visites par Jour (30j)</span>
                    </h3>
                    <canvas id="chart-visits" height="180"></canvas>
                </div>
                <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <h3 class="font-extrabold text-slate-800 text-sm mb-3 flex items-center gap-2">
                        <i class="fa-solid fa-star text-yellow-500"></i>
                        <span data-i18n="superadmin_chart_rating">Répartition des Notes</span>
                    </h3>
                    <canvas id="chart-rating" height="180"></canvas>
                </div>
                <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <h3 class="font-extrabold text-slate-800 text-sm mb-3 flex items-center gap-2">
                        <i class="fa-solid fa-chart-bar text-amber-500"></i>
                        <span>Notes par Langue</span>
                    </h3>
                    <canvas id="chart-lang" height="180"></canvas>
                </div>
                <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <h3 class="font-extrabold text-slate-800 text-sm mb-3 flex items-center gap-2">
                        <i class="fa-solid fa-chart-line text-blue-500"></i>
                        <span data-i18n="superadmin_chart_users">Activité Marketplace</span>
                    </h3>
                    <canvas id="chart-activity" height="180"></canvas>
                </div>
            </div>

            <!-- Derniers avis -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div class="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <h3 class="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <i class="fa-solid fa-comments text-amber-500"></i>
                        <span data-i18n="superadmin_ratings_list">Derniers Avis Visiteurs</span>
                    </h3>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-slate-500">${data.totalRatings} ${t('rating_total')}</span>
                        ${data.source === 'supabase'
                            ? '<span class="text-[10px] text-emerald-600 font-bold">● Live</span>'
                            : '<span class="text-[10px] text-slate-400 font-bold">○ Local</span>'}
                    </div>
                </div>
                <div id="superadmin-ratings-list" class="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                    ${this._renderRatingsList(data.recentRatings)}
                </div>
            </div>

            <!-- Répartition par langue si données dispo -->
            ${data.byLang.length ? this._renderLangBreakdown(data.byLang) : ''}

        </div>`;
    },

    /* ── KPI card grande ─────────────────────────────────── */
    _kpiCard(icon, i18nKey, value, textColor, bgColor) {
        return `
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
            <div class="${bgColor} ${textColor} w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <i class="fa-solid ${icon} text-lg"></i>
            </div>
            <span class="text-[10px] text-slate-400 font-bold uppercase block leading-tight mb-1" data-i18n="${i18nKey}"></span>
            <span class="text-xl font-black ${textColor}">${value}</span>
        </div>`;
    },

    /* ── Mini KPI ────────────────────────────────────────── */
    _miniKpi(label, value, color) {
        return `
        <div class="bg-white rounded-xl border border-slate-200 p-3 text-center shadow-sm">
            <span class="text-xl font-black ${color}">${value}</span>
            <p class="text-[10px] text-slate-400 font-bold mt-0.5 leading-tight">${label}</p>
        </div>`;
    },

    /* ── Liste des avis ──────────────────────────────────── */
    _renderRatingsList(ratings) {
        if (!ratings || !ratings.length) {
            return `<div class="p-6 text-center text-slate-400 text-sm"
                        data-i18n="superadmin_no_ratings">${t('superadmin_no_ratings')}</div>`;
        }

        const langFlags = { fr: '🇫🇷', rn: '🇧🇮', rw: '🇷🇼', en: '🇬🇧' };

        return ratings.map(r => {
            const starsStr = '★'.repeat(r.stars) + '☆'.repeat(5 - r.stars);
            const starColor = r.stars >= 4 ? 'text-yellow-500' : r.stars === 3 ? 'text-amber-400' : 'text-red-400';
            const dateStr  = new Date(r.date || r.created_at).toLocaleDateString('fr-FR', {
                day: '2-digit', month: 'short', year: 'numeric'
            });
            const flag = langFlags[r.lang] || '🌐';
            return `
            <div class="p-3 flex items-start gap-3 hover:bg-slate-50 transition">
                <div class="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center
                            text-amber-700 font-black text-sm flex-shrink-0">
                    ${(r.name || r.visitor_name || 'V').charAt(0).toUpperCase()}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-bold text-xs text-slate-900">
                            ${r.name || r.visitor_name || 'Anonyme'}
                        </span>
                        <span class="${starColor} text-xs font-bold tracking-tight">${starsStr}</span>
                        <span class="text-xs">${flag}</span>
                        <span class="text-[10px] text-slate-400 ml-auto whitespace-nowrap">${dateStr}</span>
                    </div>
                    ${r.comment
                        ? `<p class="text-xs text-slate-600 mt-0.5 line-clamp-2 italic">"${r.comment}"</p>`
                        : '<p class="text-[10px] text-slate-300 mt-0.5">Aucun commentaire</p>'}
                </div>
            </div>`;
        }).join('');
    },

    /* ── Répartition par langue ──────────────────────────── */
    _renderLangBreakdown(byLang) {
        const flags = { fr: '🇫🇷', rn: '🇧🇮', rw: '🇷🇼', en: '🇬🇧' };
        return `
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <h3 class="font-extrabold text-slate-900 text-sm mb-3 flex items-center gap-2">
                <i class="fa-solid fa-language text-blue-500"></i> Avis par Langue
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                ${byLang.map(l => `
                <div class="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                    <div class="text-2xl mb-1">${flags[l.lang] || '🌐'}</div>
                    <div class="font-black text-slate-900 text-lg">${l.total}</div>
                    <div class="text-[10px] text-slate-500 uppercase font-bold">${l.lang.toUpperCase()}</div>
                    <div class="text-xs text-yellow-600 font-bold mt-0.5">
                        ${parseFloat(l.avg_stars).toFixed(1)} ★
                    </div>
                </div>`).join('')}
            </div>
        </div>`;
    },

    /* ── Chargement Chart.js ─────────────────────────────── */
    _loadChartJs(callback) {
        if (window.Chart) { callback(); return; }
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
        s.onload  = callback;
        s.onerror = () => console.warn('[SuperAdmin] Chart.js failed to load');
        document.head.appendChild(s);
    },

    /* ── Dessin des graphiques ───────────────────────────── */
    _drawCharts(data, demo) {
        const baseOpts = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { font: { size: 9 }, maxTicksLimit: 8 } },
                y: { ticks: { font: { size: 9 } }, beginAtZero: true }
            }
        };
        const noScales = { ...baseOpts, scales: undefined };

        // Nettoyer les anciens graphiques
        Object.values(this.charts).forEach(c => { try { c?.destroy(); } catch (_) {} });
        this.charts = {};

        // 1. Visites (réelles ou démo)
        const vLabels = data.visits.slice(-30).map(v => v.date.slice(5));
        const vData   = data.visits.slice(-30).map(v => v.count);
        const ctxV = document.getElementById('chart-visits');
        if (ctxV) this.charts.visits = new Chart(ctxV, {
            type: 'line',
            data: {
                labels: vLabels.length ? vLabels : demo.map(d => d.label),
                datasets: [{
                    data:            vData.length ? vData : demo.map(d => d.visits),
                    borderColor:     '#10b981',
                    backgroundColor: 'rgba(16,185,129,.12)',
                    fill: true, tension: 0.4, pointRadius: 2,
                }],
            },
            options: baseOpts,
        });

        // 2. Répartition des étoiles (données réelles Supabase)
        const ctxStar = document.getElementById('chart-rating');
        if (ctxStar) this.charts.rating = new Chart(ctxStar, {
            type: 'doughnut',
            data: {
                labels: ['1★','2★','3★','4★','5★'],
                datasets: [{
                    data: data.starCounts.some(n => n > 0)
                        ? data.starCounts
                        : [1, 2, 4, 8, 15],   // démo si aucun vote
                    backgroundColor: ['#ef4444','#f97316','#f59e0b','#84cc16','#22c55e'],
                    hoverOffset: 4,
                }],
            },
            options: {
                ...noScales,
                plugins: {
                    legend: { display: true, position: 'bottom', labels: { font: { size: 9 } } },
                },
            },
        });

        // 3. Notes par langue
        const ctxLang = document.getElementById('chart-lang');
        if (ctxLang) {
            const langLabels = data.byLang.length
                ? data.byLang.map(l => ({ fr:'FR',rn:'RN',rw:'RW',en:'EN' }[l.lang] || l.lang.toUpperCase()))
                : ['FR','RN','RW','EN'];
            const langAvg = data.byLang.length
                ? data.byLang.map(l => parseFloat(l.avg_stars))
                : [4.2, 3.9, 4.0, 4.5];
            this.charts.lang = new Chart(ctxLang, {
                type: 'bar',
                data: {
                    labels: langLabels,
                    datasets: [{
                        label: 'Note moyenne',
                        data: langAvg,
                        backgroundColor: ['#3b82f6','#10b981','#f59e0b','#8b5cf6'],
                        borderRadius: 6,
                        maxBarThickness: 40,
                    }],
                },
                options: {
                    ...baseOpts,
                    plugins: { legend: { display: false } },
                    scales: {
                        ...baseOpts.scales,
                        y: { ...baseOpts.scales.y, min: 0, max: 5 },
                    },
                },
            });
        }

        // 4. Activité marketplace (produits approuvés + crédits — démo)
        const ctxAct = document.getElementById('chart-activity');
        if (ctxAct) this.charts.activity = new Chart(ctxAct, {
            type: 'bar',
            data: {
                labels: demo.slice(-14).map(d => d.label),
                datasets: [
                    {
                        label: 'Visites',
                        data: demo.slice(-14).map(d => Math.round(d.visits / 20)),
                        backgroundColor: 'rgba(59,130,246,.6)',
                        borderRadius: 3,
                    },
                    {
                        label: 'Activité',
                        data: demo.slice(-14).map(d => Math.round(d.revenue / 10000)),
                        backgroundColor: 'rgba(245,158,11,.6)',
                        borderRadius: 3,
                    },
                ],
            },
            options: {
                ...baseOpts,
                plugins: { legend: { display: true, position: 'bottom', labels: { font: { size: 9 } } } },
            },
        });
    },

    /* ── Export CSV ──────────────────────────────────────── */
    async exportCSV() {
        const data = await this._fetchAllData();

        let csv = '\uFEFF'; // BOM UTF-8 pour Excel
        csv += 'UBUMWE Agri — Export Analytics\n';
        csv += `Généré le,${new Date().toLocaleString('fr-FR')}\n`;
        csv += `Source données,${data.source}\n\n`;

        csv += '== KPI GLOBAUX ==\n';
        csv += `Note moyenne,${data.avgRating}\n`;
        csv += `Total avis,${data.totalRatings}\n`;
        csv += `Visites aujourd\'hui,${data.visitsToday}\n`;
        csv += `Total visites (30j),${data.totalVisits}\n`;
        csv += `Produits approuvés,${data.approvedCount}\n`;
        csv += `Demandes crédit,${data.creditsCount}\n\n`;

        csv += '== VISITES PAR JOUR ==\nDate,Visites\n';
        data.visits.forEach(v => { csv += `${v.date},${v.count}\n`; });

        csv += '\n== RÉPARTITION NOTES ==\nÉtoiles,Nombre\n';
        [1,2,3,4,5].forEach((s, i) => { csv += `${s} étoile${s>1?'s':''},${data.starCounts[i]}\n`; });

        csv += '\n== AVIS DÉTAILLÉS ==\nDate,Note,Langue,Nom,Commentaire\n';
        data.recentRatings.forEach(r => {
            const d = new Date(r.date || r.created_at).toLocaleDateString('fr-FR');
            const c = (r.comment || '').replace(/"/g, '""');
            const n = (r.name || r.visitor_name || 'Anonyme').replace(/"/g, '""');
            csv += `${d},${r.stars},${r.lang || ''},"${n}","${c}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const a    = Object.assign(document.createElement('a'), {
            href: url,
            download: `ubumwe-analytics-${new Date().toISOString().split('T')[0]}.csv`,
        });
        a.click();
        URL.revokeObjectURL(url);
        showToast('CSV exporté avec succès !', 'success');
    },

    /* ── Reset local uniquement (Supabase non touché) ──── */
    resetStats() {
        if (!confirm('Réinitialiser les statistiques LOCALES ?\n(Les données Supabase sont conservées)')) return;
        [VISITS_KEY, REVENUE_KEY].forEach(k => localStorage.removeItem(k));
        showToast('Données locales réinitialisées.', 'warning');
        this.render();
    },
};

/* ─── Enregistre une visite à chaque chargement ─────────── */
superAdmin.recordVisit();
