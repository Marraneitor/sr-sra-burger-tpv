# GitHub Copilot — Instrucciones del Proyecto Gestia POS

## Contexto del proyecto
Gestia es un POS (Point of Sale) para restaurantes construido como una SPA en HTML/CSS/JavaScript vanilla con Firebase (Firestore + Auth). Se despliega en Vercel.

## Reglas generales para este proyecto

### Seguridad — siempre prioritaria
- **Nunca** escribir credenciales, API keys, passwords ni emails de usuarios directamente en el código
- **Siempre** validar que el usuario esté autenticado (`window.auth?.currentUser?.uid`) antes de cualquier operación de Firestore
- **Nunca** usar `allow read: if true` en reglas de Firestore — requiere `request.auth != null`
- **Nunca** comparar passwords en texto plano en el cliente — usar Firebase Authentication
- Toda escritura a Firestore debe incluir `userId: uid` como el UID del usuario autenticado

### Firestore — patrones correctos
- Usar `runTransaction` para operaciones que leen y luego escriben (ej. contadores, `nextSaleNumber`)
- Usar `setDoc(..., { merge: true })` solo para actualizaciones parciales seguras
- Nunca usar `where('userId','==',uid)` sin que el userId corresponda al `auth.currentUser.uid`
- Toda función de Firestore debe comenzar con `if(!isFirestoreReady()) return;`
- Exponer errores de Firestore al usuario, no swalllearlos con `console.warn` silencioso

### Manejo de errores
- Siempre mostrar feedback visual al usuario cuando una operación crítica falla
- Los errores de Firestore deben mostrar mensajes legibles, no códigos técnicos
- Usar `try/catch` con `finally` en funciones async para garantizar limpieza de estado

### Estado
- El estado de la app vive en `appState`; nunca mutar el estado sin pasar por las funciones de guardado
- Toda mutación de `appState` relevante debe persistir en Firestore y/o localStorage
- No crear variables globales innecesarias en `window.*`

### Performance
- No usar el CDN de Tailwind en producción — usar el build compilado
- Lazy-load funcionalidades que no son críticas para el primer render
- Las queries de Firestore deben estar acotadas con `where('userId','==',uid)` como primer filtro

### Código limpio
- Las funciones de Firestore siguen el patrón: `save[Entidad]ToFirestore`, `subscribe[Entidad]`, `maybeBootstrap[Entidad]ToFirestore`
- No duplicar lógica de Firestore — reutilizar las funciones existentes
- Agregar comentarios solo donde la lógica no es evidente
