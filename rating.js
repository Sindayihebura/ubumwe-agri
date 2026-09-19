/**
 * UBUMWE AGRI — Système de Notation 5 Étoiles
 * Persistance : Supabase (online) → localStorage (fallback offline)
 * Globale : tout le monde voit la vraie moyenne depuis Supabase
 * Privée  : les commentaires détaillés sont réservés au Super Admin
 *
 * Architecture :
 *   - Un seul vote par session (session_key = fingerprint léger)
 *   - Vote anonyme autorisé (pas besoin de compte)
 *   - Données locales synchronisées avec Supabase dès qu'on est online
 */

/* ─── Clés localStorage ──────────────────────────────────── */
const RATINGS_STORE   = 'UBUMWE_RATINGS_V2';
const USER_RATED_KEY  = 'UBUMWE_USER_RATED_V2';
const GLOBAL_AVG_KEY  = 'UBUMWE_GLOBAL_AVG_V2';    // cache de la moyenne Supabase

/* ─── Génère une clé de session stable (pas PII) ─────────── */
function _ratingSessionKey() {
    const stored = sessionStorage.getItem('_ubumwe_sk');
    if (stored) return stored;
    const key = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem('_ubumwe_sk', key);
    return key;
}

/* ─── Helpers Supabase ───────────────────────────────────── */
function _getSupabase() {
    return (typeof window._ubumweSupabase !== 'undefined' && window._ubumweSupabase)
        ? window._ubumweSupabase
        : null;
}

/* ─── Module principal ───────────────────────────────────── */
const ratingApp = {
    selectedStars: 0,
    _globalAvg:    null,   // moyenne Supabase en cache
    _globalCount:  null,   // nombre total de votes Supabase

    /* ── Initialise le widget ─────────────────────────────── */
    async init() {
        const container = document.getElementById('rating-widget');
        if (!container) return;

        // Charger la moyenne globale depuis Supabase en arrière-plan
        await this._loadGlobalStats();

        container.innerHTML = this._buildWidget();
        this._attachStarListeners();
    },

    /* ── Charge les stats globales (vraie moyenne multi-utilisateurs) ── */
    async _loadGlobalStats() {
        const sb = _getSupabase();
        if (sb) {
            try {
                // Utiliser la vue rating_stats définie dans schema.sql
                const { data, error } = await sb
                    .from('rating_stats')
                    .select('total_ratings, average_stars')
                    .single();

                if (!error && data) {
                    this._globalAvg   = data.average_stars
                        ? parseFloat(data.average_stars).toFixed(1)
                        : null;
                    this._globalCount = data.total_ratings ?? 0;
                    // Mettre en cache pour l'affichage offline
                    try {
                        localStorage.setItem(GLOBAL_AVG_KEY, JSON.stringify({
                            avg: this._globalAvg,
                            count: this._globalCount,
                            ts: Date.now()
                        }));
                    } catch (_) {}
                    return;
                }
            } catch (_) {}
        }

        // Fallback : cache localStorage (valide 10 minutes)
        try {
            const cached = JSON.parse(localStorage.getItem(GLOBAL_AVG_KEY));
            if (cached && (Date.now() - cached.ts < 600_000)) {
                this._globalAvg   = cached.avg;
                this._globalCount = cached.count;
                return;
            }
        } catch (_) {}

        // Dernier recours : calculer depuis les votes locaux
        const local = this._getLocalRatings();
        if (local.length > 0) {
            const sum = local.reduce((s, r) => s + r.stars, 0);
            this._globalAvg   = (sum / local.length).toFixed(1);
            this._globalCount = local.length;
        }
    },

    /* ── Construit le HTML du widget ─────────────────────── */
    _buildWidget() {
        const hasRated = localStorage.getItem(USER_RATED_KEY);
        const avg      = this._globalAvg   ?? '—';
        const count    = this._globalCount ?? 0;

        if (hasRated) {
            return `
            <div class="bg-white rounded-2xl border border-amber-200 shadow-sm p-5 text-center space-y-3">
                <div class="text-4xl">⭐</div>
                <h3 class="font-extrabold text-slate-900 text-sm" data-i18n="rating_title">${t('rating_title')}</h3>

                <!-- Étoiles moyenne globale -->
                <div class="flex items-center justify-center gap-0.5">
                    ${[1,2,3,4,5].map(s => `
                    <span class="text-2xl ${parseFloat(avg) >= s ? 'text-yellow-400' : 'text-slate-200'}">★</span>`
                    ).join('')}
                </div>
                <div class="text-slate-700 text-sm font-black">${avg}<span class="text-slate-400 font-normal"> / 5</span></div>
                <div class="text-xs text-slate-400">${count} ${t('rating_total')}</div>

                <div class="text-xs text-emerald-600 font-bold flex items-center justify-center gap-1">
                    <i class="fa-solid fa-circle-check"></i>
                    <span data-i18n="rating_thanks">${t('rating_thanks')}</span>
                </div>
            </div>`;
        }

        return `
        <div class="bg-white rounded-2xl border border-amber-200 shadow-sm p-5 space-y-4">

            <!-- En-tête -->
            <div class="text-center">
                <div class="text-3xl mb-2">🌾</div>
                <h3 class="font-extrabold text-slate-900 text-sm" data-i18n="rating_title">${t('rating_title')}</h3>
                <p class="text-xs text-slate-500 mt-1" data-i18n="rating_subtitle">${t('rating_subtitle')}</p>
            </div>

            <!-- Étoiles interactives -->
            <div class="flex items-center justify-center gap-1" id="rating-stars-row"
                 role="radiogroup" aria-label="${t('rating_title')}">
                ${[1,2,3,4,5].map(s => `
                <button class="star-btn text-3xl text-slate-200 transition-transform hover:scale-125 focus:outline-none"
                        data-star="${s}"
                        title="${t('rating_label_' + s)}"
                        aria-label="${s} étoile${s > 1 ? 's' : ''}"
                        role="radio" aria-checked="false">★</button>`).join('')}
            </div>
            <p id="rating-label" class="text-center text-xs font-bold text-amber-600 h-4"></p>

            <!-- Moyenne globale -->
            <div class="flex items-center justify-center gap-2 text-xs text-slate-400">
                <span class="text-yellow-400 font-black text-base" id="rating-live-avg">${avg}</span>
                <span class="text-yellow-400">★</span>
                <span id="rating-live-count">${count}</span>
                <span>${t('rating_total')}</span>
            </div>

            <!-- Commentaire optionnel -->
            <textarea id="rating-comment"
                class="w-full text-xs border border-slate-200 rounded-xl p-3 resize-none focus:ring-2 focus:ring-amber-300 focus:outline-none"
                rows="2" maxlength="500"
                data-i18n-placeholder="rating_placeholder"
                placeholder="${t('rating_placeholder')}"></textarea>

            <!-- Bouton soumettre -->
            <button id="rating-submit-btn"
                onclick="ratingApp.submit()"
                disabled
                class="w-full py-2.5 bg-amber-400 text-slate-900 font-extrabold rounded-xl text-xs opacity-40 cursor-not-allowed transition"
                data-i18n="rating_submit">${t('rating_submit')}</button>

            <!-- Indicateur de sync -->
            <p id="rating-sync-status" class="text-center text-[10px] text-slate-400 hidden"></p>
        </div>`;
    },

    /* ── Attache les listeners après injection dans le DOM ── */
    _attachStarListeners() {
        document.querySelectorAll('.star-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectStar(parseInt(btn.dataset.star)));
            btn.addEventListener('mouseenter', () => this._previewStars(parseInt(btn.dataset.star)));
        });
        document.getElementById('rating-stars-row')
            ?.addEventListener('mouseleave', () => this._previewStars(this.selectedStars));
    },

    /* ── Aperçu au survol ──────────────────────────────────── */
    _previewStars(n) {
        document.querySelectorAll('.star-btn').forEach((btn, i) => {
            btn.classList.toggle('text-yellow-300', i < n && n !== this.selectedStars);
            btn.classList.toggle('text-yellow-400', i < this.selectedStars);
            btn.classList.toggle('text-slate-200',  i >= Math.max(n, this.selectedStars));
        });
    },

    /* ── Sélection définitive d'une note ─────────────────── */
    selectStar(n) {
        this.selectedStars = n;
        document.querySelectorAll('.star-btn').forEach((btn, i) => {
            btn.classList.toggle('text-yellow-400', i < n);
            btn.classList.toggle('text-slate-200',  i >= n);
            btn.setAttribute('aria-checked', String(i === n - 1));
        });
        const lbl = document.getElementById('rating-label');
        if (lbl) lbl.textContent = t('rating_label_' + n);

        const submitBtn = document.getElementById('rating-submit-btn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-40', 'cursor-not-allowed');
            submitBtn.classList.add('hover:bg-amber-300', 'active:bg-amber-500');
        }
    },

    /* ── Soumettre le vote ────────────────────────────────── */
    async submit() {
        if (!this.selectedStars) return;

        const submitBtn = document.getElementById('rating-submit-btn');
        const syncStatus = document.getElementById('rating-sync-status');

        // UI : état chargement
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ Envoi…';
        }

        const comment = (document.getElementById('rating-comment')?.value || '').trim();
        const user    = (() => {
            try { return JSON.parse(localStorage.getItem('UBUMWE_AGRI_CURRENT_USER_V3')); }
            catch { return null; }
        })();
        const name    = user?.fullName || user?.email?.split('@')[0] || 'Visiteur';
        const lang    = (typeof currentLang !== 'undefined' ? currentLang : null) || 'fr';
        const sessionKey = _ratingSessionKey();

        const entry = {
            stars:        this.selectedStars,
            comment,
            name,
            lang,
            date:         new Date().toISOString(),
            synced:       false,
        };

        /* ── 1. Sauvegarder localement d'abord (toujours fiable) ── */
        this._saveLocal(entry);
        localStorage.setItem(USER_RATED_KEY, '1');

        /* ── 2. Tenter la sync Supabase ───────────────────── */
        const sb = _getSupabase();
        let savedToSupabase = false;

        if (sb && navigator.onLine) {
            try {
                const { error } = await sb.from('site_ratings').insert([{
                    user_id:       user?.id   || null,
                    visitor_name:  name,
                    visitor_email: user?.email || null,
                    stars:         this.selectedStars,
                    comment:       comment || null,
                    lang,
                    user_agent:    navigator.userAgent.slice(0, 250),
                    session_key:   sessionKey,
                }]);

                if (!error) {
                    savedToSupabase = true;
                    // Marquer l'entrée locale comme synchronisée
                    const local = this._getLocalRatings();
                    if (local.length > 0) {
                        local[local.length - 1].synced = true;
                        localStorage.setItem(RATINGS_STORE, JSON.stringify(local));
                    }
                } else if (error.code === '23505') {
                    // session_key déjà utilisé = vote dupliqué, on ignore silencieusement
                    savedToSupabase = true;
                }
            } catch (err) {
                console.warn('[Rating] Supabase save failed, kept locally:', err.message);
            }
        }

        /* ── 3. Feedback utilisateur ─────────────────────── */
        if (syncStatus) {
            syncStatus.classList.remove('hidden');
            syncStatus.textContent = savedToSupabase
                ? '✅ Merci ! Votre avis a été enregistré.'
                : '📱 Avis enregistré localement (sync au prochain accès internet).';
        }

        showToast(t('toast_rating_saved'), 'success');

        // Re-charger les stats globales puis ré-afficher le widget "merci"
        await this._loadGlobalStats();
        setTimeout(() => this.init(), 1500);
    },

    /* ── Synchroniser les votes locaux non envoyés ────────── */
    async syncPendingRatings() {
        const sb = _getSupabase();
        if (!sb || !navigator.onLine) return;

        const local   = this._getLocalRatings();
        const pending = local.filter(r => !r.synced);
        if (!pending.length) return;

        for (const r of pending) {
            try {
                const sessionKey = `offline-${r.date}-${Math.random().toString(36).slice(2,8)}`;
                const { error } = await sb.from('site_ratings').insert([{
                    visitor_name: r.name  || 'Visiteur',
                    stars:        r.stars,
                    comment:      r.comment || null,
                    lang:         r.lang   || 'fr',
                    session_key:  sessionKey,
                }]);
                if (!error || error.code === '23505') r.synced = true;
            } catch (_) {}
        }

        localStorage.setItem(RATINGS_STORE, JSON.stringify(local));
    },

    /* ── Persistance locale ───────────────────────────────── */
    _saveLocal(entry) {
        const ratings = this._getLocalRatings();
        ratings.push(entry);
        if (ratings.length > 500) ratings.splice(0, ratings.length - 500);
        localStorage.setItem(RATINGS_STORE, JSON.stringify(ratings));
    },

    _getLocalRatings() {
        try { return JSON.parse(localStorage.getItem(RATINGS_STORE)) || []; }
        catch { return []; }
    },

    /* ── Met à jour le badge de note globale ──────────────── */
    _updateDisplay() {
        const badge = document.getElementById('rating-global-badge');
        if (!badge) return;
        const avg   = this._globalAvg   ?? '—';
        const count = this._globalCount ?? 0;
        badge.textContent = `${avg}★ (${count})`;
    },
};

/* ─── Auto-sync des votes offline quand internet revient ─── */
window.addEventListener('online', () => {
    ratingApp.syncPendingRatings();
});
