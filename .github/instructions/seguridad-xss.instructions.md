---
applyTo: "**/*.{html,js}"
---

# Skill: Prevención de XSS — Gestia POS

## Regla cardinal: NUNCA interpolar datos externos en `innerHTML` sin escapar

Todo dato que provenga de:
- Firestore (`appState.*`)
- `localStorage`
- Inputs del usuario
- Parámetros de URL

**DEBE** pasar por la función `esc()` antes de insertarse en HTML.

---

## La función `esc()` — obligatoria en todo `innerHTML` con datos externos

```js
// Definida en index.html junto a las otras utilidades (const $, $$, fmt...)
const esc = (s) => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
```

---

## Patrones correctos vs incorrectos

### ❌ MAL — XSS posible si `nombre` viene de Firestore/usuario
```js
tr.innerHTML = `<td>${producto.nombre}</td>`;
tr.innerHTML = `<td>${cliente.descripcion || '—'}</td>`;
element.innerHTML = `<button data-id="${item.id}">Editar</button>`;
```

### ✅ CORRECTO — datos externos siempre escapados
```js
tr.innerHTML = `<td>${esc(producto.nombre)}</td>`;
tr.innerHTML = `<td>${esc(cliente.descripcion || '—')}</td>`;
element.innerHTML = `<button data-id="${esc(item.id)}">Editar</button>`;
```

---

## Excepciones permitidas — cuándo NO usar `esc()`

### 1. `textContent` — siempre seguro (el browser NO interpreta HTML)
```js
el.textContent = producto.nombre;       // ✅ seguro sin esc()
el.textContent = `Total: ${fmt(monto)}`; // ✅ seguro
```

### 2. Valores propios del programa (no de usuario/Firestore)
```js
// Fechas formateadas por el propio JS — no vienen de usuario:
tr.innerHTML = `<td>${new Date(v.fecha).toLocaleDateString()}</td>`;  // ✅

// Números calculados localmente:
tr.innerHTML = `<td>${fmt(Number(g.monto)||0)}</td>`;  // ✅ fmt() produce solo dígitos/$

// Clases CSS y estructura HTML hardcodeada en el código:
tr.innerHTML = `<td class="p-2">…</td>`;  // ✅ valor literal
```

### 3. Emojis y strings literales del código fuente
```js
const tipoMap = { 'sueldo': '💵 Sueldo', 'otro': '📌 Otro' };
// tipoMap[g.tipo] viene de un mapa local con claves controladas.
// Igualmente aplicar esc() por si g.tipo no matchea y se usa el fallback:
tr.innerHTML = `<td>${esc(tipoMap[g.tipo] || g.tipo || '—')}</td>`; // ✅
```

---

## `data-id` attributes — también deben escaparse

Los `data-id` se usan como selectores en event delegation. Si contienen `"` o `>` sin escapar, rompen el HTML o permiten inyección de atributos:

```js
// ❌ MAL
element.innerHTML = `<button data-id="${item.id}">Editar</button>`;

// ✅ CORRECTO
element.innerHTML = `<button data-id="${esc(item.id)}">Editar</button>`;
```

---

## Security Headers HTTP — `vercel.json`

El proyecto ya tiene estos headers configurados en `vercel.json`. No eliminarlos:

| Header | Valor | Protección |
|---|---|---|
| `X-Frame-Options` | `SAMEORIGIN` | Anti-clickjacking |
| `X-Content-Type-Options` | `nosniff` | Anti-MIME-sniffing |
| `X-XSS-Protection` | `1; mode=block` | XSS legacy browsers |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Fuga de URLs |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Permisos de hardware |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | HTTPS forzado |

---

## PII — Nunca en comentarios de código público

```js
// ❌ MAL — email del admin expuesto en código fuente visible por cualquiera
const ADMIN_UID = 'Gi7lpYblceRCzebBIL6si5NoTU72'; // admin@ejemplo.com

// ✅ CORRECTO — solo el UID, sin información personal
const ADMIN_UID = 'Gi7lpYblceRCzebBIL6si5NoTU72';
```

---

## Reglas rápidas para code review

Antes de aprobar cualquier cambio que toque `innerHTML`, verificar:

- [ ] Todos los valores de `appState.*` pasan por `esc()`
- [ ] Todos los `data-id="${...}"` pasan por `esc()`
- [ ] No hay emails, contraseñas ni datos personales en comentarios
- [ ] `vercel.json` mantiene el bloque `headers`
- [ ] La función `esc()` está definida antes del primer uso
