#!/usr/bin/env bash
# ============================================================
# UBUMWE Agri — Script de déploiement automatique Netlify
# Usage : bash deploy.sh
# Prérequis : git installé, compte GitHub, compte Netlify
# ============================================================

set -euo pipefail

# ── Couleurs console ─────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log()   { echo -e "${GREEN}[✓]${NC} $1"; }
info()  { echo -e "${BLUE}[i]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   UBUMWE Agri — Déploiement Netlify Auto     ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""

# ── Vérification git ─────────────────────────────────────────
command -v git >/dev/null 2>&1 || error "git n'est pas installé. Installez-le avec : sudo apt install git"
log "git détecté : $(git --version)"

# ── Positionnement dans le dossier deploy/ ───────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
info "Répertoire de travail : $SCRIPT_DIR"

# ── Initialisation Git si besoin ─────────────────────────────
if [ ! -d ".git" ]; then
  git init
  git checkout -b main 2>/dev/null || git branch -M main
  log "Dépôt Git initialisé"
else
  log "Dépôt Git existant détecté"
fi

# ── Configuration identité Git (si pas déjà configurée) ──────
if [ -z "$(git config user.email 2>/dev/null)" ]; then
  read -rp "  Votre email GitHub : " GIT_EMAIL
  read -rp "  Votre nom         : " GIT_NAME
  git config user.email "$GIT_EMAIL"
  git config user.name  "$GIT_NAME"
  log "Identité Git configurée"
fi

# ── URL du dépôt GitHub ──────────────────────────────────────
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")

if [ -z "$REMOTE_URL" ]; then
  echo ""
  warn "Aucun remote GitHub configuré."
  echo ""
  echo "  1. Créez un dépôt VIDE sur https://github.com/new"
  echo "     → Nom suggéré : ubumwe-agri"
  echo "     → Visibilité : Public (requis pour Netlify gratuit)"
  echo "     → NE PAS cocher 'Add a README'"
  echo ""
  read -rp "  Collez ici l'URL du dépôt GitHub (ex: https://github.com/votre-nom/ubumwe-agri.git) : " REMOTE_URL
  git remote add origin "$REMOTE_URL"
  log "Remote GitHub configuré : $REMOTE_URL"
else
  log "Remote existant : $REMOTE_URL"
fi

# ── Ajout et commit de tous les fichiers ─────────────────────
echo ""
info "Ajout de tous les fichiers au commit..."
git add -A

# Vérifier s'il y a des changements à committer
if git diff --cached --quiet; then
  warn "Aucun changement détecté — le dépôt est déjà à jour."
else
  COMMIT_MSG="🚀 deploy: UBUMWE Agri v$(date +%Y%m%d-%H%M) — Static PWA"
  git commit -m "$COMMIT_MSG"
  log "Commit créé : $COMMIT_MSG"
fi

# ── Push vers GitHub ─────────────────────────────────────────
echo ""
info "Push vers GitHub..."
git push -u origin main
log "Code poussé sur GitHub ✓"

# ── Instructions Netlify ──────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Code sur GitHub ! Connectez maintenant Netlify :           ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BLUE}1.${NC} Allez sur https://app.netlify.com"
echo -e "  ${BLUE}2.${NC} Cliquez « Add new site » → « Import an existing project »"
echo -e "  ${BLUE}3.${NC} Choisissez GitHub → sélectionnez : ${YELLOW}ubumwe-agri${NC}"
echo -e "  ${BLUE}4.${NC} Paramètres de build :"
echo -e "       • Branch to deploy : ${YELLOW}main${NC}"
echo -e "       • Base directory   : ${YELLOW}(vide)${NC}"
echo -e "       • Build command    : ${YELLOW}(vide — site statique)${NC}"
echo -e "       • Publish directory: ${YELLOW}.${NC}"
echo -e "  ${BLUE}5.${NC} Cliquez « Deploy site » → votre URL apparaît en quelques secondes"
echo ""
echo -e "  ${GREEN}Chaque git push déclenchera automatiquement un redéploiement.${NC}"
echo ""
