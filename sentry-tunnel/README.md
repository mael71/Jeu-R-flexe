# Tunnel Sentry universel (anti-bloqueurs)

Fait passer les erreurs **par ton propre domaine** avant Sentry, pour qu'elles ne soient plus
coupées par les bloqueurs de pub (uBlock, Brave, etc.). **Un seul Worker pour tous tes projets.**

## Déployer (gratuit, ~5 min, aucun serveur à gérer)

1. Crée un compte sur **https://dash.cloudflare.com** (gratuit).
2. Menu **Workers & Pages** → **Create** → **Create Worker**.
3. Donne-lui un nom (ex. `sentry-tunnel`) → **Deploy**.
4. Clique **Edit code**, colle tout le contenu de [`worker.js`](./worker.js), puis **Deploy**.
5. Note l'URL du Worker, de la forme : `https://sentry-tunnel.TON-COMPTE.workers.dev`

## Utiliser dans un projet

Dans l'appel `Sentry.init(...)`, ajoute l'option `tunnel` avec l'URL de ton Worker :

```js
Sentry.init({
  dsn: "https://…ingest….sentry.io/…",   // le DSN du projet, comme d'habitude
  tunnel: "https://sentry-tunnel.TON-COMPTE.workers.dev",
  release: "mon-projet@1.0.0",
  environment: "production",
});
```

C'est tout. Les erreurs partent désormais vers ton Worker (que les bloqueurs ne bloquent pas),
qui les relaie à Sentry. La **même URL de Worker** fonctionne pour n'importe quel projet Sentry :
le Worker lit le projet de destination dans chaque erreur.

## Limite

Ça contourne les bloqueurs de pub. Ça ne contourne pas un réseau d'entreprise qui bloquerait
carrément ton domaine Worker (rare). Dans ce cas, héberge le tunnel sur ton propre domaine.
