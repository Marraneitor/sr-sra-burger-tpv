---
applyTo: "**/*.{html,js}"
---

# Skill: Firestore Best Practices — Gestia POS

Cuando generes o modifiques código que interactúa con Firestore, sigue estos patrones sin excepción.

## Verificación de estado antes de cualquier operación
Toda función de Firestore debe empezar con este guard:
```javascript
if (!isFirestoreReady()) return;
const uid = window.auth?.currentUser?.uid;
if (!uid) return;
```

## Transacciones atómicas para contadores
Cualquier operación que lea un valor y luego escriba basándose en él (como `nextSaleNumber`) DEBE usar `runTransaction`:
```javascript
const result = await runTransaction(window.db, async (tx) => {
  const ref = doc(window.db, 'meta', uid);
  const snap = await tx.get(ref);
  const next = snap.exists() ? (snap.data().nextSaleNumber || 1) : 1;
  tx.set(ref, { nextSaleNumber: next + 1 }, { merge: true });
  return next;
});
```
**Nunca** uses `getDoc()` + `setDoc()` separados para este patrón — hay race conditions.

## `setDoc` con merge — cuándo usarlo
- ✅ Usar `{ merge: true }` para actualizaciones parciales donde el documento puede ya existir
- ❌ NO usar `{ merge: true }` si quieres garantizar que el documento tiene exactamente los campos que envías (usa `setDoc` sin merge)

## Estructura obligatoria en todo documento
Todo documento guardado en Firestore debe incluir `userId` del usuario autenticado:
```javascript
await setDoc(ref, { ...datos, userId: uid }, { merge: true });
```

## Queries — filtrar siempre por userId
Las queries deben comenzar con el filtro de usuario para no leer datos de otros:
```javascript
// ✅ CORRECTO
query(collection(db, 'ventas'), where('userId', '==', uid), orderBy('fecha', 'desc'))

// ❌ MAL — lee todas las ventas de todos los usuarios
query(collection(db, 'ventas'), orderBy('fecha', 'desc'))
```

## Patrón de funciones Firestore
Las funciones siguen esta convención de nombres:
| Patrón | Descripción |
|--------|-------------|
| `save[Entidad]ToFirestore(obj)` | Guarda o actualiza una entidad |
| `delete[Entidad]FromFirestore(id)` | Borra (soft o hard) una entidad |
| `subscribe[Entidad]()` | Inicia listener `onSnapshot` |
| `maybeBootstrap[Entidad]ToFirestore()` | Sube datos locales si Firestore está vacío |

## Manejo de errores — exponer siempre al usuario
```javascript
// ❌ MAL — swallowing silencioso
catch(e) { console.warn('[FS] error', e); }

// ✅ CORRECTO — feedback al usuario
catch(e) {
  console.error('[FS] saveVenta', e);
  showFirestoreError(e, 'guardar venta');  // feedback visual
}
```

## Listeners — limpieza obligatoria
Cuando un listener `onSnapshot` se crea, guardar la función de cleanup:
```javascript
let unsubscribe = onSnapshot(ref, callback);

// Al cerrar sesión o cambiar de usuario:
if (unsubscribe) { unsubscribe(); unsubscribe = null; }
```

## Fallback offline
Si una operación de Firestore falla, nunca dejar el estado local inconsistente:
```javascript
async function saveVentaConFallback(venta) {
  try {
    await atomicSaveVenta(venta);
  } catch(e) {
    // Si falla la transacción, revertir el estado local
    appState.ventas = appState.ventas.filter(v => v.id !== venta.id);
    showFirestoreError(e, 'guardar venta');
    throw e;
  }
}
```

## Validación de datos antes de escribir a Firestore
```javascript
// Siempre validar antes de guardar:
function validateProducto(p) {
  if (!p.nombre || typeof p.nombre !== 'string' || p.nombre.length > 120) throw new Error('Nombre inválido');
  if (typeof p.precio !== 'number' || p.precio < 0) throw new Error('Precio inválido');
  if (p.costo !== undefined && (typeof p.costo !== 'number' || p.costo < 0)) throw new Error('Costo inválido');
  return true;
}
```

## Índices compuestos — qué queries los requieren
Firestore requiere índices para queries con múltiples filtros + orderBy:
- `where('userId','==',uid)` + `orderBy('fecha','desc')` → necesita índice compuesto
- `where('userId','==',uid)` + `where('estado','==','pendiente')` + `orderBy('fecha')` → necesita índice compuesto

Si una query falla con `FAILED_PRECONDITION`, agregar el índice en `firestore.indexes.json`.
