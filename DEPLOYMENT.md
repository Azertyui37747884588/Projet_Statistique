# Déploiement Vercel — TTK StatTestIA

## Structure du projet

- **`design-source/non-parametric-tests-platform/`** → Application Next.js frontend
- **`backend/`** → API FastAPI (Python)

## Déploiement du frontend sur Vercel

### Prérequis
- Compte Vercel (https://vercel.com)
- GitHub (ou GitLab / Bitbucket)
- Git installé localement

### Étapes

1. **Initialiser Git**
   ```bash
   cd Projet_Statistique
   git init
   git add .
   git commit -m "Initial commit: TTK StatTestIA"
   ```

2. **Créer un repo GitHub**
   - Allez sur https://github.com/new
   - Créez un repo `Projet_Statistique` (public ou privé)
   - Poussez votre code :
     ```bash
     git remote add origin https://github.com/<votre-user>/<repo-name>.git
     git branch -M main
     git push -u origin main
     ```

3. **Configurer Vercel**
   - Allez sur https://vercel.com/new
   - Importez le repo GitHub
   - Sélectionnez `design-source/non-parametric-tests-platform/` comme dossier racine
   - Variables d'environnement :
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-api.com
     ```
   - Cliquez sur "Deploy"

4. **Déployer le backend** (FastAPI sur Heroku, Railway, ou autre)
   - Option 1: **Railway** (simple)
     ```bash
     # Installation Railway CLI
     npm i -g @railway/cli
     railway login
     cd backend
     railway init
     railway up
     ```
   - Option 2: **Heroku** (gratuit deprecated, peut être payant)
   - Option 3: **Self-hosted** (serveur VPS)

5. **Mettre à jour les variables d'environnement**
   - Après le déploiement du backend, copier l'URL
   - Dans Vercel: Allez à Project Settings → Environment Variables
   - Ajouter `NEXT_PUBLIC_API_URL` avec l'URL du backend déployé

## Après le déploiement

- Le frontend sera accessible sur `https://<projet-name>.vercel.app`
- Le backend sera accessible sur l'URL de déploiement (Heroku, Railway, etc.)
- Les requêtes frontend iront vers l'API backend via `NEXT_PUBLIC_API_URL`

## Notes

- Assurez-vous que le CORS est configuré sur le backend pour accepter les requêtes de Vercel
- Testez localement avant de déployer : `npm run build && npm start`
