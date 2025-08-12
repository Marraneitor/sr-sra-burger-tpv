# 🔥 Configuración de Firebase para SR & SRA BURGER TPV

## 📋 Pasos para Configurar Firebase

### 1. Crear Proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto" o "Add project"
3. Nombra tu proyecto: `sr-sra-burger-tpv`
4. Deshabilita Google Analytics (opcional para este proyecto)
5. Haz clic en "Crear proyecto"

### 2. Configurar Firestore Database

1. En el panel lateral izquierdo, ve a **"Firestore Database"**
2. Haz clic en **"Crear base de datos"**
3. Selecciona **"Comenzar en modo de prueba"** (Test mode)
4. Elige una ubicación cercana a ti (ej: `us-central1`)
5. Haz clic en **"Listo"**

### 3. Configurar Authentication

1. En el panel lateral izquierdo, ve a **"Authentication"**
2. Ve a la pestaña **"Sign-in method"**
3. Habilita **"Acceso anónimo"** (Anonymous):
   - Haz clic en "Anonymous"
   - Toggle "Enable"
   - Haz clic en "Guardar"

4. Habilita **Email/Password** (para poder iniciar sesión y vincular cuentas):
  - En la misma pestaña "Sign-in method" haz clic en "Email/Password"
  - Activa "Enable"
  - Guarda cambios

5. En la pestaña **Authorized domains** (Dominios autorizados), asegúrate de que existan:
  - localhost
  - 127.0.0.1
  - Tu IP LAN (por ejemplo 192.168.100.7)
  - Si no aparece tu IP LAN, agrega un nuevo dominio con esa IP (sin puerto)

### 4. Obtener Configuración del Proyecto

1. Ve a **"Configuración del proyecto"** (ícono de engranaje ⚙️)
2. Baja hasta la sección **"Tus apps"**
3. Haz clic en **"Agregar app"** → **"Web"** (ícono `</>`):
   - Nombre de la app: `SR & SRA Burger TPV`
   - NO marcar "Firebase Hosting"
   - Haz clic en "Registrar app"
4. **COPIA** la configuración que aparece (se ve así):

```javascript
const firebaseConfig = {
  apiKey: "tu-api-key-aqui",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 5. Actualizar tu Archivo index.html

1. Abre tu archivo `index.html`
2. Busca la línea que dice:
```javascript
// Tu configuración de Firebase (REEMPLAZA CON TUS CREDENCIALES)
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_AUTH_DOMAIN",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_STORAGE_BUCKET",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
};
```

3. **REEMPLAZA** esa configuración con la que copiaste de Firebase Console

### 6. Configurar Reglas de Firestore (Importante para Seguridad)

1. En Firebase Console, ve a **"Firestore Database"**
2. Ve a la pestaña **"Reglas"**
3. Reemplaza las reglas con esto:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acceso de lectura y escritura (modo desarrollo/prueba)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

4. Haz clic en **"Publicar"**

> **⚠️ Nota**: Estas reglas son para desarrollo. Para producción, implementa reglas más estrictas.

### 7. Errores comunes (y solución rápida)

- auth/operation-not-allowed al registrar/iniciar sesión con email:
  - Habilita Email/Password en Authentication → Sign-in method.
  - Agrega tus dominios (localhost, 127.0.0.1, IP LAN) en Authorized domains.
- 400 en identitytoolkit.googleapis.com:
  - Suele ser por proveedor deshabilitado o dominio no autorizado.
  - Verifica pasos anteriores y recarga la aplicación.

## 🚀 ¡Listo para Usar!

Una vez completados estos pasos:

1. Abre tu archivo `index.html` en un navegador web
2. El sistema debería:
   - Conectarse automáticamente a Firebase
   - Autenticarse de forma anónima
   - Sincronizar datos en la nube
   - Mostrar "🔥 Modo Firebase activo" en la consola

## 🔍 Verificar que Funciona

### En la Consola del Navegador (F12):
- Deberías ver: `🔥 Firebase inicializado correctamente`
- Deberías ver: `🚀 Iniciando sistema Sr. & Sra. Burger...`
- Deberías ver: `🔥 Modo Firebase activo`

### En Firebase Console:
- Ve a **"Firestore Database"** → **"Datos"**
- Al usar la aplicación, deberías ver colecciones creadas automáticamente:
  - `ingredientes`
  - `productos` 
  - `clientes`
  - `ventas`
  - `pedidos_pendientes`

## 📱 Características de la Integración

### ✅ Funcionalidades Implementadas:
- **Autenticación Anónima**: Cada usuario tiene un ID único
- **Sincronización en Tiempo Real**: Los cambios se reflejan instantáneamente
- **Fallback Local**: Si Firebase falla, usa localStorage
- **Multi-dispositivo**: Accede desde cualquier dispositivo con los mismos datos
- **Persistencia**: Los datos se guardan permanentemente en la nube

### 🔄 Comportamiento Híbrido:
- **Con Internet + Firebase configurado**: Modo en la nube
- **Sin Internet o Firebase mal configurado**: Modo local (localStorage)

## ⚠️ Notas Importantes

1. **Seguridad**: Las reglas actuales permiten acceso a usuarios anónimos. Para producción, considera implementar autenticación con email.

2. **Límites Gratuitos de Firebase**:
   - 50,000 lecturas/día
   - 20,000 escrituras/día
   - 1 GB de almacenamiento
   - Suficiente para un negocio pequeño-mediano

3. **Backup**: Los datos en Firebase están respaldados automáticamente.

## 🆘 Solución de Problemas

### Error: "Firebase not defined"
- Verifica que copiaste correctamente la configuración
- Asegúrate de tener conexión a internet

### Los datos no se sincronizan:
- Revisa las reglas de Firestore
- Verifica que la autenticación anónima esté habilitada

### Consola muestra "Modo local":
- Revisa la configuración de Firebase
- Verifica la conexión a internet
- Abre la consola del navegador para ver errores específicos

## 📞 Contacto

Si necesitas ayuda con la configuración, puedes:
1. Revisar la consola del navegador (F12) para errores específicos
2. Verificar que todos los pasos se completaron correctamente
3. Consultar la documentación oficial de Firebase

¡Tu sistema TPV está listo para funcionar en la nube! 🎉
