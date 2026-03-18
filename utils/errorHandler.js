// Gestia POS — Toast notifications & Firestore error display
// Loaded as a regular <script> before the main app script.

(function initToastSystem() {
  if (document.getElementById('__gestia_toast_container')) return;
  var el = document.createElement('div');
  el.id = '__gestia_toast_container';
  el.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:99999;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none;';
  document.body.appendChild(el);
})();

function showToast(msg, type, duration) {
  type = type || 'info';
  duration = duration == null ? 3500 : duration;
  var container = document.getElementById('__gestia_toast_container');
  if (!container) return;
  var colors = {
    success: 'background:#14532d;border-color:#22c55e;color:#bbf7d0',
    error:   'background:#450a0a;border-color:#ef4444;color:#fecaca',
    warning: 'background:#451a03;border-color:#f97316;color:#fed7aa',
    info:    'background:#0c1a2e;border-color:#60a5fa;color:#bfdbfe'
  };
  var t = document.createElement('div');
  t.style.cssText = 'padding:10px 18px;border-radius:12px;font-size:.83rem;font-weight:500;border:1px solid;backdrop-filter:blur(8px);max-width:340px;text-align:center;pointer-events:auto;transition:opacity .35s;' + (colors[type] || colors.info);
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(function () { t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 400); }, duration);
}

var FS_ERROR_MESSAGES = {
  'permission-denied':  'Sin permisos. Inicia sesión de nuevo.',
  'unauthenticated':    'Sesión expirada. Por favor inicia sesión.',
  'unavailable':        'Sin conexión. Se guardará cuando vuelva la red.',
  'resource-exhausted': 'Demasiadas operaciones. Espera unos segundos.',
  'not-found':          'El documento no existe.',
  'already-exists':     'El documento ya existe.',
  'internal':           'Error interno. Contacta soporte.',
  'deadline-exceeded':  'La operación tardó demasiado. Intenta de nuevo.',
};

function showFirestoreError(err, context) {
  context = context || '';
  var code = (err && err.code) ? err.code.replace('firestore/', '') : '';
  var msg = FS_ERROR_MESSAGES[code] || ('Error al guardar (' + (code || (err && err.message) || 'desconocido') + ')');
  console.error('[FS] ' + context, err);
  showToast(msg, 'error', 4500);
}
