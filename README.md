# Frontend - Vulnerable TodoList

Frontend estático desarrollado con HTML, CSS, JavaScript y Bootstrap que contiene vulnerabilidades intencionalmente implementadas para propósitos educativos.

## Instalación

### Instalación Local

1. **Navegar al directorio frontend**:
```bash
cd frontend
```

2. **Servir archivos estáticos**:

**Opción 1 - Python**:
```bash
python -m http.server 3000
```

**Opción 2 - Node.js (si tienes npm)**:
```bash
npx http-server -p 3000
```

**Opción 3 - PHP**:
```bash
php -S localhost:3000
```

3. **Acceder a la aplicación**:
Abrir `http://localhost:3000` en el navegador

## Estructura de Archivos

```
frontend/
├── index.html          # Dashboard principal con lista de tareas
├── auth.html          # Página de autenticación (login/registro)
├── js/
│   ├── app.js         # JavaScript principal del dashboard
│   └── auth.js        # JavaScript para autenticación
├── css/
│   └── style.css      # Estilos personalizados con Bootstrap
├── package.json       # Configuración del proyecto
├── README.md          # Este archivo
└── VULNERABILITIES.md # Documentación de vulnerabilidades educativas
```

## Configuración

### URL del Backend

Actualizar la variable `API_BASE_URL` en `js/app.js` según el entorno:

```javascript
// Desarrollo local
const API_BASE_URL = 'http://localhost:8000';

// Producción (Render)
const API_BASE_URL = 'https://tu-app.onrender.com';
```

## Funcionalidades

### Páginas Principales
- **index.html**: Dashboard principal con lista de tareas, formularios de agregar/editar tareas
- **auth.html**: Formularios de login y registro con validación básica

### Características
- Interfaz responsive con Bootstrap 5 y estilos personalizados
- Comunicación con API REST del backend
- Gestión de autenticación con JWT (almacenamiento vulnerable)
- Operaciones CRUD completas para tareas
- Formularios de autenticación (login/registro)
- Dashboard interactivo con búsqueda y filtros
- Modales para editar y eliminar tareas
- Indicadores de estado y alertas de usuario

## Vulnerabilidades Implementadas

⚠️ **Las siguientes vulnerabilidades están implementadas intencionalmente**:

1. **XSS Almacenado**: En títulos y descripciones de tareas
2. **XSS Reflejado**: En parámetros de búsqueda
3. **Almacenamiento inseguro**: JWT en localStorage
4. **Validación insuficiente**: Del lado del cliente
5. **CSRF**: Sin protección contra ataques CSRF

## Despliegue en GitHub Pages

### Configuración Automática

1. **Habilitar GitHub Pages**:
   - Ir a Settings > Pages en el repositorio
   - Seleccionar source: Deploy from a branch
   - Seleccionar branch: main
   - Seleccionar folder: /frontend

2. **Configurar URL del backend**:
   - Actualizar `API_BASE_URL` en `js/app.js`
   - Usar la URL de producción de Render

### Configuración Manual

1. **Crear archivo de configuración**:
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend
```

## Testing

### Testing Manual
1. Abrir Developer Tools del navegador
2. Verificar que no haya errores de consola
3. Probar funcionalidades básicas
4. Verificar comunicación con el backend

### Testing de Vulnerabilidades
1. **XSS**: Intentar inyectar scripts en formularios
2. **CSRF**: Crear requests desde dominios externos
3. **Almacenamiento**: Inspeccionar localStorage en DevTools

## Troubleshooting

### Error de CORS
- Verificar que el backend tenga configurado CORS correctamente
- Confirmar que la URL del backend sea correcta

### Archivos no se cargan
- Verificar que el servidor HTTP esté ejecutándose
- Confirmar que los archivos estén en las rutas correctas

### JavaScript no funciona
- Abrir Developer Tools y revisar errores de consola
- Verificar que Bootstrap esté cargando correctamente

## Recursos

- [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.1/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)