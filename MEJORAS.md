# Plan de Mejoras Técnicas — Gestia POS
> Auditoría realizada el 17 de marzo de 2026  
> Prioridades ordenadas por impacto y riesgo

---

## FASE 1 — Crítico (resolver antes de ir a producción con usuarios reales)

### C1 · Firebase API Keys expuestas
**Archivos afectados:** `firebase-config.json`, `firebase-config.js`, `index.html`

**Problema:** Las credenciales reales de Firebase están expuestas en el código fuente público.

**Pasos de resolución:**
1. [ ] Ir a [Google Cloud Console](https://console.cloud.google.com) → Credentials → Restringir la API key a solo los dominios autorizados (`gestia.rest`, `manager-d860c.firebaseapp.com`)
2. [ ] Quitar `firebase-config.js` y `firebase-config.json` del repositorio Git
3. [ ] Agregar ambos al `.gitignore`
4. [ ] En Vercel: agregar `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, etc. como **Environment Variables**
5. [ ] Modificar `index.html` para leer desde `window.__ENV__` inyectado por Vercel Edge Config en lugar de hardcodear
6. [ ] Rotar la API key original (generar una nueva en GCP)

```bash
# .gitignore — agregar
firebase-config.js
firebase-config.json
.env
.env.local
```

---

### C2 · Password de admin hardcodeado en JavaScript
**Archivo afectado:** `admin.html` línea ~192

**Problema:** `const PASS = "admingestia3141592"` es visible en el código fuente del navegador.

**Pasos de resolución:**
1. [ ] Crear usuario administrador en Firebase Authentication con email específico
2. [ ] En Firestore crear colección `/admins/{uid}` con campo `role: "superadmin"`
3. [ ] Reemplazar la validación de password por `signInWithEmailAndPassword` de Firebase Auth
4. [ ] Agregar validación de Custom Claim en el panel admin:
   ```javascript
   const token = await user.getIdTokenResult();
   if (!token.claims.admin) { signOut(auth); return; }
   ```
5. [ ] Desde Firebase Console → Authentication → Functions, crear Cloud Function para asignar el custom claim `admin: true` solo al UID autorizado
6. [ ] Activar regla en `firestore.rules` para que la colección `/admins` solo sea legible por admins verificados

---

### C3 · `_auth_lookup.js` — PII expuesta públicamente
**Archivo afectado:** `_auth_lookup.js`

**Problema:** Mapeo de UIDs a emails de usuarios en scope global. Viola GDPR/CCPA.

**Pasos de resolución:**
1. [ ] Eliminar `_auth_lookup.js` del repositorio
2. [ ] Eliminar la referencia en `admin.html`
3. [ ] En el panel admin, obtener emails de usuarios mediante una **Cloud Function** autenticada:
   ```javascript
   // Cloud Function (no expuesta al cliente):
   exports.getUserEmail = functions.https.onCall(async (data, context) => {
     if (!context.auth?.token?.admin) throw new functions.https.HttpsError('permission-denied', 'Not admin');
     const user = await admin.auth().getUser(data.uid);
     return { email: user.email };
   });
   ```
4. [ ] Hacer `git rm --cached _auth_lookup.js` y limpiar el historial con `git filter-branch` o BFG Repo Cleaner si ya fue pusheado

```bash
git rm --cached _auth_lookup.js
echo "_auth_lookup.js" >> .gitignore
git commit -m "security: remove PII exposure file"
```

---

## FASE 2 — Alto (resolver antes de escalar a más usuarios)

### H1 · Firestore Rules incompletas
**Archivo afectado:** `firestore.rules`

**Mejoras pendientes:**
1. [ ] Separar reglas por colección (no usar wildcard genérico para todo)
2. [ ] Agregar validación de tipo y rango para campos críticos:
   ```javascript
   // Ejemplo para productos:
   match /productos/{docId} {
     allow write: if request.auth != null
       && request.resource.data.userId == request.auth.uid
       && request.resource.data.nombre is string
       && request.resource.data.nombre.size() > 0
       && request.resource.data.nombre.size() <= 120
       && request.resource.data.precio is number
       && request.resource.data.precio >= 0
       && request.resource.data.precio <= 999999;
   }
   ```
3. [ ] Agregar reglas explícitas de `delete` separadas de `write`
4. [ ] Publicar reglas con `firebase deploy --only firestore:rules`
5. [ ] Activar el **Simulador de Reglas** en Firebase Console para testear casos edge

---

### H2 · Namespace global contaminado
**Archivo afectado:** `index.html`

**Problema:** `window.db`, `window.auth`, `window.fs` exponen Firestore a cualquier script de tercero.

**Pasos de resolución:**
1. [ ] Envolver toda la inicialización de Firebase en un módulo IIFE o clase `GestiaDB`:
   ```javascript
   const GestiaDB = (() => {
     let _db, _auth;
     return {
       init(db, auth) { _db = db; _auth = auth; },
       getDb() { return _db; },
       getAuth() { return _auth; },
       // API controlada:
       async saveVenta(venta) { /* validar + guardar */ },
       async saveProducto(prod) { /* validar + guardar */ }
     };
   })();
   ```
2. [ ] Reemplazar todas las referencias a `window.db`, `window.auth`, `window.fs` por `GestiaDB.getDb()`, etc.
3. [ ] Remover la exposición directa de `window.fs`

---

### H3 · Sin manejo de errores para el usuario
**Problema:** Los errores de Firestore se swallean a `console.warn` sin notificar al usuario.

**Pasos de resolución:**
1. [ ] Crear función centralizada `showFirestoreError(err)`:
   ```javascript
   const FS_ERROR_MESSAGES = {
     'permission-denied': 'No tienes permisos. Inicia sesión nuevamente.',
     'unavailable': 'Sin conexión. La venta se guardará cuando vuelva la red.',
     'resource-exhausted': 'Demasiadas operaciones. Espera unos segundos.',
     'unauthenticated': 'Sesión expirada. Por favor inicia sesión.',
   };
   function showFirestoreError(err, context = '') {
     const msg = FS_ERROR_MESSAGES[err.code] || `Error al guardar (${err.code || err.message})`;
     console.error(`[FS] ${context}`, err);
     // Mostrar toast o alerta en UI
     showToast(msg, 'error');
   }
   ```
2. [ ] Reemplazar todos los `catch(e){ console.warn('[FS]...', e); }` por `showFirestoreError(e, 'contexto')`
3. [ ] Para `processSale()`: si `atomicSaveVenta` falla, revertir el push local a `appState.ventas` y mostrar error al cajero

---

### H4 · Sin Service Worker (modo offline real)
**Problema:** IndexedDB cachea datos pero la shell HTML no se cachea. Sin red = app en blanco.

**Pasos de resolución:**
1. [ ] Crear `public/sw.js`:
   ```javascript
   const CACHE_NAME = 'gestia-v1';
   const SHELL_FILES = ['/', '/index.html', '/styles/responsive.css', '/styles/saas2026.css', '/styles/enhancements.css'];

   self.addEventListener('install', e => {
     e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_FILES)));
   });

   self.addEventListener('fetch', e => {
     e.respondWith(
       caches.match(e.request).then(cached => cached || fetch(e.request))
     );
   });
   ```
2. [ ] Registrar en `index.html`:
   ```javascript
   if ('serviceWorker' in navigator) {
     navigator.serviceWorker.register('/sw.js');
   }
   ```
3. [ ] Agregar indicador visual de estado offline:
   ```javascript
   window.addEventListener('online', () => showToast('Conexión restaurada ✓', 'success'));
   window.addEventListener('offline', () => showToast('Sin conexión — modo offline activo', 'warning'));
   ```

---

### H5 · Tailwind CDN en producción
**Problema:** El JIT compiler de Tailwind corre en el navegador (+56KB, +300ms).

**Pasos de resolución:**
1. [ ] Instalar Tailwind CLI: `npm install -D tailwindcss`
2. [ ] Crear `tailwind.config.js`:
   ```javascript
   module.exports = {
     content: ['./*.html', './styles/**/*.css'],
     theme: { extend: {} },
     plugins: [],
   };
   ```
3. [ ] Crear `styles/input.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
4. [ ] Build script en `package.json`:
   ```json
   "scripts": {
     "css:build": "tailwindcss -i styles/input.css -o styles/main.css --minify",
     "css:watch": "tailwindcss -i styles/input.css -o styles/main.css --watch"
   }
   ```
5. [ ] Reemplazar `<script src="https://cdn.tailwindcss.com">` por `<link rel="stylesheet" href="./styles/main.css">`

---

## FASE 3 — Medio (mejoras de calidad y mantenibilidad)

### M1 · Monolito de 13,000+ líneas
**Propuesta de estructura modular:**
```
/modules
  /pos/           → POS.js (cobro, orden, productos)
  /inventario/    → Inventario.js
  /finanzas/      → Finanzas.js
  /clientes/      → Clientes.js
  /pedidos/       → Pedidos.js
  /reportes/      → Reportes.js
/db
  firebaseClient.js   → Instancia y helpers de Firestore
  auth.js             → Firebase Auth helpers
/state
  appState.js         → Estado centralizado (o Zustand/nanostores)
/utils
  validators.js       → Validación de inputs
  formatters.js       → fmt(), esc(), etc.
  errorHandler.js     → showFirestoreError(), showToast()
index.html            → Solo HTML shell + import de módulos
```

**Plan de migración incremental:**
1. [ ] Extraer primero las funciones de Firestore a `/db/firebaseClient.js`
2. [ ] Extraer `appState` y sus mutaciones a `/state/appState.js`
3. [ ] Modularizar por vista (una por sprint)

---

### M2 · Paginación en panel admin
1. [ ] Reemplazar `.slice(0,100)` por cursores de Firestore:
   ```javascript
   const PAGE_SIZE = 25;
   let lastDoc = null;
   
   async function fetchNextPage(collectionName) {
     let q = query(collection(db, collectionName), where('userId','==',uid), limit(PAGE_SIZE));
     if (lastDoc) q = query(q, startAfter(lastDoc));
     const snap = await getDocs(q);
     lastDoc = snap.docs[snap.docs.length - 1] || null;
     return snap.docs.map(d => d.data());
   }
   ```

---

### M3 · Índices compuestos de Firestore
1. [ ] Crear `firestore.indexes.json`:
   ```json
   {
     "indexes": [
       {
         "collectionGroup": "ventas",
         "fields": [
           { "fieldPath": "userId", "order": "ASCENDING" },
           { "fieldPath": "fecha", "order": "DESCENDING" }
         ]
       },
       {
         "collectionGroup": "pedidos",
         "fields": [
           { "fieldPath": "userId", "order": "ASCENDING" },
           { "fieldPath": "estado", "order": "ASCENDING" },
           { "fieldPath": "fecha", "order": "DESCENDING" }
         ]
       }
     ]
   }
   ```
2. [ ] Deploy: `firebase deploy --only firestore:indexes`

---

### M4 · CSS fragmentado — consolidar y minificar
1. [ ] Unificar `saas2026.css` + `enhancements.css` + estilos inline en un solo `styles/main.css`
2. [ ] Eliminar reglas duplicadas manualmente o con `cssnano`
3. [ ] Agregar a package.json: `"postcss": "postcss styles/main.css -o styles/main.min.css"`

---

### M5 · Imagen `gestia.jpg.png`
1. [ ] Convertir a WebP: `cwebp gestia.jpg.png -o gestia.webp -q 80`
2. [ ] Usar `<picture>` con fallback:
   ```html
   <picture>
     <source srcset="./gestia.webp" type="image/webp">
     <img src="./gestia.jpg.png" alt="Gestia POS" loading="lazy" width="180" height="60">
   </picture>
   ```

---

## Checklist de progreso

| # | Issue | Prioridad | Estado |
|---|-------|-----------|--------|
| C1 | Firebase keys expuestas | 🔴 Crítico | ✅ 17/03/2026 |
| C2 | Admin password hardcodeado | 🔴 Crítico | ✅ 17/03/2026 |
| C3 | `_auth_lookup.js` PII | 🔴 Crítico | ✅ 17/03/2026 |
| H1 | Firestore rules granulares | 🟠 Alto | ✅ 17/03/2026 |
| H2 | Namespace global | 🟠 Alto | ⬜ Pendiente |
| H3 | Error handling para usuario | 🟠 Alto | ✅ 17/03/2026 |
| H4 | Service Worker offline real | 🟠 Alto | ✅ 17/03/2026 |
| H5 | Tailwind CDN → build | 🟠 Alto | ✅ Configs listas (ejecutar npm run css:build) |
| M1 | Modularizar monolito | 🟡 Medio | ✅ 17/03/2026 (utils/errorHandler.js + styles/main.css) |
| M2 | Paginación admin | 🟡 Medio | ✅ 17/03/2026 |
| M3 | Firestore indexes | 🟡 Medio | ✅ 17/03/2026 |
| M4 | CSS unificado | 🟡 Medio | ✅ 17/03/2026 (styles/main.css) |
| M5 | Imagen WebP | 🟢 Bajo | ✅ 17/03/2026 (generar gestia.webp con cwebp) |
| ✅ | Transacciones atómicas | ✅ Hecho | ✅ 17/03/2026 |
| ✅ | Firestore rules base | ✅ Hecho | ✅ 17/03/2026 |
| ✅ | processSale async | ✅ Hecho | ✅ 17/03/2026 |
