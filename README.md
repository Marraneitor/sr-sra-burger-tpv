# 🍔 SR & SRA BURGER - Sistema TPV Offline

![SR & SRA BURGER](https://img.shields.io/badge/TPV-Sistema%20Completo-brightgreen)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

Sistema de Punto de Venta (TPV) completo y moderno para restaurantes, desarrollado en HTML, CSS y JavaScript puro. **Funciona completamente offline** usando localStorage.

## 🚀 Vista Previa

**🔗 Demo en vivo**: [https://sr-sra-burger-tpv.vercel.app](https://tu-url-aqui.vercel.app)

## ✨ Características Principales

### 📊 Sistema Completo TPV
- **Dashboard en tiempo real** con métricas y estadísticas
- **Punto de Venta (POS)** intuitivo y rápido
- **Gestión de productos** con recetas y costos detallados
- **Gestión de ingredientes** con control de costos unitarios
- **Gestión de clientes** con historial de compras y puntos
- **Sistema de reportes** avanzados con gráficas interactivas

### 📈 Reportes & Analytics Avanzados
- **Gráficas interactivas** con Chart.js
- **Análisis de rentabilidad** por producto
- **Métricas de ventas** en tiempo real
- **Filtros avanzados** por fecha y cliente
- **Top clientes** y productos más vendidos
- **Exportación de datos** para análisis externos

### 💾 Tecnología Offline
- **100% Offline** - Funciona sin conexión a internet
- **Datos persistentes** en localStorage del navegador
- **Preservación automática** de datos del usuario
- **Simulación realista** de 6 meses de ventas para demostración

## 🎨 Diseño Moderno

- **Tema oscuro** con efectos glassmorphism
- **Diseño responsive** - Funciona perfectamente en móviles y tablets
- **Animaciones fluidas** y transiciones suaves
- **Iconografía moderna** con Heroicons
- **UX optimizada** para velocidad en el punto de venta

## 🛠️ Stack Tecnológico

| Tecnología | Uso | Versión |
|------------|-----|---------|
| **HTML5** | Estructura semántica | - |
| **CSS3 + Tailwind** | Estilos modernos | 3.x |
| **Vanilla JavaScript** | Lógica de aplicación | ES6+ |
| **Chart.js** | Gráficas interactivas | 4.x |
| **LocalStorage** | Persistencia offline | Nativo |
| **Heroicons** | Iconografía | 2.0 |

## 📱 Funcionalidades Detalladas

### 🏠 Dashboard
- Resumen de ventas del día
- Métricas de transacciones y clientes
- Tabla de ventas recientes
- Indicadores visuales en tiempo real

### 📊 Reportes & Analytics
- **Filtros avanzados**: Por fecha, cliente, productos
- **Métricas principales**: Ingresos, ganancia neta, margen promedio, ticket promedio
- **Gráficas interactivas**: Ventas por período, productos más vendidos, distribución de clientes
- **Análisis de rentabilidad**: ROI por producto, análisis de costos
- **Top clientes**: Ranking por gasto total
- **Exportación**: Descarga de datos en formato CSV

### 🛒 Punto de Venta
- Interfaz intuitiva para procesamiento rápido
- Catálogo visual de productos
- Carrito de compras dinámico
- Aplicación de descuentos
- Cálculo automático de envío
- Selección de cliente
- Procesamiento instantáneo

### 📦 Gestión de Productos
- Creación de productos con recetas detalladas
- Cálculo automático de costos por ingredientes
- Análisis de margen de ganancia
- Gestión de precios de venta

### 🥗 Gestión de Ingredientes
- Control de inventario por ingrediente
- Precios por paquete y costo unitario
- Diferentes unidades de medida
- Cálculo automático de costos

### 👥 Gestión de Clientes
- Base de datos completa de clientes
- Historial de compras y gasto total
- Sistema de puntos de fidelidad
- Información de contacto y dirección

## 📊 Datos Precargados

El sistema incluye datos realistas para demostración:

- **41 ingredientes** reales con precios y unidades
- **26 clientes** con historial de gasto y puntos
- **11 productos** (hamburguesas, papas, hotdogs) con recetas completas
- **6 meses de ventas simuladas** (promedio $1,400-$2,000 diarios)

## 🔧 Instalación y Uso

### Instalación Local
```bash
# Clona el repositorio
git clone https://github.com/tuusuario/sr-sra-burger-tpv.git

# Navega al directorio
cd sr-sra-burger-tpv

# Abre index.html en tu navegador
# ¡Listo! No requiere instalación adicional
```

### Uso del Sistema
1. **Abre la aplicación** en tu navegador
2. **Navega por las secciones** usando el menú lateral
3. **Explora los datos precargados** en todas las secciones
4. **Procesa ventas** en el punto de venta
5. **Analiza resultados** en la sección de reportes

## 🌐 Despliegue en Vercel

### Opción 1: Deploy Automático
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tuusuario/sr-sra-burger-tpv)

### Opción 2: Deploy Manual

1. **Preparar el repositorio**:
```bash
git init
git add .
git commit -m "🚀 Initial commit: SR & SRA BURGER TPV System"
git branch -M main
git remote add origin https://github.com/tuusuario/sr-sra-burger-tpv.git
git push -u origin main
```

2. **Conectar con Vercel**:
   - Ve a [vercel.com](https://vercel.com)
   - Haz clic en "New Project"
   - Conecta tu repositorio de GitHub
   - Vercel detectará automáticamente que es un sitio estático
   - Haz clic en "Deploy"

3. **¡Listo!** Tu TPV estará disponible en una URL como:
   `https://sr-sra-burger-tpv.vercel.app`

## 📁 Estructura del Proyecto

```
sr-sra-burger-tpv/
├── index.html          # 🏠 Aplicación principal (SPA completa)
├── README.md           # 📖 Este archivo de documentación
├── vercel.json         # ⚙️ Configuración de Vercel
├── .gitignore          # 🚫 Archivos a ignorar en Git
└── LICENSE             # 📄 Licencia del proyecto
```

## 🎯 Características Técnicas

### ⚡ Rendimiento
- **Carga instantánea** - Todo en un archivo HTML optimizado
- **Sin dependencias pesadas** - Solo CDNs necesarios
- **Optimizado para móviles** - Responsive design completo
- **Funciona offline** - Sin necesidad de internet

### 🔒 Seguridad
- **No requiere base de datos** externa
- **Datos locales** en el navegador del usuario
- **Sin información sensible** en el servidor
- **Control total** sobre los datos

### 🔧 Mantenimiento
- **Código modular** y bien comentado
- **Fácil personalización** de estilos y funciones
- **Escalable** para agregar nuevas funcionalidades
- **Compatible** con todos los navegadores modernos

## 🚀 Próximas Funcionalidades

- [ ] Exportación a PDF de reportes
- [ ] Sistema de notificaciones push
- [ ] Sincronización en la nube opcional
- [ ] Modo kiosko para tablets
- [ ] Integración con impresoras de tickets
- [ ] Sistema de backup automático

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si quieres mejorar el sistema:

1. **Fork** el proyecto
2. **Crea una rama** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre un Pull Request**

## 📞 Soporte y Contacto

- 🐛 **Reportar bugs**: [Issues en GitHub](https://github.com/tuusuario/sr-sra-burger-tpv/issues)
- 💡 **Sugerir funcionalidades**: [Discussions](https://github.com/tuusuario/sr-sra-burger-tpv/discussions)
- 📧 **Contacto directo**: [tu-email@example.com](mailto:tu-email@example.com)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 🎉 Agradecimientos

- **[Tailwind CSS](https://tailwindcss.com/)** - Framework de estilos
- **[Chart.js](https://www.chartjs.org/)** - Gráficas interactivas  
- **[Heroicons](https://heroicons.com/)** - Iconos modernos
- **[Vercel](https://vercel.com/)** - Hosting gratuito y rápido

---

<div align="center">

**¡Desarrollado con ❤️ para SR & SRA BURGER!**

*Sistema TPV moderno, rápido y completamente funcional*

[⭐ Dale una estrella](https://github.com/tuusuario/sr-sra-burger-tpv) • [🐛 Reportar bug](https://github.com/tuusuario/sr-sra-burger-tpv/issues) • [💡 Sugerir función](https://github.com/tuusuario/sr-sra-burger-tpv/discussions)

</div>
