const geoip  = require('geoip-lite');
const logger = require('../config/logger.config');
const { AnalyticsEvent } = require('../models');

/**
 * Enregistre un événement analytique de façon NON-BLOQUANTE.
 * Utilise setImmediate pour ne jamais retarder la réponse HTTP.
 * En cas d'erreur, logue en warn — ne crash jamais l'app.
 *
 * @param {string} eventType   - 'download' | 'view' | 'signup' | 'login' | 'upload' | 'error'
 * @param {object} options
 * @param {object} options.req         - Express request object
 * @param {string} [options.entityType] - 'depot' | 'article' | 'announcement' | 'document'
 * @param {number} [options.entityId]
 * @param {object} [options.metadata]  - données contextuelles libres
 */
function trackEvent(eventType, { req, entityType = null, entityId = null, metadata = {} } = {}) {
  setImmediate(async () => {
    try {
      const rawIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
                 || req.ip
                 || null;

      // Normaliser l'IP (retirer le préfixe ::ffff: des IPv4-mapped)
      const ip = rawIp?.replace(/^::ffff:/, '') || null;

      let country_code = null;
      let country_name = null;
      let city         = null;

      if (ip && ip !== '127.0.0.1' && ip !== '::1') {
        const geo = geoip.lookup(ip);
        if (geo) {
          country_code = geo.country  || null;
          country_name = geo.country  || null; // geoip-lite ne retourne pas le nom complet — on utilise le code
          city         = geo.city     || null;
        }
      }

      await AnalyticsEvent.create({
        event_type:   eventType,
        entity_type:  entityType,
        entity_id:    entityId    || null,
        user_id:      req.user?.user_id || req.user?.id || null,
        ip_address:   ip,
        country_code,
        country_name,
        city,
        user_agent:   req.headers['user-agent'] || null,
        metadata,
      });
    } catch (err) {
      // Silencieux — le tracking ne doit jamais impacter l'app
      logger.warn('Analytics tracking failed', { context: { eventType, error: err.message } });
    }
  });
}

/**
 * Middleware Express pour tracker automatiquement les requêtes API.
 * À utiliser en option sur les routes critiques.
 */
function trackApiRequest(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    trackEvent('api_request', {
      req,
      metadata: {
        method:      req.method,
        path:        req.path,
        status_code: res.statusCode,
        response_ms: Date.now() - start,
      },
    });
  });

  next();
}

module.exports = { trackEvent, trackApiRequest };
