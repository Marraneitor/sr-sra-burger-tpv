---
applyTo: "**/*.{html,js,css}"
---

# Skill: Arquitectura y Calidad de Código — Gestia POS

Cuando generes o modifiques código en este proyecto, sigue estas guías de arquitectura.

## Estado de la aplicación
- El estado global SOLO vive en el objeto `appState`
- **Nunca** crear variables globales adicionales en `window.*` para estado de la app
- Toda mutación de `appState` que persista datos debe llamar a la función de guardado correspondiente:
  ```javascript
  // ✅ CORRECTO
  appState.productos.push(nuevoProd);
  saveProductToFirestore(nuevoProd);
  saveLS();
  renderAll();
  
  // ❌ MAL
  window.miProductoTemporal = nuevoProd; // variable global suelta
  ```

## Separación de responsabilidades
Cuando agregues una funcionalidad nueva, separarla en estas capas:
1. **Datos** → función `Firestore` (save/subscribe/bootstrap)
2. **Estado** → mutación de `appState`
3. **Render** → función `render*()` que solo lee `appState` y actualiza DOM

## Manejo de errores — obligatorio en todas las funciones async
```javascript
// Patrón estándar para funciones de Firestore:
async function saveAlgoToFirestore(item) {
  try {
    if (!isFirestoreReady() || !item?.id) return;
    const uid = window.auth?.currentUser?.uid;
    if (!uid) return;
    // ... operación ...
  } catch(e) {
    console.error('[FS] saveAlgo', e);
    // ✅ Notificar usuario — NO swallowing silencioso
    if (typeof showToast === 'function') showToast('Error al guardar. Intenta de nuevo.', 'error');
  }
}
```

## DOM y XSS — reglas de inserción
```javascript
// ✅ SEGURO — para texto plano
elemento.textContent = valorDeUsuario;

// ✅ SEGURO — para HTML (siempre escapar variables del usuario o de Firestore)
elemento.innerHTML = `<span>${esc(nombreDeFirestore)}</span>`;

// ❌ PELIGROSO — nunca insertar datos externos sin escapar
elemento.innerHTML = `<span>${datos.nombre}</span>`;
```

## CSS — convenciones
- Usar variables CSS de `--brand-*` para colores de marca (no hardcodear hex en código nuevo)
- No agregar estilos inline en JS si el estado puede manejarse con clases CSS:
  ```javascript
  // ✅ CORRECTO
  el.classList.toggle('hidden', !esVisible);
  
  // ❌ MAL
  el.style.display = esVisible ? 'block' : 'none';
  ```
- Los media queries van en `responsive.css`, no en `saas2026.css`
- Preferir `min-height: 44px` en botones para targets de toque móvil

## Performance — reglas de render
- Nunca llamar `renderAll()` en un loop por cada item — acumular cambios y llamar una sola vez al final
- Usar `DocumentFragment` para listas largas (>20 items):
  ```javascript
  const frag = document.createDocumentFragment();
  appState.productos.forEach(p => {
    const li = document.createElement('li');
    li.textContent = p.nombre;
    frag.appendChild(li);
  });
  listaEl.innerHTML = '';
  listaEl.appendChild(frag);
  ```
- Imágenes nuevas deben tener `loading="lazy"` y dimensiones explícitas (width/height)

## Modularización — cuando crees funciones nuevas
- Si una función tiene más de 50 líneas, evalúa dividirla
- Si una lógica se repite en 2+ lugares, crear una función helper
- Nombres de funciones deben ser descriptivos y en `camelCase`:
  - `save*`, `delete*`, `subscribe*`, `render*`, `maybe*`, `get*`, `calc*`

## Offline — consideraciones de UX
- Si una operación puede ejecutarse sin conexión (por IndexedDB), no bloquear la UI
- Al ejecutar operaciones críticas (procesarVenta), avisar si el dispositivo está offline:
  ```javascript
  if (!navigator.onLine) {
    showToast('Sin conexión — la venta se sincronizará cuando vuelva la red', 'warning');
  }
  ```

## Código que NO debes generar
- ❌ No crear nuevos archivos `.js` sin consultar (el proyecto es actualmente todo en `index.html`)
- ❌ No agregar dependencias npm sin consultar
- ❌ No crear variables globales `window.algo` para funcionalidad nueva
- ❌ No usar `document.write()`, `eval()`, ni `setTimeout` para lógica de negocio
- ❌ No hardcodear el `userId` ni el `uid` — siempre leerlo de `window.auth?.currentUser?.uid`
