-- UBUMWE AGRI Schema Definitif 2026 | Loi 1/05 du 16 mars 2023 | ISABU / OEB / FOMI
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- PROVINCES & COMMUNES OFFICIELLES
CREATE TABLE IF NOT EXISTS provinces (code TEXT PRIMARY KEY, name TEXT NOT NULL, chef_lieu TEXT NOT NULL);
INSERT INTO provinces VALUES
  ('BUJUMBURA','Bujumbura','Mukaza'),('GITEGA','Gitega','Gitega'),
  ('BUTANYERERA','Butanyerera','Ngozi'),('BURUNGA','Burunga','Makamba'),
  ('BUHUMUZA','Buhumuza','Cankuzo') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS communes (code TEXT PRIMARY KEY, name TEXT NOT NULL, province_code TEXT REFERENCES provinces(code));
INSERT INTO communes VALUES
  ('BUJ_BUBANZA','Bubanza','BUJUMBURA'),('BUJ_BUKINANYANA','Bukinanyana','BUJUMBURA'),
  ('BUJ_CIBITOKE','Cibitoke','BUJUMBURA'),('BUJ_ISARE','Isare','BUJUMBURA'),
  ('BUJ_MPANDA','Mpanda','BUJUMBURA'),('BUJ_MUGERE','Mugere','BUJUMBURA'),
  ('BUJ_MUGINA','Mugina','BUJUMBURA'),('BUJ_MUHUTA','Muhuta','BUJUMBURA'),
  ('BUJ_MUKAZA','Mukaza','BUJUMBURA'),('BUJ_NTAHANGWA','Ntahangwa','BUJUMBURA'),
  ('BUJ_RWIBAGA','Rwibaga','BUJUMBURA'),
  ('GIT_BUGENDANA','Bugendana','GITEGA'),('GIT_GISHUBI','Gishubi','GITEGA'),
  ('GIT_GITEGA','Gitega','GITEGA'),('GIT_KARUSI','Karusi','GITEGA'),
  ('GIT_KIGANDA','Kiganda','GITEGA'),('GIT_MURAMVYA','Muramvya','GITEGA'),
  ('GIT_MWARO','Mwaro','GITEGA'),('GIT_NYABIHANGA','Nyabihanga','GITEGA'),
  ('GIT_SHOMBO','Shombo','GITEGA'),
  ('BUT_BUSONI','Busoni','BUTANYERERA'),('BUT_KAYANZA','Kayanza','BUTANYERERA'),
  ('BUT_KIREMBA','Kiremba','BUTANYERERA'),('BUT_KIRUNDO','Kirundo','BUTANYERERA'),
  ('BUT_MATONGO','Matongo','BUTANYERERA'),('BUT_MUHANGA','Muhanga','BUTANYERERA'),
  ('BUT_NGOZI','Ngozi','BUTANYERERA'),('BUT_TANGARA','Tangara','BUTANYERERA'),
  ('BUR_BURURI','Bururi','BURUNGA'),('BUR_MAKAMBA','Makamba','BURUNGA'),
  ('BUR_MATANA','Matana','BURUNGA'),('BUR_MUSONGATI','Musongati','BURUNGA'),
  ('BUR_NYANZA','Nyanza-Lac','BURUNGA'),('BUR_RUMONGE','Rumonge','BURUNGA'),
  ('BUR_RUTANA','Rutana','BURUNGA'),
  ('BUH_BUTAGANZWA','Butaganzwa','BUHUMUZA'),('BUH_BUTIHINDA','Butihinda','BUHUMUZA'),
  ('BUH_CANKUZO','Cankuzo','BUHUMUZA'),('BUH_GISAGARA','Gisagara','BUHUMUZA'),
  ('BUH_GISURU','Gisuru','BUHUMUZA'),('BUH_MUYINGA','Muyinga','BUHUMUZA'),
  ('BUH_RUYIGI','Ruyigi','BUHUMUZA') ON CONFLICT DO NOTHING;

-- PROFILS RBAC
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL CHECK (phone ~ '^\+257\d{8}$'),
    role TEXT NOT NULL DEFAULT 'agriculteur_independant'
         CHECK (role IN ('super_admin','admin_regional','chef_cooperative',
                         'agriculteur_independant','agriculteur_cooperative','client')),
    province_code TEXT REFERENCES provinces(code),
    commune_code  TEXT REFERENCES communes(code),
    cooperative_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "p_sel" ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "p_ins" ON profiles FOR INSERT WITH CHECK (auth.uid()=id);
CREATE POLICY "p_upd" ON profiles FOR UPDATE USING (auth.uid()=id OR EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role='super_admin'));
CREATE POLICY "p_del" ON profiles FOR DELETE USING (EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role='super_admin'));

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_phone TEXT;
BEGIN
  -- Valider le rôle : si valeur invalide, fallback sur agriculteur_independant
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'agriculteur_independant');
  IF v_role NOT IN ('super_admin','admin_regional','chef_cooperative','agriculteur_independant','agriculteur_cooperative','client') THEN
    v_role := 'agriculteur_independant';
  END IF;

  -- Valider le téléphone : si format invalide, utiliser le placeholder
  v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '+25700000000');
  IF v_phone !~ '^\+257\d{8}$' THEN
    v_phone := '+25700000000';
  END IF;

  INSERT INTO profiles(id, full_name, phone, role) VALUES(
    NEW.id,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''), 'Utilisateur'),
    v_phone,
    v_role
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Ne jamais bloquer la création du compte auth en cas d'erreur profil
  RAISE WARNING 'handle_new_user: impossible de créer le profil pour %: %', NEW.id, SQLERRM;
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- PRODUITS
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('vegetal','animal')),
    category TEXT NOT NULL, name TEXT NOT NULL,
    quantity NUMERIC NOT NULL CHECK (quantity>0),
    unit TEXT NOT NULL, price_per_unit NUMERIC NOT NULL CHECK (price_per_unit>0),
    currency TEXT DEFAULT 'BIF',
    province_code TEXT REFERENCES provinces(code),
    commune_code  TEXT REFERENCES communes(code),
    whatsapp_phone TEXT NOT NULL CHECK (whatsapp_phone ~ '^\+257\d{8}$'),
    image_url TEXT, description TEXT,
    saison TEXT CHECK (saison IN ('A','B','C','Permanente')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','sold')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pr_sel" ON products FOR SELECT USING (status='approved' OR auth.uid()=user_id OR EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role IN ('super_admin','admin_regional')));
CREATE POLICY "pr_ins" ON products FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "pr_upd" ON products FOR UPDATE USING (auth.uid()=user_id OR EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role IN ('super_admin','admin_regional')));
CREATE POLICY "pr_del" ON products FOR DELETE USING (auth.uid()=user_id OR EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role='super_admin'));

-- DEMANDES DE CREDIT
CREATE TABLE IF NOT EXISTS credit_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    farmer_name TEXT NOT NULL, phone TEXT NOT NULL,
    province_code TEXT REFERENCES provinces(code),
    commune_code  TEXT REFERENCES communes(code),
    crop TEXT NOT NULL, surface_ha NUMERIC NOT NULL CHECK (surface_ha>0),
    topography TEXT, soil_type TEXT,
    saison TEXT CHECK (saison IN ('A','B','C')),
    institution_bancaire TEXT NOT NULL DEFAULT 'FENACOBU'
        CHECK (institution_bancaire IN ('BCAB','BNDE','BANCOBU','CRDB_Bank','FENACOBU','CECM','WISE','UCODE_Microfinance')),
    warrantage BOOLEAN DEFAULT FALSE,
    calculated_score INTEGER CHECK (calculated_score BETWEEN 0 AND 100),
    recommended_fertilizer TEXT,
    fertilizer_bags INTEGER,
    fertilizer_cost_bif NUMERIC,
    taux_interet NUMERIC DEFAULT 15.0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE credit_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cr_sel" ON credit_requests FOR SELECT USING (auth.uid()=user_id OR EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role IN ('super_admin','admin_regional','chef_cooperative')));
CREATE POLICY "cr_ins" ON credit_requests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "cr_upd" ON credit_requests FOR UPDATE USING (EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role IN ('super_admin','admin_regional')));

-- CATALOGUE MALADIES (ISABU/OEB) avec index GIN Kirundi
CREATE TABLE IF NOT EXISTS diseases_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_type TEXT NOT NULL CHECK (subject_type IN ('plante','animal')),
    subject_name TEXT NOT NULL, subject_name_rn TEXT NOT NULL,
    disease_name TEXT NOT NULL, disease_name_rn TEXT NOT NULL,
    keywords_rn TEXT[] NOT NULL DEFAULT '{}',
    symptoms_fr TEXT NOT NULL, symptoms_rn TEXT NOT NULL,
    prevention_fr TEXT NOT NULL, prevention_rn TEXT NOT NULL,
    treatment_fr TEXT NOT NULL, treatment_rn TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('faible','modere','grave','critique')),
    source TEXT DEFAULT 'ISABU / OEB',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_diseases_gin ON diseases_catalog USING GIN (keywords_rn);
ALTER TABLE diseases_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dc_sel" ON diseases_catalog FOR SELECT USING (TRUE);
CREATE POLICY "dc_adm" ON diseases_catalog FOR ALL USING (EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role='super_admin'));

-- SEED MALADIES ISABU/OEB
INSERT INTO diseases_catalog(subject_type,subject_name,subject_name_rn,disease_name,disease_name_rn,keywords_rn,symptoms_fr,symptoms_rn,prevention_fr,prevention_rn,treatment_fr,treatment_rn,severity,source) VALUES
('plante','Bananier','Ibitoke','Fletrissement Bacterien BXW','Kirabiranya',
 ARRAY['kirabiranya','umuhondo','gufuya','umusozi wumye','pus jaune'],
 'Jaunissement/fletrissement des feuilles. Pus jaune au tronc a la coupe. Pourriture des regimes.',
 'Amababi arahindura umuhondo akavaho. Ubona amazi umuhondo mu giti igihe utemye. Ingano ziboze.',
 'Methode SDSR : enlever uniquement tige malade. Desinfecter machette au feu/chlore. Rejets sains certifies ISABU. Briser fleur male apres pollinisation.',
 'Gukuraho igiti kiranduye gusa (SDSR). Gutwika inzora mu muriro cyangwa chlore. Gukoresha imisatsi isana y ISABU. Gukura indabyo y ingona.',
 'Aucun traitement chimique. Appliquer SDSR strictement. Bruler tiges malades loin du champ.',
 'Nta muti. Gukoresha SDSR. Gutwika ibitoki biranduye.','critique','ISABU 2024'),

('plante','Manioc','Imyumbati','Mosaique du Manioc CMD','Umutore w Imyumbati',
 ARRAY['umutore','amababi yagize amabara','nanisme','imyumbati yagagaziwe','ibibabi bibisi'],
 'Deformation/decoloration des feuilles (taches jaunes-vertes en mosaique). Nanisme. Tubercules petits.',
 'Amababi aragaragara amabara amuhondo n atoto. Imyumbati igakorwa nke.',
 'Boutures saines certifiees ISABU. Arracher et bruler plants malades. Varietes resistantes NASE 14.',
 'Indamutso nziza z ISABU. Gukuraho no gutwika ibimera biranduye. Amoko NASE 14.',
 'Pas de traitement curatif. Boutures saines + varietes resistantes.',
 'Nta muti. Indamutso nziza.','grave','ISABU / FAO'),

('plante','Mais','Ibigori','Necrose Lethale du Mais MLN','Igicucu cy Ibigori',
 ARRAY['igicucu','ibigori byumye','amababi yumye','umusatsi ufuye','epis vides'],
 'Dessechement premature des feuilles depuis les bords. Epis mal remplis ou vides. Mort prematuree.',
 'Amababi agora uhereye ku mpera. Ibigori ntibuzure. Ibiti bishira imbere y igihe.',
 'Interdire grains marche local comme semence (OEB). Rotation legumineuses. Insecticide contre pucerons/thrips. Semences certifiees OEB.',
 'Kubuza imbuto zo mu isoko (itegeko OEB). Guhindura ubutaka. Imiti y inzoka. Imbuto z OEB.',
 'Arracher et bruler plants infectes. Nettoyage strict. Pas de traitement curatif.',
 'Gukuraho no gutwika. Gukaraba neza.','critique','OEB Burundi 2024'),

('plante','Pomme de terre','Ibirayi','Fletrissement Bacterien','Indwara y Ibirayi Ifuya',
 ARRAY['ibirayi zifuya','imizi ibisi','amazi umuhondo','fletrissement','vaisseaux bruns'],
 'Fletrissement soudain aux heures chaudes. Coupe tubercule : vaisseaux bruns avec pus blanc-jaune.',
 'Ibimera bihindagira igihe izuba rituritse. Ibirayi zitemwe bigaragaza inzira imara bisi.',
 'Rotation obligatoire avec mais (2 saisons). Semences certifiees OEB. Eviter blessures a la recolte.',
 'Guhindura ubutaka na ibigori (ibihe 2). Imbuto z OEB. Kwirinda gukata ibirayi.',
 'Arracher et bruler. Desinfecter outils. Aucun traitement curatif.',
 'Gukuraho no gutwika. Gusukura ibyuma.','grave','OEB / CIP'),

('animal','Bovins','Inka','Theileriose Bovine (Fievre Cote Est)','Umuyago w Inka',
 ARRAY['umuyago','inka zirwaye','ubushuhe bwinshi','izimu zivuye','amata nke','agatima gata vuba'],
 'Fievre forte soudaine 40-42 C. Ganglions gonfles sous les oreilles. Difficultes respiratoires. Chute production laitiere. Amaigrissement rapide. Mort en 2-3 semaines sans traitement.',
 'Ubushuhe bukabije vuba (40-42). Umutwe ugufuka munsi y amatwi. Guhumeka nabi. Amata nke. Kwihuta gukonda.',
 'Acaricide (Amitraz/Flumethrin) toutes les 2 semaines sur tout le corps. Stabulation permanente fermee (politique nationale). Inspecter tiques chaque jour.',
 'Insektisaidi buri ibyumweru 2. Kubika inka munda buri gihe. Kureba ingambari buri munsi.',
 'Buparvaquone (Butalex) 2.5mg/kg IM dans les 3 premiers jours. Antipyretiques + Vitamines B + rehydratation.',
 'Butalex 2.5mg/kg vuba. Vitamines B + amazi.','critique','OEB / ILRAD'),

('animal','Porcins','Ingurube','Peste Porcine Africaine PPA','Indwara Ikomeye y Ingurube',
 ARRAY['indwara y ingurube','ingurube zipfa','guhitana amaraso','imunda','ruvuvuma','ibara ry umutuku'],
 'Fievre 40-42 C. Taches violettes/rouges sur oreilles, ventre, membres. Diarrhee sanglante. Vomissements. Mort certaine en 2-10 jours. Letalite 100%.',
 'Ubushuhe bukabije. Amabara y umutuku ku matwi no ku nda. Guhitana amaraso. Gutwita. Urupfu (100%).',
 'AUCUN VACCIN. Biosecurite stricte : interdire visiteurs aux porcheries. Ne jamais donner restes cuisine non bouilles. Desinfection quotidienne. Controle mouvements porcs.',
 'NTAGITI. Kubuza abantu kwinjira. Kubutsa gufana ibiryo bidategurwa. Gukaraba buri munsi.',
 'AUCUN TRAITEMENT. Abattage sanitaire total immediat. Signalement OEB OBLIGATOIRE.',
 'NTAGITI. Gusiga ingurube zose vuba. KUMENYESHA OEB.','critique','OEB 2024'),

('animal','Volailles','Inkoko','Maladie de Newcastle','Pseudo-Peste Aviaire',
 ARRAY['inkoko zipfa','ibirinde','guhumeka nabi','ijosi rihindagurika','isave y umutuku','paralysie'],
 'Rales respiratoires. Diarrhee verdatre. Torticolis et paralysie. Chute brutale de la ponte. Mortalite massive.',
 'Indirimbo zo guhumeka nabi. Isave y umutuku. Ijosi rihindagurika. Impfuzi zipfa nyinshi.',
 'Vaccination reguliere obligatoire (OEB). Vaccin thermotolérant I-2 pour volaille villageoise. Isoler oiseaux malades.',
 'Kugira ubudodo (vaccin I-2) biciye mu bikorwa vy OEB. Gukura inkoko ziranduye.',
 'Aucun traitement curatif. Antibiotiques contre surinfections. Vitamines C et E.',
 'Nta muti. Vitamines. Gukura inkoko ziranduye.','critique','OEB / FAO'),

('animal','Bovins','Inka','Dermatose Nodulaire et Brucellose','Amabara n Inda Zihunguka',
 ARRAY['amabara mu mubiri','inda zihunguka','nodules','brucellose','avortement','ruvuvuma rw inda'],
 'DNCB : nodules fermes sur peau, fievre, reduction lait. Brucellose : avortements au 7eme mois, retention placentaire, infertilite.',
 'DNCB : amabara akomera ku mubiri, ubushuhe, amata nke. Brucellose : inda zihunguka mu kwezi kw 7, infertilite.',
 'DNCB : Vaccination annuelle. Lutte insectes vecteurs. Brucellose : Depistage regulier. Hygiene stricte aux mises bas (gants+desinfectants).',
 'DNCB : Ubudodo buri mwaka. Brucellose : Ubushakashatsi. Isuku rikabije.',
 'DNCB : Anti-inflammatoires, antibiotiques. Brucellose : Abattre animaux positifs.',
 'DNCB : Imiti. Brucellose : Gusiga inka zigiranye indwara.','grave','OEB Burundi')
ON CONFLICT DO NOTHING;


-- ============================================================
-- RATINGS & ANALYTICS — UBUMWE Agri v3
-- Run this in Supabase → SQL Editor → New query
-- ============================================================

-- ── 1. TABLE : évaluations 5 étoiles ────────────────────────
CREATE TABLE IF NOT EXISTS site_ratings (
    id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- identité souple (pas obligatoirement connecté)
    user_id       UUID        REFERENCES profiles(id) ON DELETE SET NULL,
    visitor_name  TEXT        NOT NULL DEFAULT 'Visiteur',
    visitor_email TEXT,
    -- données de notation
    stars         SMALLINT    NOT NULL CHECK (stars BETWEEN 1 AND 5),
    comment       TEXT        CHECK (char_length(comment) <= 500),
    lang          TEXT        NOT NULL DEFAULT 'fr'
                               CHECK (lang IN ('fr','rn','rw','en')),
    -- source technique
    user_agent    TEXT,
    -- anti-spam : un seul vote par fingerprint de session (nullable pour visiteurs anonymes)
    session_key   TEXT        UNIQUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE site_ratings ENABLE ROW LEVEL SECURITY;

-- Lecture publique (pour afficher la note globale)
CREATE POLICY "sr_select_public"
    ON site_ratings FOR SELECT
    USING (TRUE);

-- Insertion ouverte à tous (connectés ET anonymes)
CREATE POLICY "sr_insert_public"
    ON site_ratings FOR INSERT
    WITH CHECK (TRUE);

-- Mise à jour : seul le super_admin peut modifier
CREATE POLICY "sr_update_admin"
    ON site_ratings FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'super_admin'
    ));

-- Suppression : super_admin uniquement
CREATE POLICY "sr_delete_admin"
    ON site_ratings FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'super_admin'
    ));

-- Index pour accélérer les agrégations (stats dashboard)
CREATE INDEX IF NOT EXISTS idx_site_ratings_stars      ON site_ratings (stars);
CREATE INDEX IF NOT EXISTS idx_site_ratings_created_at ON site_ratings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_ratings_lang       ON site_ratings (lang);

-- ── 2. TABLE : visites journalières ─────────────────────────
CREATE TABLE IF NOT EXISTS site_visits (
    id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_date DATE        NOT NULL DEFAULT CURRENT_DATE,
    count      INTEGER     NOT NULL DEFAULT 1,
    UNIQUE (visit_date)
);

ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

-- Lecture : super_admin uniquement (données analytiques privées)
CREATE POLICY "sv_select_admin"
    ON site_visits FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'super_admin'
    ));

-- Insertion/update : tous (le compteur est incrémenté à chaque visite)
CREATE POLICY "sv_upsert_public"
    ON site_visits FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "sv_update_public"
    ON site_visits FOR UPDATE
    USING (TRUE);

-- ── 3. FONCTION : incrémenter visite du jour ─────────────────
-- Appelée depuis le client via supabase.rpc('record_visit')
CREATE OR REPLACE FUNCTION record_visit()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO site_visits (visit_date, count)
    VALUES (CURRENT_DATE, 1)
    ON CONFLICT (visit_date)
    DO UPDATE SET count = site_visits.count + 1;
END;
$$;

-- ── 4. VUE : stats globales de notation (accessible publiquement) ──
CREATE OR REPLACE VIEW public.rating_stats AS
SELECT
    COUNT(*)                                    AS total_ratings,
    ROUND(AVG(stars)::NUMERIC, 2)              AS average_stars,
    COUNT(*) FILTER (WHERE stars = 5)           AS stars_5,
    COUNT(*) FILTER (WHERE stars = 4)           AS stars_4,
    COUNT(*) FILTER (WHERE stars = 3)           AS stars_3,
    COUNT(*) FILTER (WHERE stars = 2)           AS stars_2,
    COUNT(*) FILTER (WHERE stars = 1)           AS stars_1,
    MAX(created_at)                             AS last_rating_at
FROM site_ratings;

-- Autoriser lecture publique de la vue
GRANT SELECT ON public.rating_stats TO anon, authenticated;

-- ── 5. VUE : 20 derniers avis (pour dashboard admin) ─────────
CREATE OR REPLACE VIEW public.recent_ratings AS
SELECT
    id, visitor_name, stars, comment, lang, created_at
FROM site_ratings
ORDER BY created_at DESC
LIMIT 20;

GRANT SELECT ON public.recent_ratings TO authenticated;

-- ── 6. VUE : répartition des notes par langue ─────────────────
CREATE OR REPLACE VIEW public.ratings_by_lang AS
SELECT
    lang,
    COUNT(*)                        AS total,
    ROUND(AVG(stars)::NUMERIC, 2)  AS avg_stars
FROM site_ratings
GROUP BY lang
ORDER BY total DESC;

GRANT SELECT ON public.ratings_by_lang TO authenticated;
