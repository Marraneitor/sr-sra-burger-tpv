---
applyTo: "**/*.{html,js}"
---

# Skill: Seguridad Web — Gestia POS

Cuando generes o modifiques código en este proyecto, sigue estas reglas de seguridad sin excepción.

## Credenciales y secretos
- **NUNCA** pongas API keys, passwords, tokens ni UIDs de usuarios literales en el código
- Si necesitas una credencial, usa `window.__ENV__` o variables de entorno de Vercel
- Si detectas credenciales hardcodeadas en el código existente, señálalas como error crítico
- No generes archivos `firebase-config.js` ni `firebase-config.json` con valores reales

## Autenticación de admin
- **NUNCA** uses comparación directa de password en el cliente: `if(input === PASS)` está prohibido
- El admin panel debe autenticarse con `signInWithEmailAndPassword` de Firebase Auth
- Después del login, verificar custom claim antes de mostrar datos:
  ```javascript
  const token = await user.getIdTokenResult();
  if (!token.claims.admin) { await signOut(auth); return; }
  ```
- El acceso a datos de otros usuarios SOLO debe hacerse desde Cloud Functions con validación de token

## PII (Información Identificable)
- **NUNCA** expongas emails, UIDs, nombres de usuarios en el scope global (`window.*`)
- No crees archivos que mapeen UIDs a emails (como `_auth_lookup.js`)
- Para obtener datos de otros usuarios en el admin, usa Cloud Functions, no acceso directo a Firestore desde cliente

## XSS (Cross-Site Scripting)
- Toda cadena de texto proveniente del usuario o de Firestore que se inserte en `innerHTML` debe pasar por la función `esc()` del proyecto
- Usa `textContent` en lugar de `innerHTML` cuando no necesites HTML
- No uses `eval()`, `Function()` ni `document.write()`
- Si usas template literals para generar HTML, asegúrate de que cada variable dinámica esté escapada

## CSRF y Acceso Cross-Origin
- No expongas funciones administrativas que lean datos de todos los usuarios desde el cliente sin verificar el token de Firebase
- Las operaciones destructivas (borrar usuario, borrar todos los datos) deben requerir reautenticación

## Campos en Firestore
- Nunca almacenes passwords, PINs ni tokens de sesión en Firestore
- Si necesitas almacenar datos sensibles, usar Firebase Authentication (no Firestore) como fuente de verdad

## Ejemplo — Cómo NO hacer autenticación admin:
```javascript
// ❌ MAL — NUNCA HACER ESTO
const PASS = "mipassword123";
function login() {
  if (inputEl.value === PASS) { showAdminPanel(); }
}
```

## Ejemplo — Cómo SÍ hacer autenticación admin:
```javascript
// ✅ CORRECTO
async function loginAdmin(email, password) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  const tokenResult = await user.getIdTokenResult();
  if (!tokenResult.claims.admin) {
    await signOut(auth);
    throw new Error('No tienes permisos de administrador');
  }
  showAdminPanel();
}
```
