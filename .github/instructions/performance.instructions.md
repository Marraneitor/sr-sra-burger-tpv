---
applyTo: "**/*.{html,js,css}"
---

# Performance — Reglas para Gestia POS

## Carga inicial — Eliminar render-blocking

- **Nunca** poner scripts de terceros no críticos en `<head>` sin `defer` o `async`
- `Chart.js` y `jsPDF` son bibliotecas de uso diferido — cargarlas con `defer` en el `<head>` (Chart.js) o dinámicamente via `import()` en la función que las usa (jsPDF)
- El CDN de Tailwind (`cdn.tailwindcss.com`) **nunca** en producción — usar el CSS compilado en `styles/main.css`
- `EmailJS` va con `defer`
- Las fuentes de Google Fonts usan el truco `media="print" onload="this.media='all'"` con un `<noscript>` fallback, para cargar sin bloquear el render

## CSS — Orden de link tags

El orden en `<head>` debe ser:
1. `<meta charset>` y `<meta viewport>` primero
2. Fuentes (con loading async)
3. CSS crítico local (responsive.css, main.css, saas2026.css)
4. Scripts diferidos (con `defer`)

No poner `<link rel="stylesheet">` de CDN externo (como heroicons) que bloqueen el render — utilizar iconos inline SVG o un sprite local si se necesitan.

## renderAll() — Patrón requerido

`renderAll()` renderiza **todas** las secciones a la vez. Es costoso. Reglas:

- **Nunca** llamar `renderAll()` dentro de un loop
- Cuando se llama `renderAll()` después de una mutación de estado, envolverla en `requestAnimationFrame` si NO es la primera carga:
  ```js
  // Solo en callbacks de user action (no en bootstrap):
  requestAnimationFrame(() => renderAll());
  ```
- En handlers de Firestore (`onSnapshot`) usar un debounce de **50ms** para evitar re-renders múltiples consecutivos:
  ```js
  let _renderTimer;
  function scheduleRender() {
    clearTimeout(_renderTimer);
    _renderTimer = setTimeout(() => renderAll(), 50);
  }
  ```
- `renderAll()` en Firestore snapshots (líneas 2182, 11780, 12681) DEBEN pasar por `scheduleRender()`, no llamarse directamente

## Render por sección visible

Cuando un view se activa en `showView(id)`, renderizar SOLO la sección activa si corresponde:

```js
// En showView(), después de aplicar la clase activa:
const sectionRenderMap = {
  'dashboard': updateDashboard,
  'ventas':    renderVentasTabla,
  'productos': () => { renderProductosTabla(); renderProductosFilterButtons(); },
  'clientes':  renderClientesTabla,
  'insumos':   renderInsumosView,
  'finanzas':  renderFinanzas,
  'caja':      renderCaja,
};
if (sectionRenderMap[id]) requestAnimationFrame(sectionRenderMap[id]);
```

## DOM strings vs createElement

- Para tablas con >20 filas usar `DocumentFragment` + `createElement`, NO concatenar `innerHTML` dentro de forEach
- Para tablas small (<10 filas) ok usar template string + `innerHTML = rows.map(...).join('')`
- Nunca hacer `querySelector` dentro de un forEach de lista grande — cachear las refs antes del loop

## Images

- Todo `<img>` que no esté above-the-fold debe tener `loading="lazy"`
- Usar formato WebP con `<picture>` para imágenes de producto/logo cuando sea posible

## Loading overlay

- El timeout de `hideLoading()` no debe superar **400ms** para usuarios con conexión normal
- Si Firebase tarda más de 400ms, el overlay se debe remover de todas formas y mostrar un skeleton o indicador inline

## Service Worker

- El SW debe cachear el shell (index.html + CSS + JS crítico) con cache-first
- Los datos de Firestore nunca se cachean en SW (son reactivos en tiempo real)

## Métricas objetivo

| Métrica | Objetivo |
|---|---|
| First Contentful Paint | < 1.5s (en conexión 4G simulada) |
| Time to Interactive | < 3s |
| Tamaño JS inicial bloqueante | 0 KB (todo diferido) |
| renderAll() por acción del usuario | máx. 1 call (debounced) |
