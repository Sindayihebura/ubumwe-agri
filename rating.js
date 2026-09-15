/**
 * UBUMWE AGRI — Système de Notation 5 Étoiles
 * Visible par tous les visiteurs
 * Résultats accessibles dans le Super Admin Dashboard
 */

const RATINGS_STORE = 'UBUMWE_RATINGS_V2';
const USER_RATED_KEY = 'UBUMWE_USER_RATED_V2';

const ratingApp = {
    selectedStars: 0,

    /** Initialise le widget de notation (injecté dans le footer ou section dédiée) */
    init() {
        const container = document.getElementById('rating-widget');
        if (!container) return;
        container.innerHTML = this._buildWidget();
        this._updateDisplay();
    },

    _buildWidget() {
        const ratings = this._getRatings();
        const avg     = ratings.length
            ? (ratings.reduce((s, r) => s + r.stars, 0) / ratings.length).toFixed(1)
            : '—';
        const hasRated = localStorage.getItem(USER_RATED_KEY);

        if (hasRated) {
            return `
            <div class="bg-white rounded-2xl border border-amber-200 shadow-sm p-5 text-center space-y-3">
                <div class="text-4xl">⭐</div>
                <h3 class="font-extrabold text-slate-900 text-sm" data-i18n="rating_title">${t('rating_title')}</h3>
                <div class="flex items-center justify-center gap-1">
                    ${[1,2,3,4,5].map(s =>
                        `<span class="text-2xl ${Number(avg) >= s ? 'text-yellow-400' : 'text-slate-200'}">★</span>`
                    ).join('')}
                </div>
                <div class="text-slate-500 text-sm font-bold">${avg} / 5</div>
                <div class="text-xs text-slate-400">${ratings.length} ${t('rating_total')}</div>
                <div class="text-xs text-emerald-600 font-bold flex items-center justify-center gap-1">
                    <i class="fa-solid fa-circle-check"></i>
                    <span data-i18n="rating_thanks">${t('rating_thanks')}</span>
                </div>
            </div>`;
        }

        return `
        <div class="bg-white rounded-2xl border border-amber-200 shadow-sm p-5 space-y-4" id="rating-form-card">
            <div class="text-center">
                <div class="text-3xl mb-2">🌾</div>
                <h3 class="font-extrabold text-slate-900 text-sm" data-i18n="rating_title">${t('rating_title')}</h3>
                <p class="text-xs text-slate-500 mt-1" data-i18n="rating_subtitle">${t('rating_subtitle')}</p>
            </div>

            <!-- Étoiles interactives -->
            <div class="flex items-center justify-center gap-1" id="rating-stars-row" role="radiogroup" aria-label="${t('rating_title')}">
                ${[1,2,3,4,5].map(s => `
                <button
                    class="text-3xl transition-transform hover:scale-125 text-slate-200 star-btn focus:outline-none"
                    data-star="${s}"
                    onclick="ratingApp.selectStar(${s})"
                    title="${t('rating_label_' + s)}"
                    aria-label="${s} étoile${s > 1 ? 's' : ''}"
                    role="radio">★</button>`).join('')}
            </div>
            <div id="rating-label" class="text-center text-xs font-bold text-amber-600 h-4"></div>

            <!-- Score global -->
            <div class="flex items-center justify-center gap-2 text-xs text-slate-400">
                <span class="text-yellow-400 font-black text-base">${avg}</span>
                <span class="text-yellow-400">★</span>
                <span>${ratings.length} ${t('rating_total')}</span>
            </div>

            <!-- Commentaire -->
            <textarea id="rating-comment"
                class="w-full text-xs border border-slate-200 rounded-xl p-3 resize-none focus:ring-2 focus:ring-amber-300 focus:outline-none"
                rows="2"
                placeholder="${t('rating_placeholder')}"
                data-i18n-placeholder="rating_placeholder"
                maxlength="200"></textarea>

            <!-- Bouton envoyer -->
            <button id="rating-submit-btn"
                onclick="ratingApp.submit()"
                disabled
                class="w-full py-2.5 bg-amber-400 text-slate-900 font-extrabold rounded-xl text-xs opacity-40 cursor-not-allowed transition"
                data-i18n="rating_submit">
                ${t('rating_submit')}
            </button>
        </div>`;
    },

    selectStar(n) {
        this.selectedStars = n;
        // Animer les étoiles
        document.querySelectorAll('.star-btn').forEach((btn, i) => {
            const filled = i < n;
            btn.classList.toggle('text-yellow-400', filled);
            btn.classList.toggle('text-slate-200', !filled);
            btn.setAttribute('aria-checked', String(i === n - 1));
        });
        // Label
        const label = document.getElementById('rating-label');
        if (label) label.textContent = t('rating_label_' + n);
        // Activer le bouton
        const btn = document.getElementById('rating-submit-btn');
        if (btn) {
            btn.disabled = false;
            btn.classList.remove('opacity-40', 'cursor-not-allowed');
            btn.classList.add('hover:bg-amber-300');
        }
    },

    submit() {
        if (!this.selectedStars) return;
        const comment  = (document.getElementById('rating-comment')?.value || '').trim();
        const user     = (() => { try { return JSON.parse(localStorage.getItem('UBUMWE_AGRI_CURRENT_USER_V3')); } catch { return null; } })();
        const name     = user?.fullName || user?.email?.split('@')[0] || 'Visiteur';

        const ratings = this._getRatings();
        ratings.push({
            stars:   this.selectedStars,
            comment,
            name,
            date:    new Date().toISOString(),
            lang:    currentLang || 'fr',
        });
        // Garder les 500 dernières
        if (ratings.length > 500) ratings.splice(0, ratings.length - 500);
        localStorage.setItem(RATINGS_STORE, JSON.stringify(ratings));
        localStorage.setItem(USER_RATED_KEY, '1');

        showToast(t('toast_rating_saved'), 'success');
        this.init(); // Rechargement pour afficher merci
    },

    _getRatings() {
        try { return JSON.parse(localStorage.getItem(RATINGS_STORE)) || []; }
        catch { return []; }
    },

    _updateDisplay() {
        // Mettre à jour le compteur dans le footer si présent
        const badge = document.getElementById('rating-global-badge');
        if (!badge) return;
        const ratings = this._getRatings();
        const avg = ratings.length
            ? (ratings.reduce((s, r) => s + r.stars, 0) / ratings.length).toFixed(1)
            : '—';
        badge.textContent = `${avg}★ (${ratings.length})`;
    },
};
