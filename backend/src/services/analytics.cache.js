const NodeCache = require('node-cache');

/**
 * Cache in-memory éphémère — JAMAIS écrit en base de données.
 * Meurt au redémarrage du serveur. Aucune synchronisation nécessaire.
 * En cas de miss, l'aggregation service recalcule depuis les raw events.
 */
const cache = new NodeCache({ useClones: false, checkperiod: 60 });

/** TTL en secondes, adaptés à la volatilité de chaque métrique */
const TTL = {
  overview:    30,   // KPI temps réel — 30s
  series:      120,  // Graphiques temporels — 2min
  geography:   300,  // Répartition pays — 5min
  topContent:  120,  // Top dépôts / articles — 2min
  heatmap:     300,  // Heatmap activité — 5min
  performance: 60,   // Temps de réponse API — 1min
  errors:      30,   // Log erreurs récentes — 30s
  funnel:      300,  // Funnel inscription → upload — 5min
};

/**
 * Récupère depuis le cache ou calcule via computeFn puis met en cache.
 * @param {string}   key       - Clé de cache unique
 * @param {number}   ttl       - Durée de vie en secondes
 * @param {Function} computeFn - Fonction async qui retourne la donnée
 */
async function withCache(key, ttl, computeFn) {
  const hit = cache.get(key);
  if (hit !== undefined) return hit;

  const data = await computeFn();
  cache.set(key, data, ttl);
  return data;
}

/** Invalide une clé ou toutes les clés (refresh forcé depuis le dashboard) */
function invalidate(key) {
  if (key) {
    cache.del(key);
  } else {
    cache.flushAll();
  }
}

/** Stats du cache (pour debug/monitoring) */
function stats() {
  return cache.getStats();
}

module.exports = { withCache, invalidate, TTL, stats };
