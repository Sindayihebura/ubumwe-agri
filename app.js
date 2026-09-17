/**
 * UBUMWE AGRI — Backend Logic
 * Supabase Auth + LocalStorage Offline-First
 * Partenaires : FOMI Burundi, Météo-Burundi, Ministère de l'Élevage
 */

// ==============================================================================
// 1. INITIALISATION CLIENT SUPABASE
// ==============================================================================
const SUPABASE_URL = window.ENV_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const SUPABASE_ANON_KEY = window.ENV_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

let supabaseClient = null;
let isSupabaseConnected = false;

try {
    if (window.supabase && SUPABASE_URL !== 'https://xyzcompany.supabase.co') {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        isSupabaseConnected = true;
    }
} catch (e) {
    console.warn('Supabase non initialisé — Mode Offline-First actif:', e);
}

const LOCAL_STORAGE_PRODUCTS = 'UBUMWE_AGRI_PRODUCTS_V3';
const LOCAL_STORAGE_CREDITS  = 'UBUMWE_AGRI_CREDITS_V3';
const LOCAL_STORAGE_USER     = 'UBUMWE_AGRI_CURRENT_USER_V3';

// ==============================================================================
// 2. DONNÉES DE DÉMONSTRATION (SEED)
// ==============================================================================
const INITIAL_SEED_PRODUCTS = [
    {
        id: 'seed-1', type: 'vegetal', name: '1 Tonne de Haricots Jaunes (Kiharo)',
        category: 'Légumineuses', quantity: 1000, unit: 'kg', price_per_unit: 2200, currency: 'FB',
        province: 'Gitega', commune: 'Giheta', whatsapp_phone: '+25779123456',
        description: 'Excellente récolte de la saison A, séchée et triée, prête à l\'exportation.',
        image_url: 'img-haricots.jpg.webp',
        status: 'approved', created_at: new Date(Date.now() - 3600000 * 48).toISOString()
    },
    {
        id: 'seed-2', type: 'animal', name: '2 Vaches Ankolé de Race Métissée',
        category: 'Bovins', quantity: 2, unit: 'unité', price_per_unit: 650000, currency: 'FB',
        province: 'Butanyerera', commune: 'Ngozi', whatsapp_phone: '+25771987654',
        description: 'Génisses saines en première gestation. Vaccinées contre la fièvre de la Vallée du Rift.',
        image_url: 'img-vaches.jpg.gif',
        status: 'approved', created_at: new Date(Date.now() - 3600000 * 72).toISOString()
    },
    {
        id: 'seed-3', type: 'vegetal', name: '500 kg de Maïs Blanc Séché',
        category: 'Céréales', quantity: 500, unit: 'kg', price_per_unit: 1800, currency: 'FB',
        province: 'Buhumuza', commune: 'Cankuzo', whatsapp_phone: '+25769223344',
        description: 'Maïs fertilisé avec engrais FOMI Bagara. Faible taux d\'humidité (<12%).',
        image_url: 'img-mais.jpg.webp',
        status: 'approved', created_at: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    {
        id: 'seed-4', type: 'animal', name: '50 Poules Pondeuses de Race',
        category: 'Volailles', quantity: 50, unit: 'unité', price_per_unit: 18000, currency: 'FB',
        province: 'Bujumbura', commune: 'Bubanza', whatsapp_phone: '+25779554433',
        description: 'Poules au pic de ponte (85% rendement). Carnet de vaccination Newcastle à jour.',
        image_url: 'img-poules.jpg.jpg',
        status: 'approved', created_at: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
        id: 'seed-5', type: 'animal', name: '10 Chèvres de Race Locale',
        category: 'Caprins', quantity: 10, unit: 'unité', price_per_unit: 95000, currency: 'FB',
        province: 'Burunga', commune: 'Rumonge', whatsapp_phone: '+25771332211',
        description: 'Élevage en stabulation contrôlée. Idéal pour constitution de cheptel familial.',
        image_url: 'img-chevre-local.jfif',
        status: 'approved', created_at: new Date(Date.now() - 3600000 * 30).toISOString()
    },
    {
        id: 'seed-6', type: 'vegetal', name: '50 Régimes de Bananes (Igikoro)',
        category: 'Fruits', quantity: 50, unit: 'Régime', price_per_unit: 22000, currency: 'FB',
        province: 'Gitega', commune: 'Shombo', whatsapp_phone: '+25779887766',
        description: 'Bananes de table bien charnues. Récolte fraîche du jour.',
        image_url: 'img-bananes.jpg.png',
        status: 'approved', created_at: new Date().toISOString()
    },
    {
        id: 'seed-7', type: 'animal', name: '5 Porcs Améliorés (Race Locale Croisée)',
        category: 'Porcins', quantity: 5, unit: 'unité', price_per_unit: 180000, currency: 'BIF',
        province: 'BUTANYERERA', commune: 'Kayanza', whatsapp_phone: '+25769445566',
        description: 'Porcs en claustration. Vaccinés. Poids moyen 60-80 kg. Filière porcine FILAGRO.',
        image_url: 'img-porc.jfif',
        status: 'approved', created_at: new Date(Date.now() - 3600000 * 15).toISOString()
    },
    {
        id: 'seed-8', type: 'vegetal', name: '200 kg de Café Arabica Cerises (Lavé)',
        category: 'Café', quantity: 200, unit: 'kg', price_per_unit: 4500, currency: 'BIF',
        province: 'GITEGA', commune: 'Bugendana', whatsapp_phone: '+25771234567',
        description: 'Café lavé en station. Altitude 1800m. Saison A. Certifié ODECA.',
        image_url: 'img-cafe.jfif',
        status: 'approved', created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
        id: 'seed-9', type: 'animal', name: '20 Lapins (Cuniculture Familiale)',
        category: 'Cuniculture', quantity: 20, unit: 'unité', price_per_unit: 8000, currency: 'BIF',
        province: 'GITEGA', commune: 'Gitega', whatsapp_phone: '+25779001122',
        description: 'Lapins locaux croisés. Cycle court 3 mois. Idéal petites parcelles. Très prolifiques.',
        image_url: 'img-lapin.jfif',
        status: 'approved', created_at: new Date(Date.now() - 3600000 * 8).toISOString()
    },
    {
        id: 'seed-10', type: 'animal', name: '10 Moutons de Race Locale (Ovins)',
        category: 'Ovins', quantity: 10, unit: 'unité', price_per_unit: 75000, currency: 'BIF',
        province: 'BURUNGA', commune: 'Makamba', whatsapp_phone: '+25771556677',
        description: 'Moutons en stabulation. Alimentation Leucaena. Déparasités. Poids moyen 25-35 kg.',
        image_url: 'img-mouton.jfif',
        status: 'approved', created_at: new Date(Date.now() - 3600000 * 20).toISOString()
    },
    {
        id: 'seed-11', type: 'animal', name: '5 Canards Locaux (Aviculture)',
        category: 'Canards', quantity: 5, unit: 'unité', price_per_unit: 15000, currency: 'BIF',
        province: 'BUJUMBURA', commune: 'Ntahangwa', whatsapp_phone: '+25779334455',
        description: 'Canards locaux. Élevage semi-extensif près des marais. Oeufs et viande.',
        image_url: 'img-canard.jfif',
        status: 'approved', created_at: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
        id: 'seed-12', type: 'animal', name: 'Production Piscicole — 50 kg Tilapia',
        category: 'Pisciculture', quantity: 50, unit: 'kg', price_per_unit: 3500, currency: 'BIF',
        province: 'BUHUMUZA', commune: 'Muyinga', whatsapp_phone: '+25769778899',
        description: 'Tilapia d\'étang piscicole aménagé dans les marais. Frais. Pêche du jour.',
        image_url: 'img-poisson.jfif',
        status: 'approved', created_at: new Date(Date.now() - 3600000 * 1).toISOString()
    }
];

// ==============================================================================
// 3. ÉTAT APPLICATIF GLOBAL
// ==============================================================================
class AppState {
    constructor() {
        try {
            this.currentUser = JSON.parse(localStorage.getItem(LOCAL_STORAGE_USER)) || null;
        } catch {
            this.currentUser = null;
        }
        this.products = this.loadProducts();
        this.creditRequests = this.loadCredits();
        this.currentScreen = 'home';
        this.marketFilter = 'all';
    }

    loadCredits() {
        try {
            return JSON.parse(localStorage.getItem(LOCAL_STORAGE_CREDITS)) || [];
        } catch {
            return [];
        }
    }

    loadProducts() {
        try {
            const stored = localStorage.getItem(LOCAL_STORAGE_PRODUCTS);
            if (!stored) {
                localStorage.setItem(LOCAL_STORAGE_PRODUCTS, JSON.stringify(INITIAL_SEED_PRODUCTS));
                return [...INITIAL_SEED_PRODUCTS];
            }
            return JSON.parse(stored);
        } catch {
            // Données corrompues : réinitialiser avec les données de démonstration
            localStorage.setItem(LOCAL_STORAGE_PRODUCTS, JSON.stringify(INITIAL_SEED_PRODUCTS));
            return [...INITIAL_SEED_PRODUCTS];
        }
    }

    saveProducts() {
        localStorage.setItem(LOCAL_STORAGE_PRODUCTS, JSON.stringify(this.products));
    }

    saveCredits() {
        localStorage.setItem(LOCAL_STORAGE_CREDITS, JSON.stringify(this.creditRequests));
    }

    setCurrentUser(user) {
        this.currentUser = user;
        if (user) {
            localStorage.setItem(LOCAL_STORAGE_USER, JSON.stringify(user));
        } else {
            localStorage.removeItem(LOCAL_STORAGE_USER);
        }
    }
}

const state = new AppState();

// ==============================================================================
// 4. UTILITAIRES & VALIDATION
// ==============================================================================
// Validation téléphone Burundi STRICTE : +257 fixe + 8 chiffres
const PHONE_REGEX = /^\+257\d{8}$/;

function validateBurundiPhone(phone) {
    const clean = phone.replace(/[\s\-\(\)\.]/g, '');
    return PHONE_REGEX.test(clean);
}

function formatPhone257(raw) {
    // Normalise : retire tout sauf chiffres et +, ajoute +257 si absent
    const clean = raw.trim().replace(/[\s\-\(\)\.]/g, '');
    const digits = clean.replace(/\D/g, '');
    if (clean.startsWith('+257') && digits.length === 11) return '+' + digits;
    if (digits.startsWith('257') && digits.length === 11) return '+' + digits;
    if (digits.length === 8) return '+257' + digits;
    // Ne pas créer silencieusement un numéro tronqué — retourner tel quel pour déclencher la validation
    return clean;
}

// ── ÉTAPE 2 : Tarifs FOMI réels (prix subventionnés BIF/sac 25kg) ──────────
const FOMI_CATALOG = {
    'Maïs':              { sacs_ha: 12, prix_sac: 33000, produit: 'FOMI Imbura + Totahaza' },
    'Riz':               { sacs_ha: 14, prix_sac: 35000, produit: 'FOMI Totahaza (Marais Imbo)' },
    'Manioc':            { sacs_ha: 16, prix_sac: 31000, produit: 'FOMI Kula (Tubercules)' },
    'Patate douce':      { sacs_ha: 16, prix_sac: 31000, produit: 'FOMI Kula (Tubercules)' },
    'Colocase':          { sacs_ha: 14, prix_sac: 31000, produit: 'FOMI Kula (Tubercules)' },
    'Pomme de terre':    { sacs_ha: 16, prix_sac: 31000, produit: 'FOMI Kula (Altitude Mugamba)' },
    'Haricot':           { sacs_ha:  8, prix_sac: 33000, produit: 'FOMI Imbura (Légumineuses)' },
    'Petits pois':       { sacs_ha:  8, prix_sac: 33000, produit: 'FOMI Imbura (Légumineuses)' },
    'Maïs (Imbo)':       { sacs_ha: 12, prix_sac: 33000, produit: 'FOMI Imbura + Totahaza' },
    'Riz (Imbo)':        { sacs_ha: 14, prix_sac: 35000, produit: 'FOMI Totahaza (Plaine Imbo)' },
    'Banane':            { sacs_ha: 20, prix_sac: 31000, produit: 'FOMI Kula + Bagara' },
    'Banane à bière':    { sacs_ha: 18, prix_sac: 31000, produit: 'FOMI Kula + Bagara' },
    'Sorgho':            { sacs_ha: 10, prix_sac: 33000, produit: 'FOMI Totahaza (Céréales)' },
    'Éleusine':          { sacs_ha:  8, prix_sac: 33000, produit: 'FOMI Totahaza (Céréales)' },
    'Café':              { sacs_ha: 22, prix_sac: 28000, produit: 'FOMI Bagara (Arabica)' },
    'Thé':               { sacs_ha: 24, prix_sac: 28000, produit: 'FOMI Bagara (Crête Congo-Nil)' },
    'Palmier à huile':   { sacs_ha: 20, prix_sac: 28000, produit: 'FOMI Bagara (Imbo/Mosso)' },
    'Canne à sucre':     { sacs_ha: 20, prix_sac: 28000, produit: 'FOMI Bagara (SOSUMO)' },
    'Coton':             { sacs_ha: 14, prix_sac: 28000, produit: 'FOMI Bagara (Culture de rente)' },
    'Tomate':            { sacs_ha: 12, prix_sac: 31000, produit: 'FOMI Bagara (Maraîcher)' },
    'Chou':              { sacs_ha: 10, prix_sac: 31000, produit: 'FOMI Bagara (Maraîcher)' },
    'Oignon':            { sacs_ha: 10, prix_sac: 31000, produit: 'FOMI Bagara (Maraîcher)' },
    'Lengalenga':        { sacs_ha:  8, prix_sac: 31000, produit: 'FOMI Bagara (Maraîcher)' },
    'Avocat':            { sacs_ha: 16, prix_sac: 28000, produit: 'FOMI Bagara (Fruitier)' },
    'Champignon':        { sacs_ha:  4, prix_sac: 31000, produit: 'FOMI Bagara (Hors-sol)' },
};

function calculateRealFomiNeeds(culture, surface) {
    const c = FOMI_CATALOG[culture] || { sacs_ha: 12, prix_sac: 33000, produit: 'FOMI Imbura' };
    const sacs_total = Math.ceil(c.sacs_ha * surface);
    const cout_total = sacs_total * c.prix_sac;
    return {
        produit: c.produit,
        sacs_ha: c.sacs_ha,
        sacs_total,
        prix_sac_bif: c.prix_sac,
        cout_total_bif: cout_total,
        cout_display: new Intl.NumberFormat('fr-FR').format(cout_total) + ' BIF'
    };
}

// ── ÉTAPE 3 : Catalogue maladies offline (ISABU/OEB) ────────────────────────
const DISEASES_CATALOG_OFFLINE = [
    { id:'d1', type:'plante', sujet:'Bananier', sujet_rn:'Ibitoke',
      nom:'Fletrissement Bacterien BXW', nom_rn:'Kirabiranya',
      keywords:['kirabiranya','umuhondo','gufuya','umusozi wumye','pus jaune'],
      symptomes:'Jaunissement/fletrissement des feuilles. Pus jaune au tronc à la coupe. Pourriture des régimes.',
      symptomes_rn:'Amababi arahindura umuhondo. Ubona amazi umuhondo mu giti igihe utemye. Ingano ziboze.',
      prevention:'Méthode SDSR : enlever uniquement la tige malade. Désinfecter machette au feu/chlore. Rejets sains ISABU. Briser la fleur mâle.',
      prevention_rn:'SDSR : Gukuraho igiti kiranduye gusa. Gutwika inzora. Imisatsi isana y ISABU.',
      traitement:'Aucun traitement chimique efficace. Appliquer SDSR strictement. Brûler tiges malades.',
      traitement_rn:'Nta muti. Gukoresha SDSR. Gutwika ibitoki biranduye.', gravite:'critique', source:'ISABU 2024' },

    { id:'d2', type:'plante', sujet:'Manioc', sujet_rn:'Imyumbati',
      nom:'Mosaïque du Manioc CMD', nom_rn:'Umutore w Imyumbati',
      keywords:['umutore','amababi yagize amabara','nanisme','imyumbati yagagaziwe','ibibabi bibisi'],
      symptomes:'Taches jaunes-vertes en mosaïque sur feuilles. Nanisme. Tubercules petits et malformés.',
      symptomes_rn:'Amababi aragaragara amabara amuhondo n atoto. Imyumbati igakorwa nke.',
      prevention:'Boutures saines certifiées ISABU. Arracher et brûler plants malades. Variétés résistantes NASE 14, UKIRIGURU.',
      prevention_rn:'Indamutso nziza z ISABU. Gukuraho no gutwika ibimera biranduye. Amoko NASE 14.',
      traitement:'Pas de traitement curatif. Prévention par boutures saines.',
      traitement_rn:'Nta muti. Indamutso nziza.', gravite:'grave', source:'ISABU / FAO' },

    { id:'d3', type:'plante', sujet:'Maïs', sujet_rn:'Ibigori',
      nom:'Nécrose Létale du Maïs MLN', nom_rn:'Igicucu cy Ibigori',
      keywords:['igicucu','ibigori byumye','amababi yumye','umusatsi ufuye','epis vides'],
      symptomes:'Dessèchement prématuré des feuilles depuis les bords. Épis mal remplis ou vides. Mort prématurée de la plante.',
      symptomes_rn:'Amababi agora uhereye ku mpera. Ibigori ntibuzure. Ibiti bishira imbere y igihe.',
      prevention:'Interdire grains du marché local comme semence (directive OEB). Rotation avec légumineuses. Insecticide contre pucerons/thrips. Semences certifiées OEB uniquement.',
      prevention_rn:'Kubuza imbuto zo mu isoko (itegeko OEB). Guhindura ubutaka. Imiti y inzoka. Imbuto z OEB.',
      traitement:'Arracher et brûler plants infectés. Nettoyage strict. Pas de traitement curatif.',
      traitement_rn:'Gukuraho no gutwika. Gukaraba neza.', gravite:'critique', source:'OEB Burundi 2024' },

    { id:'d4', type:'plante', sujet:'Pomme de terre', sujet_rn:'Ibirayi',
      nom:'Flétrissement Bactérien', nom_rn:'Indwara y Ibirayi Ifuya',
      keywords:['ibirayi zifuya','imizi ibisi','amazi umuhondo','fletrissement','vaisseaux bruns'],
      symptomes:'Flétrissement soudain aux heures chaudes. Coupe tubercule : vaisseaux bruns avec pus blanc-jaune visqueux.',
      symptomes_rn:'Ibimera bihindagira igihe izuba rituritse. Ibirayi zitemwe bigaragaza inzira imara bisi.',
      prevention:'Rotation obligatoire avec maïs (2 saisons). Semences certifiées OEB. Éviter blessures à la récolte. Chauler le sol si pH bas.',
      prevention_rn:'Guhindura ubutaka na ibigori (ibihe 2). Imbuto z OEB. Kwirinda gukata ibirayi.',
      traitement:'Arracher et brûler. Désinfecter outils. Aucun traitement curatif efficace.',
      traitement_rn:'Gukuraho no gutwika. Gusukura ibyuma.', gravite:'grave', source:'OEB / CIP' },

    { id:'d5', type:'animal', sujet:'Bovins', sujet_rn:'Inka',
      nom:'Théilériose Bovine (Fièvre de la Côte Est)', nom_rn:'Umuyago w Inka',
      keywords:['umuyago','inka zirwaye','ubushuhe bwinshi','izimu zivuye','amata nke','agatima gata vuba'],
      symptomes:'Fièvre forte soudaine 40-42°C. Ganglions gonflés sous les oreilles. Difficultés respiratoires. Chute production laitière. Amaigrissement rapide. Mort en 2-3 semaines sans traitement.',
      symptomes_rn:'Ubushuhe bukabije (40-42). Umutwe ugufuka munsi y amatwi. Guhumeka nabi. Amata nke. Kwihuta gukonda.',
      prevention:'Acaricide (Amitraz) toutes les 2 semaines. Stabulation permanente fermée (politique nationale). Inspecter tiques chaque jour.',
      prevention_rn:'Insektisaidi buri ibyumweru 2. Kubika inka munda buri gihe. Kureba ingambari buri munsi.',
      traitement:'Buparvaquone (Butalex) 2.5mg/kg IM dans les 3 premiers jours. Antipyrétiques + Vitamines B + réhydratation.',
      traitement_rn:'Butalex 2.5mg/kg vuba mu minsi 3 ya mbere. Vitamines B + amazi.', gravite:'critique', source:'OEB / ILRAD' },

    { id:'d6', type:'animal', sujet:'Porcins', sujet_rn:'Ingurube',
      nom:'Peste Porcine Africaine PPA', nom_rn:'Indwara Ikomeye y Ingurube',
      keywords:['indwara y ingurube','ingurube zipfa','guhitana amaraso','imunda','ruvuvuma','ibara ry umutuku'],
      symptomes:'Fièvre 40-42°C. Taches violettes/rouges sur oreilles, ventre, membres. Diarrhée sanglante. Mort certaine en 2-10 jours. Létalité 100%.',
      symptomes_rn:'Ubushuhe bukabije. Amabara y umutuku ku matwi no ku nda. Guhitana amaraso. Urupfu (100%).',
      prevention:'AUCUN VACCIN. Biosécurité stricte. Interdire visiteurs. Ne jamais donner restes cuisine non bouillis. Désinfection quotidienne.',
      prevention_rn:'NTAGITI. Kubuza abantu kwinjira. Kubutsa gufana ibiryo bidategurwa. Gukaraba buri munsi.',
      traitement:'AUCUN TRAITEMENT. Abattage sanitaire total et immédiat. Signalement OEB OBLIGATOIRE.',
      traitement_rn:'NTAGITI. Gusiga ingurube zose vuba. KUMENYESHA OEB VUBA.', gravite:'critique', source:'OEB 2024' },

    { id:'d7', type:'animal', sujet:'Volailles', sujet_rn:'Inkoko',
      nom:'Maladie de Newcastle', nom_rn:'Pseudo-Peste Aviaire',
      keywords:['inkoko zipfa','ibirinde','guhumeka nabi','ijosi rihindagurika','isave y umutuku','paralysie'],
      symptomes:'Râles respiratoires. Diarrhée verdâtre. Torticolis et paralysie. Chute brutale de la ponte. Mortalité massive.',
      symptomes_rn:'Indirimbo zo guhumeka nabi. Isave y umutuku. Ijosi rihindagurika. Impfuzi zipfa nyinshi.',
      prevention:'Vaccination régulière obligatoire (campagnes OEB). Vaccin thermotolérant I-2 pour volaille villageoise. Isoler oiseaux malades immédiatement.',
      prevention_rn:'Kugira ubudodo (vaccin I-2) biciye mu bikorwa vy OEB. Gukura inkoko ziranduye.',
      traitement:'Aucun traitement curatif. Antibiotiques contre surinfections. Vitamines C et E. Isolement strict.',
      traitement_rn:'Nta muti. Vitamines. Gukura inkoko ziranduye.', gravite:'critique', source:'OEB / FAO' },

    { id:'d8', type:'animal', sujet:'Bovins', sujet_rn:'Inka',
      nom:'Dermatose Nodulaire DNCB et Brucellose', nom_rn:'Amabara n Inda Zihunguka',
      keywords:['amabara mu mubiri','inda zihunguka','nodules','brucellose','avortement','ruvuvuma rw inda'],
      symptomes:'DNCB: nodules fermes sur peau, fièvre, réduction lait. Brucellose: avortements au 7e mois de gestation, rétention placentaire, infertilité chronique.',
      symptomes_rn:'DNCB: amabara akomera ku mubiri, ubushuhe, amata nke. Brucellose: inda zihunguka mu kwezi kw 7, infertilite.',
      prevention:'DNCB: Vaccination annuelle. Lutte insectes vecteurs. Brucellose: Dépistage régulier. Hygiène stricte aux mises bas (gants+désinfectants). Isoler vaches avortées.',
      prevention_rn:'DNCB: Ubudodo buri mwaka. Brucellose: Ubushakashatsi. Isuku rikabije.',
      traitement:'DNCB: Anti-inflammatoires, antibiotiques. Brucellose: Abattre animaux positifs. Pas de traitement curatif.',
      traitement_rn:'DNCB: Imiti. Brucellose: Gusiga inka zigiranye indwara.', gravite:'grave', source:'OEB Burundi' },
];

// Fonction recherche maladies par mots-clés Kirundi
function searchDiseaseByKeyword(query) {
    const q = query.toLowerCase().trim();
    return DISEASES_CATALOG_OFFLINE.filter(d =>
        d.keywords.some(k => q.includes(k) || k.includes(q)) ||
        d.nom.toLowerCase().includes(q) ||
        d.nom_rn.toLowerCase().includes(q) ||
        d.sujet.toLowerCase().includes(q) ||
        d.symptomes_rn.toLowerCase().includes(q)
    );
}

// ── ÉTAPE 4 : Calendrier cultural des saisons réelles ───────────────────────
const SAISONS_BURUNDI = {
    A: {
        nom: 'Saison A — Agatasi',
        periode: 'Septembre à Mi-Février',
        cultures_prioritaires: ['Maïs','Haricot','Pomme de terre','Patate douce','Banane'],
        conseil_semis: 'Semis dès les premières pluies de septembre (2e-3e décade selon région).',
        conseil_recolte: 'Récolte maïs et haricots entre janvier et mi-février. Profiter courte saison sèche pour séchage.',
        alerte: '⚠️ Commandez vos engrais FOMI en août avant le début des semis de septembre !'
    },
    B: {
        nom: 'Saison B — Grande Saison des Pluies',
        periode: 'Mi-Février à Mi-Juillet',
        cultures_prioritaires: ['Sorgho','Haricot','Manioc','Légumineuses'],
        conseil_semis: 'Semer le Sorgho IMPÉRATIVEMENT entre le 5 et le 15 février. Légumineuses en mars.',
        conseil_recolte: 'Moisson haricot en mai-juin. Sorgho grain en juin-juillet (saison sèche).',
        alerte: '⚠️ SORGHO : fenêtre de semis stricte du 5 au 15 février. Préparez maintenant !'
    },
    C: {
        nom: 'Saison C — Contre-saison des Marais',
        periode: 'Juin à Septembre',
        cultures_prioritaires: ['Riz','Tomate','Chou','Lengalenga','Pomme de terre'],
        conseil_semis: 'Aménager marais en juin dès début saison sèche. Semis légumes en juin-juillet.',
        conseil_recolte: 'Récoltes maraîchères août-septembre. Approvisionne marchés pendant période de soudure.',
        alerte: '⚠️ Contre-saison marais : opportunité cruciale contre la soudure. Irrigation intensive juillet-août.'
    }
};

function getCurrentSaison() {
    const m = new Date().getMonth() + 1;
    if (m >= 9 || m <= 2) return 'A';
    if (m >= 3 && m <= 7) return 'B';
    return 'C';
}

const BANQUES_BURUNDI = {
    'BCAB': {
        nom: 'BCAB — Banque Communautaire et Agricole',
        type: 'Banque agricole spécialisée',
        produit: 'Crédit Twese Kw\'Itongo (remboursable après récolte)',
        taux: 7,
        frais_dossier_pct: 1,
        public: 'Coopératives et grands exploitants',
        warrantage: true
    },
    'BNDE': {
        nom: 'BNDE — Banque Nationale pour le Développement Économique',
        type: 'Banque de développement',
        produit: 'Financement agro-industrie et projets moyens/grands',
        taux: 7,
        frais_dossier_pct: 1,
        public: 'Agro-industries, coopératives structurées',
        warrantage: true
    },
    'BANCOBU': {
        nom: 'BANCOBU — Banque Commerciale du Burundi',
        type: 'Banque commerciale',
        produit: 'Fonds PAIFAR-B (FIDA)',
        taux: 15,
        frais_dossier_pct: 1,
        public: 'Coopératives et associations',
        warrantage: false
    },
    'CRDB_Bank': {
        nom: 'CRDB Bank Burundi',
        type: 'Banque commerciale (origine tanzanienne)',
        produit: 'Financement chaînes de valeur rurales',
        taux: 15,
        frais_dossier_pct: 1,
        public: 'Coopératives, PME rurales',
        warrantage: false
    },
    'FENACOBU': {
        nom: 'FENACOBU — Réseau COOPEC',
        type: 'Microfinance (réseau de proximité)',
        produit: 'Micro-crédit campagne (semences/engrais)',
        taux: 15,
        frais_dossier_pct: 1,
        public: 'Petits agriculteurs familiaux',
        warrantage: false
    },
    'CECM': {
        nom: 'CECM — Caisse d\'Épargne et Crédit Mutuel',
        type: 'Microfinance',
        produit: 'Microcrédit groupements femmes',
        taux: 15,
        frais_dossier_pct: 1,
        public: 'Groupements de femmes agricultrices',
        warrantage: false
    },
    'WISE': {
        nom: 'WISE Microfinance',
        type: 'Microfinance locale',
        produit: 'Crédit de campagne à court terme',
        taux: 18,
        frais_dossier_pct: 1,
        public: 'Petits producteurs',
        warrantage: false
    },
    'UCODE_Microfinance': {
        nom: 'UCODE Microfinance',
        type: 'Microfinance warrantage',
        produit: 'Warrantage Riz/Maïs (stock comme garantie)',
        taux: 12,
        frais_dossier_pct: 1,
        public: 'Riziculteurs et maïsiculteurs avec coopératives',
        warrantage: true
    }
};

// ── PRIX MARCHÉS OFFICIELS (SIM / INSBU / FAO-PAM) ──────────────────────────
// Sources : SIM/MINEAGRIE, INSBU, PAM-VAM, FAO Burundi
// Mise à jour : hebdomadaire (données de référence 2025-2026)
const PRIX_MARCHES = {
    'Haricot':        { prix_min: 1200, prix_max: 1800, unite: 'BIF/kg', marche_ref: 'Gitega', source: 'SIM/MINEAGRIE' },
    'Maïs':           { prix_min: 800,  prix_max: 1200, unite: 'BIF/kg', marche_ref: 'Ngozi',  source: 'SIM/MINEAGRIE' },
    'Manioc':         { prix_min: 400,  prix_max: 700,  unite: 'BIF/kg', marche_ref: 'Gitega', source: 'PAM-VAM' },
    'Pomme de terre': { prix_min: 700,  prix_max: 1100, unite: 'BIF/kg', marche_ref: 'Kayanza', source: 'DPAE Butanyerera' },
    'Riz':            { prix_min: 1500, prix_max: 2200, unite: 'BIF/kg', marche_ref: 'Bubanza (Imbo)', source: 'SIM/MINEAGRIE' },
    'Sorgho':         { prix_min: 600,  prix_max: 900,  unite: 'BIF/kg', marche_ref: 'Muyinga', source: 'INSBU' },
    'Banane':         { prix_min: 400,  prix_max: 800,  unite: 'BIF/kg', marche_ref: 'Bujumbura', source: 'PAM-VAM' },
    'Tomate':         { prix_min: 500,  prix_max: 1500, unite: 'BIF/kg', marche_ref: 'Bujumbura', source: 'SIM/MINEAGRIE' },
    'Café cerises':   { prix_min: 800,  prix_max: 1200, unite: 'BIF/kg', marche_ref: 'ODECA Gitega', source: 'ODECA' },
    // Élevage — termes de l'échange PAM
    'Vache Ankolé':   { prix_min: 400000, prix_max: 800000, unite: 'BIF/tête', marche_ref: 'Ngozi/Gitega', source: 'DPAE/INSBU' },
    'Chèvre locale':  { prix_min: 50000,  prix_max: 120000, unite: 'BIF/tête', marche_ref: 'Kirundo',      source: 'DPAE/INSBU' },
    'Porc amélioré':  { prix_min: 120000, prix_max: 250000, unite: 'BIF/tête', marche_ref: 'Bujumbura',    source: 'FILAGRO' },
    'Poule pondeuse': { prix_min: 12000,  prix_max: 25000,  unite: 'BIF/tête', marche_ref: 'Gitega',       source: 'DPAE' },
    'Lait':           { prix_min: 800,    prix_max: 1500,   unite: 'BIF/litre', marche_ref: 'Centre collecte Ngozi', source: 'PRODEFI' },
};

// Sources officielles de données agricoles au Burundi
const SOURCES_OFFICIELLES = [
    { nom: 'SIM — Système Information Marchés',    institution: 'MINEAGRIE',    url: 'https://www.agriculture.gov.bi',      type: 'Prix hebdomadaires' },
    { nom: 'INSBU — Institut National Statistique', institution: 'Gouvernement', url: 'https://www.insbu.net',               type: 'IPC + Recensement agro-pastoral' },
    { nom: 'PAM-VAM Burundi',                       institution: 'PAM / ONU',    url: 'https://www.wfp.org/countries/burundi', type: 'Grilles prix par province' },
    { nom: 'FAO Burundi',                           institution: 'FAO / ONU',    url: 'https://www.fao.org/burundi',          type: 'Sécurité alimentaire' },
    { nom: 'PARM — Analyse Risques Agricoles',      institution: 'PARM/UE',      url: 'https://www.p4atp.org',               type: 'Chaînes de valeur élevage' },
    { nom: 'DPAE — Directions Provinciales',        institution: 'MINEAGRIE',    url: 'https://www.agriculture.gov.bi',      type: 'Données terrain communes' },
    { nom: 'ODECA — Office Café Burundi',           institution: 'Gouvernement', url: 'https://www.odeca.bi',                type: 'Prix café cerises/parche' },
];

// ── SYSTÈME AGENTS DE TERRAIN ────────────────────────────────────────────────
// Rôle : permettre aux agriculteurs sans smartphone de publier leurs produits
const AGENT_ROLES = {
    agent_terrain: {
        label: 'Agent de Terrain',
        description: 'Publie au nom des agriculteurs de sa zone collinaire',
        commission_pct: 3,
        droits: ['deposer_produit', 'choisir_agriculteur', 'prendre_photo', 'sync_offline'],
    },
    chef_cooperative: {
        label: 'Chef Coopérative',
        description: 'Gère les membres de sa coopérative (Sangwe/CAPAD)',
        commission_pct: 1,
        droits: ['deposer_produit', 'choisir_agriculteur', 'valider_prix', 'rapport_zone'],
    }
};

// Marchés de référence par province (selon données DPAE)
const MARCHES_PAR_PROVINCE = {
    'BUJUMBURA':  ['Marché Central Bujumbura','Rwibaga','Buyenzi','Kinama'],
    'GITEGA':     ['Marché Gitega','Mwaro','Muramvya','Karusi'],
    'BUTANYERERA':['Marché Ngozi','Kayanza','Kirundo','Muyinga'],
    'BURUNGA':    ['Marché Makamba','Rumonge','Bururi','Rutana'],
    'BUHUMUZA':   ['Marché Cankuzo','Muyinga Est','Ruyigi','Gisuru'],
};

function getPrixMarche(produit) {
    const p = PRIX_MARCHES[produit];
    if (!p) return null;
    const moy = Math.round((p.prix_min + p.prix_max) / 2);
    return { ...p, prix_moyen: moy, affichage: `${new Intl.NumberFormat('fr-FR').format(moy)} ${p.unite}` };
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FB';
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const colors = {
        error:   'bg-rose-700 text-white',
        warning: 'bg-amber-600 text-slate-900',
        info:    'bg-blue-700 text-white',
        success: 'bg-emerald-700 text-white'
    };
    const icons = { error: 'fa-triangle-exclamation', warning: 'fa-triangle-exclamation', info: 'fa-info-circle', success: 'fa-circle-check' };

    toast.className = `p-3.5 rounded-xl shadow-xl border border-white/20 text-xs font-bold flex items-center justify-between pointer-events-auto ${colors[type] || colors.success}`;
    toast.innerHTML = `
        <div class="flex items-center gap-2">
            <i class="fa-solid ${icons[type] || icons.success}"></i>
            <span>${message}</span>
        </div>
        <button onclick="this.parentElement.remove()" class="ml-3 opacity-80 hover:opacity-100">&times;</button>
    `;
    container.appendChild(toast);
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 4000);
}

// ==============================================================================
// 5. OBJET PRINCIPAL DE L'APPLICATION
// ==============================================================================
const app = {

    init() {
        this.updateAuthUI();
        this.initSupabaseListener();
        this.renderMarketplace();
        this.renderFeaturedHome();
        this.renderAdminQueue();
        this.updateBadgeStatus();
        this.renderDiseases();
        // Initialiser le widget de notation
        if (typeof ratingApp !== 'undefined') ratingApp.init();
        // Écouter online/offline
        this.initNetworkListeners();
        // Appliquer la traduction complète au démarrage
        if (typeof translatePage === 'function') translatePage();
    },

    // ── Surveiller connexion réseau ───────────────────────────
    initNetworkListeners() {
        const badge = document.getElementById('online-badge');
        const badgeTxt = document.getElementById('online-badge-text');
        const update = () => {
            const isOnline = navigator.onLine;
            if (badge) {
                badge.classList.remove('hidden');
                badge.className = isOnline
                    ? 'sm:flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300'
                    : 'sm:flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-400';
                const dot = badge.querySelector('span:first-child');
                if (dot) dot.className = isOnline
                    ? 'w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block'
                    : 'w-1.5 h-1.5 rounded-full bg-slate-500 inline-block';
            }
            if (badgeTxt) badgeTxt.setAttribute('data-i18n', isOnline ? 'status_online' : 'status_offline');
            if (typeof translatePage === 'function') translatePage();
            showToast(t(isOnline ? 'toast_online' : 'toast_offline'), isOnline ? 'success' : 'warning');
        };
        window.addEventListener('online',  update);
        window.addEventListener('offline', update);
        // État initial silencieux
        if (badge) { badge.classList.remove('hidden'); }
    },

    showScreen(screenId) {
        const screens = ['home', 'scoring', 'market', 'livestock', 'guide', 'prices', 'sos', 'diseases', 'admin', 'superadmin'];
        screens.forEach(s => {
            const el = document.getElementById(`screen-${s}`);
            if (el) el.classList.add('hidden');
            const navBtn = document.getElementById(`nav-${s}`);
            if (navBtn) {
                navBtn.classList.remove('border-amber-400', 'text-white', 'font-bold');
                navBtn.classList.add('text-slate-300');
            }
            const mobileBtn = document.getElementById(`nav-mobile-${s}`);
            if (mobileBtn) {
                mobileBtn.classList.remove('text-forest-700');
                mobileBtn.classList.add('text-slate-500');
            }
        });

        const target = document.getElementById(`screen-${screenId}`);
        if (target) target.classList.remove('hidden');

        const activeNav = document.getElementById(`nav-${screenId}`);
        if (activeNav) {
            activeNav.classList.add('border-amber-400', 'text-white', 'font-bold');
            activeNav.classList.remove('text-slate-300');
        }
        const activeMobile = document.getElementById(`nav-mobile-${screenId}`);
        if (activeMobile) {
            activeMobile.classList.add('text-forest-700');
            activeMobile.classList.remove('text-slate-500');
        }

        state.currentScreen = screenId;
        if (screenId === 'prices')      this.renderPrices();
        if (screenId === 'superadmin' && typeof superAdmin !== 'undefined') superAdmin.render();
        if (screenId === 'sos' && typeof ussdApp !== 'undefined') ussdApp.init();
        // Fermer le menu hamburger automatiquement
        if (typeof hamburgerOpen !== 'undefined' && hamburgerOpen && typeof toggleHamburger === 'function') toggleHamburger();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Re-traduire les éléments dynamiques
        if (typeof translatePage === 'function') translatePage();
    },

    updateBadgeStatus() {
        const el = document.getElementById('db-status-text');
        if (el) el.textContent = isSupabaseConnected ? 'Supabase Connecté' : 'Mode Offline-First';
    },

    // ============================================================
    // 6. AUTHENTIFICATION
    // ============================================================
    openAuthModal(mode = 'login') {
        const modal = document.getElementById('auth-modal');
        const authModeInput = document.getElementById('auth-mode');
        const title = document.getElementById('auth-modal-title');
        const registerGroup = document.getElementById('register-fields-group');
        const toggleBtn = document.getElementById('auth-toggle-btn');
        const submitBtn = document.getElementById('auth-submit-btn');

        if (mode === 'register') {
            authModeInput.value = 'register';
            title.innerHTML = '<i class="fa-solid fa-user-plus text-forest-700"></i> Inscription Nouveau Compte';
            registerGroup.classList.remove('hidden');
            toggleBtn.textContent = 'Déjà un compte ? Se connecter';
            submitBtn.querySelector('span').textContent = 'Créer mon Compte';
        } else {
            authModeInput.value = 'login';
            title.innerHTML = '<i class="fa-solid fa-user-lock text-forest-700"></i> Connexion Utilisateur';
            registerGroup.classList.add('hidden');
            toggleBtn.textContent = "Pas encore de compte ? S'inscrire ici";
            submitBtn.querySelector('span').textContent = 'Se Connecter';
        }
        modal.classList.remove('hidden');
    },

    closeAuthModal() {
        document.getElementById('auth-modal').classList.add('hidden');
    },

    toggleAuthMode() {
        const mode = document.getElementById('auth-mode').value;
        this.openAuthModal(mode === 'login' ? 'register' : 'login');
    },

    async handleAuthSubmit(e) {
        e.preventDefault();
        const mode = document.getElementById('auth-mode').value;
        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value;

        if (mode === 'register') {
            const fullName = document.getElementById('auth-full-name').value.trim();
            const role = document.getElementById('auth-role').value;
            const phoneDigits = document.getElementById('auth-phone').value.replace(/\D/g,'').slice(0,8);
            const phone = '+257' + phoneDigits;

            if (!fullName || !phoneDigits) {
                showToast('Veuillez remplir tous les champs.', 'error');
                return;
            }
            if (!password || password.length < 8) {
                showToast('Le mot de passe doit contenir au moins 8 caractères.', 'error');
                return;
            }
            if (phoneDigits.length !== 8) {
                showToast('Le numéro doit avoir exactement 8 chiffres après +257.', 'error');
                return;
            }
            if (!validateBurundiPhone(phone)) {
                showToast('Format de téléphone invalide (ex: +257 79 123 456).', 'error');
                return;
            }

            if (isSupabaseConnected) {
                try {
                    const { error } = await supabaseClient.auth.signUp({
                        email, password,
                        options: { data: { full_name: fullName, role, phone } }
                    });
                    if (error) throw error;
                    // Supabase gère la session — ne pas connecter localement pour éviter le contournement de la vérification e-mail
                    showToast('Inscription réussie ! Vérifiez votre e-mail puis connectez-vous.', 'success');
                    this.closeAuthModal();
                    return;
                } catch (err) {
                    showToast('Mode local activé : ' + err.message, 'warning');
                }
            }

            // Mode offline-first uniquement (pas de Supabase)
            const localUser = { id: 'user-' + Date.now(), email, fullName, role, phone };
            state.setCurrentUser(localUser);
            showToast(`Bienvenue ${fullName} ! (${role})`, 'success');

        } else {
            if (isSupabaseConnected) {
                try {
                    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
                    if (error) throw error;
                    const m = data.user.user_metadata || {};
                    state.setCurrentUser({ id: data.user.id, email: data.user.email, fullName: m.full_name || email.split('@')[0], role: m.role || 'agriculteur', phone: m.phone || '' });
                    showToast('Connexion réussie !', 'success');
                } catch (err) {
                    showToast('Erreur de connexion : ' + err.message, 'error');
                    if (typeof UbumweSecurity !== 'undefined') UbumweSecurity.reportFailedLogin();
                    return;
                }
            } else {
                const role = email.includes('admin') ? 'admin' : 'agriculteur';
                state.setCurrentUser({ id: 'user-demo', email, fullName: email.split('@')[0], role, phone: '+25779000000' });
                showToast(`Connexion démo (${role}) !`, 'success');
            }
        }

        this.closeAuthModal();
        this.updateAuthUI();
        // Afficher le loading screen 2-3 secondes
        showLoadingScreen(t('auth_connecting'), () => {
            if (typeof unlockApp === 'function') unlockApp();
            if (typeof UbumweSecurity !== 'undefined') UbumweSecurity.reportSuccess();
            if (typeof translatePage === 'function') translatePage();
        });
    },

    logout() {
        showLoadingScreen(t('auth_disconnecting'), () => {
            if (isSupabaseConnected) supabaseClient.auth.signOut();
            state.setCurrentUser(null);
            this.updateAuthUI();
            showToast(t('toast_logout'), 'warning');
            // Retour à la page de bienvenue
            const ws = document.getElementById('welcome-screen');
            const ma = document.getElementById('main-app');
            if (ws) { ws.style.display = ''; ws.classList.remove('hidden'); }
            if (ma) { ma.classList.add('hidden'); ma.classList.remove('flex','flex-col'); }
        });
    },

    updateAuthUI() {
        const authContainer   = document.getElementById('auth-buttons-container');
        const userContainer   = document.getElementById('user-profile-container');
        const adminNavBtn     = document.getElementById('nav-admin');
        const adminMobileBtn  = document.getElementById('nav-mobile-admin');
        const menuAdminBtn    = document.getElementById('menu-admin-btn');
        const menuSuperBtn    = document.getElementById('menu-superadmin-btn');
        const menuLogoutBtn   = document.getElementById('menu-logout-btn');
        const menuAuthBtns    = document.getElementById('menu-auth-btns');

        if (state.currentUser) {
            if (authContainer) authContainer.classList.add('hidden');
            if (userContainer) userContainer.classList.remove('hidden');

            const name = state.currentUser.fullName || state.currentUser.email || 'U';
            const nameEl    = document.getElementById('user-display-name');
            const roleEl    = document.getElementById('user-display-role');
            const avatarBtn = document.getElementById('user-avatar-btn');
            if (nameEl)    nameEl.textContent    = name;
            if (roleEl)    roleEl.textContent    = state.currentUser.role.toUpperCase();
            if (avatarBtn) avatarBtn.textContent = name.charAt(0).toUpperCase();

            // Menu hamburger
            if (menuAuthBtns)  menuAuthBtns.style.display = 'none';
            if (menuLogoutBtn) { menuLogoutBtn.style.display = ''; menuLogoutBtn.classList.remove('hidden'); }

            const isAdmin      = ['admin','super_admin'].includes(state.currentUser.role);
            const isSuperAdmin = state.currentUser.role === 'super_admin' || state.currentUser.email === 'admin@ubumwe.bi';

            if (adminNavBtn)    adminNavBtn.classList.toggle('hidden', !isAdmin);
            if (adminMobileBtn) adminMobileBtn.classList.toggle('hidden', !isAdmin);
            if (menuAdminBtn)   { menuAdminBtn.classList.toggle('hidden', !isAdmin); if (isAdmin) menuAdminBtn.style.display = ''; }
            if (menuSuperBtn)   { menuSuperBtn.classList.toggle('hidden', !isSuperAdmin); if (isSuperAdmin) menuSuperBtn.style.display = ''; }
        } else {
            if (authContainer) authContainer.classList.remove('hidden');
            if (userContainer) userContainer.classList.add('hidden');
            if (adminNavBtn)    adminNavBtn.classList.add('hidden');
            if (adminMobileBtn) adminMobileBtn.classList.add('hidden');
            if (menuAdminBtn)   menuAdminBtn.classList.add('hidden');
            if (menuLogoutBtn)  menuLogoutBtn.classList.add('hidden');
            if (menuAuthBtns)   menuAuthBtns.style.display = '';
        }
    },

    toggleDemoAdminRole() {
        if (!state.currentUser) {
            state.setCurrentUser({ id: 'admin-demo', email: 'admin@ubumwe.bi', fullName: 'Admin Démo', role: 'admin', phone: '+25779000000' });
            showToast('Mode Démo Administrateur activé !', 'success');
        } else {
            state.currentUser.role = state.currentUser.role === 'admin' ? 'agriculteur' : 'admin';
            state.setCurrentUser(state.currentUser);
            showToast(`Rôle changé : ${state.currentUser.role.toUpperCase()}`, 'info');
        }
        this.updateAuthUI();
        this.showScreen('admin');
        this.renderAdminQueue();
    },

    initSupabaseListener() {
        if (isSupabaseConnected && supabaseClient) {
            supabaseClient.auth.onAuthStateChange((event, session) => {
                if (session && session.user) {
                    const m = session.user.user_metadata || {};
                    state.setCurrentUser({ id: session.user.id, email: session.user.email, fullName: m.full_name || 'Utilisateur', role: m.role || 'agriculteur', phone: m.phone || '' });
                }
                this.updateAuthUI();
            });
        }
    },

    // ============================================================
    // 7. MENU UTILISATEUR (DROPDOWN)
    // ============================================================
    toggleUserMenu() {
        let menu = document.getElementById('user-dropdown-menu');
        if (menu) { menu.remove(); return; }

        const user = state.currentUser;
        if (!user) return;

        menu = document.createElement('div');
        menu.id = 'user-dropdown-menu';
        menu.className = 'fixed top-16 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 w-64 space-y-3';
        menu.innerHTML = `
            <div class="border-b border-slate-100 pb-3 text-center">
                <div class="w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center text-forest-900 font-black text-lg mx-auto mb-2">
                    ${(user.fullName || user.email).charAt(0).toUpperCase()}
                </div>
                <p class="font-extrabold text-slate-900 text-sm">${user.fullName || 'Utilisateur'}</p>
                <p class="text-xs text-slate-500">${user.email}</p>
                <span class="inline-block text-[10px] font-extrabold mt-1 px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'} uppercase">${user.role}</span>
            </div>
            <div class="space-y-1.5">
                ${user.role === 'admin' ? `<button onclick="app.showScreen('admin'); document.getElementById('user-dropdown-menu')?.remove();" class="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 flex items-center gap-2"><i class="fa-solid fa-user-shield"></i> Dashboard Admin</button>` : ''}
                <button onclick="app.openDepositModal(); document.getElementById('user-dropdown-menu')?.remove();" class="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-forest-700 bg-slate-50 hover:bg-slate-100 flex items-center gap-2"><i class="fa-solid fa-plus-circle"></i> Déposer un Produit</button>
                <button onclick="app.logout(); document.getElementById('user-dropdown-menu')?.remove();" class="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 flex items-center gap-2"><i class="fa-solid fa-right-from-bracket"></i> Se Déconnecter</button>
            </div>
        `;
        document.body.appendChild(menu);
        setTimeout(() => {
            document.addEventListener('click', function close(e) {
                if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', close); }
            });
        }, 100);
    },

    // ============================================================
    // 8. AGRI-SCORING & CRÉDIT FOMI
    // ============================================================
    handleCalculateScoring(e) {
        e.preventDefault();

        const farmerName = document.getElementById('score-farmer-name').value.trim();
        const province   = document.getElementById('score-province').value;
        const commune    = document.getElementById('score-commune').value.trim();
        const crop       = document.getElementById('score-crop').value;
        const topography = document.getElementById('score-topography').value;
        const soil       = document.getElementById('score-soil').value;
        const surface    = parseFloat(document.getElementById('score-surface').value);
        const phone      = document.getElementById('score-phone').value.trim();

        const errPhone = document.getElementById('err-score-phone');
        let hasError = false;

        if (!validateBurundiPhone(phone)) {
            errPhone.classList.remove('hidden');
            hasError = true;
        } else {
            errPhone.classList.add('hidden');
        }
        if (isNaN(surface) || surface <= 0) {
            showToast(t('scoring_surface') + ' > 0', 'error');
            hasError = true;
        }
        if (hasError) return;

        // ── Algorithme de scoring ─────────────────────────────
        let score = 50;
        if (topography.includes('Plateau')) score += 20;
        else if (topography.includes('Plaine')) score += 15;
        else if (topography.includes('Pente')) score += 5;

        if (soil === 'Limono-Argileux') score += 20;
        else if (soil === 'Limon') score += 15;
        else if (soil === 'Argile') score += 10;
        else if (soil === 'Sable') score += 5;

        if (surface >= 0.5 && surface <= 5.0) score += 10;

        // ── Bonus météo temps réel ────────────────────────────
        const weatherBonus = (typeof weatherApp !== 'undefined') ? weatherApp.getScoreBonus() : 0;
        score += weatherBonus;
        score = Math.min(Math.max(score, 10), 98);

        // ── Recommandation FOMI (tarifs officiels BIF) ────────
        const fomi = calculateRealFomiNeeds(crop, surface);
        const totalFertilizer = fomi.sacs_total * 25;

        // ── Coût crédit selon institution ─────────────────────
        const institution = document.getElementById('score-institution')?.value || 'FENACOBU';
        const taux        = (institution === 'BCAB' || institution === 'BNDE') ? 7 : 15;
        const cout_credit = Math.round(fomi.cout_total_bif * (1 + taux / 100));
        const saison_actuelle = getCurrentSaison();
        const saison_info     = SAISONS_BURUNDI[saison_actuelle];

        // ── Conseil topographique ─────────────────────────────
        let topoAdvice = '';
        if (topography.includes('Pente'))    topoAdvice = '⚠️ ' + t('scoring_topo_advice') + ' courbes de niveau (zigzag), fossés fanya juu.';
        else if (topography.includes('Plaine')) topoAdvice = '💧 Canaux de drainage. Riz ou légumes tolérants à l\'eau.';
        else if (topography.includes('Plateau')) topoAdvice = '🌬️ Haies vives coupe-vent. Sol couvert en permanence.';

        // ── Plantes associées ─────────────────────────────────
        const companions = {
            'Maïs': 'Haricot + Courge', 'Manioc': 'Arachide ou Niébé',
            'Café': 'Bananier (ombrage) + Légumineuses', 'Haricot': 'Maïs (tuteur)',
            'Riz': 'Légumineuses sur bordure', 'Banane': 'Café + Légumineuses'
        };
        const companion = companions[crop] || t('scoring_companion');

        const container = document.getElementById('scoring-result-container');
        container.classList.remove('hidden');

        // ── Badge météo dans le résultat ──────────────────────
        const weatherBadge = weatherBonus !== 0 ? `
            <div class="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg ${weatherBonus > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                <i class="fa-solid fa-cloud-sun"></i>
                <span>${weatherBonus > 0 ? t('scoring_weather_bonus') : t('scoring_weather_malus')} <strong>${weatherBonus > 0 ? '+' : ''}${weatherBonus} pts</strong></span>
            </div>` : '';

        container.innerHTML = `
            <div class="rounded-xl p-5 border ${score >= 70 ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300'} space-y-4">
                <div class="flex items-center justify-between flex-wrap gap-2">
                    <div>
                        <span class="text-xs font-bold text-slate-500 uppercase" data-i18n="scoring_result_title">${t('scoring_result_title')}</span>
                        <h3 class="text-3xl font-black ${score >= 70 ? 'text-emerald-800' : 'text-amber-800'}">${score} / 100</h3>
                    </div>
                    <div class="px-3 py-1 rounded-full text-xs font-extrabold ${score >= 70 ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'}">
                        ${score >= 70 ? '✓ ' + t('scoring_eligible') : '⚠️ ' + t('scoring_conditional')}
                    </div>
                </div>

                ${weatherBadge}

                <!-- Alerte saison -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
                    <strong class="text-blue-800">📅 ${saison_info.nom} (${saison_info.periode})</strong>
                    <p class="text-blue-700 mt-1">${saison_info.alerte}</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div class="bg-white p-3 rounded-lg border border-slate-200">
                        <strong class="block font-extrabold mb-1">Engrais FOMI Recommandé :</strong>
                        <span class="text-green-700 font-bold">${fomi.produit}</span>
                    </div>
                    <div class="bg-white p-3 rounded-lg border border-slate-200">
                        <strong class="block font-extrabold mb-1">Nombre de Sacs (25 kg) :</strong>
                        <span class="text-amber-700 font-bold">${fomi.sacs_total} sacs × ${new Intl.NumberFormat('fr-FR').format(fomi.prix_sac_bif)} BIF</span>
                    </div>
                    <div class="bg-white p-3 rounded-lg border border-slate-200">
                        <strong class="block font-extrabold mb-1">Coût Total Engrais :</strong>
                        <span class="text-red-700 font-bold text-base">${fomi.cout_display}</span>
                    </div>
                    <div class="bg-white p-3 rounded-lg border border-slate-200">
                        <strong class="block font-extrabold mb-1">Remboursement estimé (taux ${taux}%) :</strong>
                        <span class="text-purple-700 font-bold">${new Intl.NumberFormat('fr-FR').format(cout_credit)} BIF</span>
                    </div>
                    <div class="bg-white p-3 rounded-lg border border-slate-200">
                        <strong class="block font-extrabold mb-1">Plantes Associées :</strong>
                        <span class="text-blue-700 font-bold">${companion}</span>
                    </div>
                    ${topoAdvice ? `<div class="bg-white p-3 rounded-lg border border-amber-200">
                        <strong class="block font-extrabold mb-1">Conseil Topographie :</strong>
                        <span class="text-slate-700">${topoAdvice}</span>
                    </div>` : ''}
                </div>
                <a href="https://fomi.bi/fr/" target="_blank" rel="noopener" class="inline-flex items-center gap-2 px-4 py-2 bg-green-700 text-white text-xs font-bold rounded-lg hover:bg-green-800 transition">
                    <i class="fa-solid fa-external-link-alt"></i> Voir le catalogue FOMI officiel
                </a>
                <button id="btn-submit-credit"
                    class="w-full py-3 bg-forest-700 hover:bg-forest-800 text-white font-extrabold rounded-xl shadow transition text-xs flex items-center justify-center gap-2">
                    <i class="fa-solid fa-paper-plane"></i> Envoyer la Demande Officielle de Crédit
                </button>
            </div>
        `;
        showToast(`Score calculé : ${score}/100`, 'success');

        // Attacher l'événement de façon sécurisée (évite XSS via attribut onclick inline)
        const btnSubmit = document.getElementById('btn-submit-credit');
        if (btnSubmit) {
            btnSubmit.onclick = () => this.submitCreditRequest(
                farmerName, crop, surface, topography, soil, score,
                fomi.produit, fomi.sacs_total * 25, province, commune
            );
        }
    },

    async submitCreditRequest(farmer_name, crop, surface_ha, topography, soil_type, calculated_score, recommended_fertilizer, fertilizer_quantity_kg, province, commune) {
        const phone = state.currentUser?.phone || document.getElementById('score-phone')?.value || '';
        const institution = document.getElementById('score-institution')?.value || 'FENACOBU';
        const fomi = calculateRealFomiNeeds(crop, surface_ha);

        const creditData = {
            id: 'credit-' + Date.now(),
            user_id: state.currentUser ? state.currentUser.id : 'guest',
            farmer_name, crop, surface_ha, topography, soil_type,
            calculated_score, recommended_fertilizer, fertilizer_quantity_kg,
            fertilizer_bags: fomi.sacs_total,
            fertilizer_cost_bif: fomi.cout_total_bif,
            institution_bancaire: institution,
            phone, province, commune,
            status: 'pending', created_at: new Date().toISOString()
        };

        if (isSupabaseConnected && state.currentUser) {
            try { await supabaseClient.from('credit_requests').insert([creditData]); }
            catch (err) { console.warn('Fallback local:', err); }
        }

        state.creditRequests.unshift(creditData);
        state.saveCredits();
        showToast('Demande de crédit enregistrée avec succès !', 'success');
        this.renderAdminQueue();
    },

    // ── Notification SMS/WhatsApp lors de l'approbation d'un crédit ──────────
    sendCreditApprovalNotification(creditData) {
        const phone = creditData.phone || '';
        const cleanPhone = phone.replace(/[\s\-\(\)]/g,'');
        const fomi = calculateRealFomiNeeds(creditData.crop || '', creditData.surface_ha || 1);

        const msg = `✅ UBUMWE Agri - Demande approuvée !\n`
            + `Cher(e) ${creditData.farmer_name},\n`
            + `Votre demande de crédit engrais a été APPROUVÉE.\n`
            + `Culture: ${creditData.crop} - ${creditData.surface_ha} ha\n`
            + `Engrais: ${fomi.produit}\n`
            + `Sacs: ${fomi.sacs_total} sacs (${fomi.cout_display})\n`
            + `Institution: ${creditData.institution_bancaire}\n`
            + `Score: ${creditData.calculated_score}/100\n`
            + `Présentez ce message à votre agence. Merci !`;

        const encodedMsg = encodeURIComponent(msg);

        // Ouvrir WhatsApp ou SMS selon disponibilité
        if (cleanPhone.startsWith('+257')) {
            window.open(`https://wa.me/${cleanPhone.replace('+','')}?text=${encodedMsg}`, '_blank');
        } else if (cleanPhone) {
            window.open(`sms:${cleanPhone}?body=${encodedMsg}`, '_blank');
        }
        showToast(`Notification envoyée à ${phone}`, 'success');
    },

    async approveCreditRequest(creditId) {
        const credit = state.creditRequests.find(c => c.id === creditId);
        if (!credit) return;
        credit.status = 'approved';
        state.saveCredits();

        if (isSupabaseConnected) {
            try { await supabaseClient.from('credit_requests').update({ status: 'approved' }).eq('id', creditId); }
            catch(e) { console.warn(e); }
        }

        showToast(`Crédit de ${credit.farmer_name} approuvé !`, 'success');
        this.renderAdminQueue();

        // Notification automatique
        this.sendCreditApprovalNotification(credit);
    },
    openDepositModal() {
        if (!state.currentUser) {
            showToast('Veuillez vous connecter pour déposer un produit.', 'warning');
            this.openAuthModal('login');
            return;
        }
        document.getElementById('deposit-modal').classList.remove('hidden');
    },

    closeDepositModal() {
        document.getElementById('deposit-modal').classList.add('hidden');
    },

    filterMarket(category) {
        state.marketFilter = category;
        ['all', 'vegetal', 'animal'].forEach(b => {
            const btn = document.getElementById(`filter-btn-${b}`);
            if (btn) btn.className = b === category
                ? 'px-3 py-1.5 rounded-lg text-xs font-bold bg-forest-700 text-white shadow-sm'
                : 'px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200';
        });
        this.renderMarketplace();
    },

    async handleDepositSubmit(e) {
        e.preventDefault();
        const form = document.getElementById('product-deposit-form');
        const fd = new FormData(form);

        const name     = fd.get('name').trim();
        const price    = parseFloat(fd.get('price'));
        const province = fd.get('province');
        const whatsapp = fd.get('whatsapp_phone').trim();
        const type     = fd.get('type');
        const description = fd.get('description').trim();

        if (!name || !province || !description) {
            showToast('Veuillez remplir tous les champs obligatoires.', 'error'); return;
        }
        if (!validateBurundiPhone(whatsapp)) {
            showToast('Numéro WhatsApp invalide (+257 79 ...)', 'error'); return;
        }
        if (isNaN(price) || price <= 0) {
            showToast('Le prix doit être un nombre supérieur à 0.', 'error'); return;
        }

        const defaultImg = type === 'animal'
            ? 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=600&q=80'
            : 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=600&q=80';

        const newProduct = {
            id: 'prod-' + Date.now(),
            user_id: state.currentUser ? state.currentUser.id : 'guest',
            type, category: fd.get('category').trim(), name,
            quantity: parseFloat(fd.get('quantity')), unit: fd.get('unit'),
            price_per_unit: price, currency: 'FB', province,
            commune: fd.get('commune') || '', whatsapp_phone: whatsapp,
            image_url: fd.get('image_url').trim() || defaultImg,
            description,
            status: (state.currentUser && state.currentUser.role === 'admin') ? 'approved' : 'pending',
            created_at: new Date().toISOString()
        };

        if (isSupabaseConnected && state.currentUser) {
            try { await supabaseClient.from('products').insert([newProduct]); }
            catch (err) { console.warn('Fallback local pour produit:', err); }
        }

        state.products.unshift(newProduct);
        state.saveProducts();
        this.closeDepositModal();
        form.reset();

        if (newProduct.status === 'approved') {
            showToast('Produit publié et visible immédiatement !', 'success');
        } else {
            showToast('Produit soumis — en attente de validation Admin.', 'info');
        }

        this.renderMarketplace();
        this.renderFeaturedHome();
        this.renderAdminQueue();
    },

    renderMarketplace() {
        const grid = document.getElementById('marketplace-grid');
        const livestockGrid = document.getElementById('livestock-products-grid');
        const provinceFilter = document.getElementById('market-province-filter');
        const pf = provinceFilter ? provinceFilter.value : 'all';

        if (!grid) return;

        let filtered = state.products.filter(p => p.status === 'approved');
        if (state.marketFilter !== 'all') filtered = filtered.filter(p => p.type === state.marketFilter);
        if (pf !== 'all') filtered = filtered.filter(p =>
            (p.province || '').toUpperCase() === pf.toUpperCase()
        );

        grid.innerHTML = filtered.length
            ? filtered.map(p => this.createProductCard(p)).join('')
            : `<div class="col-span-full py-12 text-center text-slate-400"><i class="fa-solid fa-basket-shopping text-4xl mb-2 block"></i><p class="text-sm font-semibold">Aucun produit dans cette catégorie.</p></div>`;

        if (livestockGrid) {
            const animals = state.products.filter(p => p.type === 'animal' && p.status === 'approved');
            livestockGrid.innerHTML = animals.length
                ? animals.map(p => this.createProductCard(p)).join('')
                : `<p class="col-span-full text-center text-xs text-slate-400 py-4">Aucun animal à la vente pour l'instant.</p>`;
        }
    },

    renderFeaturedHome() {
        const container = document.getElementById('home-featured-products');
        if (!container) return;
        const featured = state.products.filter(p => p.status === 'approved').slice(0, 3);
        container.innerHTML = featured.map(p => this.createProductCard(p)).join('');
    },

    createProductCard(product) {
        const cleanPhone = (product.whatsapp_phone || '').replace(/[^\d+]/g, '');
        const waMsg = encodeURIComponent(`Bonjour, je suis intéressé par votre annonce UBUMWE Agri : "${product.name}" (${formatCurrency(product.price_per_unit)}) à ${product.province}. Est-il disponible ?`);
        const waUrl = `https://wa.me/${cleanPhone}?text=${waMsg}`;
        const totalPrice = formatCurrency(product.price_per_unit * product.quantity);
        const badgeClass = product.type === 'animal' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800';

        return `
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition">
            <div class="relative h-44 bg-slate-100 overflow-hidden">
                <img src="${product.image_url}" alt="${product.name}" class="w-full h-full object-cover" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22200%22 viewBox=%220 0 400 200%22%3E%3Crect fill=%22%23f1f5f9%22 width=%22400%22 height=%22200%22/%3E%3Ctext fill=%22%2394a3b8%22 font-size=%2216%22 font-family=%22sans-serif%22 x=%22200%22 y=%22105%22 text-anchor=%22middle%22%3EPhoto%3C/text%3E%3C/svg%3E'">
                <span class="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${badgeClass}">${product.type === 'animal' ? '🐄 Élevage' : '🌱 Végétal'}</span>
                <span class="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-700">${product.province}</span>
            </div>
            <div class="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                    <h4 class="font-extrabold text-slate-900 text-sm line-clamp-2">${product.name}</h4>
                    <p class="text-xs text-slate-500 mt-1 line-clamp-2">${product.description}</p>
                </div>
                <div class="flex items-end justify-between mt-2">
                    <div>
                        <span class="block text-[10px] text-slate-400 font-bold uppercase">Prix unitaire</span>
                        <span class="text-base font-black text-forest-700">${formatCurrency(product.price_per_unit)}</span>
                        <span class="text-[10px] text-slate-400 ml-1">/ ${product.unit}</span>
                    </div>
                    <div class="text-right">
                        <span class="block text-[10px] text-slate-400 font-bold uppercase">Qté : ${product.quantity} ${product.unit}</span>
                        <span class="text-xs font-bold text-amber-700">Total : ${totalPrice}</span>
                    </div>
                </div>
                <a href="${waUrl}" target="_blank" rel="noopener noreferrer"
                   class="mt-1 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow transition">
                    <i class="fa-brands fa-whatsapp text-base"></i> Contacter le Vendeur
                </a>
            </div>
        </div>`;
    },

    // ============================================================
    // 10. TABLEAU DE BORD ADMIN
    // ============================================================
    renderAdminQueue() {
        this.renderAdminStats();
        const pendingContainer = document.getElementById('admin-pending-products-list');
        if (!pendingContainer) return;

        const pending = state.products.filter(p => p.status === 'pending');

        if (pending.length === 0) {
            pendingContainer.innerHTML = `
                <div class="p-8 text-center text-slate-400">
                    <i class="fa-solid fa-circle-check text-emerald-400 text-3xl mb-2 block"></i>
                    <p class="text-sm font-semibold">Aucun produit en attente. Tout est validé !</p>
                </div>`;
            return;
        }

        pendingContainer.innerHTML = pending.map(p => `
            <div class="p-4 hover:bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img src="${p.image_url}" class="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0" alt="${p.name}">
                <div class="flex-1 min-w-0">
                    <p class="font-extrabold text-slate-900 text-sm">${p.name}</p>
                    <p class="text-xs text-slate-500">${p.province} · ${formatCurrency(p.price_per_unit)} / ${p.unit} · ${p.type === 'animal' ? '🐄 Élevage' : '🌱 Végétal'}</p>
                    <p class="text-xs text-slate-400 line-clamp-1 mt-0.5">${p.description}</p>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="app.approveProduct('${p.id}')" class="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg shadow">
                        <i class="fa-solid fa-check mr-1"></i> Valider
                    </button>
                    <button onclick="app.rejectProduct('${p.id}')" class="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-lg">
                        <i class="fa-solid fa-xmark mr-1"></i> Rejeter
                    </button>
                </div>
            </div>
        `).join('');
    },

    renderAdminStats() {
        const approved = state.products.filter(p => p.status === 'approved').length;
        const pending  = state.products.filter(p => p.status === 'pending').length;
        const el = id => document.getElementById(id);
        if (el('admin-pending-count'))  el('admin-pending-count').textContent  = pending;
        if (el('admin-approved-count')) el('admin-approved-count').textContent = approved;
        if (el('admin-credits-count'))  el('admin-credits-count').textContent  = state.creditRequests.length;
        if (el('admin-stat-users'))     el('admin-stat-users').textContent     = Math.max(5, state.products.length + 3);
        this.refreshSecurityReport();
    },

    refreshSecurityReport() {
        if (typeof UbumweSecurity === 'undefined') return;
        const report = UbumweSecurity.getReport();
        const el = id => document.getElementById(id);
        if (el('sec-layer1')) el('sec-layer1').textContent = report.layers.layer1 === 'ACTIF' ? '🟢 ACTIF' : '🔴 INACTIF';
        if (el('sec-layer2')) el('sec-layer2').textContent = report.layers.layer2 === 'ACTIF' ? '🟢 ACTIF' : '🔴 INACTIF';
        if (el('sec-layer3')) el('sec-layer3').textContent = report.layers.layer3 === 'ACTIF' ? '🟢 ACTIF' : '🔴 INACTIF';
        if (el('sec-total'))   el('sec-total').textContent  = report.stats.total;
        if (el('sec-blocked')) el('sec-blocked').textContent = report.stats.blocked;
        if (el('sec-xss'))     el('sec-xss').textContent    = report.stats.xss_attempts;
        if (el('sec-24h'))     el('sec-24h').textContent    = report.stats.last24h;
    },

    async approveProduct(productId) {
        const prod = state.products.find(p => p.id === productId);
        if (!prod) return;
        prod.status = 'approved';
        if (isSupabaseConnected) {
            try { await supabaseClient.from('products').update({ status: 'approved' }).eq('id', productId); }
            catch (e) { console.warn(e); }
        }
        state.saveProducts();
        showToast(`"${prod.name}" approuvé et publié !`, 'success');
        this.renderAdminQueue();
        this.renderMarketplace();
        this.renderFeaturedHome();
    },

    async rejectProduct(productId) {
        const prod = state.products.find(p => p.id === productId);
        if (!prod) return;
        prod.status = 'rejected';
        if (isSupabaseConnected) {
            try { await supabaseClient.from('products').update({ status: 'rejected' }).eq('id', productId); }
            catch (e) { console.warn(e); }
        }
        state.saveProducts();
        showToast(`"${prod.name}" rejeté.`, 'warning');
        this.renderAdminQueue();
    },

    renderPrices() {
        // Table des prix
        const tbody = document.getElementById('prix-table-body');
        if (tbody) {
            tbody.innerHTML = Object.entries(PRIX_MARCHES).map(([produit, p]) => {
                const moy = Math.round((p.prix_min + p.prix_max) / 2);
                const fmt = n => new Intl.NumberFormat('fr-FR').format(n);
                const isAnimal = p.unite.includes('tête') || p.unite.includes('litre');
                return `<tr class="hover:bg-slate-50 transition">
                    <td class="px-4 py-3 font-bold text-slate-900">${isAnimal ? '🐄' : '🌱'} ${produit}</td>
                    <td class="px-4 py-3 text-right text-slate-500">${fmt(p.prix_min)}</td>
                    <td class="px-4 py-3 text-right text-slate-500">${fmt(p.prix_max)}</td>
                    <td class="px-4 py-3 text-right font-extrabold text-amber-700">${fmt(moy)} <span class="text-[10px] font-normal text-slate-400">${p.unite}</span></td>
                    <td class="px-4 py-3 text-slate-600 text-[11px]">${p.marche_ref}</td>
                    <td class="px-4 py-3 text-[10px] text-slate-400">${p.source}</td>
                </tr>`;
            }).join('');
        }

        // Sources officielles
        const sgrid = document.getElementById('sources-grid');
        if (sgrid && typeof SOURCES_OFFICIELLES !== 'undefined') {
            sgrid.innerHTML = SOURCES_OFFICIELLES.map(s => `
                <a href="${s.url}" target="_blank" rel="noopener"
                   class="block bg-slate-50 border border-slate-200 rounded-xl p-3 hover:border-forest-400 hover:bg-forest-50 transition">
                    <div class="font-extrabold text-slate-900 text-xs">${s.nom}</div>
                    <div class="text-[10px] text-forest-700 font-bold mt-0.5">${s.institution}</div>
                    <div class="text-[10px] text-slate-500 mt-1">${s.type}</div>
                    <div class="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i> Accéder →
                    </div>
                </a>`).join('');
        }

        // Marchés par province
        const mgrid = document.getElementById('marches-grid');
        if (mgrid && typeof MARCHES_PAR_PROVINCE !== 'undefined') {
            mgrid.innerHTML = Object.entries(MARCHES_PAR_PROVINCE).map(([prov, marches]) => `
                <div class="bg-slate-50 rounded-xl border border-slate-200 p-3">
                    <div class="font-extrabold text-forest-800 text-xs mb-2">${prov}</div>
                    ${marches.map(m => `<div class="text-[11px] text-slate-600 py-0.5 border-b border-slate-100 last:border-0">📍 ${m}</div>`).join('')}
                </div>`).join('');
        }
    },

    resetToSeedData() {
        localStorage.setItem(LOCAL_STORAGE_PRODUCTS, JSON.stringify(INITIAL_SEED_PRODUCTS));
        state.products = [...INITIAL_SEED_PRODUCTS];
        this.renderMarketplace();
        this.renderFeaturedHome();
        this.renderAdminQueue();
        showToast('Données réinitialisées avec les produits de démonstration.', 'success');
    },

    // ============================================================
    // 13. MODULE DIAGNOSTIC MALADIES
    // ============================================================
    _diseaseTypeFilter: 'all',

    initDiseases() {
        this.renderDiseases();
    },

    filterDiseaseType(type) {
        this._diseaseTypeFilter = type;
        ['all','plant','animal'].forEach(t => {
            const btn = document.getElementById('dtype-' + t);
            if (btn) btn.className = t === type
                ? 'px-4 py-2 rounded-xl text-xs font-bold bg-red-700 text-white'
                : 'px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200';
        });
        this.renderDiseases();
    },

    filterDiseases() {
        this.renderDiseases();
    },

    renderDiseases() {
        const grid = document.getElementById('diseases-grid');
        if (!grid) return;

        const query = (document.getElementById('disease-search')?.value || '').toLowerCase();
        const type  = this._diseaseTypeFilter;

        let plants  = (typeof PLANT_DISEASES_DB  !== 'undefined' && PLANT_DISEASES_DB.length)  ? PLANT_DISEASES_DB  : (typeof DISEASES_CATALOG_OFFLINE !== 'undefined' ? DISEASES_CATALOG_OFFLINE.filter(d=>d.type==='plante').map(d=>({...d,id:d.id,name:d.nom,name_en:d.nom_rn,plant:d.sujet,symptoms:d.symptomes,treatment:d.traitement,prevention:d.prevention,source:d.source,severity:d.gravite,image:d.image||null})) : []);
        let animals = (typeof ANIMAL_DISEASES_DB !== 'undefined' && ANIMAL_DISEASES_DB.length) ? ANIMAL_DISEASES_DB : (typeof DISEASES_CATALOG_OFFLINE !== 'undefined' ? DISEASES_CATALOG_OFFLINE.filter(d=>d.type==='animal').map(d=>({...d,id:d.id,name:d.nom,name_en:d.nom_rn,animal:d.sujet,symptoms:d.symptomes,treatment:d.traitement,prevention:d.prevention,source:d.source,severity:d.gravite,image:d.image||null})) : []);

        let items = [];
        if (type === 'all' || type === 'plant')  items = items.concat(plants.map(d  => ({...d, _type:'plant'})));
        if (type === 'all' || type === 'animal') items = items.concat(animals.map(d => ({...d, _type:'animal'})));

        if (query) {
            items = items.filter(d =>
                (d.name || '').toLowerCase().includes(query) ||
                (d.plant || d.animal || '').toLowerCase().includes(query) ||
                (d.symptoms || '').toLowerCase().includes(query) ||
                (d.name_en || '').toLowerCase().includes(query)
            );
        }

        const severityColors = {
            'faible':   'bg-blue-100 text-blue-800 border-blue-200',
            'modere':   'bg-amber-100 text-amber-800 border-amber-200',
            'grave':    'bg-orange-100 text-orange-800 border-orange-200',
            'critique': 'bg-red-100 text-red-800 border-red-200'
        };

        if (!items.length) {
            grid.innerHTML = `<div class="col-span-full py-10 text-center text-slate-400">
                <i class="fa-solid fa-magnifying-glass text-3xl mb-2 block"></i>
                <p class="text-sm font-semibold">Aucune maladie trouvée pour cette recherche.</p>
            </div>`;
            return;
        }

        grid.innerHTML = items.map(d => {
            const subject  = d._type === 'plant' ? (d.plant || '') : (d.animal || '');
            const icon     = d._type === 'plant' ? '🌱' : '🐄';
            const sevColor = severityColors[d.severity] || 'bg-slate-100 text-slate-700';
            const imgFallback = d._type === 'plant'
                ? 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=320&q=80'
                : 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=320&q=80';

            return `
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer"
                 onclick="app.showDiseaseDetail('${d.id}','${d._type}')">
                <div class="h-36 bg-slate-100 overflow-hidden relative">
                    <img src="${d.image || imgFallback}" alt="${d.name}"
                         class="w-full h-full object-cover"
                         onerror="this.src='${imgFallback}'" loading="lazy">
                    <span class="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${sevColor} border">
                        ${d.severity?.toUpperCase() || ''}
                    </span>
                    <span class="absolute top-2 right-2 text-lg">${icon}</span>
                </div>
                <div class="p-4">
                    <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">${subject}</p>
                    <h4 class="font-extrabold text-slate-900 text-sm mb-2 line-clamp-2">${d.name}</h4>
                    <p class="text-xs text-slate-500 line-clamp-2">${d.symptoms || ''}</p>
                    <div class="mt-3 flex items-center justify-between">
                        <span class="text-[10px] text-slate-400">${d.source || ''}</span>
                        <button class="text-xs font-bold text-red-700 hover:text-red-900">
                            Voir remèdes →
                        </button>
                    </div>
                </div>
            </div>`;
        }).join('');
    },

    showDiseaseDetail(id, type) {
        // Chercher d'abord dans les DBs principales, puis dans le catalogue offline si non trouvé
        const primaryDb = type === 'plant'
            ? (typeof PLANT_DISEASES_DB  !== 'undefined' ? PLANT_DISEASES_DB  : [])
            : (typeof ANIMAL_DISEASES_DB !== 'undefined' ? ANIMAL_DISEASES_DB : []);

        let d = primaryDb.find(x => x.id === id);

        // Fallback : chercher dans DISEASES_CATALOG_OFFLINE et normaliser le format
        if (!d && typeof DISEASES_CATALOG_OFFLINE !== 'undefined') {
            const raw = DISEASES_CATALOG_OFFLINE.find(x => x.id === id);
            if (raw) {
                d = {
                    ...raw,
                    name: raw.nom || raw.name,
                    name_en: raw.nom_rn || raw.name_en || '',
                    plant: type === 'plant' ? (raw.sujet || '') : undefined,
                    animal: type === 'animal' ? (raw.sujet || '') : undefined,
                    symptoms: raw.symptomes || raw.symptoms || '',
                    treatment: raw.traitement || raw.treatment || '',
                    prevention: raw.prevention || '',
                    severity: raw.gravite || raw.severity || 'modere',
                    source: raw.source || '',
                    image: raw.image || null,
                };
            }
        }

        if (!d) return;

        const modal   = document.getElementById('disease-modal');
        const content = document.getElementById('disease-modal-content');
        const subject = type === 'plant' ? (d.plant || '') : (d.animal || '');
        const imgFallback = type === 'plant'
            ? 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80'
            : 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&q=80';

        const sevColors = {
            'faible':'bg-blue-100 text-blue-800','modere':'bg-amber-100 text-amber-800',
            'grave':'bg-orange-100 text-orange-800','critique':'bg-red-100 text-red-800'
        };
        const sc = sevColors[d.severity] || 'bg-slate-100 text-slate-800';

        // Support dual formats:
        // diseases_db.js     : d.symptoms, d.treatment, d.prevention, d.cause, d.diagnosis
        // DISEASES_CATALOG_OFFLINE : d.symptomes, d.traitement, d.prevention (no cause/diagnosis)
        const symptoms  = d.symptoms   || d.symptomes   || '';
        const treatment = d.treatment  || d.traitement  || '';
        const prevention= d.prevention || '';
        const causeTxt  = d.cause      || '';
        const diagTxt   = d.diagnosis  || '';
        const diseaseName = d.name || d.nom || '';
        const diseaseNameEn = d.name_en || d.nom_rn || '';

        const formatLines = (text) => (text || '').split('\n').map(l =>
            `<li class="flex items-start gap-2 py-1"><span class="text-red-500 mt-1">▶</span><span>${l.replace(/^\d+\.\s*/,'')}</span></li>`
        ).join('');

        content.innerHTML = `
            <div class="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div class="flex-1">
                    <p class="text-xs font-bold text-slate-400 uppercase mb-1">${type === 'plant' ? '🌱' : '🐄'} ${subject}</p>
                    <h3 class="text-xl font-black text-slate-900">${diseaseName}</h3>
                    <p class="text-sm text-slate-500 mt-1">${diseaseNameEn}</p>
                    <span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-extrabold ${sc}">${(d.severity || d.gravite || '').toUpperCase()}</span>
                    ${d.is_zoonotic ? '<span class="ml-2 inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-purple-100 text-purple-800">⚠️ ZOONOSE - Danger humain</span>' : ''}
                </div>
                <img src="${d.image || imgFallback}" alt="${diseaseName}"
                     class="w-24 h-24 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                     onerror="this.src='${imgFallback}'">
            </div>

            <div class="space-y-4">
                <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <h4 class="font-extrabold text-amber-900 text-sm mb-2 flex items-center gap-1">
                        <i class="fa-solid fa-triangle-exclamation text-amber-600"></i> Symptômes
                    </h4>
                    <p class="text-sm text-amber-800">${symptoms}</p>
                </div>

                ${(causeTxt || diagTxt) ? `
                <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <h4 class="font-extrabold text-slate-900 text-sm mb-2 flex items-center gap-1">
                        <i class="fa-solid fa-microscope text-slate-600"></i> Cause & Diagnostic
                    </h4>
                    ${causeTxt ? `<p class="text-sm text-slate-700"><strong>Cause :</strong> ${causeTxt}</p>` : ''}
                    ${diagTxt  ? `<p class="text-sm text-slate-700 mt-1"><strong>Diagnostic :</strong> ${diagTxt}</p>` : ''}
                </div>` : ''}

                <div class="bg-green-50 border border-green-200 rounded-xl p-4">
                    <h4 class="font-extrabold text-green-900 text-sm mb-2 flex items-center gap-1">
                        <i class="fa-solid fa-flask text-green-600"></i> Traitement / Remèdes
                    </h4>
                    <ul class="text-sm text-green-800 space-y-0.5">${formatLines(treatment)}</ul>
                </div>

                <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 class="font-extrabold text-blue-900 text-sm mb-2 flex items-center gap-1">
                        <i class="fa-solid fa-shield-halved text-blue-600"></i> Prévention
                    </h4>
                    <p class="text-sm text-blue-800">${prevention}</p>
                    ${d.vaccine ? `<p class="text-sm text-blue-900 font-bold mt-2">💉 Vaccin : ${d.vaccine}</p>` : ''}
                </div>

                <p class="text-xs text-slate-400 text-right">Source : ${d.source || 'FAO'} — UBUMWE Agri Database</p>
            </div>
        `;

        modal.classList.remove('hidden');
    }
};

// Démarrage au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

/* ═══════════════════════════════════════════════════════════════
   LOADING SCREEN — Fonction globale 2-3 secondes
═══════════════════════════════════════════════════════════════ */
function showLoadingScreen(message, callback) {
    const screen = document.getElementById('loading-screen');
    const msg    = document.getElementById('loading-msg');
    const bar    = document.getElementById('loading-bar');
    if (!screen) { if (callback) callback(); return; }

    if (msg) msg.textContent = message || t('auth_connecting');
    screen.classList.remove('hidden');

    // Barre de progression animée sur 2.5 secondes
    let pct = 0;
    const duration = 2500;
    const interval = 40;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
        pct = Math.min(pct + step + Math.random() * 2, 100);
        if (bar) bar.style.width = pct + '%';
        if (pct >= 100) {
            clearInterval(timer);
            setTimeout(() => {
                screen.classList.add('hidden');
                if (bar) bar.style.width = '0%';
                if (callback) callback();
            }, 300);
        }
    }, interval);
}

/* ═══════════════════════════════════════════════════════════════
   COMMUNES + MÉTÉO — Mise à jour quand province change
═══════════════════════════════════════════════════════════════ */
function updateCommunes(province) {
    const COMMUNES_PAR_PROVINCE = {
        'BUJUMBURA':   ['Bubanza','Bukinanyana','Cibitoke','Isare','Mpanda','Mugere','Mugina','Muhuta','Mukaza','Ntahangwa','Rwibaga'],
        'GITEGA':      ['Bugendana','Gishubi','Gitega','Karusi','Kiganda','Muramvya','Mwaro','Nyabihanga','Shombo'],
        'BUTANYERERA': ['Busoni','Kayanza','Kiremba','Kirundo','Matongo','Muhanga','Ngozi','Tangara'],
        'BURUNGA':     ['Bururi','Makamba','Matana','Musongati','Nyanza-Lac','Rumonge','Rutana'],
        'BUHUMUZA':    ['Butaganzwa','Butihinda','Cankuzo','Gisagara','Gisuru','Muyinga','Ruyigi']
    };
    const communes = COMMUNES_PAR_PROVINCE[province] || [];
    const opts = `<option value="">${t('choose_commune')}</option>` +
        communes.map(c => `<option value="${c}">${c}</option>`).join('');

    const sel = document.getElementById('score-commune');
    const mSel = document.getElementById('deposit-commune');
    if (sel)  sel.innerHTML  = opts;
    if (mSel) mSel.innerHTML = opts;

    // ── Charger la météo en temps réel pour cette province ────
    if (province && typeof weatherApp !== 'undefined') {
        weatherApp.renderWidget(province);
    }
}

/* ═══════════════════════════════════════════════════════════════
   PROTECTION CODE — Désactivation clic droit + devtools basique
   (Protection légère côté client — vraie protection = obfuscation)
═══════════════════════════════════════════════════════════════ */
(function protectCode() {
    // Désactiver clic droit sur mobile
    document.addEventListener('contextmenu', e => {
        if ('ontouchstart' in window) e.preventDefault();
    });
    // Désactiver sélection texte sur éléments non-input
    document.addEventListener('selectstart', e => {
        const tag = e.target.tagName;
        if (!['INPUT','TEXTAREA','SELECT'].includes(tag)) {
            // Autoriser sur certains éléments seulement
        }
    });
})();

