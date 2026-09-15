/**
 * UBUMWE AGRI - Système de Traductions Multilingues
 * Langues supportées : Français, Kirundi, English
 */

const translations = {
    fr: {
        // Navigation
        nav_home: "Accueil",
        nav_scoring: "Agri-Scoring & Crédit FOMI",
        nav_market: "Marketplace Agricole",
        nav_livestock: "Élevage & Bétail",
        nav_guide: "Guide FOMI",
        nav_admin: "Dashboard Admin",
        
        // Authentification
        auth_login: "Connexion",
        auth_register: "S'inscrire",
        auth_logout: "Déconnexion",
        auth_email: "Email",
        auth_password: "Mot de passe",
        auth_full_name: "Nom complet",
        auth_phone: "Téléphone",
        auth_role: "Rôle",
        auth_role_farmer: "Agriculteur",
        auth_role_herder: "Éleveur",
        auth_role_client: "Client/Acheteur",
        auth_create_account: "Créer mon Compte",
        auth_signin: "Se Connecter",
        auth_already_account: "Déjà un compte ? Se connecter",
        auth_no_account: "Pas encore de compte ? S'inscrire ici",
        
        // Hero
        hero_title: "UBUMWE Agri : Crédit Agricole, Fertilisants FOMI & Marketplace Burundi",
        hero_subtitle: "Solution complète d'agriculture de précision : Évaluez votre score de crédit engrais, vendez et achetez des récoltes et du bétail sans intermédiaire.",
        hero_btn_score: "Calculer mon Score Crédit",
        hero_btn_market: "Accéder à la Marketplace",
        hero_btn_deposit: "Déposer un Produit",
        
        // Scoring
        scoring_title: "Formulaire d'Évaluation de Crédit Engrais",
        scoring_subtitle: "Saisissez les détails de la parcelle pour obtenir un score de confiance et faire une demande de crédit d'intrants.",
        scoring_farmer_name: "Nom Complet de l'Agriculteur",
        scoring_province: "Province (Réforme 2025)",
        scoring_commune: "Commune / Colline",
        scoring_crop: "Culture Principale",
        scoring_topography: "Relief / Topographie",
        scoring_soil: "Texture du Sol",
        scoring_surface: "Superficie (en Hectares)",
        scoring_phone: "Téléphone de Contact Burundi",
        scoring_calculate: "ÉVALUER LE SCORE ET RECOMMANDER L'ENGRAIS",
        scoring_result_title: "Score de Crédit Agronomique",
        scoring_eligible: "Éligible au Crédit",
        scoring_conditional: "Crédit Sous Condition",
        scoring_fertilizer: "Engrais FOMI Recommandé :",
        scoring_quantity: "Quantité Totale :",
        scoring_companion: "Plantes Associées :",
        scoring_topo_advice: "Conseil Topographie :",
        scoring_send_request: "Envoyer la Demande Officielle de Crédit",
        
        // Marketplace
        market_title: "Marketplace Agricole & Élevage Burundi",
        market_subtitle: "Achetez et vendez directement vos récoltes et bétail sans intermédiaire.",
        market_deposit: "Déposer un Produit / Animal",
        market_all: "Tous les Produits",
        market_vegetal: "Produits Végétaux",
        market_animal: "Élevage & Bétail",
        market_province_all: "Toutes les Provinces",
        market_contact_seller: "Contacter le Vendeur",
        market_no_products: "Aucun produit dans cette catégorie pour le moment.",
        market_price_unit: "Prix unitaire",
        market_quantity: "Qté",
        market_total: "Total",
        
        // Deposit modal
        deposit_title: "Déposer un Produit sur la Marketplace",
        deposit_type: "Type de Produit",
        deposit_type_vegetal: "Produit Végétal (Récolte)",
        deposit_type_animal: "Animal (Élevage)",
        deposit_category: "Catégorie",
        deposit_name: "Nom du Produit",
        deposit_quantity: "Quantité",
        deposit_unit: "Unité",
        deposit_price: "Prix unitaire (FB)",
        deposit_province: "Province",
        deposit_commune: "Commune",
        deposit_whatsapp: "Numéro WhatsApp",
        deposit_image: "URL de l'image (optionnel)",
        deposit_description: "Description",
        deposit_submit: "Soumettre le Produit",
        deposit_cancel: "Annuler",
        
        // Toasts
        toast_welcome: "Bienvenue",
        toast_login_success: "Connexion réussie !",
        toast_logout: "Vous avez été déconnecté.",
        toast_signup_success: "Inscription réussie ! Connectez-vous.",
        toast_phone_invalid: "Format de téléphone invalide (ex: +257 79 123 456).",
        toast_fill_fields: "Veuillez remplir tous les champs.",
        toast_product_submitted: "Produit soumis ! En attente de validation Admin.",
        toast_product_published: "Produit publié et visible immédiatement !",
        toast_score_calculated: "Score calculé avec succès",
        toast_credit_sent: "Demande de crédit enregistrée avec succès !",
        toast_must_login: "Veuillez vous connecter pour déposer un produit.",
        
        // Admin
        admin_title: "Tableau de Bord Administrateur",
        admin_subtitle: "Validation des annonces du marché, gestion des rôles et contrôle du système.",
        admin_pending: "Produits en Attente",
        admin_approved: "Produits Approuvés",
        admin_credits: "Demandes de Crédit",
        admin_users: "Utilisateurs Actifs",
        admin_validate: "Valider",
        admin_reject: "Rejeter",
        admin_no_pending: "Aucun produit en attente. Tout est validé !",
        admin_reset_demo: "Réinitialiser démo",
        admin_demo_mode: "Mode Test Admin",
        
        // Footer
        footer_partners: "Partenaire Engrais",
        footer_db: "Base de Données",
        footer_livestock: "Élevage & Bétail",
        footer_direct_sale: "Vente Directe",
        
        // Cultures
        crop_corn: "Maïs",
        crop_banana: "Banane",
        crop_bean: "Haricot",
        crop_cassava: "Manioc",
        crop_rice: "Riz (Bas-fonds)",
        crop_coffee: "Caféier",
        crop_potato: "Pomme de terre",
        
        // Provinces
        province_gitega: "Gitega",
        province_buhumuza: "Buhumuza",
        province_bujumbura: "Bujumbura",
        province_burunga: "Burunga",
        province_butanyerera: "Butanyerera",
    },
    
    rn: { // Kirundi
        // Navigation
        nav_home: "Ahabanza",
        nav_scoring: "Agri-Scoring & Inguzanyo FOMI",
        nav_market: "Isoko ry'Ubuhinzi",
        nav_livestock: "Ubworozi",
        nav_guide: "Ubuyobozi bwa FOMI",
        nav_admin: "Ikibanza c'Umuyobozi",
        
        // Authentification
        auth_login: "Kwinjira",
        auth_register: "Kwiyandikisha",
        auth_logout: "Gusohoka",
        auth_email: "Imeyili",
        auth_password: "Ijambobanga",
        auth_full_name: "Amazina yose",
        auth_phone: "Telefoni",
        auth_role: "Uruhare",
        auth_role_farmer: "Umuhinzi",
        auth_role_herder: "Umworozi",
        auth_role_client: "Umuguzi",
        auth_create_account: "Kora Konti Yanje",
        auth_signin: "Kwinjira",
        auth_already_account: "Ufise konti? Injira",
        auth_no_account: "Ntufise konti? Iyandikishe hano",
        
        // Hero
        hero_title: "UBUMWE Agri : Inguzanyo z'Ubuhinzi, Ifumbire za FOMI & Isoko rya Burundi",
        hero_subtitle: "Igisubizo c'ubuhinzi bwiza : Suzuma amanota y'inguzanyo, ugurisha kandi ugure ibihingwa n'amatungo bitarenze ku bandi.",
        hero_btn_score: "Kubara Amanota Yanje",
        hero_btn_market: "Injira ku Isoko",
        hero_btn_deposit: "Shira Igicuruzwa",
        
        // Scoring
        scoring_title: "Ifishi yo Gusuzuma Inguzanyo z'Ifumbire",
        scoring_subtitle: "Andika ibisobanuro vy'umurima kugira ngo ubone amanota kandi usabe inguzanyo z'ifumbire.",
        scoring_farmer_name: "Amazina Yose y'Umuhinzi",
        scoring_province: "Intara (Ivugurura rya 2025)",
        scoring_commune: "Komine / Umusozi",
        scoring_crop: "Igihingwa Nyamukuru",
        scoring_topography: "Imiterere y'Ubutaka",
        scoring_soil: "Ubwoko bw'Ubutaka",
        scoring_surface: "Ubunini (mw'Mahectare)",
        scoring_phone: "Telefoni yo Kuvugana",
        scoring_calculate: "SUZUMA AMANOTA KANDI USABE IFUMBIRE",
        scoring_result_title: "Amanota y'Inguzanyo z'Ubuhinzi",
        scoring_eligible: "Wemerewe Inguzanyo",
        scoring_conditional: "Inguzanyo ku Bishingiye",
        scoring_fertilizer: "Ifumbire za FOMI Zirasabwa :",
        scoring_quantity: "Igiteranyo Cyose :",
        scoring_companion: "Ibimera Bifashanya :",
        scoring_topo_advice: "Inama ku Miterere :",
        scoring_send_request: "Ohereza Icyifuzo c'Inguzanyo",
        
        // Marketplace
        market_title: "Isoko ry'Ubuhinzi & Ubworozi mu Burundi",
        market_subtitle: "Gura kandi ugurisha ibihingwa n'amatungo bitarenze ku bandi.",
        market_deposit: "Shira Igicuruzwa / Igitungo",
        market_all: "Ibicuruzwa Vyose",
        market_vegetal: "Ibihingwa",
        market_animal: "Ubworozi & Amatungo",
        market_province_all: "Intara Zose",
        market_contact_seller: "Vugana n'Uwagurisha",
        market_no_products: "Nta gicuruzwa kiri muri iyi kategori ubu.",
        market_price_unit: "Igiciro ku kimwe",
        market_quantity: "Ingano",
        market_total: "Igiteranyo",
        
        // Deposit modal
        deposit_title: "Shira Igicuruzwa ku Isoko",
        deposit_type: "Ubwoko bw'Igicuruzwa",
        deposit_type_vegetal: "Igihingwa",
        deposit_type_animal: "Igitungo (Ubworozi)",
        deposit_category: "Ikiciro",
        deposit_name: "Izina ry'Igicuruzwa",
        deposit_quantity: "Ingano",
        deposit_unit: "Igipimo",
        deposit_price: "Igiciro ku kimwe (FB)",
        deposit_province: "Intara",
        deposit_commune: "Komine",
        deposit_whatsapp: "Nimero ya WhatsApp",
        deposit_image: "URL y'Ishusho (itari ngombwa)",
        deposit_description: "Ibisobanuro",
        deposit_submit: "Ohereza Igicuruzwa",
        deposit_cancel: "Hagarika",
        
        // Toasts
        toast_welcome: "Murakaza neza",
        toast_login_success: "Winjiye neza !",
        toast_logout: "Wasohokeje.",
        toast_signup_success: "Wiyandikishije neza ! Injira.",
        toast_phone_invalid: "Telefoni ntiyuzuye (urugero: +257 79 123 456).",
        toast_fill_fields: "Uzuza amasomo yose.",
        toast_product_submitted: "Igicuruzwa cyoherejwe ! Gitegereza kwemezwa.",
        toast_product_published: "Igicuruzwa cyaratangajwe !",
        toast_score_calculated: "Amanota yarabawe neza",
        toast_credit_sent: "Icyifuzo c'inguzanyo cyanditswe neza !",
        toast_must_login: "Ugomba kwinjira kugira ngo ushireho igicuruzwa.",
        
        // Admin
        admin_title: "Ikibanza c'Umuyobozi",
        admin_subtitle: "Kwemeza ibicuruzwa, kuyobora abantu no kugenzura sisitemu.",
        admin_pending: "Ibicuruzwa Bitegereje",
        admin_approved: "Ibicuruzwa Byemejwe",
        admin_credits: "Ibisabwa vy'Inguzanyo",
        admin_users: "Abakoresha Bakora",
        admin_validate: "Emeza",
        admin_reject: "Anga",
        admin_no_pending: "Nta gicuruzwa gitegereje. Vyose byemejwe !",
        admin_reset_demo: "Ongera utangire demo",
        admin_demo_mode: "Uburyo bwo Kugerageza",
        
        // Cultures
        crop_corn: "Ibigori",
        crop_banana: "Ibitoke",
        crop_bean: "Ibiharage",
        crop_cassava: "Imyumbati",
        crop_rice: "Umuceri",
        crop_coffee: "Ikawa",
        crop_potato: "Ibirayi",
        
        // Provinces
        province_gitega: "Gitega",
        province_buhumuza: "Buhumuza",
        province_bujumbura: "Bujumbura",
        province_burunga: "Burunga",
        province_butanyerera: "Butanyerera",
    },
    
    en: { // English
        // Navigation
        nav_home: "Home",
        nav_scoring: "Agri-Scoring & FOMI Credit",
        nav_market: "Agricultural Marketplace",
        nav_livestock: "Livestock & Cattle",
        nav_guide: "FOMI Guide",
        nav_admin: "Admin Dashboard",
        
        // Authentification
        auth_login: "Login",
        auth_register: "Sign Up",
        auth_logout: "Logout",
        auth_email: "Email",
        auth_password: "Password",
        auth_full_name: "Full Name",
        auth_phone: "Phone",
        auth_role: "Role",
        auth_role_farmer: "Farmer",
        auth_role_herder: "Herder",
        auth_role_client: "Client/Buyer",
        auth_create_account: "Create My Account",
        auth_signin: "Sign In",
        auth_already_account: "Already have an account? Sign in",
        auth_no_account: "Don't have an account? Sign up here",
        
        // Hero
        hero_title: "UBUMWE Agri: Agricultural Credit, FOMI Fertilizers & Burundi Marketplace",
        hero_subtitle: "Complete precision agriculture solution: Assess your fertilizer credit score, sell and buy crops and livestock without intermediaries.",
        hero_btn_score: "Calculate My Credit Score",
        hero_btn_market: "Access Marketplace",
        hero_btn_deposit: "List a Product",
        
        // Scoring
        scoring_title: "Fertilizer Credit Assessment Form",
        scoring_subtitle: "Enter plot details to get a confidence score and apply for input credit.",
        scoring_farmer_name: "Farmer's Full Name",
        scoring_province: "Province (2025 Reform)",
        scoring_commune: "Commune / Hill",
        scoring_crop: "Main Crop",
        scoring_topography: "Relief / Topography",
        scoring_soil: "Soil Texture",
        scoring_surface: "Area (in Hectares)",
        scoring_phone: "Burundi Contact Phone",
        scoring_calculate: "EVALUATE SCORE AND RECOMMEND FERTILIZER",
        scoring_result_title: "Agricultural Credit Score",
        scoring_eligible: "Eligible for Credit",
        scoring_conditional: "Credit Under Condition",
        scoring_fertilizer: "Recommended FOMI Fertilizer:",
        scoring_quantity: "Total Quantity:",
        scoring_companion: "Companion Plants:",
        scoring_topo_advice: "Topography Advice:",
        scoring_send_request: "Send Official Credit Request",
        
        // Marketplace
        market_title: "Agricultural & Livestock Marketplace Burundi",
        market_subtitle: "Buy and sell crops and livestock directly without intermediaries.",
        market_deposit: "List a Product / Animal",
        market_all: "All Products",
        market_vegetal: "Crop Products",
        market_animal: "Livestock & Cattle",
        market_province_all: "All Provinces",
        market_contact_seller: "Contact Seller",
        market_no_products: "No products in this category at the moment.",
        market_price_unit: "Unit price",
        market_quantity: "Qty",
        market_total: "Total",
        
        // Deposit modal
        deposit_title: "List a Product on the Marketplace",
        deposit_type: "Product Type",
        deposit_type_vegetal: "Crop Product",
        deposit_type_animal: "Animal (Livestock)",
        deposit_category: "Category",
        deposit_name: "Product Name",
        deposit_quantity: "Quantity",
        deposit_unit: "Unit",
        deposit_price: "Unit Price (FB)",
        deposit_province: "Province",
        deposit_commune: "Commune",
        deposit_whatsapp: "WhatsApp Number",
        deposit_image: "Image URL (optional)",
        deposit_description: "Description",
        deposit_submit: "Submit Product",
        deposit_cancel: "Cancel",
        
        // Toasts
        toast_welcome: "Welcome",
        toast_login_success: "Login successful!",
        toast_logout: "You have been logged out.",
        toast_signup_success: "Registration successful! Please login.",
        toast_phone_invalid: "Invalid phone format (ex: +257 79 123 456).",
        toast_fill_fields: "Please fill in all fields.",
        toast_product_submitted: "Product submitted! Pending Admin validation.",
        toast_product_published: "Product published and visible immediately!",
        toast_score_calculated: "Score calculated successfully",
        toast_credit_sent: "Credit request successfully registered!",
        toast_must_login: "Please login to list a product.",
        
        // Admin
        admin_title: "Administrator Dashboard",
        admin_subtitle: "Market listing validation, role management and system control.",
        admin_pending: "Pending Products",
        admin_approved: "Approved Products",
        admin_credits: "Credit Requests",
        admin_users: "Active Users",
        admin_validate: "Approve",
        admin_reject: "Reject",
        admin_no_pending: "No pending products. Everything is validated!",
        admin_reset_demo: "Reset demo",
        admin_demo_mode: "Test Admin Mode",
        
        // Cultures
        crop_corn: "Corn",
        crop_banana: "Banana",
        crop_bean: "Bean",
        crop_cassava: "Cassava",
        crop_rice: "Rice (Lowland)",
        crop_coffee: "Coffee",
        crop_potato: "Potato",
        
        // Provinces
        province_gitega: "Gitega",
        province_buhumuza: "Buhumuza",
        province_bujumbura: "Bujumbura",
        province_burunga: "Burunga",
        province_butanyerera: "Butanyerera",
    }
};

// Langue par défaut
let currentLang = localStorage.getItem('UBUMWE_LANG') || 'fr';

// Fonction pour obtenir une traduction
function t(key) {
    return translations[currentLang][key] || translations.fr[key] || key;
}

// Fonction pour changer de langue
function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('UBUMWE_LANG', lang);
    translatePage();
}

// Fonction pour traduire toute la page
function translatePage() {
    // Traduire tous les éléments avec data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = t(key);
        
        // Choisir la méthode d'insertion selon le type d'élément
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            if (el.type === 'button' || el.type === 'submit') {
                el.value = translation;
            } else {
                el.placeholder = translation;
            }
        } else if (el.hasAttribute('data-i18n-html')) {
            el.innerHTML = translation;
        } else {
            el.textContent = translation;
        }
    });
    
    // Mettre à jour le sélecteur actif
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === currentLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}
