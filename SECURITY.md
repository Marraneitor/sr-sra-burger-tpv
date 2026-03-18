# SECURITY.md — Gestia POS

Documento de referencia de seguridad para este proyecto. Actualizado: 2026-03-17.

---

## Estado actual de seguridad

| Área | Estado | Notas |
|---|---|---|
| Firestore Rules | ✅ Seguro | `isOwner()`, `validStr()`, `validPrice()` implementados |
| Auth en todas las operaciones | ✅ Seguro | `isFirestoreReady()` verificado consistentemente |
| `userId` en cada write | ✅ Seguro | Todos los `setDoc` incluyen `userId: uid` |
| XSS — `esc()` en innerHTML | ✅ Corregido (2026-03-17) | Función `esc()` agregada y aplicada a todos los innerHTML con datos de Firestore |
| PII en comentarios | ✅ Corregido (2026-03-17) | Email removido del comentario en `ADMIN_UID` |
| Security Headers HTTP | ✅ Corregido (2026-03-17) | Configurados en `vercel.json` |
| EmailJS domain whitelist | ⚠️ Pendiente | Configurar en dashboard de EmailJS |
| Firebase API key restricciones | ⚠️ Pendiente | Restringir a dominios en Google Cloud Console |

---

## Correcciones aplicadas (2026-03-17)

### 1. Función `esc()` para prevención de XSS

**Problema:** Datos de Firestore (nombres, descripciones) se insertaban directamente en `innerHTML` sin sanitizar, permitiendo inyección de HTML/JS.

**Solución:** Se agregó `esc()` como utilidad global en `index.html` junto a `$`, `$$` y `fmt`:

```js
const esc = (s) => String(s ?? '')
  .replace(/&/g,'&amp;')
  .replace(/</g,'&lt;')
  .replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;')
  .replace(/'/g,'&#39;');
```

**Archivos afectados:** Todos los `innerHTML` con datos de Firestore en los módulos:
- Caja → ingresos, gastos, pendientes
- Finanzas → asignaciones, empleados, servicios, gastos
- Dashboard → ventas recientes
- Insumos → historial, mermas
- Inventario → compras/gastos por ingrediente

**Regla:** Ver [`.github/instructions/seguridad-xss.instructions.md`](./.github/instructions/seguridad-xss.instructions.md)

---

### 2. PII eliminado de comentarios

**Problema:** El email del administrador estaba hardcodeado como comentario en código fuente público.

```js
// ANTES (❌)
const ADMIN_UID = 'Gi7lpYblceRCzebBIL6si5NoTU72'; // yoelskygold@gmail.com
```

**Solución:**
```js
// DESPUÉS (✅)
const ADMIN_UID = 'Gi7lpYblceRCzebBIL6si5NoTU72';
```

---

### 3. Security Headers HTTP en Vercel

**Problema:** `vercel.json` no definía cabeceras de seguridad HTTP, dejando la app vulnerable a clickjacking, MIME-sniffing y fuga de referrer.

**Solución:** Se agregó el bloque `headers` en `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options",           "value": "SAMEORIGIN" },
        { "key": "X-Content-Type-Options",     "value": "nosniff" },
        { "key": "X-XSS-Protection",           "value": "1; mode=block" },
        { "key": "Referrer-Policy",            "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy",         "value": "camera=(), microphone=(), geolocation=()" },
        { "key": "Strict-Transport-Security",  "value": "max-age=63072000; includeSubDomains; preload" }
      ]
    }
  ]
}
```

| Header | Protección |
|---|---|
| `X-Frame-Options: SAMEORIGIN` | Previene clickjacking (la app no puede embeberse en iframes externos) |
| `X-Content-Type-Options: nosniff` | El browser no adivina el Content-Type (MIME-sniffing attacks) |
| `X-XSS-Protection: 1; mode=block` | Activa el filtro XSS de navegadores legacy |
| `Referrer-Policy` | Las URLs internas no se filtran a sitios externos |
| `Permissions-Policy` | La app no puede acceder a cámara/micrófono/GPS sin permiso explícito |
| `Strict-Transport-Security` | Fuerza HTTPS por 2 años con preload en navegadores modernos |

---

## Tareas de seguridad pendientes

### ⚠️ EmailJS — Whitelist de dominios
La public key de EmailJS (`q14FqhdjUSICAGOTm`) está expuesta en el código cliente, lo cual es normal para EmailJS, pero cualquiera puede usarla desde cualquier dominio. 

**Acción:** En [app.emailjs.com](https://app.emailjs.com) → Settings → API keys → agregar restricción de dominio: `gestia.rest`, `localhost`.

### ⚠️ Firebase API Key — Restricción de referrer
La API key de Firebase es pública por diseño, pero se puede limitar su uso a dominios específicos.

**Acción:** En [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → seleccionar la API key → agregar restricción de aplicaciones HTTP: `gestia.rest/*`, `*.gestia.rest/*`.

---

## Responsabilidades

- **Firestore Security Rules** (`firestore.rules`): controlan acceso en el servidor. Nunca debilitarlas.
- **`esc()` en cliente** (`index.html`): previene XSS en el rendering local.
- **Security Headers** (`vercel.json`): controlan comportamiento del browser.

Las tres capas son complementarias: ninguna reemplaza a las otras.
