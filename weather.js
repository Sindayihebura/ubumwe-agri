/**
 * UBUMWE AGRI — Module Météo Temps Réel
 * API : Open-Meteo (gratuit, sans clé)
 * Coordonnées GPS des 5 provinces du Burundi (Réforme 2025)
 * Impact sur le score de crédit agronomique (+/- points)
 */

const PROVINCE_COORDS = {
    'GITEGA':      { lat: -3.4271,  lon: 29.9247, name: 'Gitega' },
    'BUJUMBURA':   { lat: -3.3822,  lon: 29.3613, name: 'Bujumbura' },
    'BUTANYERERA': { lat: -2.9080,  lon: 29.8313, name: 'Ngozi (Butanyerera)' },
    'BURUNGA':     { lat: -4.1369,  lon: 29.8003, name: 'Makamba (Burunga)' },
    'BUHUMUZA':    { lat: -3.0448,  lon: 30.5394, name: 'Cankuzo (Buhumuza)' },
};

const WEATHER_CACHE_KEY = 'UBUMWE_WEATHER_CACHE_V2';
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

const weatherApp = {
    currentData: null,
    currentProvince: null,

    /**
     * Charge la météo pour une province donnée
     * @param {string} province - ex: 'GITEGA'
     * @returns {Promise<object|null>}
     */
    async fetchWeather(province) {
        const coords = PROVINCE_COORDS[province?.toUpperCase()];
        if (!coords) return null;
        if (!navigator.onLine) return this.getCached(province);

        // Vérifier le cache
        const cached = this.getCached(province);
        if (cached) return cached;

        try {
            const url = `https://api.open-meteo.com/v1/forecast?`
                + `latitude=${coords.lat}&longitude=${coords.lon}`
                + `&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code`
                + `&timezone=Africa%2FBujumbura&forecast_days=1`;

            const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();

            const weather = {
                province,
                provinceName: coords.name,
                temp:       data.current.temperature_2m,
                humidity:   data.current.relative_humidity_2m,
                rain:       data.current.precipitation,
                wind:       data.current.wind_speed_10m,
                code:       data.current.weather_code,
                icon:       this.getIcon(data.current.weather_code),
                label:      this.getLabel(data.current.weather_code),
                scoreImpact: this.computeScoreImpact(data.current),
                fetchedAt:  Date.now(),
            };

            this.cacheWeather(province, weather);
            this.currentData = weather;
            this.currentProvince = province;
            return weather;
        } catch (e) {
            console.warn('[Weather] Erreur fetch:', e.message);
            return this.getCached(province);
        }
    },

    /**
     * Calcule l'impact météo sur le score de crédit (+10 à -15 points)
     */
    computeScoreImpact(current) {
        const rain      = current.precipitation || 0;
        const humidity  = current.relative_humidity_2m || 50;
        const temp      = current.temperature_2m || 22;
        const code      = current.weather_code || 0;

        let impact = 0;
        let reason = '';
        let type   = 'neutral'; // 'good' | 'bad' | 'neutral'

        // Pluie modérée = idéale pour agriculture
        if (rain > 0 && rain <= 5) {
            impact = +8; reason = t('weather_good'); type = 'good';
        } else if (rain > 5 && rain <= 15) {
            impact = +5; reason = t('weather_optimal'); type = 'good';
        } else if (rain > 15) {
            impact = -10; reason = t('weather_flood'); type = 'bad';
        }

        // Sécheresse
        if (rain === 0 && humidity < 40) {
            impact = Math.min(impact, -8);
            reason = t('weather_drought'); type = 'bad';
        }

        // Températures extrêmes
        if (temp > 35) { impact -= 5; type = 'bad'; }
        if (temp < 10) { impact -= 5; type = 'bad'; }

        // Conditions optimales (temp 18-28°C, humidité 50-80%, légère pluie)
        if (temp >= 18 && temp <= 28 && humidity >= 50 && humidity <= 80 && rain >= 0.5 && rain <= 8) {
            impact = Math.max(impact, +10);
            reason = t('weather_optimal'); type = 'good';
        }

        // Orages / Tempêtes (code WMO 95+)
        if (code >= 95) {
            impact = Math.min(impact, -12); reason = '⛈️ Orage imminent'; type = 'bad';
        }

        return { points: Math.max(-15, Math.min(+15, impact)), reason, type };
    },

    getIcon(code) {
        if (code === 0)               return '☀️';
        if (code <= 3)                return '⛅';
        if (code <= 49)               return '🌫️';
        if (code <= 67)               return '🌧️';
        if (code <= 77)               return '❄️';
        if (code <= 82)               return '🌦️';
        if (code >= 95)               return '⛈️';
        return '🌤️';
    },

    getLabel(code) {
        if (code === 0)  return 'Ciel dégagé';
        if (code <= 3)   return 'Nuageux';
        if (code <= 49)  return 'Brouillard';
        if (code <= 67)  return 'Pluie';
        if (code <= 77)  return 'Neige / Grêle';
        if (code <= 82)  return 'Averses';
        if (code >= 95)  return 'Orage';
        return 'Variable';
    },

    cacheWeather(province, data) {
        try {
            const cache = JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY) || '{}');
            cache[province] = data;
            localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cache));
        } catch (_) {}
    },

    getCached(province) {
        try {
            const cache = JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY) || '{}');
            const entry = cache[province];
            if (entry && (Date.now() - entry.fetchedAt) < CACHE_DURATION_MS) return entry;
        } catch (_) {}
        return null;
    },

    /**
     * Rendu du widget météo dans le formulaire de scoring
     */
    async renderWidget(province) {
        const container = document.getElementById('weather-widget');
        if (!container) return;

        container.classList.remove('hidden');
        container.innerHTML = `
            <div class="flex items-center gap-2 text-xs text-slate-500">
                <div class="animate-spin w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
                <span data-i18n="scoring_weather_loading">${t('scoring_weather_loading')}</span>
            </div>`;

        const w = await this.fetchWeather(province);
        if (!w) {
            container.innerHTML = `
                <div class="flex items-center gap-2 text-xs text-slate-400">
                    <i class="fa-solid fa-wifi-slash"></i>
                    <span data-i18n="scoring_weather_offline">${t('scoring_weather_offline')}</span>
                </div>`;
            return;
        }

        const impactColor = w.scoreImpact.type === 'good'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : w.scoreImpact.type === 'bad'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-slate-50 border-slate-200 text-slate-700';

        const impactSign = w.scoreImpact.points >= 0 ? '+' : '';

        container.innerHTML = `
            <div class="rounded-xl border ${impactColor} p-3 space-y-2">
                <div class="flex items-center justify-between flex-wrap gap-2">
                    <div class="flex items-center gap-2">
                        <span class="text-2xl">${w.icon}</span>
                        <div>
                            <div class="text-xs font-extrabold">${w.label} — ${w.provinceName}</div>
                            <div class="text-[10px] opacity-75">${t('weather_title')}</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-lg font-black">${w.temp}°C</div>
                        <div class="text-[10px] opacity-75">
                            💧 ${w.humidity}% · 🌧 ${w.rain}mm · 💨 ${w.wind}km/h
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-2 pt-1 border-t border-current/20">
                    <span class="text-[10px] font-bold opacity-75">${t('weather_impact')}</span>
                    <span class="font-black text-sm">${impactSign}${w.scoreImpact.points} pts</span>
                    <span class="text-[10px]">${w.scoreImpact.reason}</span>
                </div>
            </div>`;

        showToast(t('toast_weather_ok'), 'success');
    },

    /**
     * Met à jour les labels météo sans re-fetch (changement de langue)
     */
    updateLabels() {
        if (this.currentData) this.renderWidget(this.currentProvince);
    },

    /**
     * Retourne le score d'impact météo actuel (0 si pas de données)
     */
    getScoreBonus() {
        return this.currentData ? this.currentData.scoreImpact.points : 0;
    },
};
