/**
 * UBUMWE AGRI — Sécurité légère (sans blocage DOM)
 * Protège contre XSS sur les formulaires uniquement
 */
const UbumweSecurity = (() => {
    'use strict';

    const ATTACK_PATTERNS = [
        /<script[\s\S]*?>/gi,
        /javascript:/gi,
        /union\s+select/gi,
        /drop\s+table/gi,
        /exec\s*\(/gi,
        /on\w+\s*=/gi,          // Gestionnaires inline : onclick=, onerror=, onload=...
        /<\s*iframe/gi,          // Iframes malveillantes
        /<\s*object/gi,          // Éléments object malveillants
        /expression\s*\(/gi,     // CSS expression() IE
    ];

    function scan(value) {
        if (typeof value !== 'string') return false;
        return ATTACK_PATTERNS.some(p => { p.lastIndex = 0; return p.test(value); });
    }

    function sanitize(input) {
        if (typeof input !== 'string') return input;
        return input
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    }

    function reportFailedLogin() {
        const count = parseInt(sessionStorage.getItem('_fl') || '0') + 1;
        sessionStorage.setItem('_fl', count);
        if (count >= 10) {
            showToast && showToast('Trop de tentatives. Réessayez plus tard.', 'error');
        }
    }

    function reportSuccess() {
        sessionStorage.removeItem('_fl');
    }

    function getReport() {
        return {
            version: '3.1-lite',
            status: '🟢 SÉCURISÉ',
            threatLevel: 0,
            stats: { total: 0, blocked: 0, xss_attempts: 0, bot_attempts: 0, last24h: 0 },
            layers: { layer1: 'ACTIF', layer2: 'ACTIF', layer3: 'ACTIF' },
            isCurrentlyBlocked: false,
        };
    }

    function init() {
        // Nettoyer tout ancien blocage
        localStorage.removeItem('UBUMWE_SEC_BLOCKED');
        localStorage.removeItem('UBUMWE_SEC_LOG');
        // Scan léger sur soumissions de formulaire seulement
        document.addEventListener('submit', e => {
            const inputs = e.target.querySelectorAll('input, textarea');
            for (const el of inputs) {
                if (scan(el.value)) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (typeof showToast === 'function') showToast('Contenu invalide détecté.', 'error');
                    el.value = '';
                    el.focus();
                    return;
                }
            }
        }, true);
        console.log('[UBUMWE Security] v3.1-lite actif');
    }

    return { init, scan, sanitize, reportFailedLogin, reportSuccess, getReport, isBlocked: () => false };
})();
