# NOM-035 - Sistema de Evaluación Psicosocial en React

Sistema completo para la evaluación de factores de riesgo psicosocial según la Norma Oficial Mexicana NOM-035-STPS-2018, desarrollado con React y Vite.

## Características

- ✅ Landing page informativa sobre la NOM-035
- ✅ Registro de empresas
- ✅ Sistema de autenticación
- ✅ Formularios psicosociales (Entorno y Trabajo)
- ✅ Formulario de eventos traumáticos
- ✅ Visualización de resultados
- ✅ Interfaz moderna con Bootstrap 5
- ✅ Navegación con React Router

## Tecnologías

- **React 19** - Framework de UI
- **Vite** - Build tool y dev server
- **React Router** - Navegación
- **Bootstrap 5** - Estilos y componentes UI
- **Axios** - Cliente HTTP para API
- **Bootstrap Icons** - Iconos

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno (opcional):
Crear archivo `.env` en la raíz del proyecto:
```
VITE_API_URL=http://localhost:3000/api
```

3. Iniciar servidor de desarrollo:
```bash
npm run dev
```

4. Construir para producción:
```bash
npm run build
```

5. Previsualizar build de producción:
```bash
npm run preview
```

## Estructura del Proyecto

```
frontend-react/
├── src/
│   ├── components/      # Componentes reutilizables
│   │   ├── Layout.jsx
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── QuestionForm.jsx
│   ├── pages/          # Páginas principales
│   │   ├── Home.jsx
│   │   ├── RegistroEmpresa.jsx
│   │   ├── Login.jsx
│   │   ├── Intermedio.jsx
│   │   ├── PsicosocialEntorno.jsx
│   │   ├── PsicosocialTrabajo.jsx
│   │   ├── Traumaticos.jsx
│   │   ├── ResultadosEntorno.jsx
│   │   ├── ResultadosTrabajo.jsx
│   │   └── ResultadosTraumaticos.jsx
│   ├── services/       # Servicios de API
│   │   └── api.js
│   ├── App.jsx         # Componente principal
│   ├── main.jsx        # Punto de entrada
│   └── index.css       # Estilos globales
├── public/             # Archivos estáticos
└── package.json
```

## Rutas

- `/` - Página principal (Home)
- `/registro` - Registro de empresa
- `/login` - Login de empleado
- `/intermedio` - Selección de tipo de acceso
- `/psicosocial-entorno` - Formulario psicosocial entorno (51+ empleados)
- `/psicosocial-trabajo` - Formulario psicosocial trabajo (1-50 empleados)
- `/traumaticos` - Formulario de eventos traumáticos
- `/resultados-entorno` - Resultados del formulario entorno
- `/resultados-trabajo` - Resultados del formulario trabajo
- `/resultados-traumaticos` - Resultados del formulario traumáticos

## Backend

Este frontend está diseñado para trabajar con el backend Node.js/Express que se encuentra en la carpeta `Backend/` del proyecto.

Asegúrate de que el backend esté corriendo en `http://localhost:3000` (o ajusta la URL en las variables de entorno).

## Desarrollo

### Agregar nuevas preguntas al formulario

Para agregar preguntas a los formularios psicosociales, edita los archivos correspondientes en `src/pages/`:

- `PsicosocialEntorno.jsx` - Para el formulario de entorno
- `PsicosocialTrabajo.jsx` - Para el formulario de trabajo
- `Traumaticos.jsx` - Para el formulario de eventos traumáticos

Las preguntas se definen como un array de objetos con la siguiente estructura:

```javascript
{
  id: 'pregunta1',        // ID único de la pregunta
  number: 1,              // Número de pregunta
  text: 'Texto de la pregunta', // Texto de la pregunta
  required: true          // Si es obligatoria
}
```

## Notas

- Los formularios actuales incluyen versiones simplificadas de las preguntas. Puedes expandirlos agregando todas las preguntas del formulario original.
- Los datos se almacenan temporalmente en `localStorage` para mantener la sesión del usuario.
- El proyecto está configurado para trabajar con el backend existente sin necesidad de modificaciones adicionales.

## Licencia

Este proyecto es parte de un sistema de evaluación NOM-035.
