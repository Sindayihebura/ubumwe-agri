# 🚀 Guide de Déploiement — UBUMWE Agri sur Netlify

Deux méthodes disponibles. **La méthode A** (GitHub) active le déploiement automatique à chaque modification.

---

## ✅ Méthode A — GitHub + Netlify (Recommandée, déploiement automatique)

### Étape 1 — Créer le dépôt GitHub

1. Allez sur **https://github.com/new**
2. Remplissez :
   - **Repository name** : `ubumwe-agri`
   - **Visibility** : `Public`
   - ⚠️ **NE PAS cocher** "Add a README file"
3. Cliquez **Create repository**
4. Copiez l'URL affichée (format : `https://github.com/VOTRE-NOM/ubumwe-agri.git`)

---

### Étape 2 — Pousser le code avec le script automatique

Ouvrez un terminal dans le dossier `deploy/` et lancez :

```bash
bash deploy.sh
```

Le script va :
- Configurer Git (email + nom si nécessaire)
- Vous demander l'URL GitHub copiée à l'étape 1
- Committer tous les fichiers
- Pousser vers GitHub

---

### Étape 3 — Connecter Netlify à GitHub

1. Allez sur **https://app.netlify.com** → connectez-vous
2. Cliquez **"Add new site"** → **"Import an existing project"**
3. Choisissez **GitHub** → autorisez l'accès si demandé
4. Sélectionnez le dépôt **`ubumwe-agri`**
5. Paramètres de build (à remplir exactement) :

   | Champ              | Valeur              |
   |--------------------|---------------------|
   | Branch to deploy   | `main`              |
   | Base directory     | *(laisser vide)*    |
   | Build command      | *(laisser vide)*    |
   | Publish directory  | `.`                 |

6. Cliquez **"Deploy site"**

Netlify génère une URL en quelques secondes, ex : `https://ubumwe-agri-xxxx.netlify.app`

---

### Étape 4 — (Optionnel) Personnaliser l'URL

Dans Netlify : **Site configuration → Domain management → Options → Edit site name**

Exemple : `ubumwe-agri.netlify.app`

---

### 🔄 Déploiements automatiques

Désormais, chaque modification poussée sur GitHub déclenche automatiquement un redéploiement :

```bash
# Depuis le dossier deploy/
git add -A
git commit -m "fix: description de ma modification"
git push
# → Netlify redéploie automatiquement en ~30 secondes
```

---

## ⚡ Méthode B — Netlify Drop (Sans compte GitHub, immédiat)

> Idéal pour tester rapidement. Pas de déploiement automatique.

1. Allez sur **https://app.netlify.com/drop**
2. Ouvrez le gestionnaire de fichiers et naviguez vers :
   ```
   /home/carmelsp2/Carmel-Projets/agri-scoring-burundi/deploy/
   ```
3. **Glissez-déposez le dossier `deploy/` entier** dans la zone Netlify Drop
4. Netlify génère une URL instantanément

---

## 📁 Fichiers déployés

```
deploy/
├── index.html          ← Application principale
├── app.js              ← Logique métier (scoring, marketplace, auth)
├── diseases_db.js      ← Base maladies offline (FAO/OIE)
├── translations.js     ← i18n (Français, Kirundi, English)
├── security.js         ← Protection XSS légère
├── sw.js               ← Service Worker PWA offline-first
├── manifest.json       ← Manifest PWA (icônes, couleurs)
├── netlify.toml        ← Config Netlify (cache, CSP, redirections)
├── _redirects          ← Fallback SPA Netlify
├── schema.sql          ← Schema Supabase (optionnel)
├── icon-192.png        ← Icône PWA 192px
├── icon-512.png        ← Icône PWA 512px
├── icon.svg            ← Icône vectorielle
└── img-*.{webp,png,…}  ← Images produits locales
```

---

## 🔧 Variables d'environnement Supabase (optionnel)

Si vous connectez une vraie base Supabase, ajoutez ces variables dans :
**Netlify → Site configuration → Environment variables**

| Variable                | Valeur                          |
|-------------------------|---------------------------------|
| `ENV_SUPABASE_URL`      | `https://xxxx.supabase.co`      |
| `ENV_SUPABASE_ANON_KEY` | `votre-clé-anon-publique`       |

Puis dans `index.html`, ajoutez avant le chargement de `app.js` :

```html
<script>
  window.ENV_SUPABASE_URL     = '{{ ENV_SUPABASE_URL }}';
  window.ENV_SUPABASE_ANON_KEY = '{{ ENV_SUPABASE_ANON_KEY }}';
</script>
```

Sans ces variables, l'app fonctionne en **mode offline-first** (localStorage uniquement).

---

## ✔️ Checklist avant déploiement

- [ ] Dépôt GitHub créé et URL copiée
- [ ] `bash deploy.sh` exécuté sans erreur
- [ ] Site visible sur Netlify avec une URL `.netlify.app`
- [ ] PWA installable sur mobile (icône + manifest OK)
- [ ] Mode offline testé (couper le Wi-Fi → app fonctionne)
