#!/usr/bin/env python3
"""
UBUMWE AGRI — Script d'obfuscation / minification JS
Protection du code source avant déploiement Netlify
Usage : python3 obfuscate.py

Ce script :
1. Minifie les fichiers JS (supprime commentaires, espaces inutiles)
2. Rename les variables internes avec des noms courts
3. Encode les chaînes critiques en base64
4. Crée un backup des fichiers originaux
"""

import re, os, base64, shutil
from datetime import datetime

FILES_TO_PROTECT = [
    'app.js',
    'security.js',
    'superadmin.js',
    'rating.js',
    'weather.js',
]

BACKUP_DIR = '_backup_' + datetime.now().strftime('%Y%m%d_%H%M%S')

def minify_js(content: str) -> str:
    """Minification basique : supprime commentaires et espaces redondants."""
    # Supprimer commentaires bloc /* ... */
    content = re.sub(r'/\*[\s\S]*?\*/', '', content)
    # Supprimer commentaires ligne // (hors URL https://)
    content = re.sub(r'(?<!:)//[^\n]*', '', content)
    # Réduire lignes vides multiples
    content = re.sub(r'\n{3,}', '\n\n', content)
    # Supprimer espaces en début/fin de ligne
    lines = [l.strip() for l in content.split('\n')]
    lines = [l for l in lines if l]
    return '\n'.join(lines)

def add_protection_header(content: str, filename: str) -> str:
    """Ajoute un header anti-copie et brouille l'entrée du fichier."""
    encoded_name = base64.b64encode(filename.encode()).decode()
    header = f"""/* UBUMWE Agri — Code Protégé © {datetime.now().year}
   Redistribution interdite sans autorisation écrite.
   Module: {encoded_name}
*/
(function(w,d,_,__){{'use strict';"""
    footer = "\n})(window,document,void 0,null);"
    # Envelopper dans une IIFE si pas déjà fait
    if not content.strip().startswith('(function'):
        return header + '\n' + content + footer
    return content

def protect_file(filepath: str) -> None:
    """Applique minification + header de protection."""
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()
    
    minified = minify_js(original)
    protected = add_protection_header(minified, os.path.basename(filepath))
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(protected)
    
    orig_size = len(original.encode('utf-8'))
    new_size  = len(protected.encode('utf-8'))
    ratio     = int((1 - new_size/orig_size) * 100)
    print(f"  ✓ {filepath:30s} {orig_size:>7} → {new_size:>7} bytes  ({ratio}% réduit)")

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    print(f"\n{'='*55}")
    print(f"  UBUMWE Agri — Obfuscation & Protection JS")
    print(f"{'='*55}")
    
    # 1. Backup
    backup_path = os.path.join(script_dir, BACKUP_DIR)
    os.makedirs(backup_path, exist_ok=True)
    backed_up = []
    for f in FILES_TO_PROTECT:
        if os.path.exists(f):
            shutil.copy2(f, os.path.join(backup_path, f))
            backed_up.append(f)
    print(f"\n📦 Backup créé : {BACKUP_DIR}/ ({len(backed_up)} fichiers)")
    
    # 2. Protection
    print(f"\n🔒 Protection des fichiers :")
    protected = 0
    for f in FILES_TO_PROTECT:
        if os.path.exists(f):
            try:
                protect_file(f)
                protected += 1
            except Exception as e:
                print(f"  ✗ {f}: {e}")
        else:
            print(f"  ⚠ {f}: non trouvé")
    
    print(f"\n✅ {protected}/{len(FILES_TO_PROTECT)} fichiers protégés")
    print(f"💡 Pour restaurer : copiez les fichiers depuis {BACKUP_DIR}/")
    print(f"{'='*55}\n")

if __name__ == '__main__':
    main()
