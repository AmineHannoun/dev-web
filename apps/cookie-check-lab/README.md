# Cookie-Check Lab

Mini-labo pédagogique full-stack montrant une vulnérabilité d'auth (cookie Base64 non signé) et sa correction (HMAC-signed cookie).

## Structure
- `vulnerable/` — app vulnérable (node server on :3001)
- `fixed/` — app corrigée (node server on :3002)
- `poc/` — script PoC: `exploit.sh`

## Quickstart (local)
# 1) installer deps
cd apps/cookie-check-lab/vulnerable && npm install
cd ../fixed && npm install
cd ../..

# 2) lancer servers (dans deux terminaux)
cd apps/cookie-check-lab/vulnerable && npm start   # http://localhost:3001
# autre terminal:
cd apps/cookie-check-lab/fixed
export COOKIE_SECRET='une_valeur_secrete_forte'
npm start   # http://localhost:3002

# 3) PoC
cd apps/cookie-check-lab
./poc/exploit.sh http://localhost:3001   # doit donner accès admin
./poc/exploit.sh http://localhost:3002   # doit échouer (401/403)

## Licence / Disclaimer
Usage pédagogique uniquement. N'exécutez ces scripts que dans des environnements que vous contrôlez.
