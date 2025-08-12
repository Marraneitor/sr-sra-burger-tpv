# 🔐 Reglas Avanzadas de Firestore para SR & SRA BURGER TPV

## Reglas Básicas (Actuales)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acceso solo a usuarios autenticados (incluso anónimos)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Reglas Avanzadas (Recomendadas para Producción)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Ingredientes: Solo el propietario puede ver y modificar
    match /ingredientes/{ingredienteId} {
      allow read, write: if request.auth != null 
        && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null 
        && request.resource.data.userId == request.auth.uid;
    }
    
    // Productos: Solo el propietario puede ver y modificar
    match /productos/{productoId} {
      allow read, write: if request.auth != null 
        && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null 
        && request.resource.data.userId == request.auth.uid;
    }
    
    // Clientes: Solo el propietario puede ver y modificar
    match /clientes/{clienteId} {
      allow read, write: if request.auth != null 
        && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null 
        && request.resource.data.userId == request.auth.uid;
    }
    
    // Ventas: Solo el propietario puede ver y modificar
    // Una vez creada, solo se puede leer (para auditoría)
    match /ventas/{ventaId} {
      allow read: if request.auth != null 
        && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null 
        && request.resource.data.userId == request.auth.uid;
      // No permitir delete para mantener auditoría
      allow update: if request.auth != null 
        && resource.data.userId == request.auth.uid
        && request.resource.data.userId == request.auth.uid;
    }
    
    // Pedidos Pendientes: Solo el propietario puede ver y modificar
    match /pedidos_pendientes/{pedidoId} {
      allow read, write: if request.auth != null 
        && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null 
        && request.resource.data.userId == request.auth.uid;
    }
    
    // Metadatos del usuario (configuraciones, preferencias)
    match /usuarios/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
  }
}
```

## Reglas con Validación de Datos

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función auxiliar para verificar campos requeridos
    function hasRequiredFields(data, fields) {
      return fields.toSet().difference(data.keys().toSet()).size() == 0;
    }
    
    // Función auxiliar para verificar tipos de datos
    function isValidPrice(price) {
      return price is number && price >= 0;
    }
    
    // Ingredientes con validación
    match /ingredientes/{ingredienteId} {
      allow read, write: if request.auth != null 
        && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null 
        && request.resource.data.userId == request.auth.uid
        && hasRequiredFields(request.resource.data, ['nombre', 'unidad', 'unidadesPaquete', 'precioPaquete'])
        && request.resource.data.nombre is string
        && request.resource.data.unidad is string
        && request.resource.data.unidadesPaquete is number
        && isValidPrice(request.resource.data.precioPaquete);
    }
    
    // Productos con validación
    match /productos/{productoId} {
      allow read, write: if request.auth != null 
        && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null 
        && request.resource.data.userId == request.auth.uid
        && hasRequiredFields(request.resource.data, ['nombre', 'precio', 'descripcion'])
        && request.resource.data.nombre is string
        && isValidPrice(request.resource.data.precio)
        && request.resource.data.descripcion is string;
    }
    
    // Clientes con validación
    match /clientes/{clienteId} {
      allow read, write: if request.auth != null 
        && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null 
        && request.resource.data.userId == request.auth.uid
        && hasRequiredFields(request.resource.data, ['nombre', 'telefono', 'direccion'])
        && request.resource.data.nombre is string
        && request.resource.data.telefono is string
        && request.resource.data.direccion is string
        && request.resource.data.gastoTotal >= 0
        && request.resource.data.puntos >= 0;
    }
    
    // Ventas con validación estricta
    match /ventas/{ventaId} {
      allow read: if request.auth != null 
        && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null 
        && request.resource.data.userId == request.auth.uid
        && hasRequiredFields(request.resource.data, ['items', 'total', 'fecha'])
        && request.resource.data.items is list
        && request.resource.data.items.size() > 0
        && isValidPrice(request.resource.data.total)
        && request.resource.data.fecha is timestamp;
      // No permitir modificaciones después de creada
      allow update: if false;
      allow delete: if false;
    }
  }
}
```

## Reglas para Múltiples Negocios (Multi-tenant)

Si planeas expandir a múltiples negocios:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Estructura: /negocios/{negocioId}/ingredientes/{ingredienteId}
    match /negocios/{negocioId}/{collection}/{documentId} {
      // Solo propietarios y empleados del negocio
      allow read, write: if request.auth != null 
        && (
          // Es el propietario del negocio
          get(/databases/$(database)/documents/negocios/$(negocioId)).data.ownerId == request.auth.uid
          ||
          // Es un empleado autorizado
          request.auth.uid in get(/databases/$(database)/documents/negocios/$(negocioId)).data.empleados
        );
    }
    
    // Metadatos del negocio
    match /negocios/{negocioId} {
      allow read, write: if request.auth != null 
        && resource.data.ownerId == request.auth.uid;
      allow create: if request.auth != null 
        && request.resource.data.ownerId == request.auth.uid;
    }
  }
}
```

## Cómo Aplicar las Reglas

1. Ve a **Firebase Console** → **Firestore Database** → **Reglas**
2. Copia y pega las reglas que prefieras
3. Haz clic en **"Publicar"**
4. **Prueba** que todo funcione correctamente

## Recomendaciones por Tipo de Negocio

### 🏪 Negocio Individual (Actual)
- Usa las **Reglas Básicas**
- Fácil de implementar
- Suficiente seguridad para un solo propietario

### 🏢 Negocio con Empleados
- Usa las **Reglas Avanzadas**
- Mejor auditoría
- Protección contra eliminaciones accidentales

### 🏭 Múltiples Sucursales
- Usa las **Reglas Multi-tenant**
- Separación completa de datos
- Gestión de permisos por sucursal

## ⚠️ Importante

- **Siempre prueba** las reglas en un entorno de desarrollo primero
- **Haz backup** de tus reglas actuales antes de cambiar
- **Verifica** que la aplicación sigue funcionando después del cambio
- Las reglas más restrictivas son más seguras pero requieren más configuración

### Autenticación: dominios autorizados y proveedores

Si ves errores como `auth/operation-not-allowed` o respuestas 400 desde `identitytoolkit.googleapis.com`, revisa:

1) Authentication → Sign-in method: habilita Anonymous y Email/Password.
2) Authentication → Settings → Authorized domains: agrega `localhost`, `127.0.0.1` y tu IP LAN (ej. `192.168.100.7`).

¡Elige las reglas que mejor se adapten a tu negocio! 🎯
