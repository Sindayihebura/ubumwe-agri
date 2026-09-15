# 🌾 UBUMWE Agri (Anciennement Agri-Scoring Burundi)

**UBUMWE Agri** est une Progressive Web App (PWA) d'agriculture de précision et d'évaluation du crédit agricole développée pour **FOMI** (Fabrique d'Engrais Organo-Minéraux du Burundi). 

L'application est conçue pour fonctionner **100% Hors-Ligne (Offline-First)** sur les smartphones et téléphones mobiles 2G/3G des agents de terrain et des agriculteurs burundais.

---

## 🏛️ Nouveau Découpage Administratif (Loi Organique 2025)

L'application intègre rigoureusement la **Loi Organique n° 1/05 du 16 mars 2023 (Réforme 2025)** :
- **5 Nouvelles Provinces** :
  1. **Buhumuza** (Cankuzo, Muyinga, Ruyigi, Karuzi, etc.)
  2. **Bujumbura** (Bujumbura Mairie, Bujumbura Rural, Bubanza, Cibitoke)
  3. **Burunga** (Makamba, Rutana, Bururi, Rumonge)
  4. **Butanyerera** (Ngozi, Kayanza, Kirundo)
  5. **Gitega** (Gitega, Karuzi, Muramvya, Mwaro)
- **Structure Hiérarchique Dynamique** : Province -> 42 Communes -> 447 Zones -> 3037 Collines.
- **Formulaire dynamique** : Menus déroulants en cascade qui se mettent à jour automatiquement selon la sélection précédente.

---

## 🧪 Moteur d'IA Agronomique & Dosage d'Engrais FOMI

1. **Calcul Précis des Doses d'Engrais (kg/ha et Quantité Totale)** :
   - Formules officielles FOMI : **FOMI Imbura** (Engrais de fond), **FOMI Bagara** (Engrais d'entretien), **FOMI Kula** (Spécial Tubercules & Bananiers), **Urée (46% N)**, **DAP**.
   - Prise en compte de la **Province**, la **Commune**, la **Culture** (Maïs, Banane, Haricot, Manioc, Riz, Café, Pomme de terre) et la **Texture du Sol** (Argile, Sable, Limon, Limono-Argileux).
   - Message de sécurité automatique : *"Respectez scrupuleusement les doses pour éviter l'épuisement du sol."*

2. **Associations de Plantes (Compagnonnage & Protection Agroécologique)** :
   - Plante compagne recommandée pour chaque culture (ex: *Maïs + Haricot Volubile / Desmodium*, *Banane + Mucuna*, *Pomme de terre + Tagetes*).
   - Avantages agronomiques (fixation d'azote, couverture de sol, tuteur vivant).
   - Contrôle des ravageurs et maladies évitées (*Chenille Légionnaire d'Automne, Striga, Flétrissement Bactérien BXW, Mosaïque du Manioc*).

3. **Partage & Exportation SMS (2G/3G Friendly)** :
   - Bouton *"Imprimer / Partager (SMS)"* générant un résumé condensé au format texte à copier ou envoyer directement via l'application SMS du téléphone (`sms:?body=...`).

---

## 📱 Progressive Web App & Support Hors-Ligne (Offline-First)

- **Installable** : Fichier `manifest.json` configuré pour l'ajout sur l'écran d'accueil mobile avec le nom "UBUMWE Agri" et icônes PWA.
- **Service Worker (`sw.js`)** : Cache l'ensemble des ressources statiques (HTML, CSS, JS, icônes) au premier chargement. L'application s'ouvre et fonctionne sans aucune connexion Internet.
- **Persistance des Données** : Sauvegarde des diagnostics dans le `LocalStorage` du navigateur.

---

## 💻 Comment Lancer le Serveur Local

Pour tester l'application et valider le fonctionnement du Service Worker PWA, lancez un serveur local HTTP :

### Option 1 : Avec Node.js (`npx serve`)
```bash
# Dans le dossier d:/agri-scoring-burundi
npx -y serve -l 3000
```
Ouvrez votre navigateur sur : `http://localhost:3000`

### Option 2 : Avec Python 3
```bash
# Dans le dossier d:/agri-scoring-burundi
python -m http.server 3000
```
Ouvrez votre navigateur sur : `http://localhost:3000`

---

## 📂 Structure des Livrables

```
d:/agri-scoring-burundi/
├── index.html        # Interface PWA Responsive (SPA) & Formulaires
├── app.js            # Moteur de calcul agronomique FOMI & Données 2025
├── sw.js             # Service Worker PWA pour cache 100% Offline
├── manifest.json     # Fichier Manifest Web PWA (Nom UBUMWE Agri)
├── icon-192.png      # Icône PWA 192x192
├── icon-512.png      # Icône PWA 512x512
├── icon.svg          # Icône vectorielle SVG
└── README.md         # Documentation complète du projet
```

---

*Données conformes à la Loi Organique n° 1/05 du 16 mars 2023 (Réforme 2025) - Partenariat FOMI*
