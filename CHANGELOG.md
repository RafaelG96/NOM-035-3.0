# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

---

## [1.0.0] - 2025-11-05

### 🎉 Lanzamiento Inicial

#### Añadido
- **Backend**: API REST completa con Node.js/Express
  - Endpoints para empresas y empleados
  - Endpoints para evaluación psicosocial (entorno y trabajo)
  - Endpoints para eventos traumáticos
  - Sistema de autenticación por claves
  - Middleware de seguridad (Helmet, CORS, Rate Limiting)
  - Validación de datos con Express Validator
  - Logging y detección de actividades sospechosas

- **Frontend React**: Interfaz moderna con React 18
  - Landing page informativa sobre NOM-035
  - Registro de empresas
  - Sistema de login para empleados
  - Formulario psicosocial de entorno (51+ empleados)
  - Formulario psicosocial de trabajo (1-50 empleados)
  - Formulario de eventos traumáticos
  - Visualización de resultados con gráficos
  - Componentes reutilizables (QuestionForm, Charts, Layout)
  - Navegación con React Router

- **Base de Datos**: MongoDB con Mongoose
  - Modelos para empresas, empleados, respuestas y resultados
  - Modelo para eventos traumáticos

- **Cálculos y Utilidades**:
  - Cálculo de puntajes para entorno laboral
  - Cálculo de puntajes para trabajo
  - Determinación de niveles de riesgo (Bajo, Medio, Alto)

#### Cambios
- Migración de frontend HTML/CSS/JS a React
- Mejoras en el backend de formularios
- Cambios en formulario de trauma
- Mejoras en filtrado de datos de empresas
- Mejoras en formularios traumáticos y validaciones

#### Documentación
- Documentación de arquitectura completa (ARQUITECTURA.md)
- Diagramas de arquitectura y flujos (DIAGRAMAS.md)
- Sistema completo de versionamiento (VERSIONAMIENTO.md)
- Estrategia de ramas y branching (ESTRATEGIA-RAMAS.md)
- Documentación de monorepo (MONOREPO.md)
- Scripts de automatización para releases y hotfixes
- README del frontend React

---

## [0.6.0] - 2024-XX-XX

### Añadido
- Frontend React implementado
- Componente QuestionForm reutilizable
- Integración con Chart.js para visualización

### Cambios
- Migración de frontend HTML a React
- Refactorización de componentes

---

## [0.5.0] - 2024-XX-XX

### Añadido
- Sistema de evaluación de eventos traumáticos
- Filtrado de datos de empresas

### Cambios
- Mejoras en backend de formularios
- Cambios en formulario de trauma

---

## [0.4.0] - 2024-XX-XX

### Añadido
- Sistema de autenticación por claves
- Endpoints de verificación

---

## [0.3.0] - 2024-XX-XX

### Añadido
- Endpoints de evaluación psicosocial
- Cálculo de puntajes y niveles de riesgo

---

## [0.2.0] - 2024-XX-XX

### Añadido
- Sistema de registro de empresas
- Modelos de base de datos

---

## [0.1.0] - 2024-XX-XX

### Añadido
- Proyecto inicial
- Estructura básica del backend
- Configuración de MongoDB

---

## Tipos de Cambios

- **Añadido** para nuevas funcionalidades
- **Modificado** para cambios en funcionalidades existentes
- **Deprecado** para funcionalidades que pronto serán eliminadas
- **Eliminado** para funcionalidades eliminadas
- **Corregido** para corrección de errores
- **Seguridad** para vulnerabilidades

---

## Formato de Versiones

El proyecto utiliza [Semantic Versioning](https://semver.org/lang/es/):

- **MAJOR** (1.0.0): Cambios incompatibles con versiones anteriores
- **MINOR** (0.1.0): Nuevas funcionalidades compatibles
- **PATCH** (0.0.1): Correcciones de errores compatibles

---

## Cómo Actualizar el Changelog

1. Agrega tus cambios bajo la sección `[Unreleased]`
2. Cuando hagas un release, mueve los cambios a una nueva sección de versión
3. Actualiza la fecha en formato YYYY-MM-DD
4. Sigue el formato establecido

