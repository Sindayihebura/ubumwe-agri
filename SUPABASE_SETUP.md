# UBUMWE Agri — Guide de Configuration Supabase
## Ratings & Analytics Backend

Ce guide explique comment connecter ton site UBUMWE Agri à Supabase pour
stocker les votes des visiteurs et voir les statistiques en temps réel.

---

## Étape 1 — Créer un projet Supabase (gratuit)

1. Va sur **https://supabase.com** → clique **"Start your project"**
2. Connecte-toi avec GitHub
3. Clique **"New project"**
4. Remplis :
   - **Organization** : ton organisation (ou crée-en une)
   - **Name** : `ubumwe-agri`
   - **Database Password** : génère un mot de passe fort et **note-le**
   - **Region** : `East US (N. Virginia)` — le plus proche de l'Afrique de l'Est
5. Clique **"Create new project"** — attends ~2 minutes

---

## Étape 2 — Récupérer tes clés API

Dans ton projet Supabase :
1. Va dans **Settings** → **API**
2. Copie ces deux valeurs :

| Valeur | Où la trouver |
|--------|---------------|
| **Project URL** | Section "Project URL" — ressemble à `https://xxxxxxxxxxxx.supabase.co` |
| **anon public key** | Section "Project API keys" → `anon public` |

> ⚠️ Ne jamais utiliser la clé `service_role` dans le code frontend — elle donne accès total à la base.

---

## Étape 3 — Créer les tables (SQL)

1. Dans Supabase, va dans **SQL Editor** → clique **"New query"**
2. Copie **tout le contenu** du fichier `schema.sql` de ce projet
3. Clique **"Run"** (ou `Ctrl+Enter`)
4. Vérifie que tu vois `Success. No rows returned` ou des lignes créées

Cela crée automatiquement :
- `site_ratings` — table des votes (étoiles + commentaires)
- `site_visits` — compteur de visites par jour
- `record_visit()` — fonction pour incrémenter le compteur
- `rating_stats` — vue agrégée (moyenne, total, répartition)
- `recent_ratings` — vue des 20 derniers avis
- `ratings_by_lang` — vue par langue

---

## Étape 4 — Configurer les variables d'environnement sur Netlify

1. Va sur **https://app.netlify.com** → ton site `starlit-kashata-a91f53`
2. Clique **Site configuration** → **Environment variables**
3. Clique **"Add a variable"** → ajoute ces deux variables :

| Key | Value |
|-----|-------|
| `ENV_SUPABASE_URL` | `https://xxxxxxxxxxxx.supabase.co` ← ton Project URL |
| `ENV_SUPABASE_ANON_KEY` | `eyJhbGciOiJI...` ← ta clé anon public |

4. Clique **"Save"**
5. Va dans **Deploys** → clique **"Trigger deploy"** → **"Deploy site"**
   (les variables ne s'appliquent qu'après un redéploiement)

---

## Étape 5 — Configurer index.html pour passer les variables

Dans `index.html`, juste avant le `<script src="app.js">`, ajoute ce bloc
qui lit les variables d'environnement Netlify et les injecte dans la page :

```html
<!-- Variables d'environnement Supabase (injectées par Netlify au build) -->
<script>
  // Ces valeurs sont remplacées par Netlify lors du déploiement
  window.ENV_SUPABASE_URL     = '%%ENV_SUPABASE_URL%%';
  window.ENV_SUPABASE_ANON_KEY = '%%ENV_SUPABASE_ANON_KEY%%';
</script>
```

> **Note** : Netlify remplace automatiquement `%%ENV_SUPABASE_URL%%` par
> la vraie valeur lors du build si tu utilises le plugin
> [netlify-plugin-env-html](https://github.com/netlify/netlify-plugin-html-inject-env-vars),
> OU tu peux les coller directement en dur dans `index.html` puisque ce sont
> des clés publiques (la clé `anon` est conçue pour être visible côté client).

### Solution la plus simple — coller les valeurs directement

Ouvre `deploy/index.html`, cherche la ligne :
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

Ajoute juste **en dessous** :
```html
<script>
  window.ENV_SUPABASE_URL     = 'https://TONPROJET.supabase.co';
  window.ENV_SUPABASE_ANON_KEY = 'eyJhbGciOiJI... ta clé anon ...';
</script>
```

Remplace par tes vraies valeurs, sauvegarde, puis :
```bash
cd deploy/
git add index.html
git commit -m "config: ajouter clés Supabase pour ratings backend"
git push
```

---

## Étape 6 — Vérifier que tout fonctionne

### Test du widget de notation
1. Ouvre ton site sur **starlit-kashata-a91f53.netlify.app**
2. Descends jusqu'au widget ⭐ en bas de page
3. Donne une note → tu dois voir **"✅ Merci ! Votre avis a été enregistré."**
4. Dans Supabase → **Table Editor** → `site_ratings` → tu dois voir ta ligne

### Test du dashboard Super Admin
1. Connecte-toi avec le compte `admin@ubumwe.bi` (ou un compte avec rôle `super_admin`)
2. Clique le menu hamburger → **⭐ Super Admin**
3. Le badge **"● Données Supabase Live"** doit apparaître en vert
4. Les graphiques doivent afficher les vraies données

### Test de la vue analytics
Dans Supabase → **SQL Editor**, exécute :
```sql
SELECT * FROM rating_stats;
SELECT * FROM recent_ratings LIMIT 5;
SELECT * FROM ratings_by_lang;
SELECT * FROM site_visits ORDER BY visit_date DESC LIMIT 7;
```

---

## Étape 7 — (Optionnel) Activer les notifications email

Pour recevoir un email quand quelqu'un laisse un avis :

1. Dans Supabase → **Database** → **Webhooks** → **Create a new hook**
2. Paramètres :
   - **Name** : `notify-new-rating`
   - **Table** : `site_ratings`
   - **Events** : `INSERT`
   - **URL** : ton URL Netlify Function ou service email (ex: Zapier, Make)

---

## Structure des données créées

### Table `site_ratings`
```
id             UUID (clé primaire)
user_id        UUID (optionnel — si visiteur connecté)
visitor_name   TEXT (nom affiché)
visitor_email  TEXT (optionnel)
stars          SMALLINT 1-5
comment        TEXT (max 500 chars)
lang           TEXT (fr/rn/rw/en)
user_agent     TEXT (navigateur)
session_key    TEXT UNIQUE (anti-doublon)
created_at     TIMESTAMPTZ
```

### Table `site_visits`
```
id             UUID
visit_date     DATE UNIQUE
count          INTEGER (incrémenté à chaque visite)
```

### Vue `rating_stats` (lecture publique)
```
total_ratings    BIGINT
average_stars    NUMERIC
stars_5/4/3/2/1  BIGINT (répartition)
last_rating_at   TIMESTAMPTZ
```

---

## Dépannage

| Problème | Solution |
|----------|----------|
| Badge reste "Données locales" | Vérifier que les clés dans `index.html` sont correctes et le projet Supabase est actif |
| `relation "rating_stats" does not exist` | Réexécuter le SQL de l'Étape 3 |
| Votes non enregistrés | Vérifier que RLS est actif et que la policy `sr_insert_public` existe |
| `duplicate key session_key` | Normal — protection anti-doublon, le vote est ignoré silencieusement |
| Graphiques vides | Attendre quelques visites et votes réels, ou vérifier les permissions de la table `site_visits` |

---

## Contacts & Support

- Documentation Supabase : **https://supabase.com/docs**
- SQL de référence : fichier `schema.sql` dans ce projet
- Code rating : `rating.js` + `superadmin.js`
