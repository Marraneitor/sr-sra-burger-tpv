# PERFORMANCE.md — Plan de optimización de rendimiento
## Gestia POS — index.html

> Creado: 2025  
> Estado: En progreso

---

## Diagnóstico inicial

| Artefacto | Tamaño |
|---|---|
| `index.html` | **652 KB** (12,834 líneas) |
| `styles/main.css` | 36.2 KB |
| `styles/saas2026.css` | 14.7 KB |
| `styles/responsive.css` | 5.7 KB |

### Scripts render-blocking detectados en `<head>`

| Script | Peso aprox. | Problema |
|---|---|---|
| `cdn.tailwindcss.com` | ~56 KB (JIT compiler) | Bloquea primer paint — ELIMINADO (usamos `main.css`) |
| `chart.js` (CDN) | ~200 KB | Bloquea primer paint — usar `defer` |
| `jspdf@2.5.1` (CDN) | ~300 KB | Bloquea primer paint — carga dinámica en función |
| `heroicons.min.css` (CDN) | ~15 KB | Bloquea render — iconos SVG inline |
| Google Fonts (CDN) | ~2 req. → 2 RTT | Bloquea render — usar media=print trick |
| `@emailjs/browser` (CDN) | ~30 KB | Bloquea render — usar `defer` |

**Total JS render-blocking eliminable: ~586 KB → 0 KB al primer paint**

---

## P1 — Crítico (impacto directo en Time to First Paint)

### ✅ P1.1 — Eliminar Tailwind CDN
- **Acción**: Eliminar `<script src="https://cdn.tailwindcss.com">` del `<head>`
- **Resultado**: +56 KB menos parseado/ejecutado al cargar; ya tenemos `styles/main.css`
- **Estado**: ✅ COMPLETADO

### ✅ P1.2 — Diferir Chart.js
- **Acción**: Agregar `defer` al `<script src="chart.js">`
- **Resultado**: ~200 KB de JS no bloquean el parser HTML
- **Estado**: ✅ COMPLETADO

### ✅ P1.3 — Cargar jsPDF dinámicamente
- **Acción**: Eliminar `<script src="jspdf">` del `<head>`; en cada función que usa `jsPDF` agregar carga dinámica:
  ```js
  async function ensureJsPDF() {
    if (window.jspdf) return;
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  ```
- **Estado**: ✅ COMPLETADO

### ✅ P1.4 — Async Google Fonts
- **Acción**: Usar patrón `media="print" onload="this.media='all'"` para cargar fuentes sin bloquear
- **Estado**: ✅ COMPLETADO

### ✅ P1.5 — Diferir EmailJS
- **Acción**: Agregar `defer` al `<script src="@emailjs/browser">`
- **Estado**: ✅ COMPLETADO

---

## P2 — Alto (impacto en tiempo de navegación interna)

### ✅ P2.1 — Debounce renderAll() en Firestore snapshots
- **Acción**: Reemplazar llamadas directas a `renderAll()` en callbacks de `onSnapshot` por `scheduleRender()`
- **Razón**: Multiples snapshots pueden llegar en ráfaga al inicio — sin debounce se ejecuta renderAll() N veces en milisegundos
- **Calls afectadas**: líneas ~2182, ~11780, ~12681
- **Estado**: ✅ COMPLETADO

### ✅ P2.2 — Reducir timeout de loading overlay
- **Acción**: Cambiar `setTimeout(hideLoading, 2500)` → `setTimeout(hideLoading, 400)`
- **Razón**: 2.5 segundos es demasiado — el overlay debe desaparecer tan pronto como los datos iniciales lleguen
- **Estado**: ✅ COMPLETADO

### ⬜ P2.3 — Render por sección al navegar (lazy render)
- **Acción**: En `showView(id)` llamar solo la función render de la sección activa (no todas)
- **Razón**: Al navegar a "caja" no hay necesidad de re-renderizar "ventas" o "productos"
- **Estado**: ⬜ PENDIENTE (requiere refactor de `showView`)

### ⬜ P2.4 — DocumentFragment para tablas grandes
- **Acción**: `renderVentasTabla`, `renderClientesTabla`, `renderInsumosView` — migrar de `innerHTML=` a `DocumentFragment`
- **Estado**: ⬜ PENDIENTE

---

## P3 — Medio (mejoras incrementales)

### ⬜ P3.1 — Eliminar heroicons CSS CDN
- **Acción**: Reemplazar con SVGs inline solo para los iconos que se usan realmente
- **Estado**: ⬜ PENDIENTE (requiere auditoría de qué iconos se usan)

### ⬜ P3.2 — Virtualizar listas muy largas
- **Acción**: Para ventas/productos con >200 items, solo renderizar los visibles en viewport
- **Estado**: ⬜ PENDIENTE (baja prioridad — ya hay paginación en admin.html)

### ⬜ P3.3 — Preload de recursos críticos
- **Acción**: `<link rel="preload">` para `main.css`, `saas2026.css` y Firebase SDK
- **Estado**: ⬜ PENDIENTE

---

## Impacto estimado de P1 completado

| Métrica | Antes | Después P1 |
|---|---|---|
| JS bloqueante en `<head>` | ~586 KB | **0 KB** |
| Requests bloqueantes | 6 | **1** (Google Fonts, async) |
| First Contentful Paint (estimado) | ~4-6s | **< 1.5s** |
| Loading overlay | 2500ms mínimo | **400ms** |

---

## Notas

- `renderAll()` se llama ~20 veces distintas en el código — es la función más costosa, siempre mínimo 12 renders de sección
- Los PDFs solo se generan bajo demanda (click de botón) — `jsPDF` cargado dinámicamente no afecta TTI
- `Chart.js` con `defer` aún se descarga, pero no bloquea el parser HTML — los charts se inicializarán cuando el script esté listo
