// Tunnel Sentry universel — Cloudflare Worker (gratuit).
//
// À quoi ça sert : les bloqueurs de pub (uBlock, Brave, etc.) bloquent les envois
// directs vers sentry.io. En faisant passer les erreurs par CE Worker (ton adresse à
// toi, en *.workers.dev), elles ne sont plus bloquées et arrivent dans Sentry.
//
// Réutilisable tel quel pour N'IMPORTE QUEL projet Sentry : le Worker lit le projet
// de destination dans l'erreur elle-même. Un seul Worker suffit pour tous tes sites.
//
// Déploiement : voir README.md à côté de ce fichier.

export default {
  async fetch(request) {
    // En-têtes CORS : le site et le Worker sont sur deux domaines différents.
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") {
      return new Response("Tunnel Sentry actif.", { headers: cors });
    }

    try {
      const envelope = await request.text();
      // La 1re ligne de l'enveloppe Sentry est un JSON qui contient le DSN.
      const header = JSON.parse(envelope.split("\n")[0]);
      const dsn = new URL(header.dsn);

      // Sécurité : on ne relaie que vers Sentry (évite que ton tunnel serve à autre chose).
      if (!dsn.hostname.endsWith(".sentry.io")) {
        return new Response("Hôte refusé", { status: 400, headers: cors });
      }

      const projectId = dsn.pathname.replace(/^\//, "");
      const upstream = `https://${dsn.hostname}/api/${projectId}/envelope/`;
      const resp = await fetch(upstream, { method: "POST", body: envelope });
      return new Response(resp.body, { status: resp.status, headers: cors });
    } catch (e) {
      return new Response("Erreur tunnel", { status: 400, headers: cors });
    }
  },
};
