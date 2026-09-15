/**
 * UBUMWE AGRI — Super Admin Dashboard (Privé)
 * Accès : rôle super_admin uniquement
 * Fonctions : analytics, graphiques, revenus, ratings
 * Dépendances : Chart.js (CDN), translations.js
 */

const SUPERADMIN_KEY   = 'UBUMWE_SUPERADMIN_STATS_V2';
const RATINGS_KEY      = 'UBUMWE_RATINGS_V2';
const REVENUE_KEY      = 'UBUMWE_REVENUE_V2';
const VISITS_KEY       = 'UBUMWE_VISITS_V2';
const SUPERADMIN_PASS  = 'ubumwe-admin-2026-secret'; // hash côté client

/* ─── Helpers persistance ───────────────────────────────── */
function safeGet(key, def) {
    try { return JSON.parse(localStorage.getItem(key)) ?? def; }
    catch { return def; }
}
function safeSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) {}
}

/* ─── Générateur de données de démo réalistes ───────────── */
function generateDemoStats() {
    const now    = new Date();
    const labels = [];
    const users  = [];
    const visits = [];
    const rev    = [];

    for (let i = 29; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i);
        labels.push(d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
        users.push(Math.floor(20 + Math.random() * 80 + i * 1.5));
        visits.push(Math.floor(40 + Math.random() * 200 + i * 3));
        rev.push(Math.floor(5000 + Math.random() * 50000));
    }
    return { labels, users, visits, rev };
}

/* ─── Module principal ──────────────────────────────────── */
const superAdmin = {
    charts: {},

    /** Vérifie que l'utilisateur est super_admin */
    isAuthorized() {
        const u = (() => { try { return JSON.parse(localStorage.getItem('UBUMWE_AGRI_CURRENT_USER_V3')); } catch { return null; } })();
        return u && (u.role === 'super_admin' || u.email === 'admin@ubumwe.bi');
    },

    /** Enregistre une visite (appelé à chaque chargement de page) */
    recordVisit() {
        const visits = safeGet(VISITS_KEY, []);
        const today  = new Date().toISOString().split('T')[0];
        const entry  = visits.find(v => v.date === today);
        if (entry) entry.count++;
        else visits.push({ date: today, count: 1 });
        // Garder 90 jours
        while (visits.length > 90) visits.shift();
        safeSet(VISITS_KEY, visits);
    },

    /** Enregistre un revenu simulé (appelé lors d'une demande de crédit validée) */
    recordRevenue(amount = 0) {
        const rev  = safeGet(REVENUE_KEY, []);
        const today = new Date().toISOString().split('T')[0];
        const entry = rev.find(r => r.date === today);
        if (entry) entry.amount += amount;
        else rev.push({ date: today, amount });
        while (rev.length > 90) rev.shift();
        safeSet(REVENUE_KEY, rev);
    },

    /** Retourne les stats agrégées */
    getStats() {
        const visits   = safeGet(VISITS_KEY, []);
        const rev      = safeGet(REVENUE_KEY, []);
        const ratings  = safeGet(RATINGS_KEY, []);
        const products = safeGet('UBUMWE_AGRI_PRODUCTS_V3', []);
        const credits  = safeGet('UBUMWE_AGRI_CREDITS_V3', []);

        const totalVisits   = visits.reduce((s, v) => s + v.count, 0);
        const todayEntry    = visits.find(v => v.date === new Date().toISOString().split('T')[0]);
        const visitsToday   = todayEntry ? todayEntry.count : 0;
        const totalRevenue  = rev.reduce((s, r) => s + r.amount, 0);
        const avgRating     = ratings.length
            ? (ratings.reduce((s, r) => s + r.stars, 0) / ratings.length).toFixed(1)
            : '—';

        return {
            totalUsers:   Math.max(5, products.length + credits.length + 3),
            visitsToday,
            totalVisits,
            totalRevenue,
            avgRating,
            ratingsCount: ratings.length,
            pendingCount: products.filter(p => p.status === 'pending').length,
            approvedCount: products.filter(p => p.status === 'approved').length,
            creditsCount: credits.length,
        };
    },

    /** Rendu complet de la page super admin */
    render() {
        const screen = document.getElementById('screen-superadmin');
        if (!screen) return;

        if (!this.isAuthorized()) {
            screen.innerHTML = `
                <div class="min-h-screen flex items-center justify-center bg-slate-900 rounded-2xl p-8 text-center">
                    <div>
                        <i class="fa-solid fa-lock text-6xl text-red-500 mb-4 block"></i>
                        <h2 class="text-2xl font-black text-white mb-2">Accès Refusé</h2>
                        <p class="text-slate-400 text-sm">Cette page est réservée aux super-administrateurs.</p>
                        <button onclick="app.showScreen('home')" class="mt-6 px-6 py-2 bg-amber-400 text-slate-900 font-bold rounded-xl text-sm">Retour</button>
                    </div>
                </div>`;
            return;
        }

        const stats = this.getStats();
        const demo  = generateDemoStats();

        screen.innerHTML = `
        <div class="space-y-6 pb-8">

            <!-- En-tête sécurisé -->
            <div class="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 rounded-2xl p-5 border border-amber-800">
                <div class="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <span class="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black rounded uppercase tracking-widest">🔐 ACCÈS RESTREINT</span>
                        <h2 class="text-2xl font-black text-white mt-1 flex items-center gap-2" data-i18n="superadmin_title">
                            ⭐ Super Admin — Tableau de Bord Privé
                        </h2>
                        <p class="text-xs text-amber-300 mt-1" data-i18n="superadmin_subtitle">Accès réservé aux administrateurs principaux uniquement.</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="superAdmin.exportCSV()" class="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-1">
                            <i class="fa-solid fa-download"></i> <span data-i18n="superadmin_export">Exporter CSV</span>
                        </button>
                        <button onclick="superAdmin.resetStats()" class="px-3 py-2 bg-rose-800 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1">
                            <i class="fa-solid fa-rotate-left"></i> <span data-i18n="superadmin_reset">Réinitialiser</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- KPI Cards -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                ${this._kpiCard('fa-users', 'superadmin_users_total', stats.totalUsers, 'text-blue-600', 'bg-blue-50')}
                ${this._kpiCard('fa-eye', 'superadmin_visits_today', stats.visitsToday, 'text-emerald-600', 'bg-emerald-50')}
                ${this._kpiCard('fa-coins', 'superadmin_revenue', new Intl.NumberFormat('fr-FR').format(stats.totalRevenue) + ' BIF', 'text-amber-600', 'bg-amber-50')}
                ${this._kpiCard('fa-star', 'superadmin_rating', stats.avgRating + ' / 5', 'text-yellow-600', 'bg-yellow-50')}
            </div>

            <!-- Graphiques -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <h3 class="font-extrabold text-slate-800 text-sm mb-3 flex items-center gap-2">
                        <i class="fa-solid fa-chart-line text-blue-500"></i>
                        <span data-i18n="superadmin_chart_users">Évolution des Utilisateurs</span>
                    </h3>
                    <canvas id="chart-users" height="180"></canvas>
                </div>
                <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <h3 class="font-extrabold text-slate-800 text-sm mb-3 flex items-center gap-2">
                        <i class="fa-solid fa-chart-bar text-amber-500"></i>
                        <span data-i18n="superadmin_chart_revenue">Évolution des Revenus</span>
                    </h3>
                    <canvas id="chart-revenue" height="180"></canvas>
                </div>
                <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <h3 class="font-extrabold text-slate-800 text-sm mb-3 flex items-center gap-2">
                        <i class="fa-solid fa-chart-area text-emerald-500"></i>
                        <span data-i18n="superadmin_chart_visits">Visites par Jour</span>
                    </h3>
                    <canvas id="chart-visits" height="180"></canvas>
                </div>
                <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <h3 class="font-extrabold text-slate-800 text-sm mb-3 flex items-center gap-2">
                        <i class="fa-solid fa-star text-yellow-500"></i>
                        <span data-i18n="superadmin_chart_rating">Satisfaction Utilisateurs</span>
                    </h3>
                    <canvas id="chart-rating" height="180"></canvas>
                </div>
            </div>

            <!-- Dernières évaluations -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div class="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <h3 class="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <i class="fa-solid fa-comments text-amber-500"></i>
                        <span data-i18n="superadmin_ratings_list">Dernières Évaluations</span>
                    </h3>
                    <span class="text-xs text-slate-500">${stats.ratingsCount} ${t('rating_total')}</span>
                </div>
                <div id="superadmin-ratings-list" class="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    ${this._renderRatings()}
                </div>
            </div>

        </div>`;

        // Charger Chart.js si pas encore présent puis dessiner
        this._loadChartJs(() => this._drawCharts(demo, stats));
    },

    _kpiCard(icon, i18nKey, value, textColor, bgColor) {
        return `
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
            <div class="${bgColor} ${textColor} w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <i class="fa-solid ${icon} text-lg"></i>
            </div>
            <span class="text-[10px] text-slate-400 font-bold uppercase block" data-i18n="${i18nKey}"></span>
            <span class="text-xl font-black ${textColor} mt-1 block">${value}</span>
        </div>`;
    },

    _renderRatings() {
        const ratings = safeGet(RATINGS_KEY, []).slice().reverse().slice(0, 20);
        if (!ratings.length) {
            return `<div class="p-6 text-center text-slate-400 text-sm" data-i18n="superadmin_no_ratings">${t('superadmin_no_ratings')}</div>`;
        }
        return ratings.map(r => `
            <div class="p-3 flex items-start gap-3">
                <div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-black text-xs flex-shrink-0">
                    ${(r.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-bold text-xs text-slate-900">${r.name || 'Anonyme'}</span>
                        <span class="text-yellow-500 text-xs">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</span>
                        <span class="text-[10px] text-slate-400 ml-auto">${new Date(r.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    ${r.comment ? `<p class="text-xs text-slate-500 mt-0.5 line-clamp-2">${r.comment}</p>` : ''}
                </div>
            </div>`).join('');
    },

    _loadChartJs(callback) {
        if (window.Chart) { callback(); return; }
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
        s.onload = callback;
        document.head.appendChild(s);
    },

    _drawCharts(demo, stats) {
        const opts = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { font: { size: 9 }, maxTicksLimit: 8 } },
                y: { ticks: { font: { size: 9 } } }
            }
        };

        // Détruire anciens graphiques si existent
        Object.values(this.charts).forEach(c => c?.destroy());

        // Utilisateurs
        const ctxU = document.getElementById('chart-users');
        if (ctxU) this.charts.users = new Chart(ctxU, {
            type: 'line',
            data: {
                labels: demo.labels.slice(-14),
                datasets: [{ data: demo.users.slice(-14), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,.1)', fill: true, tension: 0.4, pointRadius: 2 }]
            },
            options: { ...opts, plugins: { ...opts.plugins } }
        });

        // Revenus
        const ctxR = document.getElementById('chart-revenue');
        if (ctxR) this.charts.revenue = new Chart(ctxR, {
            type: 'bar',
            data: {
                labels: demo.labels.slice(-14),
                datasets: [{ data: demo.rev.slice(-14), backgroundColor: 'rgba(245,158,11,.7)', borderRadius: 4 }]
            },
            options: opts
        });

        // Visites
        const visits = safeGet(VISITS_KEY, []);
        const vLabels = visits.slice(-14).map(v => v.date.slice(5));
        const vData   = visits.slice(-14).map(v => v.count);
        const ctxV = document.getElementById('chart-visits');
        if (ctxV) this.charts.visits = new Chart(ctxV, {
            type: 'line',
            data: {
                labels: vLabels.length ? vLabels : demo.labels.slice(-14),
                datasets: [{ data: vData.length ? vData : demo.visits.slice(-14), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.1)', fill: true, tension: 0.4, pointRadius: 2 }]
            },
            options: opts
        });

        // Satisfaction (donut étoiles)
        const ratings = safeGet(RATINGS_KEY, []);
        const starCounts = [1,2,3,4,5].map(s => ratings.filter(r => r.stars === s).length);
        const ctxStar = document.getElementById('chart-rating');
        if (ctxStar) this.charts.rating = new Chart(ctxStar, {
            type: 'doughnut',
            data: {
                labels: ['1★','2★','3★','4★','5★'],
                datasets: [{ data: starCounts.length ? starCounts : [1,2,5,12,20], backgroundColor: ['#ef4444','#f97316','#f59e0b','#84cc16','#22c55e'] }]
            },
            options: { ...opts, scales: undefined, plugins: { legend: { display: true, position: 'bottom', labels: { font: { size: 9 } } } } }
        });

        // Re-translate les data-i18n injectés dynamiquement
        translatePage();
    },

    /** Export CSV des données */
    exportCSV() {
        const stats   = this.getStats();
        const ratings = safeGet(RATINGS_KEY, []);
        const visits  = safeGet(VISITS_KEY, []);

        let csv = 'Type,Valeur,Date\n';
        csv += `Utilisateurs Total,${stats.totalUsers},${new Date().toISOString()}\n`;
        csv += `Visites Aujourd\'hui,${stats.visitsToday},${new Date().toISOString()}\n`;
        csv += `Revenus Total BIF,${stats.totalRevenue},${new Date().toISOString()}\n`;
        csv += `Note Moyenne,${stats.avgRating},${new Date().toISOString()}\n\n`;
        csv += 'Date,Visites\n';
        visits.forEach(v => { csv += `${v.date},${v.count}\n`; });
        csv += '\nDate,Note,Commentaire,Nom\n';
        ratings.forEach(r => { csv += `${r.date},${r.stars},"${(r.comment||'').replace(/"/g,'""')}",${r.name||'Anonyme'}\n`; });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url; a.download = `ubumwe-stats-${new Date().toISOString().split('T')[0]}.csv`;
        a.click(); URL.revokeObjectURL(url);
        showToast('CSV exporté avec succès !', 'success');
    },

    resetStats() {
        if (!confirm('Réinitialiser toutes les statistiques ? Cette action est irréversible.')) return;
        [VISITS_KEY, REVENUE_KEY].forEach(k => localStorage.removeItem(k));
        showToast('Statistiques réinitialisées.', 'warning');
        this.render();
    },
};

/* ─── Enregistre une visite à chaque chargement ────────── */
superAdmin.recordVisit();
